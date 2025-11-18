import type { VNode, JSXNode } from "../runtime/types";
import type { SSRResult, IslandMetadata } from "../shared/types";
import { Fragment } from "../runtime/types";
import { isIslandVNode, getIslandMetadata } from "./island";
import { createIslandCollector } from "./collector";
import { isSignal, unwrap } from "../signal/utils";

/**
 * Render a VNode tree to an HTML string with island support
 *
 * @param vnode - The VNode tree to render
 * @param options - Rendering options
 * @returns SSR result with HTML and island metadata
 *
 * @example
 * ```tsx
 * const result = renderToString(<App />)
 * console.log(result.html) // HTML string
 * console.log(result.islands) // Island metadata
 * console.log(result.scripts) // Script tags to load islands
 * ```
 */
export function renderToString(
  vnode: VNode,
  options: {
    islandBasePath?: string;
  } = {},
): SSRResult {
  const { islandBasePath = "/islands" } = options;

  // Collect all islands from the tree
  const collector = createIslandCollector();
  const islands = collector.collect(vnode);

  // Render HTML with island placeholders
  const html = renderVNodeToHTML(vnode, islands);

  // Generate script tags for islands
  const scripts = generateIslandScripts(islands, islandBasePath);

  return {
    html,
    islands,
    scripts,
  };
}

/**
 * Render VNode to HTML string
 */
function renderVNodeToHTML(
  vnode: VNode | JSXNode,
  islands: IslandMetadata[],
): string {
  // Handle null/undefined
  if (vnode == null) {
    return "";
  }

  // Handle signals
  if (isSignal(vnode)) {
    return renderVNodeToHTML(unwrap(vnode), islands);
  }

  // Handle primitives
  if (typeof vnode === "string" || typeof vnode === "number") {
    return escapeHTML(String(vnode));
  }

  if (typeof vnode === "boolean") {
    return "";
  }

  // Handle arrays
  if (Array.isArray(vnode)) {
    return vnode.map((child) => renderVNodeToHTML(child, islands)).join("");
  }

  // Must be a VNode at this point
  if (typeof vnode !== "object" || !("type" in vnode)) {
    return "";
  }

  const vnodeTyped = vnode as VNode;

  // Handle text nodes
  if (vnodeTyped.type === "#text") {
    return escapeHTML(String(vnodeTyped.props?.nodeValue || ""));
  }

  // Handle islands - render placeholder
  if (isIslandVNode(vnodeTyped)) {
    const metadata = getIslandMetadata(vnodeTyped);
    if (metadata) {
      // Find the island ID
      const island = islands.find((i) => i.path === metadata.modulePath);
      if (island) {
        return renderIslandPlaceholder(island);
      }
    }
    return "";
  }

  // Handle fragments
  if (vnodeTyped.type === Fragment) {
    return vnodeTyped.children
      .map((child) => renderVNodeToHTML(child, islands))
      .join("");
  }

  // Handle function components
  if (typeof vnodeTyped.type === "function") {
    try {
      const result = vnodeTyped.type(vnodeTyped.props || {});
      return renderVNodeToHTML(result, islands);
    } catch (error) {
      console.error("Error rendering component:", error);
      return "";
    }
  }

  // Handle DOM elements
  if (typeof vnodeTyped.type === "string") {
    return renderElement(vnodeTyped, islands);
  }

  return "";
}

/**
 * Render a DOM element to HTML
 */
function renderElement(vnode: VNode, islands: IslandMetadata[]): string {
  const tag = vnode.type as string;
  const props = vnode.props || {};

  // Self-closing tags
  const selfClosing = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  // Build attributes
  const attrs = renderAttributes(props);

  // Self-closing tag
  if (selfClosing.includes(tag)) {
    return `<${tag}${attrs} />`;
  }

  // Regular tag with children
  const children = (vnode.children || [])
    .map((child) => renderVNodeToHTML(child, islands))
    .join("");

  return `<${tag}${attrs}>${children}</${tag}>`;
}

/**
 * Render element attributes
 */
function renderAttributes(props: Record<string, any>): string {
  const attrs: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    // Skip special props
    if (key === "children" || key === "key" || key === "ref") {
      continue;
    }

    // Skip event handlers
    if (key.startsWith("on")) {
      continue;
    }

    // Skip functions
    if (typeof value === "function") {
      continue;
    }

    // Skip null/undefined
    if (value == null) {
      continue;
    }

    // Handle signals
    let attrValue = value;
    if (isSignal(value)) {
      attrValue = unwrap(value);
    }

    // Boolean attributes
    if (typeof attrValue === "boolean") {
      if (attrValue) {
        attrs.push(key);
      }
      continue;
    }

    // Handle className -> class
    const attrName = key === "className" ? "class" : key;

    // Handle style object
    if (attrName === "style" && typeof attrValue === "object") {
      const styleStr = Object.entries(attrValue)
        .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
        .join("; ");
      attrs.push(`style="${escapeHTML(styleStr)}"`);
      continue;
    }

    // Regular attributes
    attrs.push(`${attrName}="${escapeHTML(String(attrValue))}"`);
  }

  return attrs.length > 0 ? " " + attrs.join(" ") : "";
}

/**
 * Render island placeholder HTML
 */
function renderIslandPlaceholder(island: IslandMetadata): string {
  const propsJson = JSON.stringify(island.props);
  const escapedProps = escapeHTML(propsJson);

  return `<div data-island-id="${island.id}" data-island-path="${island.path}" data-island-props="${escapedProps}"></div>`;
}

/**
 * Generate script tags for loading islands
 */
function generateIslandScripts(
  islands: IslandMetadata[],
  basePath: string,
): string {
  if (islands.length === 0) {
    return "";
  }

  const scripts = islands.map(
    (island) =>
      `<script type="module" src="${basePath}/${island.id}.js" async></script>`,
  );

  return scripts.join("\n");
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

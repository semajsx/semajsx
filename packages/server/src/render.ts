import type { JSXNode, VNode } from "@semajsx/core/types";
import type { IslandMetadata, SSRResult } from "./shared/types";
import { Fragment } from "@semajsx/core/types";
import { getIslandMetadata, isIslandVNode } from "./client/island";
import { isSignal, unwrap } from "@semajsx/signal/utils";

/**
 * Render context for collecting islands during traversal
 */
interface RenderContext {
  islands: IslandMetadata[];
  islandCounter: number;
  islandBasePath: string;
  // Cache for component render results to avoid duplicate rendering
  renderCache: WeakMap<VNode, string>;
}

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

  // Create render context to collect islands during single traversal
  const context: RenderContext = {
    islands: [],
    islandCounter: 0,
    islandBasePath,
    renderCache: new WeakMap(),
  };

  // Render HTML and collect islands in one pass (fixes duplicate rendering)
  const html = renderVNodeToHTML(vnode, context);

  // Generate script tags for islands
  const scripts = generateIslandScripts(context.islands, islandBasePath);

  return {
    html,
    islands: context.islands,
    scripts,
  };
}

/**
 * Serialize props for island hydration
 */
function serializeProps(props: any): Record<string, any> {
  if (!props || typeof props !== "object") {
    return {};
  }

  const serialized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    // Skip children - they will be rendered separately
    if (key === "children" || key === "key" || key === "ref") {
      continue;
    }

    // Skip functions (event handlers, callbacks)
    if (typeof value === "function") {
      continue;
    }

    // Skip symbols
    if (typeof value === "symbol") {
      continue;
    }

    // Skip undefined
    if (value === undefined) {
      continue;
    }

    // Handle signals - serialize their current value
    if (isSignal(value)) {
      serialized[key] = unwrap(value);
      continue;
    }

    // Handle null, boolean, number, string
    if (
      value === null ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      serialized[key] = value;
      continue;
    }

    // Handle arrays and plain objects
    if (Array.isArray(value) || isPlainObject(value)) {
      try {
        // Test if it's JSON-serializable
        JSON.stringify(value);
        serialized[key] = value;
      } catch (error) {
        console.warn(`Cannot serialize prop "${key}":`, error);
      }
      continue;
    }

    console.warn(
      `Skipping non-serializable prop "${key}" of type ${typeof value}`,
    );
  }

  return serialized;
}

/**
 * Render VNode to HTML string
 */
function renderVNodeToHTML(
  vnode: VNode | JSXNode,
  context: RenderContext,
): string {
  // Handle null/undefined
  if (vnode == null) {
    return "";
  }

  // Handle signals
  if (isSignal(vnode)) {
    return renderVNodeToHTML(unwrap(vnode), context);
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
    return vnode.map((child) => renderVNodeToHTML(child, context)).join("");
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

  // Handle signal nodes - unwrap and render the signal's value
  if (vnodeTyped.type === "#signal") {
    const signal = vnodeTyped.props?.signal;
    if (signal && isSignal<VNode>(signal)) {
      const unwrapped = unwrap(signal);
      const rendered = renderVNodeToHTML(unwrapped, context);
      // If signal renders to empty content, use a comment marker for hydration
      // This ensures the client can find a DOM node to attach the signal subscription to
      return rendered || "<!--signal-empty-->";
    }
    return "<!--signal-empty-->";
  }

  // Handle islands - render content AND mark for hydration
  if (isIslandVNode(vnodeTyped)) {
    return renderIsland(vnodeTyped, context);
  }

  // Handle fragments
  if (vnodeTyped.type === Fragment) {
    return vnodeTyped.children
      .map((child) => renderVNodeToHTML(child, context))
      .join("");
  }

  // Handle function components
  if (typeof vnodeTyped.type === "function") {
    try {
      // Pass children to component as part of props
      const props =
        vnodeTyped.children && vnodeTyped.children.length > 0
          ? { ...vnodeTyped.props, children: vnodeTyped.children }
          : vnodeTyped.props || {};
      const result = vnodeTyped.type(props);
      return renderVNodeToHTML(result, context);
    } catch (error) {
      console.error("Error rendering component:", error);
      // Return error fallback
      return renderErrorFallback(error, vnodeTyped);
    }
  }

  // Handle DOM elements
  if (typeof vnodeTyped.type === "string") {
    return renderElement(vnodeTyped, context);
  }

  return "";
}

/**
 * Render an island component
 * - Renders the full HTML content on server (for SEO and no-JS users)
 * - Wraps content in a hydration marker
 * - Collects island metadata for client-side hydration
 */
function renderIsland(vnode: VNode, context: RenderContext): string {
  const metadata = getIslandMetadata(vnode);
  if (!metadata) {
    return "";
  }

  // Extract component name for better debugging
  const componentName =
    typeof metadata.component === "function"
      ? metadata.component.name || "Anonymous"
      : "Unknown";

  // Generate unique island ID using component name
  // Example: "Counter-0", "TodoList-1", "Anonymous-2"
  const islandId = generateIslandId(componentName, context.islandCounter++);

  // Serialize props for hydration
  const serializedProps = serializeProps(metadata.props);

  // Store island metadata
  const islandMetadata: IslandMetadata = {
    id: islandId,
    path: metadata.modulePath,
    props: serializedProps,
    componentName,
  };
  context.islands.push(islandMetadata);

  // Render the island's content on the server
  let content = "";
  try {
    const result = metadata.component(metadata.props || {});
    content = renderVNodeToHTML(result, context);
  } catch (error) {
    console.error(
      `[SSR] Error rendering island "${islandId}" (${componentName}):`,
      error,
    );
    content = renderErrorFallback(error, vnode);
  }

  // Wrap content in island marker for hydration
  // The marker includes:
  // - data-island-id: unique identifier
  // - data-island-props: serialized props (for hydration)
  // - Server-rendered HTML content (for SEO and progressive enhancement)
  const propsJson = JSON.stringify(serializedProps);
  const escapedProps = escapeHTML(propsJson);

  return `<div data-island-id="${islandId}" data-island-props="${escapedProps}">${content}</div>`;
}

/**
 * Render a DOM element to HTML
 */
function renderElement(vnode: VNode, context: RenderContext): string {
  const tag = vnode.type as string;
  const props = vnode.props || {};

  // Handle dangerouslySetInnerHTML
  if (props.dangerouslySetInnerHTML?.__html != null) {
    const attrs = renderAttributes(props);
    return `<${tag}${attrs}>${props.dangerouslySetInnerHTML.__html}</${tag}>`;
  }

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
    .map((child) => renderVNodeToHTML(child, context))
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
    if (
      key === "children" ||
      key === "key" ||
      key === "ref" ||
      key === "dangerouslySetInnerHTML"
    ) {
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
 * Render error fallback
 */
function renderErrorFallback(error: any, vnode?: VNode): string {
  const message = error?.message || String(error);
  const componentName =
    vnode && typeof vnode.type === "function" ? vnode.type.name : "Unknown";

  return `<div style="border: 2px solid red; padding: 10px; margin: 10px; background: #fee;">
    <strong>Error rendering component: ${escapeHTML(componentName)}</strong>
    <pre>${escapeHTML(message)}</pre>
  </div>`;
}

/**
 * Generate a unique island ID from component name and counter
 * Examples: "Counter-0", "todo-list-1", "my-component-2"
 */
function generateIslandId(componentName: string, counter: number): string {
  // Convert to kebab-case and sanitize for use as HTML attribute
  const kebabName = camelToKebab(componentName)
    .toLowerCase()
    // Remove leading dash if component name started with uppercase
    .replace(/^-/, "")
    // Replace any non-alphanumeric characters (except dash) with dash
    .replace(/[^a-z0-9-]/g, "-")
    // Remove consecutive dashes
    .replace(/-+/g, "-")
    // Remove trailing dashes
    .replace(/-$/, "");

  return `${kebabName}-${counter}`;
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

/**
 * Check if a value is a plain object
 */
function isPlainObject(value: any): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

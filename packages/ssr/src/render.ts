import type { JSXNode, VNode } from "@semajsx/core/types";
import type {
  IslandMetadata,
  IslandScriptTransformer,
  RenderToStringOptions,
  SSRResult,
} from "./shared/types";
import { Fragment } from "@semajsx/core/types";
import { getIslandMetadata, isIslandVNode } from "./client/island";
import { STYLE_MARKER, LINK_MARKER, ASSET_MARKER } from "./client/resource";
import { isSignal, unwrap } from "@semajsx/signal/utils";

/**
 * Render context for collecting islands during traversal
 */
interface RenderContext {
  islands: IslandMetadata[];
  islandCounter: number;
  islandBasePath: string;
  // Whether to generate hydration markers (only when transformer is provided)
  enableHydration: boolean;
  // Cache for component render results to avoid duplicate rendering
  renderCache: WeakMap<VNode, string>;
  // Collected CSS file paths
  css: Set<string>;
  // Collected asset file paths
  assets: Set<string>;
  // Root directory for computing component keys
  rootDir: string;
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
 * // Static HTML only (no client-side scripts)
 * const result = renderToString(<App />)
 * console.log(result.html) // HTML string
 * console.log(result.islands) // Island metadata
 * console.log(result.scripts) // Empty string
 *
 * // With custom hydration scripts
 * const result = renderToString(<App />, {
 *   transformIslandScript: (island) => {
 *     return `<script type="module" src="${island.basePath}/${island.id}.js"></script>`
 *   }
 * })
 * ```
 */
export async function renderToString(
  vnode: VNode,
  options: RenderToStringOptions = {},
): Promise<SSRResult> {
  const { transformIslandScript, rootDir = process.cwd() } = options;

  // Fixed path for all static assets under /_semajsx/ namespace
  const islandBasePath = "/_semajsx/islands";

  // Create render context to collect islands during single traversal
  const context: RenderContext = {
    islands: [],
    islandCounter: 0,
    islandBasePath,
    // Only enable hydration markers when transformer is provided
    enableHydration: !!transformIslandScript,
    renderCache: new WeakMap(),
    css: new Set(),
    assets: new Set(),
    rootDir,
  };

  // Render HTML and collect islands in one pass (fixes duplicate rendering)
  const html = await renderVNodeToHTML(vnode, context);

  // Generate script tags for islands (only if transformer is provided)
  const scripts = generateIslandScripts(
    context.islands,
    islandBasePath,
    transformIslandScript,
  );

  return {
    html,
    islands: context.islands,
    scripts,
    css: Array.from(context.css),
    assets: Array.from(context.assets),
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
 * Check if a value is an async iterator
 */
function isAsyncIterator(value: any): value is AsyncIterableIterator<any> {
  return (
    value &&
    typeof value === "object" &&
    (typeof value[Symbol.asyncIterator] === "function" ||
      (typeof value.next === "function" && typeof value.return === "function"))
  );
}

/**
 * Render VNode to HTML string
 */
async function renderVNodeToHTML(
  vnode: VNode | JSXNode,
  context: RenderContext,
): Promise<string> {
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
    const results = await Promise.all(
      vnode.map((child) => renderVNodeToHTML(child, context)),
    );
    return results.join("");
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
      const rendered = await renderVNodeToHTML(unwrapped, context);
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

  // Handle Style resource - collect CSS path, render nothing
  if (vnodeTyped.type === STYLE_MARKER) {
    const href = vnodeTyped.props?.href;
    if (href && typeof href === "string") {
      context.css.add(href);
    }
    return "";
  }

  // Handle Link resource - collect CSS path for stylesheets
  if (vnodeTyped.type === LINK_MARKER) {
    const href = vnodeTyped.props?.href;
    const rel = vnodeTyped.props?.rel;
    if (href && typeof href === "string" && rel === "stylesheet") {
      context.css.add(href);
    }
    return "";
  }

  // Handle Asset resource - collect asset path
  if (vnodeTyped.type === ASSET_MARKER) {
    const src = vnodeTyped.props?.src;
    if (src && typeof src === "string") {
      context.assets.add(src);
    }
    return "";
  }

  // Handle fragments
  if (vnodeTyped.type === Fragment) {
    const results = await Promise.all(
      vnodeTyped.children.map((child) => renderVNodeToHTML(child, context)),
    );
    return results.join("");
  }

  // Handle function components
  if (typeof vnodeTyped.type === "function") {
    try {
      // Pass children to component as part of props
      const props =
        vnodeTyped.children && vnodeTyped.children.length > 0
          ? { ...vnodeTyped.props, children: vnodeTyped.children }
          : vnodeTyped.props || {};

      let result: any = vnodeTyped.type(props);

      // Handle async component - await the Promise
      if (result instanceof Promise) {
        result = await result;
      }

      // Handle async iterator - take only the first yield
      if (isAsyncIterator(result)) {
        const { value } = await result.next();
        result = value;
      }

      // Handle signal return - unwrap the value
      if (isSignal(result)) {
        result = unwrap(result);
      }

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
 * Check if a VNode result is a single DOM element (not Fragment, array, or primitive)
 */
function isSingleElement(result: VNode | JSXNode): result is VNode {
  if (result == null || typeof result !== "object") {
    return false;
  }
  if (Array.isArray(result)) {
    return false;
  }
  if (!("type" in result)) {
    return false;
  }
  const vnode = result as VNode;
  // Must be a string type (DOM element), not Fragment or function component
  return typeof vnode.type === "string";
}

/**
 * Generate a component key from path for use as identifier
 * Example: "/home/user/project/src/components/Counter.tsx" -> "components/Counter"
 */
function getComponentKey(componentPath: string, rootDir: string): string {
  // Convert file:// URL to path
  let path = componentPath;
  if (path.startsWith("file://")) {
    path = new URL(path).pathname;
  }

  // Make relative to root and remove src/ prefix
  if (path.startsWith(rootDir)) {
    path = path.slice(rootDir.length);
  }
  path = path.replace(/^\/?(src\/)?/, "");

  // Remove extension
  path = path.replace(/\.\w+$/, "");

  // Sanitize for use as attribute value
  path = path.replace(/[^a-zA-Z0-9/_-]/g, "_");

  return path;
}

/**
 * Inject island attributes into the first tag of rendered HTML
 */
function injectIslandAttrs(
  html: string,
  islandId: string,
  componentKey: string,
  propsJson: string,
): string {
  // Find the first > of the opening tag
  const firstTagEnd = html.indexOf(">");
  if (firstTagEnd === -1) {
    return html;
  }

  const escapedProps = escapeHTML(propsJson);
  const attrs = ` data-island-id="${islandId}" data-island-src="${componentKey}" data-island-props="${escapedProps}"`;

  // Handle self-closing tags
  if (html[firstTagEnd - 1] === "/") {
    return (
      html.slice(0, firstTagEnd - 1) +
      attrs +
      " />" +
      html.slice(firstTagEnd + 1)
    );
  }

  return html.slice(0, firstTagEnd) + attrs + html.slice(firstTagEnd);
}

/**
 * Render an island component
 * - Renders the full HTML content on server (for SEO and no-JS users)
 * - If hydration disabled: renders as plain HTML (no markers)
 * - If hydration enabled: adds markers for client-side hydration
 */
async function renderIsland(
  vnode: VNode,
  context: RenderContext,
): Promise<string> {
  const metadata = getIslandMetadata(vnode);
  if (!metadata) {
    return "";
  }

  // Extract component name for better debugging
  const componentName =
    typeof metadata.component === "function"
      ? metadata.component.name || "Anonymous"
      : "Unknown";

  // Render the island's content on the server
  let content = "";
  let result: any;
  try {
    result = metadata.component(metadata.props || {});

    // Handle async component - await the Promise
    if (result instanceof Promise) {
      result = await result;
    }

    // Handle async iterator - take only the first yield
    if (isAsyncIterator(result)) {
      const { value } = await result.next();
      result = value;
    }

    // Handle signal return - unwrap the value
    if (isSignal(result)) {
      result = unwrap(result);
    }

    content = await renderVNodeToHTML(result, context);
  } catch (error) {
    console.error(`[SSR] Error rendering island (${componentName}):`, error);
    return renderErrorFallback(error, vnode);
  }

  // If hydration is disabled, just return the plain HTML
  if (!context.enableHydration) {
    return content;
  }

  // Generate unique island ID using component name
  const islandId = generateIslandId(componentName, context.islandCounter++);

  // Generate component key for grouping islands by component
  const componentKey = getComponentKey(metadata.modulePath, context.rootDir);

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

  const propsJson = JSON.stringify(serializedProps);

  // Single DOM element: inject attrs directly (no wrapper div)
  if (isSingleElement(result)) {
    return injectIslandAttrs(content, islandId, componentKey, propsJson);
  }

  // Fragment or other: use comment markers + script tag
  // Use unique end marker to support nested islands
  return `<!--island:${islandId}-->${content}<!--/island:${islandId}--><script type="application/json" data-island="${islandId}" data-island-src="${componentKey}">${propsJson}</script>`;
}

/**
 * Render a DOM element to HTML
 */
async function renderElement(
  vnode: VNode,
  context: RenderContext,
): Promise<string> {
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
  const childResults = await Promise.all(
    (vnode.children || []).map((child) => renderVNodeToHTML(child, context)),
  );
  const children = childResults.join("");

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
 *
 * If no transformer is provided, returns empty string (static HTML only).
 * If transformer is provided, calls it for each island to generate custom scripts.
 */
function generateIslandScripts(
  islands: IslandMetadata[],
  basePath: string,
  transformer?: IslandScriptTransformer,
): string {
  // No islands or no transformer = no scripts (static HTML only)
  if (islands.length === 0 || !transformer) {
    return "";
  }

  const scripts: string[] = [];

  for (const island of islands) {
    const script = transformer({
      id: island.id,
      path: island.path,
      props: island.props,
      componentName: island.componentName || "Unknown",
      basePath,
    });

    if (script) {
      scripts.push(script);
    }
  }

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

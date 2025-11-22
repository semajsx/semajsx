/**
 * DOM utilities and rendering
 */

export {
  createElement,
  createTextNode,
  createComment,
  appendChild,
  removeChild,
  insertBefore,
  replaceNode,
  setText,
} from "./operations";

export { setProperty, setSignalProperty, setRef } from "./properties";

export { render } from "./render";
export type { DOMRenderResult } from "./render";

export { hydrate, hydrateIsland } from "./hydrate";

export { createPortal, PortalComponent } from "./portal";
export type { PortalProps } from "./portal";

// Re-export h from core for convenience (used in island hydration)
export { h } from "@semajsx/core";

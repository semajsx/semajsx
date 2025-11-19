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

export { render, unmount } from "./render";

export { hydrate } from "./hydrate";

export { createPortal, PortalComponent } from "./portal";
export type { PortalProps } from "./portal";

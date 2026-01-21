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

export { createPortal, PortalComponent } from "./portal";
export type { PortalProps } from "./portal";

export {
  AppStyleAnchor,
  ComponentStyleAnchor,
  getStyleTarget,
  setAppStyleTarget,
  setComponentStyleTarget,
} from "./style-anchor";
export type { AppStyleAnchorProps, ComponentStyleAnchorProps } from "./style-anchor";

/**
 * Runtime exports - shared across DOM and Terminal
 */

export { createFragment, createTextVNode, h, isVNode } from "./vnode";
export { Fragment, Portal } from "./types";
export {
  Context,
  context,
  createComponentAPI,
  type ContextMap,
} from "./context";
export { resource, stream, when } from "./helpers";
export { jsx, jsxs } from "./jsx";
export { createRenderer, isAsyncIterator, isPromise } from "./render-core";

export type {
  Component,
  ComponentAPI,
  Context as ContextType,
  ContextProps,
  ContextProvide,
  JSXNode,
  Ref,
  RenderedNode,
  VNode,
  WithKey,
  WithSignals,
} from "./types";

export type { RenderStrategy } from "./render-core";

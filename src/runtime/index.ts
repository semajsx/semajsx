/**
 * Runtime exports - shared across DOM and Terminal
 */

export { createFragment, createTextVNode, h, isVNode } from "./vnode";
export { Fragment, Portal } from "./types";
export { Context, context } from "./context";

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
} from "./types";

/**
 * Runtime exports - shared across DOM and Terminal
 */

export { h, createTextVNode, createFragment, isVNode } from "./vnode";
export { Fragment } from "./types";
export { context, Context } from "./context";

export type {
  VNode,
  Component,
  RenderedNode,
  JSXChild,
  JSXChildren,
  Context as ContextType,
  ComponentAPI,
  ContextProvide,
  ContextProps,
} from "./types";

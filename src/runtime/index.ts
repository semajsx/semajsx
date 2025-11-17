/**
 * Runtime exports - shared across DOM and Terminal
 */

export { createFragment, createTextVNode, h, isVNode } from "./vnode";
export { Fragment } from "./types";
export { Context, context } from "./context";

export type {
  Component,
  ComponentAPI,
  Context as ContextType,
  ContextProps,
  ContextProvide,
  JSXNode,
  RenderedNode,
  VNode,
} from "./types";

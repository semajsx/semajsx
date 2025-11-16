/**
 * Runtime exports - shared across DOM and Terminal
 */

export { h, createTextVNode, createFragment, isVNode } from "./vnode";
export { Fragment } from "./types";
export { createContext } from "./context";

export type {
  VNode,
  Component,
  RenderedNode,
  JSXChild,
  JSXChildren,
  Context,
  ComponentAPI,
  ProviderProps,
} from "./types";

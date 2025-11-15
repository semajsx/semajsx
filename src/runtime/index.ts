/**
 * Runtime exports - shared across DOM and Terminal
 */

export { h, createTextVNode, createFragment, isVNode } from "./vnode";
export { Fragment } from "./types";

export type {
  VNode,
  Component,
  RenderedNode,
  JSXChild,
  JSXChildren,
} from "./types";

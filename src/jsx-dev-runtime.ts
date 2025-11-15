/**
 * JSX automatic runtime (development)
 */

import { h } from "./runtime/vnode";
import { Fragment } from "./runtime/types";
import type { VNode } from "./runtime/types";

export { Fragment };

// Export JSX namespace for TypeScript's automatic JSX transform
// When using jsxImportSource, TypeScript looks for this exported namespace
export namespace JSX {
  export type Element = VNode;

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface IntrinsicElements {
    [elemName: string]: any;
  }
}

export function jsxDEV(
  type: any,
  props: any,
  key?: any,
  _isStaticChildren?: boolean,
  _source?: any,
  _self?: any,
): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    const childArray = Array.isArray(children) ? children : [children];
    return h(type, restProps, ...childArray);
  }

  return h(type, restProps);
}

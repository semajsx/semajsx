/**
 * JSX automatic runtime (production)
 */

import { h } from "./runtime/vnode";
import { Fragment } from "./runtime/types";
import type { VNode } from "./runtime/types";

// Global JSX namespace for TypeScript
declare global {
  namespace JSX {
    type Element = VNode;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes {
      key?: string | number;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export { Fragment };

export function jsx(type: any, props: any, key?: any): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    return h(type, restProps, children);
  }

  return h(type, restProps);
}

export function jsxs(type: any, props: any, key?: any): any {
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

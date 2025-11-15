/**
 * JSX automatic runtime (development)
 */

/// <reference path="./jsx.d.ts" />

import { h } from "./runtime/vnode";
import { Fragment } from "./runtime/types";

export { Fragment };

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

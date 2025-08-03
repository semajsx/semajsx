import "./jsx.d.ts";
import { Fragment } from "./types";
import { h } from "./vnode";

// JSX automatic runtime
export { Fragment };
export const jsx = h;
export const jsxs = h;

// Development version of jsx function with additional debug info
export function jsxDEV(
  _type: any,
  _props: any,
  _key?: any,
  _isStaticChildren?: boolean,
  _source?: any,
  _self?: any,
) {
  // Due to bundler parameter passing issues, we need to use arguments array
  // The named parameters may not receive the correct values from the bundler
  const type = arguments[0];
  const props = arguments[1];
  const key = arguments[2];

  // Extract children from props and pass them as separate arguments to h
  const { children, ...restProps } = props || {};
  const propsWithKey = key ? { ...restProps, key } : restProps;

  const result = children
    ? h(
      type,
      propsWithKey,
      ...(Array.isArray(children) ? children : [children]),
    )
    : h(type, propsWithKey);
  return result;
}

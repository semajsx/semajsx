import { VNode, VNodeType } from "./types";
import { h } from "./vnode";
import { ISLAND_MARKER } from "./shared/island-marker";

export function jsx(type: VNodeType, props: any, key?: any): VNode {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  // Check if this is an island component
  // Island components are functions with ISLAND_MARKER symbol
  if (typeof type === "function" && ISLAND_MARKER in type) {
    // Call the island wrapper directly with all props
    const islandProps =
      children !== undefined ? { ...restProps, children } : restProps;
    return type(islandProps);
  }

  if (children !== undefined) {
    return h(type, restProps, children);
  }

  return h(type, restProps);
}

export function jsxs(type: VNodeType, props: any, key?: any): VNode {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  // Check if this is an island component
  // Island components are functions with ISLAND_MARKER symbol
  if (typeof type === "function" && ISLAND_MARKER in type) {
    // Call the island wrapper directly with all props
    const islandProps =
      children !== undefined ? { ...restProps, children } : restProps;
    return type(islandProps);
  }

  if (children !== undefined) {
    const childArray = Array.isArray(children) ? children : [children];
    return h(type, restProps, ...childArray);
  }

  return h(type, restProps);
}

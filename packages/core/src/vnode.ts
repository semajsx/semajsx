import { Component, Fragment, JSXNode, VNode } from "./types";
import { isSignal } from "./signal-utils";

// Helper function to create VNodes
export function h(
  type: string | Component | typeof Fragment,
  props: Record<string, any> | null,
  ...children: JSXNode[]
): VNode {
  const flattenedChildren = flattenChildren(children);

  return {
    type,
    props,
    children: flattenedChildren,
    key: props?.key,
  };
}

// Flatten nested arrays and convert JSXNode to VNode
function flattenChildren(children: JSXNode[]): VNode[] {
  const result: VNode[] = [];

  for (const child of children) {
    if (child == null || typeof child === "boolean") {
      // Skip null, undefined, true, false
      continue;
    }

    if (Array.isArray(child)) {
      // Recursively flatten arrays
      result.push(...flattenChildren(child));
    } else if (typeof child === "string" || typeof child === "number") {
      // Convert primitives to text vnodes
      result.push(createTextVNode(String(child)));
    } else if (isSignal(child)) {
      // Create a text node with signal information
      result.push({
        type: "#text",
        props: {
          nodeValue: String(child.value),
          signal: child,
        },
        children: [],
        key: undefined,
      } as VNode);
    } else {
      // Already a VNode
      result.push(child as VNode);
    }
  }

  return result;
}

// Create a text VNode
export function createTextVNode(text: string): VNode {
  return {
    type: "#text",
    props: { nodeValue: text },
    children: [],
  };
}

// Check if a value is a VNode
export function isVNode(value: any): value is VNode {
  return value != null &&
    typeof value === "object" &&
    "type" in value &&
    "props" in value &&
    "children" in value;
}

// Fragment helper
export function createFragment(children: JSXNode[]): VNode {
  return h(Fragment, null, ...children);
}

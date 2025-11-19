import type { JSXNode, JSXPrimitive, VNode } from "./types";
import { Fragment } from "./types";
import { isSignal } from "@semajsx/signal";
import { createSignalVNode, createTextVNode, isVNode } from "./vnode";

/**
 * Normalize the `children` prop passed to components so it mirrors React semantics.
 * - 0 children => undefined
 * - 1 child => the child itself
 * - >1 children => array
 */
export function normalizeChildrenProp(
  children: VNode[],
): VNode | VNode[] | undefined {
  if (children.length === 0) {
    return undefined;
  }
  if (children.length === 1) {
    return children[0];
  }
  return children;
}

/**
 * Normalize any JSXNode result from a component into a concrete VNode.
 */
export function normalizeComponentResult(
  result: VNode | JSXPrimitive | Iterable<JSXNode>,
): VNode {
  if (isVNode(result)) {
    return result;
  }

  if (typeof result === "string" || typeof result === "number") {
    return createTextVNode(result);
  }

  if (result == null || typeof result === "boolean") {
    return createTextVNode("");
  }

  if (Array.isArray(result) || isIterable(result)) {
    const normalizedChildren = normalizeIterableChildren(result);
    return {
      type: Fragment,
      props: {},
      children: normalizedChildren,
    };
  }

  throw new Error(`Invalid component return type: ${typeof result}`);
}

function normalizeIterableChildren(children: Iterable<JSXNode>): VNode[] {
  const normalized: VNode[] = [];

  for (const child of children) {
    if (child == null || typeof child === "boolean") {
      continue;
    }

    if (Array.isArray(child) || isIterable(child)) {
      normalized.push(...normalizeIterableChildren(child as Iterable<JSXNode>));
      continue;
    }

    if (typeof child === "string" || typeof child === "number") {
      normalized.push(createTextVNode(child));
      continue;
    }

    if (isSignal(child)) {
      normalized.push(createSignalVNode(child));
      continue;
    }

    if (isVNode(child)) {
      normalized.push(child);
      continue;
    }

    throw new Error(`Invalid child in iterable: ${typeof child}`);
  }

  return normalized;
}

function isIterable(value: unknown): value is Iterable<unknown> {
  return value != null && typeof (value as any)[Symbol.iterator] === "function";
}

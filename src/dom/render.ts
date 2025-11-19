import type { VNode } from "../runtime/types";
import { resource, stream } from "../runtime/helpers";
import { setProperty, setSignalProperty, setRef } from "./properties";
import {
  appendChild,
  createElement,
  createTextNode,
  createComment,
  removeChild,
  replaceNode,
  insertBefore,
  getParent,
  getNextSibling,
} from "./operations";
import { type ContextMap } from "../runtime/context";
import {
  createRenderer,
  isAsyncIterator,
  isPromise,
  type RenderedNode,
  type RenderStrategy,
} from "../runtime/render-core";

/**
 * Result returned by the render function
 */
export interface DOMRenderResult {
  /**
   * Unmount the rendered tree and cleanup subscriptions
   */
  unmount: () => void;
}

/**
 * DOM-specific render strategy with optimization
 */
const domStrategy: RenderStrategy<Node> = {
  createTextNode,
  createComment,
  createElement,
  getParent,
  getNextSibling,
  insertBefore,
  appendChild,
  removeChild,
  replaceNode,
  setProperty,
  setSignalProperty,
  setRef,
  tryReuseNode,
};

// Create DOM renderer with optimization
const { renderNode, unmount: unmountCore } = createRenderer(domStrategy);

/**
 * Render a VNode tree to the DOM
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 *
 * @example
 * // Basic usage
 * const { unmount } = render(<App />, container);
 *
 * @example
 * // With signals (auto-updates)
 * const count = signal(0);
 * render(<div>{count}</div>, container);
 * count.value++; // UI updates automatically
 *
 * @example
 * // Cleanup when needed
 * const { unmount } = render(<App />, container);
 * unmount();
 */
export function render(
  element: VNode | Promise<VNode> | AsyncIterableIterator<VNode>,
  container: Element,
): DOMRenderResult {
  // Initialize empty context map for root render
  const initialContext: ContextMap = new Map();

  let rendered: RenderedNode<Node>;

  // Handle async element (Promise<VNode>)
  if (isPromise(element)) {
    const pending: VNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
    const resultSignal = resource(element, pending);
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: resultSignal, context: initialContext },
      children: [],
    };
    rendered = renderNode(signalVNode, initialContext);
    if (rendered.node) {
      appendChild(container, rendered.node);
    }
  } else if (isAsyncIterator(element)) {
    // Handle async generator (AsyncIterableIterator<VNode>)
    const pending: VNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
    const resultSignal = stream(element, pending);
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: resultSignal, context: initialContext },
      children: [],
    };
    rendered = renderNode(signalVNode, initialContext);
    if (rendered.node) {
      appendChild(container, rendered.node);
    }
  } else {
    // Handle sync VNode
    rendered = renderNode(element, initialContext);

    if (rendered.node) {
      appendChild(container, rendered.node);
    }
  }

  // Return result object with unmount method
  return {
    unmount: () => unmountCore(rendered),
  };
}

/**
 * Try to reuse an existing DOM node instead of replacing it
 * Returns true if the node was successfully reused
 */
function tryReuseNode(
  oldDom: Node,
  newDom: Node,
  oldRendered: RenderedNode<Node>,
  newRendered: RenderedNode<Node>,
): boolean {
  // Both are text nodes - just update the content
  if (
    oldDom.nodeType === Node.TEXT_NODE &&
    newDom.nodeType === Node.TEXT_NODE
  ) {
    if (oldDom.textContent !== newDom.textContent) {
      oldDom.textContent = newDom.textContent;
    }
    // Update the newRendered to point to the old (reused) DOM node
    newRendered.node = oldDom;
    return true;
  }

  // Both are elements with the same tag name - update properties and children
  if (
    oldDom.nodeType === Node.ELEMENT_NODE &&
    newDom.nodeType === Node.ELEMENT_NODE &&
    (oldDom as Element).tagName === (newDom as Element).tagName
  ) {
    const oldElement = oldDom as Element;
    const newElement = newDom as Element;

    // Update attributes
    // Remove old attributes
    for (let i = oldElement.attributes.length - 1; i >= 0; i--) {
      const attr = oldElement.attributes[i];
      if (attr && !newElement.hasAttribute(attr.name)) {
        oldElement.removeAttribute(attr.name);
      }
    }

    // Set new attributes
    for (let i = 0; i < newElement.attributes.length; i++) {
      const attr = newElement.attributes[i];
      if (attr && oldElement.getAttribute(attr.name) !== attr.value) {
        oldElement.setAttribute(attr.name, attr.value);
      }
    }

    // Use keyed reconciliation if children have keys
    const hasKeys = hasChildKeys(oldRendered) || hasChildKeys(newRendered);

    if (
      hasKeys &&
      oldRendered.children.length > 0 &&
      newRendered.children.length > 0
    ) {
      reconcileKeyedChildren(
        oldElement,
        oldRendered.children,
        newRendered.children,
      );
    } else {
      // Fallback: replace all children
      // Clear old children
      while (oldElement.firstChild) {
        oldElement.removeChild(oldElement.firstChild);
      }

      // Add new children
      while (newElement.firstChild) {
        oldElement.appendChild(newElement.firstChild);
      }
    }

    // Update the newRendered to point to the old (reused) DOM node
    newRendered.node = oldDom;

    // Cleanup old subscriptions
    for (const unsub of oldRendered.subscriptions) {
      unsub();
    }

    return true;
  }

  // Different node types - can't reuse
  return false;
}

/**
 * Check if any children have keys
 */
function hasChildKeys(rendered: RenderedNode<Node>): boolean {
  return rendered.children.some((child) => child.vnode.key != null);
}

/**
 * Reconcile children using keys for efficient list updates
 */
function reconcileKeyedChildren(
  parent: Element,
  oldChildren: RenderedNode<Node>[],
  newChildren: RenderedNode<Node>[],
): void {
  // Build a map of old children by key
  const oldKeyMap = new Map<string | number, RenderedNode<Node>>();
  const oldKeylessChildren: RenderedNode<Node>[] = [];

  for (const child of oldChildren) {
    if (child.vnode.key != null) {
      oldKeyMap.set(child.vnode.key, child);
    } else {
      oldKeylessChildren.push(child);
    }
  }

  // Track which old children have been reused
  const reusedKeys = new Set<string | number>();
  let keylessIndex = 0;

  // Process new children
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    if (!newChild) continue;

    const newKey = newChild.vnode.key;
    let oldChild: RenderedNode<Node> | undefined;
    let reused = false;

    // Try to find matching old child by key
    if (newKey != null) {
      oldChild = oldKeyMap.get(newKey);
      if (oldChild) {
        reusedKeys.add(newKey);
        reused = true;
      }
    } else {
      // No key, try to reuse next keyless child
      if (keylessIndex < oldKeylessChildren.length) {
        oldChild = oldKeylessChildren[keylessIndex++];
      }
    }

    // If we found a matching old child, try to update it
    if (oldChild && reused && oldChild.node && newChild.node) {
      const sameType =
        oldChild.vnode.type === newChild.vnode.type ||
        (oldChild.node.nodeType === Node.TEXT_NODE &&
          newChild.node.nodeType === Node.TEXT_NODE);

      if (sameType) {
        // Try to reuse the node
        const nodeReused = tryReuseNode(
          oldChild.node,
          newChild.node,
          oldChild,
          newChild,
        );

        if (nodeReused) {
          // Ensure the child is in the correct position
          const currentNode = parent.childNodes[i];
          if (currentNode !== oldChild.node) {
            parent.insertBefore(oldChild.node, currentNode || null);
          }
          continue;
        }
      }
    }

    // Can't reuse, insert the new child
    if (newChild.node) {
      const currentNode = parent.childNodes[i];
      if (currentNode) {
        parent.insertBefore(newChild.node, currentNode);
      } else {
        parent.appendChild(newChild.node);
      }
    }
  }

  // Remove old children that weren't reused
  for (const [key, oldChild] of oldKeyMap) {
    if (!reusedKeys.has(key) && oldChild.node) {
      removeChild(oldChild.node);
      unmountCore(oldChild);
    }
  }

  // Remove excess keyless children
  for (let i = keylessIndex; i < oldKeylessChildren.length; i++) {
    const oldChild = oldKeylessChildren[i];
    if (oldChild && oldChild.node) {
      removeChild(oldChild.node);
      unmountCore(oldChild);
    }
  }

  // Remove any extra DOM nodes that are still in the parent
  while (parent.childNodes.length > newChildren.length) {
    const lastChild = parent.lastChild;
    if (lastChild) {
      parent.removeChild(lastChild);
    }
  }
}


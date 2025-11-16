import type { VNode, RenderedNode } from "../runtime/types";
import { Fragment } from "../runtime/types";
import { isSignal } from "../signal";
import { isVNode } from "../runtime/vnode";
import { resource, stream } from "../runtime/helpers";
import { setProperty, setSignalProperty } from "./properties";
import {
  createElement,
  createTextNode,
  appendChild,
  removeChild,
  replaceNode,
} from "./operations";

/**
 * Render a VNode tree to the DOM
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 */
export function render(
  element: VNode | Promise<VNode> | AsyncIterableIterator<VNode>,
  container: Element,
): RenderedNode {
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
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    if (rendered.dom) {
      appendChild(container, rendered.dom);
    }
    return rendered;
  }

  // Handle async generator (AsyncIterableIterator<VNode>)
  if (isAsyncIterator(element)) {
    const pending: VNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
    const resultSignal = stream(element, pending);
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    if (rendered.dom) {
      appendChild(container, rendered.dom);
    }
    return rendered;
  }

  // Handle sync VNode
  const rendered = renderNode(element);

  if (rendered.dom) {
    appendChild(container, rendered.dom);
  }

  return rendered;
}

/**
 * Render a single VNode
 */
function renderNode(vnode: VNode): RenderedNode {
  const { type } = vnode;

  // Text node
  if (type === "#text") {
    return renderTextNode(vnode);
  }

  // Signal VNode
  if (type === "#signal") {
    return renderSignalNode(vnode);
  }

  // Fragment
  if (type === Fragment) {
    return renderFragment(vnode);
  }

  // Component
  if (typeof type === "function") {
    return renderComponent(vnode);
  }

  // Element
  if (typeof type === "string") {
    return renderElement(vnode);
  }

  throw new Error(`Unknown VNode type: ${String(type)}`);
}

/**
 * Render a text node
 */
function renderTextNode(vnode: VNode): RenderedNode {
  const text = vnode.props?.nodeValue || "";
  const dom = createTextNode(text);

  return {
    vnode,
    dom,
    subscriptions: [],
    children: [],
  };
}

/**
 * Render a signal VNode
 */
function renderSignalNode(vnode: VNode): RenderedNode {
  const signal = vnode.props?.signal;

  if (!isSignal(signal)) {
    throw new Error("Signal VNode must have a signal prop");
  }

  // Get initial value and render it
  const initialValue = signal.peek();
  let currentRendered = renderValueToNode(initialValue);
  let currentDom = currentRendered.dom;

  const subscriptions: Array<() => void> = [];

  // Subscribe to signal changes
  const unsubscribe = signal.subscribe((value) => {
    const newRendered = renderValueToNode(value);

    // Try to reuse the existing DOM node if possible
    if (currentDom && newRendered.dom) {
      const reused = tryReuseNode(
        currentDom,
        newRendered.dom,
        currentRendered,
        newRendered,
      );

      if (!reused) {
        // Can't reuse, replace the node
        replaceNode(currentDom, newRendered.dom);
        currentDom = newRendered.dom;

        // Cleanup old node
        if (currentRendered) {
          unmount(currentRendered);
        }
      } else {
        // Node was reused, update the DOM reference
        currentDom = newRendered.dom;
      }
    }

    currentRendered = newRendered;
  });

  subscriptions.push(unsubscribe);

  return {
    vnode,
    dom: currentDom,
    subscriptions,
    children: currentRendered ? [currentRendered] : [],
  };
}

/**
 * Try to reuse an existing DOM node instead of replacing it
 * Returns true if the node was successfully reused
 */
function tryReuseNode(
  oldDom: Node,
  newDom: Node,
  oldRendered: RenderedNode,
  newRendered: RenderedNode,
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
    newRendered.dom = oldDom;
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
    newRendered.dom = oldDom;

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
function hasChildKeys(rendered: RenderedNode): boolean {
  return rendered.children.some((child) => child.vnode.key != null);
}

/**
 * Reconcile children using keys for efficient list updates
 */
function reconcileKeyedChildren(
  parent: Element,
  oldChildren: RenderedNode[],
  newChildren: RenderedNode[],
): void {
  // Build a map of old children by key
  const oldKeyMap = new Map<string | number, RenderedNode>();
  const oldKeylessChildren: RenderedNode[] = [];

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
    let oldChild: RenderedNode | undefined;
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
    if (oldChild && reused && oldChild.dom && newChild.dom) {
      const sameType =
        oldChild.vnode.type === newChild.vnode.type ||
        (oldChild.dom.nodeType === Node.TEXT_NODE &&
          newChild.dom.nodeType === Node.TEXT_NODE);

      if (sameType) {
        // Try to reuse the node
        const nodeReused = tryReuseNode(
          oldChild.dom,
          newChild.dom,
          oldChild,
          newChild,
        );

        if (nodeReused) {
          // Ensure the child is in the correct position
          const currentNode = parent.childNodes[i];
          if (currentNode !== oldChild.dom) {
            parent.insertBefore(oldChild.dom, currentNode || null);
          }
          continue;
        }
      }
    }

    // Can't reuse, insert the new child
    if (newChild.dom) {
      const currentNode = parent.childNodes[i];
      if (currentNode) {
        parent.insertBefore(newChild.dom, currentNode);
      } else {
        parent.appendChild(newChild.dom);
      }
    }
  }

  // Remove old children that weren't reused
  for (const [key, oldChild] of oldKeyMap) {
    if (!reusedKeys.has(key) && oldChild.dom) {
      removeChild(oldChild.dom);
      unmount(oldChild);
    }
  }

  // Remove excess keyless children
  for (let i = keylessIndex; i < oldKeylessChildren.length; i++) {
    const oldChild = oldKeylessChildren[i];
    if (oldChild && oldChild.dom) {
      removeChild(oldChild.dom);
      unmount(oldChild);
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

/**
 * Helper to convert a signal value to a rendered node
 */
function renderValueToNode(value: unknown): RenderedNode {
  let newVNode: VNode;

  // Convert value to VNode
  if (isVNode(value)) {
    newVNode = value;
  } else if (typeof value === "string" || typeof value === "number") {
    newVNode = {
      type: "#text",
      props: { nodeValue: String(value) },
      children: [],
    };
  } else if (value == null || typeof value === "boolean") {
    // Render empty text for null/undefined/boolean
    newVNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
  } else {
    throw new Error(`Invalid signal value type: ${typeof value}`);
  }

  return renderNode(newVNode);
}

/**
 * Render a fragment
 */
function renderFragment(vnode: VNode): RenderedNode {
  const children = vnode.children.map((child) => renderNode(child));

  // Fragment has no DOM node of its own
  return {
    vnode,
    dom: null,
    subscriptions: [],
    children,
  };
}

/**
 * Check if a value is a Promise
 */
function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === "function";
}

/**
 * Check if a value is an AsyncIterator
 */
function isAsyncIterator<T>(value: any): value is AsyncIterableIterator<T> {
  return value && typeof value[Symbol.asyncIterator] === "function";
}

/**
 * Render a component
 */
function renderComponent(vnode: VNode): RenderedNode {
  if (typeof vnode.type !== "function") {
    throw new Error("Component vnode must have a function type");
  }

  const Component = vnode.type;
  const props = { ...vnode.props, children: vnode.children };

  // Call component function
  const result = Component(props);

  // Handle async component (Promise<VNode>)
  if (isPromise(result)) {
    const pending: VNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
    const resultSignal = resource(result, pending);
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    return {
      vnode,
      dom: rendered.dom,
      subscriptions: rendered.subscriptions,
      children: [rendered],
    };
  }

  // Handle async generator component (AsyncIterableIterator<VNode>)
  if (isAsyncIterator(result)) {
    const pending: VNode = {
      type: "#text",
      props: { nodeValue: "" },
      children: [],
    };
    const resultSignal = stream(result, pending);
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    return {
      vnode,
      dom: rendered.dom,
      subscriptions: rendered.subscriptions,
      children: [rendered],
    };
  }

  // Handle signal component (Signal<VNode>)
  if (isSignal(result)) {
    const signalVNode: VNode = {
      type: "#signal",
      props: { signal: result },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    return {
      vnode,
      dom: rendered.dom,
      subscriptions: rendered.subscriptions,
      children: [rendered],
    };
  }

  // Handle normal sync component (VNode)
  const rendered = renderNode(result);

  return {
    vnode,
    dom: rendered.dom,
    subscriptions: rendered.subscriptions,
    children: [rendered],
  };
}

/**
 * Render an element
 */
function renderElement(vnode: VNode): RenderedNode {
  if (typeof vnode.type !== "string") {
    throw new Error("Element vnode must have a string type");
  }

  const element = createElement(vnode.type);
  const subscriptions: Array<() => void> = [];

  // Apply props
  const props = vnode.props || {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "key" || key === "children") continue;

    if (isSignal(value)) {
      const unsub = setSignalProperty(element, key, value);
      subscriptions.push(unsub);
    } else {
      setProperty(element, key, value);
    }
  }

  // Render children
  const children = vnode.children.map((child) => renderNode(child));

  for (const child of children) {
    if (child.dom) {
      appendChild(element, child.dom);
    } else if (child.children.length > 0) {
      // Fragment case - append all fragment children
      for (const fragChild of child.children) {
        if (fragChild.dom) {
          appendChild(element, fragChild.dom);
        }
      }
    }
  }

  return {
    vnode,
    dom: element,
    subscriptions,
    children,
  };
}

/**
 * Unmount a rendered node
 */
export function unmount(node: RenderedNode): void {
  // Cleanup subscriptions
  for (const unsub of node.subscriptions) {
    unsub();
  }

  // Recursively unmount children
  for (const child of node.children) {
    unmount(child);
  }

  // Remove from DOM
  if (node.dom) {
    removeChild(node.dom);
  }
}

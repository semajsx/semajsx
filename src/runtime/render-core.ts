import type { VNode } from "./types";
import { Fragment } from "./types";
import { isSignal } from "../signal";
import { isVNode } from "./vnode";
import { resource, stream } from "./helpers";
import { type ContextMap, createComponentAPI } from "./context";
import { normalizeChildrenProp, normalizeComponentResult } from "./component";

/**
 * Generic rendered node structure
 */
export interface RenderedNode<TNode> {
  vnode: VNode;
  node: TNode | null;
  subscriptions: Array<() => void>;
  children: RenderedNode<TNode>[];
}

/**
 * Operations strategy for different rendering targets
 */
export interface RenderStrategy<TNode> {
  /**
   * Create a text node
   */
  createTextNode(text: string): TNode;

  /**
   * Create an element node
   */
  createElement(type: string): TNode;

  /**
   * Append child to parent
   */
  appendChild(parent: TNode, child: TNode): void;

  /**
   * Remove child from its parent
   */
  removeChild(node: TNode): void;

  /**
   * Replace old node with new node
   */
  replaceNode(oldNode: TNode, newNode: TNode): void;

  /**
   * Set a property on a node
   */
  setProperty(node: TNode, key: string, value: unknown): void;

  /**
   * Set a signal property on a node (returns unsubscribe function)
   */
  setSignalProperty(node: TNode, key: string, signal: any): () => void;

  /**
   * Optional: Try to reuse an existing node instead of replacing it
   * Returns true if the node was successfully reused
   * This is used for DOM optimization but not needed for terminal
   */
  tryReuseNode?(
    oldNode: TNode,
    newNode: TNode,
    oldRendered: RenderedNode<TNode>,
    newRendered: RenderedNode<TNode>,
  ): boolean;
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
 * Core rendering logic - works for both DOM and Terminal
 */
export function createRenderer<TNode>(strategy: RenderStrategy<TNode>) {
  /**
   * Render a single VNode
   */
  function renderNode(
    vnode: VNode,
    parentContext: ContextMap,
  ): RenderedNode<TNode> {
    const { type } = vnode;

    // Text node
    if (type === "#text") {
      return renderTextNode(vnode);
    }

    // Signal VNode
    if (type === "#signal") {
      return renderSignalNode(vnode, parentContext);
    }

    // Fragment
    if (type === Fragment) {
      return renderFragment(vnode, parentContext);
    }

    // Component
    if (typeof type === "function") {
      return renderComponent(vnode, parentContext);
    }

    // Element
    if (typeof type === "string") {
      return renderElement(vnode, parentContext);
    }

    throw new Error(`Unknown VNode type: ${String(type)}`);
  }

  /**
   * Render a text node
   */
  function renderTextNode(vnode: VNode): RenderedNode<TNode> {
    const text = vnode.props?.nodeValue || "";
    const node = strategy.createTextNode(text);

    return {
      vnode,
      node,
      subscriptions: [],
      children: [],
    };
  }

  /**
   * Render a signal VNode
   */
  function renderSignalNode(
    vnode: VNode,
    parentContext: ContextMap,
  ): RenderedNode<TNode> {
    const signal = vnode.props?.signal;
    // Use captured context if available (for async components), otherwise parent context
    const contextForSignal = vnode.props?.context || parentContext;

    if (!isSignal(signal)) {
      throw new Error("Signal VNode must have a signal prop");
    }

    // Get initial value and render it
    const initialValue = signal.peek();
    let currentRendered = renderValueToNode(initialValue, contextForSignal);
    let currentNode = currentRendered.node;

    const subscriptions: Array<() => void> = [];

    // Subscribe to signal changes
    const unsubscribe = signal.subscribe((value) => {
      const newRendered = renderValueToNode(value, contextForSignal);

      // Try to reuse the existing node if possible (DOM optimization)
      if (currentNode && newRendered.node && strategy.tryReuseNode) {
        const reused = strategy.tryReuseNode(
          currentNode,
          newRendered.node,
          currentRendered,
          newRendered,
        );

        if (!reused) {
          // Can't reuse, replace the node
          strategy.replaceNode(currentNode, newRendered.node);
          currentNode = newRendered.node;

          // Cleanup old node
          if (currentRendered) {
            unmount(currentRendered);
          }
        } else {
          // Node was reused, update the reference
          currentNode = newRendered.node;
        }
      } else {
        // No reuse optimization, just replace
        if (currentNode && newRendered.node) {
          strategy.replaceNode(currentNode, newRendered.node);
          currentNode = newRendered.node;
        }

        // Cleanup old node
        if (currentRendered) {
          unmount(currentRendered);
        }
      }

      currentRendered = newRendered;
    });

    subscriptions.push(unsubscribe);

    return {
      vnode,
      node: currentNode,
      subscriptions,
      children: currentRendered ? [currentRendered] : [],
    };
  }

  /**
   * Helper to convert a signal value to a rendered node
   */
  function renderValueToNode(
    value: unknown,
    context: ContextMap,
  ): RenderedNode<TNode> {
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
      // This works for both DOM and terminal
      newVNode = {
        type: "#text",
        props: { nodeValue: "" },
        children: [],
      };
    } else {
      throw new Error(`Invalid signal value type: ${typeof value}`);
    }

    return renderNode(newVNode, context);
  }

  /**
   * Render a fragment
   */
  function renderFragment(
    vnode: VNode,
    parentContext: ContextMap,
  ): RenderedNode<TNode> {
    const children = vnode.children.map((child) =>
      renderNode(child, parentContext),
    );

    // Fragment has no node of its own
    return {
      vnode,
      node: null,
      subscriptions: [],
      children,
    };
  }

  /**
   * Render a component
   */
  function renderComponent(
    vnode: VNode,
    parentContext: ContextMap,
  ): RenderedNode<TNode> {
    if (typeof vnode.type !== "function") {
      throw new Error("Component vnode must have a function type");
    }

    const Component = vnode.type;
    const props = {
      ...vnode.props,
      children: normalizeChildrenProp(vnode.children),
    };

    // Prepare current component's context
    let currentContext = parentContext;

    // Check if this is a Context Provider
    const isContextProvider = (Component as any).__isContextProvider;

    if (isContextProvider) {
      // Context Provider: create new context map with provided values
      currentContext = new Map(parentContext);
      const provide = (props as any).provide;

      if (provide) {
        // Check if it's a single provide [Context, value] or multiple [[Context, value], ...]
        const isSingle = provide.length === 2 && typeof provide[0] === "symbol";

        if (isSingle) {
          // Single: [Context, value]
          const [context, value] = provide;
          currentContext.set(context, value);
        } else {
          // Multiple: [[Context, value], ...]
          for (const [context, value] of provide) {
            currentContext.set(context, value);
          }
        }
      }
    }

    // Create ComponentAPI
    const ctx = createComponentAPI(currentContext);

    // Call component function with props and ctx
    const result = Component(props, ctx);

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
        props: { signal: resultSignal, context: currentContext },
        children: [],
      };
      const rendered = renderNode(signalVNode, currentContext);
      return {
        vnode,
        node: rendered.node,
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
        props: { signal: resultSignal, context: currentContext },
        children: [],
      };
      const rendered = renderNode(signalVNode, currentContext);
      return {
        vnode,
        node: rendered.node,
        subscriptions: rendered.subscriptions,
        children: [rendered],
      };
    }

    // Handle signal component (Signal<VNode>)
    if (isSignal(result)) {
      const signalVNode: VNode = {
        type: "#signal",
        props: { signal: result, context: currentContext },
        children: [],
      };
      const rendered = renderNode(signalVNode, currentContext);
      return {
        vnode,
        node: rendered.node,
        subscriptions: rendered.subscriptions,
        children: [rendered],
      };
    }

    // Handle normal sync component (VNode)
    const normalizedResult = normalizeComponentResult(result);
    const rendered = renderNode(normalizedResult, currentContext);

    return {
      vnode,
      node: rendered.node,
      subscriptions: rendered.subscriptions,
      children: [rendered],
    };
  }

  /**
   * Render an element
   */
  function renderElement(
    vnode: VNode,
    parentContext: ContextMap,
  ): RenderedNode<TNode> {
    if (typeof vnode.type !== "string") {
      throw new Error("Element vnode must have a string type");
    }

    const element = strategy.createElement(vnode.type);
    const subscriptions: Array<() => void> = [];

    // Apply props
    const props = vnode.props || {};
    for (const [key, value] of Object.entries(props)) {
      if (key === "key" || key === "children") continue;

      if (isSignal(value)) {
        const unsub = strategy.setSignalProperty(element, key, value);
        subscriptions.push(unsub);
      } else {
        strategy.setProperty(element, key, value);
      }
    }

    // Render children with same context
    const children = vnode.children.map((child) =>
      renderNode(child, parentContext),
    );

    for (const child of children) {
      if (child.node) {
        strategy.appendChild(element, child.node);
      } else if (child.children.length > 0) {
        // Fragment case - append all fragment children
        for (const fragChild of child.children) {
          if (fragChild.node) {
            strategy.appendChild(element, fragChild.node);
          }
        }
      }
    }

    return {
      vnode,
      node: element,
      subscriptions,
      children,
    };
  }

  /**
   * Unmount a rendered node
   */
  function unmount(node: RenderedNode<TNode>): void {
    // Cleanup subscriptions
    for (const unsub of node.subscriptions) {
      unsub();
    }

    // Recursively unmount children
    for (const child of node.children) {
      unmount(child);
    }

    // Remove from tree
    if (node.node) {
      strategy.removeChild(node.node);
    }
  }

  /**
   * Clean up subscriptions without removing nodes from tree
   */
  function cleanupSubscriptions(node: RenderedNode<TNode>): void {
    // Cleanup subscriptions
    for (const unsub of node.subscriptions) {
      unsub();
    }

    // Recursively cleanup children
    for (const child of node.children) {
      cleanupSubscriptions(child);
    }
  }

  return {
    renderNode,
    unmount,
    cleanupSubscriptions,
  };
}

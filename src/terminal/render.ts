import type { VNode, Component } from '../runtime/types';
import { Fragment } from '../runtime/types';
import { isSignal } from '../signal';
import { isVNode } from '../runtime/vnode';
import { resource, stream } from '../runtime/helpers';
import { setProperty, setSignalProperty } from './properties';
import {
  createElement,
  createTextNode,
  createComment,
  appendChild,
  removeChild,
  replaceNode,
} from './operations';
import { TerminalRenderer } from './renderer';
import type { TerminalNode } from './types';

/**
 * Rendered node in terminal
 */
interface RenderedTerminalNode {
  vnode: VNode;
  node: TerminalNode | null;
  subscriptions: Array<() => void>;
  children: RenderedTerminalNode[];
}

/**
 * Render a VNode tree to the terminal
 */
export function render(
  vnode: VNode,
  renderer: TerminalRenderer
): { rendered: RenderedTerminalNode; unmount: () => void } {
  const root = renderer.getRoot();
  const rendered = renderNode(vnode);

  if (rendered.node) {
    appendChild(root, rendered.node);
  } else if (rendered.children.length > 0) {
    // Fragment case - append all fragment children
    for (const child of rendered.children) {
      if (child.node) {
        appendChild(root, child.node);
      }
    }
  }

  // Initial render
  renderer.render();

  // Return unmount function
  const unmount = () => {
    unmountNode(rendered);
    renderer.destroy();
  };

  return { rendered, unmount };
}

/**
 * Render a single VNode to a terminal node
 */
function renderNode(vnode: VNode): RenderedTerminalNode {
  const { type } = vnode;

  // Text node
  if (type === '#text') {
    return renderTextNode(vnode);
  }

  // Signal VNode
  if (type === '#signal') {
    return renderSignalNode(vnode);
  }

  // Fragment
  if (type === Fragment) {
    return renderFragment(vnode);
  }

  // Component
  if (typeof type === 'function') {
    return renderComponent(vnode);
  }

  // Element
  if (typeof type === 'string') {
    return renderElement(vnode);
  }

  throw new Error(`Unknown VNode type: ${String(type)}`);
}

/**
 * Render a text node
 */
function renderTextNode(vnode: VNode): RenderedTerminalNode {
  const text = vnode.props?.nodeValue || '';
  const node = createTextNode(text);

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
function renderSignalNode(vnode: VNode): RenderedTerminalNode {
  const signal = vnode.props?.signal;

  if (!isSignal(signal)) {
    throw new Error('Signal VNode must have a signal prop');
  }

  // Get initial value and render it
  const initialValue = signal.peek();
  let currentRendered = renderValueToNode(initialValue);
  let currentNode = currentRendered.node;

  const subscriptions: Array<() => void> = [];

  // Subscribe to signal changes
  const unsubscribe = signal.subscribe(value => {
    const newRendered = renderValueToNode(value);

    // Replace old node with new one
    if (currentNode && newRendered.node) {
      replaceNode(currentNode, newRendered.node);
      currentNode = newRendered.node;
    }

    // Cleanup old node
    if (currentRendered) {
      unmountNode(currentRendered);
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
function renderValueToNode(value: unknown): RenderedTerminalNode {
  let newVNode: VNode;

  // Convert value to VNode
  if (isVNode(value)) {
    newVNode = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    newVNode = {
      type: '#text',
      props: { nodeValue: String(value) },
      children: [],
    };
  } else if (value == null || typeof value === 'boolean') {
    // Render empty Fragment for null/undefined/boolean (renders nothing)
    newVNode = {
      type: Fragment,
      props: {},
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
function renderFragment(vnode: VNode): RenderedTerminalNode {
  const children = vnode.children.map(child => renderNode(child));

  // Fragment has no node of its own
  return {
    vnode,
    node: null,
    subscriptions: [],
    children,
  };
}

/**
 * Check if a value is a Promise
 */
function isPromise<T>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function';
}

/**
 * Check if a value is an AsyncIterator
 */
function isAsyncIterator<T>(value: any): value is AsyncIterableIterator<T> {
  return value && typeof value[Symbol.asyncIterator] === 'function';
}

/**
 * Render a component
 */
function renderComponent(vnode: VNode): RenderedTerminalNode {
  if (typeof vnode.type !== 'function') {
    throw new Error('Component vnode must have a function type');
  }

  const Component = vnode.type;
  const props = { ...vnode.props, children: vnode.children };

  // Call component function
  const result = Component(props);

  // Handle async component (Promise<VNode>)
  if (isPromise(result)) {
    const pending: VNode = {
      type: '#text',
      props: { nodeValue: '' },
      children: [],
    };
    const resultSignal = resource(result, pending);
    const signalVNode: VNode = {
      type: '#signal',
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
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
      type: '#text',
      props: { nodeValue: '' },
      children: [],
    };
    const resultSignal = stream(result, pending);
    const signalVNode: VNode = {
      type: '#signal',
      props: { signal: resultSignal },
      children: [],
    };
    const rendered = renderNode(signalVNode);
    return {
      vnode,
      node: rendered.node,
      subscriptions: rendered.subscriptions,
      children: [rendered],
    };
  }

  // Handle normal sync component (VNode)
  const rendered = renderNode(result);

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
function renderElement(vnode: VNode): RenderedTerminalNode {
  if (typeof vnode.type !== 'string') {
    throw new Error('Element vnode must have a string type');
  }

  const element = createElement(vnode.type);
  const subscriptions: Array<() => void> = [];

  // Apply props
  const props = vnode.props || {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'key' || key === 'children') continue;

    if (isSignal(value)) {
      const unsub = setSignalProperty(element, key, value);
      subscriptions.push(unsub);
    } else {
      setProperty(element, key, value);
    }
  }

  // Render children
  const children = vnode.children.map(child => renderNode(child));

  for (const child of children) {
    if (child.node) {
      appendChild(element, child.node);
    } else if (child.children.length > 0) {
      // Fragment case - append all fragment children
      for (const fragChild of child.children) {
        if (fragChild.node) {
          appendChild(element, fragChild.node);
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
function unmountNode(node: RenderedTerminalNode): void {
  // Cleanup subscriptions
  for (const unsub of node.subscriptions) {
    unsub();
  }

  // Recursively unmount children
  for (const child of node.children) {
    unmountNode(child);
  }

  // Remove from tree
  if (node.node) {
    removeChild(node.node);
  }
}

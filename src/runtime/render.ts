import type { VNode, RenderedNode, Component } from './types';
import { Fragment } from './types';
import { isSignal, effect } from '../signal';
import { isVNode } from './vnode';
import { setProperty, setSignalProperty } from '../dom/properties';
import {
  createElement,
  createTextNode,
  createComment,
  appendChild,
  removeChild,
  replaceNode,
} from '../dom/operations';

/**
 * Render a VNode tree to the DOM
 */
export function render(vnode: VNode, container: Element): RenderedNode {
  const rendered = renderNode(vnode);

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
function renderTextNode(vnode: VNode): RenderedNode {
  const text = vnode.props?.nodeValue || '';
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
    throw new Error('Signal VNode must have a signal prop');
  }

  // Create a placeholder comment
  const placeholder = createComment('signal');
  let currentDom: Node | null = placeholder;
  let currentRendered: RenderedNode | null = null;

  const subscriptions: Array<() => void> = [];

  // Subscribe to signal changes
  const unsubscribe = effect(() => {
    const value = signal.value;
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
      // Render empty text for null/undefined/boolean
      newVNode = {
        type: '#text',
        props: { nodeValue: '' },
        children: [],
      };
    } else {
      throw new Error(`Invalid signal value type: ${typeof value}`);
    }

    // Render new node
    const newRendered = renderNode(newVNode);

    // Replace old node with new one
    if (currentDom && newRendered.dom) {
      replaceNode(currentDom, newRendered.dom);
      currentDom = newRendered.dom;
    }

    // Cleanup old node
    if (currentRendered) {
      unmount(currentRendered);
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
 * Render a component
 */
function renderComponent(vnode: VNode): RenderedNode {
  const Component = vnode.type as Component;
  const props = { ...vnode.props, children: vnode.children };

  // Call component function
  const resultVNode = Component(props);

  // Render the result
  const rendered = renderNode(resultVNode);

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
  const element = createElement(vnode.type as string);
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

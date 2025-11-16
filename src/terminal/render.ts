import type { VNode } from "../runtime/types";
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
import { TerminalRenderer } from "./renderer";
import type { TerminalNode } from "./types";
import { getExitingSignal, resetExitingSignal } from "./components/ExitHint";
import {
  createComponentAPI,
  type ContextMap,
} from "../runtime/context";

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
 * Options for terminal rendering
 */
export interface RenderOptions {
  /**
   * Custom renderer instance. If not provided, one will be created automatically.
   */
  renderer?: TerminalRenderer;
  /**
   * Whether to automatically re-render on signal changes.
   * @default true
   */
  autoRender?: boolean;
  /**
   * Target frames per second for auto-rendering.
   * @default 60
   */
  fps?: number;
  /**
   * Output stream to render to. Only used if renderer is not provided.
   * @default process.stdout
   */
  stream?: NodeJS.WriteStream;
}

/**
 * Return type for render function
 */
export interface RenderResult {
  /**
   * Re-render the tree (useful for manual updates)
   */
  rerender: () => void;
  /**
   * Unmount and cleanup
   */
  unmount: () => void;
  /**
   * Wait for all pending async operations
   */
  waitUntilExit: () => Promise<void>;
}

/**
 * Options for print function
 */
export interface PrintOptions {
  /**
   * Output stream to print to.
   * @default process.stdout
   */
  stream?: NodeJS.WriteStream;
}

/**
 * Render a VNode tree to the terminal
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 *
 * @example
 * // Simple usage (ink-style)
 * const { unmount } = render(<App />);
 *
 * @example
 * // With custom stream
 * render(<App />, { stream: process.stderr });
 *
 * @example
 * // Disable auto-rendering
 * const { rerender } = render(<App />, { autoRender: false });
 * setInterval(rerender, 100);
 *
 * @example
 * // With custom renderer
 * const renderer = new TerminalRenderer(process.stderr);
 * render(<App />, { renderer });
 *
 * @example
 * // Custom FPS
 * render(<App />, { fps: 30 });
 */
export function render(
  element: VNode | Promise<VNode> | AsyncIterableIterator<VNode>,
  options: RenderOptions = {},
): RenderResult {
  const {
    renderer,
    autoRender = true,
    fps = 60,
    stream: outputStream = process.stdout,
  } = options;

  // Reset exiting signal for new render
  resetExitingSignal();

  // Auto-create renderer if not provided (ink-style API)
  const autoCreated = !renderer;
  const actualRenderer = renderer || new TerminalRenderer(outputStream);

  const root = actualRenderer.getRoot();

  // Initialize empty context map for root render
  const initialContext: ContextMap = new Map();

  // Handle async element (Promise<VNode>)
  let rendered: RenderedTerminalNode;
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
  } else {
    // Handle sync VNode
    rendered = renderNode(element, initialContext);
  }

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
  actualRenderer.render();

  // Auto re-render on signal changes (like ink)
  let renderInterval: NodeJS.Timeout | null = null;
  if (autoRender) {
    const interval = Math.floor(1000 / fps);
    renderInterval = setInterval(() => {
      actualRenderer.render();
    }, interval);
  }

  // Promise that resolves on exit
  let exitResolver: (() => void) | null = null;
  const exitPromise = new Promise<void>((resolve) => {
    exitResolver = resolve;
  });

  // Unmount function
  const unmount = () => {
    // Mark as exiting to hide ExitHint components
    getExitingSignal().value = true;

    // Trigger one final render to apply ExitHint changes
    // This removes exit prompts from the final output
    actualRenderer.render();

    // Stop auto-rendering
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = null;
    }

    // Clean up subscriptions only (preserve output on exit)
    // This keeps the final rendered output visible in the terminal
    cleanupSubscriptions(rendered);
    actualRenderer.destroy();
    if (exitResolver) {
      exitResolver();
    }
  };

  // Handle Ctrl+C if auto-created
  if (autoCreated) {
    const handleExit = () => {
      unmount();
      process.exit(0);
    };

    process.on("SIGINT", handleExit);
    process.on("SIGTERM", handleExit);

    // Enable stdin for keyboard input
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();

      const handleKeypress = (data: Buffer) => {
        const key = data.toString();
        // Ctrl+C or ESC to exit
        if (key === "\u0003" || key === "\u001b") {
          process.stdin.removeListener("data", handleKeypress);
          handleExit();
        }
      };

      process.stdin.on("data", handleKeypress);
    }
  }

  return {
    rerender: () => actualRenderer.render(),
    unmount,
    waitUntilExit: () => exitPromise,
  };
}

/**
 * Render a single VNode to a terminal node
 */
function renderNode(vnode: VNode, parentContext: ContextMap): RenderedTerminalNode {
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
function renderTextNode(vnode: VNode): RenderedTerminalNode {
  const text = vnode.props?.nodeValue || "";
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
function renderSignalNode(vnode: VNode, parentContext: ContextMap): RenderedTerminalNode {
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
function renderValueToNode(value: unknown, context: ContextMap): RenderedTerminalNode {
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
    // Render empty Fragment for null/undefined/boolean (renders nothing)
    newVNode = {
      type: Fragment,
      props: {},
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
function renderFragment(vnode: VNode, parentContext: ContextMap): RenderedTerminalNode {
  const children = vnode.children.map((child) => renderNode(child, parentContext));

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
function renderComponent(vnode: VNode, parentContext: ContextMap): RenderedTerminalNode {
  if (typeof vnode.type !== "function") {
    throw new Error("Component vnode must have a function type");
  }

  const Component = vnode.type;

  // Normalize children prop like React does:
  // - No children: undefined
  // - Single child: the child itself
  // - Multiple children: array of children
  let childrenProp: any;
  if (vnode.children.length === 0) {
    childrenProp = undefined;
  } else if (vnode.children.length === 1) {
    childrenProp = vnode.children[0];
  } else {
    childrenProp = vnode.children;
  }

  const props = { ...vnode.props, children: childrenProp };

  // Prepare current component's context
  let currentContext = parentContext;

  // Check if this is a Provider
  const isProvider = (Component as any).__isContextProvider;
  const contextId = (Component as any).__contextId;

  if (isProvider && contextId) {
    // Provider: create new context map with overridden value
    currentContext = new Map(parentContext);
    currentContext.set(contextId, (props as any).value);
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
  const rendered = renderNode(result, currentContext);

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
function renderElement(vnode: VNode, parentContext: ContextMap): RenderedTerminalNode {
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

  // Render children with same context
  const children = vnode.children.map((child) => renderNode(child, parentContext));

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

/**
 * Print a VNode tree to the terminal once (no auto-rendering).
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 *
 * This is a convenience function for one-time rendering scenarios like:
 * - Server startup messages
 * - CLI output
 * - Static terminal displays
 *
 * Unlike `render()`, this function:
 * - Does not subscribe to signal changes
 * - Does not auto-render on updates
 * - Immediately outputs and cleans up
 * - Does not capture keyboard input
 *
 * @example
 * // Simple server output
 * print(
 *   <box border="round" borderColor="green" padding={1}>
 *     <text bold color="green">Server started!</text>
 *     <text>URL: http://localhost:3000</text>
 *   </box>
 * );
 *
 * @example
 * // Print to stderr
 * print(<text color="red">Error occurred</text>, { stream: process.stderr });
 */
export function print(
  element: VNode | Promise<VNode> | AsyncIterableIterator<VNode>,
  options: PrintOptions = {},
): void {
  const { stream: outputStream = process.stdout } = options;

  // Save raw mode state
  const wasRawMode = process.stdin.isTTY && process.stdin.isRaw;

  // Create renderer
  const renderer = new TerminalRenderer(outputStream);
  const root = renderer.getRoot();

  // Initialize empty context map for root render
  const initialContext: ContextMap = new Map();

  // Render the element
  let rendered: RenderedTerminalNode;
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
  } else if (isAsyncIterator(element)) {
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
  } else {
    rendered = renderNode(element, initialContext);
  }

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

  // Render once
  renderer.render();

  // Clean up subscriptions only (don't remove nodes from tree)
  // This keeps the output visible after destroy
  cleanupSubscriptions(rendered);

  // Destroy renderer (outputs final result and shows cursor)
  renderer.destroy();

  // Restore raw mode if it was enabled
  if (process.stdin.isTTY && process.stdin.setRawMode && wasRawMode) {
    process.stdin.setRawMode(true);
  }
}

/**
 * Clean up subscriptions without removing nodes from tree
 */
function cleanupSubscriptions(node: RenderedTerminalNode): void {
  // Cleanup subscriptions
  for (const unsub of node.subscriptions) {
    unsub();
  }

  // Recursively cleanup children
  for (const child of node.children) {
    cleanupSubscriptions(child);
  }
}

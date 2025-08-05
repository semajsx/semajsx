import {
  Component,
  ErrorBoundary,
  Fragment,
  RenderedNode,
  RenderStrategies,
  Suspense,
  VNode,
} from "./types";
import { PluginManager } from "./plugin-manager";
import { applyProps } from "./signal-utils";
import { createTextVNode, isVNode } from "./vnode";
import {
  clearSuspenseState,
  getComponentStack,
  getSuspenseState,
  popComponentStack,
  pushComponentStack,
  setSuspenseState,
} from "./suspense-state";

// Map to store re-render callbacks
const reRenderCallbacks = new Map<VNode, () => void>();

export function renderNode(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode | null | Promise<RenderedNode> {
  // Plugin transformation
  const transformedVNode = plugins.transform(vnode);
  if (!transformedVNode) return null; // Plugin filtered out this vnode

  vnode = transformedVNode;

  // Built-in component handling
  if (vnode.type === ErrorBoundary) {
    return renderErrorBoundary(vnode, container, strategies, plugins);
  }

  if (vnode.type === Suspense) {
    return renderSuspense(vnode, container, strategies, plugins);
  }

  if (vnode.type === Fragment) {
    return renderFragment(vnode, container, strategies, plugins);
  }

  // Text node handling
  if (vnode.type === "#text") {
    return renderTextNode(vnode, container, strategies);
  }

  // Signal VNode handling
  if (vnode.type === "#signal") {
    return renderSignalNode(vnode, container, strategies, plugins);
  }

  // Regular elements and components
  if (typeof vnode.type === "string") {
    return renderElement(vnode, container, strategies, plugins);
  }

  if (typeof vnode.type === "function") {
    return renderComponent(vnode, container, strategies, plugins);
  }

  throw new Error(
    `Unknown vnode type: ${
      typeof vnode.type === "symbol" ? vnode.type : vnode.type
    }`,
  );
}

function renderTextNode(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
): RenderedNode {
  const text = vnode.props?.nodeValue || "";
  const signal = vnode.props?.signal;
  const element = strategies.createTextNode(text, container);

  const subscriptions: (() => void)[] = [];

  // If this text node is connected to a signal, subscribe to changes
  if (signal) {
    const unsubscribe = signal.subscribe((newValue: any) => {
      const newText = String(newValue);

      if (element.nodeValue !== undefined) {
        // Text node
        element.nodeValue = newText;
      } else if (element.textContent !== undefined) {
        // Element node
        element.textContent = newText;
      }
    });
    subscriptions.push(unsubscribe);
  }

  return {
    vnode,
    element,
    subscriptions,
    children: [],
  };
}

function renderSignalNode(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode {
  const signal = vnode.props?.signal;
  const initialVNode = vnode.props?.signalVNode;

  if (!signal || !initialVNode) {
    throw new Error("Invalid signal VNode: missing signal or signalVNode props");
  }

  // Render the initial VNode
  let currentRenderedNode = renderNode(initialVNode, container, strategies, plugins) as RenderedNode;
  
  const subscriptions: (() => void)[] = [];

  // Subscribe to signal changes
  const unsubscribe = signal.subscribe((newValue: any) => {
    // Check if the new value is a VNode
    if (isVNode(newValue)) {
      // Unmount the current node
      if (currentRenderedNode) {
        unmountNode(currentRenderedNode, strategies);
        if (currentRenderedNode.element) {
          strategies.removeChild(container, currentRenderedNode.element);
        }
      }

      // Render the new VNode
      const newRenderedNode = renderNode(newValue, container, strategies, plugins) as RenderedNode;
      if (newRenderedNode && newRenderedNode.element) {
        strategies.appendChild(container, newRenderedNode.element);
      }
      
      currentRenderedNode = newRenderedNode;
    }
  });
  
  subscriptions.push(unsubscribe);

  // Append initial element to container
  if (currentRenderedNode && currentRenderedNode.element) {
    strategies.appendChild(container, currentRenderedNode.element);
  }

  return {
    vnode,
    element: currentRenderedNode?.element || null,
    subscriptions,
    children: currentRenderedNode ? [currentRenderedNode] : [],
  };
}

function renderElement(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode {
  const element = strategies.createElement(vnode.type as string, container);

  // Apply props with plugin transformation
  const props = vnode.props || {};
  const transformedProps = plugins.props(props, vnode);
  const subscriptions = applyProps(element, transformedProps, strategies);

  // Plugin lifecycle: create
  plugins.create(element, vnode);

  // Render children
  const renderedChildren: RenderedNode[] = [];
  for (const child of vnode.children) {
    const renderedChild = renderNode(child, element, strategies, plugins);
    if (renderedChild instanceof Promise) {
      // For now, we don't support async children in regular elements
      // This should be handled by Suspense boundary
      throw renderedChild;
    }
    if (renderedChild) {
      renderedChildren.push(renderedChild);
      if (renderedChild.element) {
        strategies.appendChild(element, renderedChild.element);
      }
    }
  }

  // Platform lifecycle
  if (strategies.onMount) {
    strategies.onMount(element, container);
  }

  // Plugin lifecycle: mount
  plugins.mount(element, vnode);

  return {
    vnode,
    element,
    subscriptions,
    children: renderedChildren,
  };
}

function renderComponent(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode | Promise<RenderedNode> {
  const Component = vnode.type as Component;
  const props = { ...vnode.props, children: vnode.children };

  pushComponentStack(Component.displayName || Component.name || "Anonymous");

  try {
    const result = Component(props);

    // Handle async components
    if (result instanceof Promise) {
      return result.then((resolvedVNode) => {
        popComponentStack();
        const renderedNode = renderNode(
          resolvedVNode,
          container,
          strategies,
          plugins,
        ) as RenderedNode;

        // Append the rendered component to the container
        if (renderedNode && renderedNode.element) {
          strategies.appendChild(container, renderedNode.element);
        }

        return renderedNode;
      }).catch((error) => {
        popComponentStack();
        throw error;
      });
    }

    popComponentStack();
    const renderedNode = renderNode(
      result,
      container,
      strategies,
      plugins,
    ) as RenderedNode;

    // Append the rendered component to the container
    if (renderedNode && renderedNode.element) {
      strategies.appendChild(container, renderedNode.element);
    }

    return renderedNode;
  } catch (error) {
    popComponentStack();
    throw error;
  }
}

function renderFragment(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode {
  const fragment = strategies.createFragment(container);
  const renderedChildren: RenderedNode[] = [];

  for (const child of vnode.children) {
    const renderedChild = renderNode(child, fragment, strategies, plugins);
    if (renderedChild instanceof Promise) {
      // Async children should be handled by Suspense
      throw renderedChild;
    }
    if (renderedChild) {
      renderedChildren.push(renderedChild);
      if (renderedChild.element) {
        strategies.appendChild(fragment, renderedChild.element);
      }
    }
  }

  return {
    vnode,
    element: fragment,
    subscriptions: [],
    children: renderedChildren,
  };
}

function renderErrorBoundary(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode {
  const { fallback, onError, children } = vnode.props || {};

  try {
    // Render children
    const childrenArray = Array.isArray(children) ? children : [children];
    const renderedChildren: RenderedNode[] = [];

    for (const child of childrenArray) {
      const rendered = renderNode(child, container, strategies, plugins);
      if (rendered instanceof Promise) {
        // Async children are handled by catching the promise
        throw rendered;
      }
      if (rendered) {
        renderedChildren.push(rendered);
      }
    }

    return {
      vnode,
      element: null, // ErrorBoundary is logical, creates no DOM
      subscriptions: [],
      children: renderedChildren,
    };
  } catch (error: any) {
    // If it's a promise (async component), let it bubble to Suspense
    if (error instanceof Promise) {
      throw error;
    }

    // Error callback
    onError?.(error, { componentStack: getComponentStack() });

    // Get fallback
    let fallbackVNode: VNode;
    const retry = () => {
      reRenderCallbacks.get(vnode)?.();
    };

    if (fallback) {
      // User provided fallback
      fallbackVNode = typeof fallback === "function"
        ? fallback(error, retry)
        : fallback;
    } else {
      // Plugin provided fallback
      fallbackVNode = plugins.getError(error, retry) ||
        createTextVNode(`An error occurred: ${error.message}`);
    }

    const renderedFallback = renderNode(
      fallbackVNode,
      container,
      strategies,
      plugins,
    );
    if (renderedFallback instanceof Promise) {
      // If fallback is async, we need to handle it synchronously
      return {
        vnode,
        element: null,
        subscriptions: [],
        children: [],
      };
    }

    return {
      vnode,
      element: null,
      subscriptions: [],
      children: renderedFallback ? [renderedFallback] : [],
    };
  }
}

function renderSuspense(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies<any, any>,
  plugins: PluginManager,
): RenderedNode {
  const { fallback, children } = vnode.props || {};
  const suspenseKey = `suspense-${vnode.key || Math.random()}`;

  // Store re-render callback
  reRenderCallbacks.set(vnode, () => {
    // Re-render logic would go here
    clearSuspenseState(suspenseKey);
  });

  // Check for pending async operations
  const pendingPromises = getSuspenseState(suspenseKey);

  if (pendingPromises.length > 0) {
    // Render loading fallback
    let fallbackVNode: VNode;

    if (fallback) {
      fallbackVNode = fallback;
    } else {
      // Plugin provided loading
      fallbackVNode = plugins.getLoading() || createTextVNode("Loading...");
    }

    const renderedFallback = renderNode(
      fallbackVNode,
      container,
      strategies,
      plugins,
    );
    if (renderedFallback instanceof Promise) {
      // Fallback shouldn't be async
      return {
        vnode,
        element: null,
        subscriptions: [],
        children: [],
      };
    }

    return {
      vnode,
      element: null,
      subscriptions: [],
      children: renderedFallback ? [renderedFallback] : [],
    };
  }

  // Try to render children
  try {
    const childrenArray = Array.isArray(children) ? children : [children];
    const renderedChildren: RenderedNode[] = [];
    const promises: Promise<any>[] = [];

    for (const child of childrenArray) {
      const result = renderNode(child, container, strategies, plugins);

      // Check for async components
      if (result instanceof Promise) {
        promises.push(result);
      } else if (result) {
        renderedChildren.push(result);
      }
    }

    if (promises.length > 0) {
      // Store promises and trigger suspense
      setSuspenseState(suspenseKey, promises);

      // Wait for all promises then re-render
      Promise.all(promises).then(() => {
        clearSuspenseState(suspenseKey);
        reRenderCallbacks.get(vnode)?.();
      });

      // Render loading fallback
      const fallbackVNode = fallback ||
        plugins.getLoading() ||
        createTextVNode("Loading...");

      const renderedFallback = renderNode(
        fallbackVNode,
        container,
        strategies,
        plugins,
      );
      if (renderedFallback instanceof Promise) {
        // Fallback shouldn't be async
        return {
          vnode,
          element: null,
          subscriptions: [],
          children: [],
        };
      }

      return {
        vnode,
        element: null,
        subscriptions: [],
        children: renderedFallback ? [renderedFallback] : [],
      };
    }

    return {
      vnode,
      element: null,
      subscriptions: [],
      children: renderedChildren,
    };
  } catch (promise) {
    if (promise instanceof Promise) {
      // Wait for async completion then re-render
      promise.then(() => {
        clearSuspenseState(suspenseKey);
        reRenderCallbacks.get(vnode)?.();
      });

      // Render loading fallback
      const fallbackVNode = fallback ||
        plugins.getLoading() ||
        createTextVNode("Loading...");

      const renderedFallback = renderNode(
        fallbackVNode,
        container,
        strategies,
        plugins,
      );
      if (renderedFallback instanceof Promise) {
        // Fallback shouldn't be async
        return {
          vnode,
          element: null,
          subscriptions: [],
          children: [],
        };
      }

      return {
        vnode,
        element: null,
        subscriptions: [],
        children: renderedFallback ? [renderedFallback] : [],
      };
    }

    // Other errors continue to throw
    throw promise;
  }
}

// Memory management
export function unmountNode(
  node: RenderedNode,
  strategies: RenderStrategies<any, any>,
): void {
  // Cleanup signal subscriptions
  node.subscriptions.forEach((unsubscribe) => unsubscribe());

  // Recursively unmount children
  node.children.forEach((child) => unmountNode(child, strategies));

  // Platform-specific cleanup
  if (strategies.onUnmount && node.element) {
    strategies.onUnmount(node.element);
  }
}

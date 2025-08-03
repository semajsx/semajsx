import type { RenderedNode, RendererConfig, VNode } from "@semajsx/core";
import { createRenderer } from "@semajsx/core";
import {
  browserFeatures,
  domStrategies,
  domStrategiesWithMetrics,
  getPerformanceMetrics,
  resetPerformanceMetrics,
} from "./dom-strategies.js";

// Web-specific renderer configuration
export interface WebRendererConfig extends Omit<RendererConfig, "platform"> {
  enableMetrics?: boolean;
  container?: Element;
  hydrate?: boolean;
}

// Create web renderer with sensible defaults
export function createWebRenderer(config: WebRendererConfig = {}) {
  const {
    plugins = [],
    enableMetrics = false,
    ...restConfig
  } = config;

  const strategies = enableMetrics ? domStrategiesWithMetrics : domStrategies;

  return createRenderer(strategies, {
    platform: "web",
    plugins,
    ...restConfig,
  });
}

// Convenience render function for common usage
export function render(
  vnode: VNode | JSX.Element,
  container: Element | string,
): RenderedNode {
  const targetContainer = typeof container === "string"
    ? document.querySelector(container)
    : container;

  if (!targetContainer) {
    throw new Error(
      typeof container === "string"
        ? `Container element not found: ${container}`
        : "Container element is null",
    );
  }

  // Create renderer with default web configuration
  const renderer = createWebRenderer({
    enableMetrics: process.env.NODE_ENV === "development",
  });

  const result = renderer.render(vnode, targetContainer);

  // Handle async components by throwing to Suspense boundary
  if (result instanceof Promise) {
    throw result;
  }

  // Mount the rendered element to the container
  if (result && result.element) {
    targetContainer.appendChild(result.element);
  }

  return result;
}

// Hydration support for SSR
export function hydrate(
  vnode: VNode,
  container: Element | string,
): RenderedNode {
  const targetContainer = typeof container === "string"
    ? document.querySelector(container)
    : container;

  if (!targetContainer) {
    throw new Error(
      typeof container === "string"
        ? `Container element not found: ${container}`
        : "Container element is null",
    );
  }

  // Create renderer with hydration support
  const renderer = createWebRenderer({
    hydrate: true,
    enableMetrics: process.env.NODE_ENV === "development",
  });

  const result = renderer.render(vnode, targetContainer);

  // Handle async components by throwing to Suspense boundary
  if (result instanceof Promise) {
    throw result;
  }

  return result;
}

// Batch multiple renders for performance
export function batchRender(
  renders: Array<{ vnode: VNode; container: Element | string }>,
) {
  const renderedNodes: RenderedNode[] = [];

  domStrategies.batchUpdates(() => {
    for (const { vnode, container } of renders) {
      renderedNodes.push(render(vnode, container));
    }
  });

  return renderedNodes;
}

// Portal rendering for components that need to render outside their parent
export function createPortal(
  vnode: VNode,
  container: Element | string,
): RenderedNode {
  const result = render(vnode, container);

  // Portal should also handle async consistently
  if (result instanceof Promise) {
    throw result;
  }

  return result;
}

// Utility to check if environment supports web features
export function isWebEnvironment(): boolean {
  return typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof HTMLElement !== "undefined";
}

// Development helpers
export function getWebCapabilities() {
  if (!isWebEnvironment()) {
    return {
      supported: false,
      features: {},
    };
  }

  return {
    supported: true,
    features: browserFeatures,
  };
}

// Error boundary for web-specific errors
export function WebErrorBoundary({
  children,
  fallback: _fallback,
  onError: _onError,
}: {
  children: VNode;
  fallback?: (error: Error) => VNode;
  onError?: (error: Error, errorInfo: any) => void;
}) {
  // This would be implemented as a proper error boundary component
  // For now, this is a placeholder structure
  return children;
}

// Performance monitoring utilities
export interface RenderMetrics {
  renderTime: number;
  nodeCount: number;
  signalCount: number;
  updateCount: number;
}

export function measureRender<T>(
  fn: () => T,
): { result: T; metrics: RenderMetrics } {
  const startTime = performance.now();

  // Reset metrics before measuring
  resetPerformanceMetrics();

  const result = fn();

  const endTime = performance.now();
  const metrics = getPerformanceMetrics();

  return {
    result,
    metrics: {
      renderTime: endTime - startTime,
      nodeCount: 0, // Would be tracked during rendering
      signalCount: metrics.signalSubscriptions,
      updateCount: metrics.updateCount,
    },
  };
}

// Cleanup utilities
export function unmountAll(container: Element): void {
  // Remove all semajsx-rendered content from container
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

// Experimental: Web Components integration
export function defineWebComponent(
  tagName: string,
  Component: (props: any) => VNode,
  options: {
    shadowDOM?: boolean;
    observedAttributes?: string[];
  } = {},
) {
  if (!browserFeatures.customElements) {
    console.warn("Web Components not supported in this environment");
    return;
  }

  class SemajsxWebComponent extends HTMLElement {
    private renderer: any;
    declare shadowRoot: ShadowRoot | null;

    constructor() {
      super();

      if (options.shadowDOM) {
        this.shadowRoot = this.attachShadow({ mode: "open" });
      }
    }

    connectedCallback() {
      this.render();
    }

    disconnectedCallback() {
      if (this.renderer) {
        this.renderer.unmount();
      }
    }

    attributeChangedCallback() {
      this.render();
    }

    static get observedAttributes() {
      return options.observedAttributes || [];
    }

    private render() {
      const props = this.getProps();
      const vnode = Component(props);
      const container = this.shadowRoot || this;

      if (this.renderer) {
        this.renderer.unmount();
      }

      this.renderer = createWebRenderer();
      this.renderer.render(vnode, container);
    }

    private getProps() {
      const props: any = {};

      // Get attributes as props
      for (const attr of this.attributes) {
        props[attr.name] = attr.value;
      }

      return props;
    }
  }

  customElements.define(tagName, SemajsxWebComponent);
}

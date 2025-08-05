import type { Signal } from "@semajsx/core";
import type { WebRenderStrategies } from "./types.js";
import {
  bindEvent,
  cleanupElementEvents,
  normalizeEventName,
} from "./events.js";
import {
  applyClassName,
  handleStyleProperty,
  performCleanup,
} from "./styles.js";

// Update batching system
class UpdateScheduler {
  private pendingUpdates = new Set<() => void>();
  private isScheduled = false;

  schedule(update: () => void): void {
    this.pendingUpdates.add(update);

    if (!this.isScheduled) {
      this.isScheduled = true;

      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => this.flush());
      } else {
        setTimeout(() => this.flush(), 16);
      }
    }
  }

  private flush(): void {
    for (const update of this.pendingUpdates) {
      try {
        update();
      } catch (error) {
        console.error("Update error:", error);
      }
    }

    this.pendingUpdates.clear();
    this.isScheduled = false;
  }
}

const updateScheduler = new UpdateScheduler();

// Element pool for recycling
class ElementPool {
  private pools = new Map<string, Element[]>();
  private maxPoolSize = 100;

  acquire(tagName: string): Element {
    const pool = this.pools.get(tagName);
    if (pool && pool.length > 0) {
      const element = pool.pop()!;
      this.resetElement(element);
      return element;
    }
    return document.createElement(tagName);
  }

  release(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    const pool = this.pools.get(tagName) || [];

    if (pool.length < this.maxPoolSize) {
      pool.push(element);
      this.pools.set(tagName, pool);
    }
  }

  private resetElement(element: Element): void {
    element.textContent = "";
    element.className = "";
    element.removeAttribute("style");

    // Remove common attributes
    const attributesToRemove = ["id", "data-*", "aria-*"];
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      const attr = element.attributes[i];
      if (
        attr &&
        attributesToRemove.some((pattern) =>
          pattern.endsWith("*")
            ? attr.name.startsWith(pattern.slice(0, -1))
            : attr.name === pattern
        )
      ) {
        element.removeAttribute(attr.name);
      }
    }
  }
}

const elementPool = new ElementPool();

// DOM strategies implementation
export const domStrategies: WebRenderStrategies = {
  createElement(tagName: string, container: Element): Element {
    return elementPool.acquire(tagName);
  },

  createTextNode(text: string, container: Element): Text {
    return document.createTextNode(text);
  },

  createFragment(container: Element): DocumentFragment {
    return document.createDocumentFragment();
  },

  setProperty(element: Node, key: string, value: any): void {
    if (!(element instanceof Element)) {
      return;
    }

    // Handle special properties
    switch (key) {
      case "className":
        applyClassName(element, value);
        break;

      case "style":
        if (element instanceof HTMLElement) {
          handleStyleProperty(element, value);
        }
        break;

      case "textContent":
        element.textContent = value ?? "";
        break;

      case "innerHTML":
        element.innerHTML = value ?? "";
        break;

      case "value":
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement ||
          element instanceof HTMLSelectElement
        ) {
          element.value = value ?? "";
        }
        break;

      case "checked":
        if (element instanceof HTMLInputElement) {
          element.checked = Boolean(value);
        }
        break;

      case "selected":
        if (element instanceof HTMLOptionElement) {
          element.selected = Boolean(value);
        }
        break;

      case "disabled":
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLButtonElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) {
          element.disabled = Boolean(value);
        }
        break;

      default:
        // Handle event handlers
        const eventType = normalizeEventName(key);
        if (eventType && typeof value === "function") {
          bindEvent(element, eventType, value);
        } else if (key.startsWith("data-") || key.startsWith("aria-")) {
          // Data and ARIA attributes
          if (value == null) {
            element.removeAttribute(key);
          } else {
            element.setAttribute(key, String(value));
          }
        } else if (key in element) {
          // Direct property assignment
          try {
            (element as any)[key] = value;
          } catch (error) {
            // Fallback to attribute
            if (value == null) {
              element.removeAttribute(key);
            } else {
              element.setAttribute(key, String(value));
            }
          }
        } else {
          // Generic attribute
          if (value == null) {
            element.removeAttribute(key);
          } else {
            element.setAttribute(key, String(value));
          }
        }
        break;
    }
  },

  setSignalProperty<T>(
    element: Node,
    key: string,
    signal: Signal<T>,
  ): () => void {
    if (!(element instanceof Element)) {
      return () => {};
    }

    // Set initial value
    this.setProperty(element, key, signal.value);

    // Subscribe to changes with batched updates
    return signal.subscribe((newValue) => {
      updateScheduler.schedule(() => {
        this.setProperty(element, key, newValue);
      });
    });
  },

  appendChild(parent: Node, child: Node): void {
    parent.appendChild(child);
  },

  removeChild(parent: Node, child: Node): void {
    if (child.parentNode === parent) {
      parent.removeChild(child);
    }
  },

  insertBefore(parent: Node, child: Node, before: Node): void {
    parent.insertBefore(child, before);
  },

  replaceChild(parent: Node, newChild: Node, oldChild: Node): void {
    if (oldChild.parentNode === parent) {
      parent.replaceChild(newChild, oldChild);
    }
  },

  onMount(element: Node, container: Element): void {
    // Lifecycle hook for when element is mounted
    if (element instanceof Element) {
      // Trigger any custom element connected callbacks
      if (element instanceof HTMLElement && "connectedCallback" in element) {
        (element as any).connectedCallback?.();
      }
    }
  },

  onUnmount(element: Node): void {
    // Cleanup when element is unmounted
    if (element instanceof Element) {
      // Clean up event listeners and subscriptions
      cleanupElementEvents(element);
      performCleanup(element);

      // Trigger any custom element disconnected callbacks
      if (element instanceof HTMLElement && "disconnectedCallback" in element) {
        (element as any).disconnectedCallback?.();
      }

      // Release to pool for reuse
      elementPool.release(element);
    }
  },

  // Web-specific methods
  batchUpdates(fn: () => void): void {
    updateScheduler.schedule(fn);
  },

  scheduleUpdate(element: Element, update: () => void): void {
    updateScheduler.schedule(update);
  },
};

// Browser feature detection
export const browserFeatures = {
  requestAnimationFrame: typeof requestAnimationFrame !== "undefined",
  customElements: typeof customElements !== "undefined",
  intersectionObserver: typeof IntersectionObserver !== "undefined",
  resizeObserver: typeof ResizeObserver !== "undefined",
  cssCustomProperties: typeof CSS !== "undefined" &&
    CSS.supports("--custom-property", "value"),
  shadowDOM: "attachShadow" in Element.prototype,
};

// Performance monitoring
let performanceMetrics = {
  renderTime: 0,
  updateCount: 0,
  signalSubscriptions: 0,
  domOperations: 0,
};

export function getPerformanceMetrics() {
  return { ...performanceMetrics };
}

export function resetPerformanceMetrics() {
  performanceMetrics = {
    renderTime: 0,
    updateCount: 0,
    signalSubscriptions: 0,
    domOperations: 0,
  };
}

// Enhanced DOM strategies with performance tracking
export const domStrategiesWithMetrics: WebRenderStrategies = {
  ...domStrategies,

  setProperty(element: Node, key: string, value: any): void {
    performanceMetrics.domOperations++;
    domStrategies.setProperty(element, key, value);
  },

  setSignalProperty<T>(
    element: Node,
    key: string,
    signal: Signal<T>,
  ): () => void {
    performanceMetrics.signalSubscriptions++;
    return domStrategies.setSignalProperty(element, key, signal);
  },

  appendChild(parent: Node, child: Node): void {
    performanceMetrics.domOperations++;
    domStrategies.appendChild(parent, child);
  },

  removeChild(parent: Node, child: Node): void {
    performanceMetrics.domOperations++;
    domStrategies.removeChild(parent, child);
  },

  insertBefore(parent: Node, child: Node, before: Node): void {
    performanceMetrics.domOperations++;
    domStrategies.insertBefore(parent, child, before);
  },
};

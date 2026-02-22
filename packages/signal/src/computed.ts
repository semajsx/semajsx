import type { ReadableSignal } from "./types";
import { scheduleUpdate } from "./batch";

/**
 * Create a computed signal with declarative dependencies
 *
 * @example
 * const count = signal(0);
 * const doubled = computed([count], c => c * 2);
 *
 * @example
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 * const fullName = computed([firstName, lastName], (f, l) => `${f} ${l}`);
 */

// Single dependency overload
export function computed<T, R>(dep: ReadableSignal<T>, compute: (value: T) => R): ReadableSignal<R>;

// Multiple dependencies overload
export function computed<T extends readonly ReadableSignal<any>[], R>(
  deps: [...T],
  compute: (...values: { [K in keyof T]: T[K] extends ReadableSignal<infer V> ? V : never }) => R,
): ReadableSignal<R>;

// Implementation
export function computed(deps: any, compute: any): ReadableSignal<any> {
  const depsArray: ReadableSignal<any>[] = Array.isArray(deps) ? deps : [deps];

  let value: any;
  const subscribers = new Set<(value: any) => void>();

  // Get current values from all dependencies
  const getValues = () => depsArray.map((dep) => dep.value);

  // Recompute when dependencies change
  const recompute = () => {
    const values = getValues();
    const newValue = Array.isArray(deps) ? compute(...values) : compute(values[0]);

    if (!Object.is(value, newValue)) {
      value = newValue;
      notify();
    }
  };

  // Notify subscribers
  const notify = () => {
    // Schedule the notification instead of running it immediately
    // This allows batching multiple updates into a single microtask
    scheduleUpdate(() => {
      // Directly iterate over the Set - no need to copy to array
      // The Set is stable during iteration even if modified
      // Wrap each listener call in try/catch to prevent one listener error
      // from crashing the entire reactive system
      for (const listener of subscribers) {
        try {
          listener(value);
        } catch (error) {
          // Log error but continue notifying other subscribers
          // This prevents a single listener error from breaking the entire reactive system
          console.error("[Computed] Error in computed signal listener:", error);
        }
      }
    });
  };

  // Initial computation
  const initialValues = getValues();
  value = Array.isArray(deps) ? compute(...initialValues) : compute(initialValues[0]);

  // Subscribe to all dependencies and store unsubscribe functions
  const unsubscribers = depsArray.map((dep) => dep.subscribe(recompute));

  // Dispose function to clean up subscriptions and prevent memory leaks
  const dispose = () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
    unsubscribers.length = 0;
    subscribers.clear();
  };

  const computedSignal: ReadableSignal<any> & { dispose: () => void } = {
    get value() {
      return value;
    },

    subscribe(listener: (value: any) => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },

    dispose,
  };

  return computedSignal;
}

export const memo: typeof computed = computed;

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
      for (const listener of subscribers) {
        listener(value);
      }
    });
  };

  // Initial computation
  const initialValues = getValues();
  value = Array.isArray(deps) ? compute(...initialValues) : compute(initialValues[0]);

  // Subscribe to all dependencies
  // Note: unsubscribers are not currently used as we don't have a dispose mechanism
  // Keeping for future dispose mechanism
  // @ts-ignore - TS6133: variable is declared but never used
  const _unsubscribers = depsArray.map((dep) => dep.subscribe(recompute));

  return {
    get value() {
      return value;
    },

    subscribe(listener: (value: any) => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
  };
}

export const memo: typeof computed = computed;

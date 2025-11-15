import type { WritableSignal } from "./types";
import { scheduleUpdate } from "./batch";

/**
 * Create a writable signal
 */
export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const sig: WritableSignal<T> = {
    get value() {
      return value;
    },

    set value(newValue: T) {
      if (!Object.is(value, newValue)) {
        value = newValue;
        notify();
      }
    },

    peek() {
      return value;
    },

    set(newValue: T) {
      this.value = newValue;
    },

    update(fn: (prev: T) => T) {
      this.value = fn(value);
    },

    subscribe(listener: (value: T) => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
  };

  function notify() {
    // Schedule the notification instead of running it immediately
    // This allows batching multiple updates into a single microtask
    scheduleUpdate(() => {
      // Directly iterate over the Set - no need to copy to array
      // The Set is stable during iteration even if modified
      for (const listener of subscribers) {
        listener(value);
      }
    });
  }

  return sig;
}

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
      // Wrap each listener call in try/catch to prevent one listener error
      // from crashing the entire reactive system
      for (const listener of subscribers) {
        try {
          listener(value);
        } catch (error) {
          // Log error but continue notifying other subscribers
          // This prevents a single listener error from breaking the entire reactive system
          console.error("[Signal] Error in signal listener:", error);
        }
      }
    });
  }

  return sig;
}

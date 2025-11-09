import type { WritableSignal } from './types';

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
    const subs = Array.from(subscribers);
    for (const listener of subs) {
      listener(value);
    }
  }

  return sig;
}

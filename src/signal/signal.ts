import type { WritableSignal } from './types';

// Global effect tracking
let currentEffect: (() => void) | null = null;

export function getCurrentEffect(): (() => void) | null {
  return currentEffect;
}

export function setCurrentEffect(effect: (() => void) | null): void {
  currentEffect = effect;
}

/**
 * Create a writable signal
 */
export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const sig: WritableSignal<T> = {
    get value() {
      // Auto-track when accessed inside effect
      if (currentEffect) {
        subscribers.add(currentEffect);
      }
      return value;
    },

    set value(newValue: T) {
      if (!Object.is(value, newValue)) {
        value = newValue;
        notify();
      }
    },

    peek() {
      // Peek without tracking
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
    // Create a copy to avoid issues with subscribers modifying the set
    const subs = Array.from(subscribers);
    for (const listener of subs) {
      listener(value);
    }
  }

  return sig;
}

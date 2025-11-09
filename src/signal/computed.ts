import type { ComputedSignal } from './types';
import { getCurrentEffect, setCurrentEffect } from './signal';

/**
 * Create a computed signal that automatically tracks dependencies
 */
export function computed<T>(compute: () => T): ComputedSignal<T> {
  let value: T;
  let dirty = true;
  const subscribers = new Set<(value: T) => void>();

  const recompute = () => {
    const prevEffect = getCurrentEffect();

    // Set ourselves as the current effect to track dependencies
    setCurrentEffect(() => {
      dirty = true;
      notify();
    });

    try {
      value = compute();
      dirty = false;
    } finally {
      setCurrentEffect(prevEffect);
    }
  };

  const notify = () => {
    const subs = Array.from(subscribers);
    for (const listener of subs) {
      listener(value);
    }
  };

  const sig: ComputedSignal<T> = {
    get value() {
      if (dirty) {
        recompute();
      }

      // Track this computed as a dependency
      const currentEff = getCurrentEffect();
      if (currentEff) {
        subscribers.add(currentEff);
      }

      return value;
    },

    peek() {
      if (dirty) {
        recompute();
      }
      return value;
    },

    subscribe(listener: (value: T) => void) {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
  };

  // Initial computation
  recompute();

  return sig;
}

export const memo = computed;

import type { Signal, MaybeSignal } from './types';
import { getCurrentEffect, setCurrentEffect } from './signal';

/**
 * Check if a value is a signal
 */
export function isSignal<T = any>(value: any): value is Signal<T> {
  return (
    value != null &&
    typeof value === 'object' &&
    'value' in value &&
    'subscribe' in value &&
    typeof value.subscribe === 'function'
  );
}

/**
 * Unwrap a signal or return the value as-is
 */
export function unwrap<T>(value: MaybeSignal<T>): T {
  return isSignal(value) ? value.value : value;
}

/**
 * Run a function without tracking signal dependencies
 */
export function untrack<T>(fn: () => T): T {
  const prevEffect = getCurrentEffect();
  setCurrentEffect(null);

  try {
    return fn();
  } finally {
    setCurrentEffect(prevEffect);
  }
}

/**
 * Get the value of a signal without tracking
 */
export function peek<T>(value: MaybeSignal<T>): T {
  if (isSignal(value)) {
    return value.peek();
  }
  return value;
}

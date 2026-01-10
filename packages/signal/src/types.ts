/**
 * Signal types for @semajsx/signal implementation
 *
 * This package extends the core Signal interfaces from @semajsx/core
 * with convenience methods (set, update) that are specific to this implementation.
 */

import type {
  MaybeSignal as CoreMaybeSignal,
  ReadableSignal as CoreReadableSignal,
  SignalValue as CoreSignalValue,
  WritableSignal as CoreWritableSignal,
} from "@semajsx/core";

/**
 * ReadableSignal - Re-export from core
 */
export type ReadableSignal<T = any> = CoreReadableSignal<T>;

/**
 * WritableSignal - Extends core interface with convenience methods
 *
 * The core WritableSignal only requires a writable `value` property.
 * This implementation adds set() and update() as convenience methods.
 */
export interface WritableSignal<T = any> extends CoreWritableSignal<T> {
  /**
   * Set signal value (convenience method)
   * Equivalent to: signal.value = newValue
   */
  set(value: T): void;

  /**
   * Update signal value based on previous value (convenience method)
   * Equivalent to: signal.value = fn(signal.value)
   */
  update(fn: (prev: T) => T): void;
}

/**
 * Legacy type alias for backward compatibility
 * @deprecated Use ReadableSignal instead
 */
export type Signal<T = any> = ReadableSignal<T>;

/**
 * Re-export utility types from core
 */
export type MaybeSignal<T> = CoreMaybeSignal<T>;
export type SignalValue<S> = CoreSignalValue<S>;

/**
 * Component lifecycle management for terminal rendering.
 *
 * Provides an onCleanup registry that components can use to register
 * cleanup callbacks (timers, listeners, etc.) that run during unmount.
 */

import { getActiveContext } from "./context";

/**
 * Register a cleanup callback that will run when the terminal app unmounts.
 *
 * Use this inside components to clean up timers, event listeners,
 * and other resources that would otherwise leak.
 *
 * @example
 * ```tsx
 * function Timer() {
 *   const elapsed = signal(0);
 *   const timer = setInterval(() => { elapsed.value++ }, 1000);
 *   onCleanup(() => clearInterval(timer));
 *   return <text>Elapsed: {elapsed}s</text>;
 * }
 * ```
 */
export function onCleanup(fn: () => void): void {
  const ctx = getActiveContext();
  if (ctx) {
    ctx.cleanupCallbacks.push(fn);
  }
}

/**
 * Run all registered cleanup callbacks and clear the registry.
 * Called internally by render() during unmount.
 */
export function flushCleanups(): void {
  const ctx = getActiveContext();
  if (!ctx) return;

  // Copy the array before iterating to avoid issues if a cleanup
  // callback registers more cleanup callbacks during iteration
  const callbacks = [...ctx.cleanupCallbacks];
  ctx.cleanupCallbacks = [];

  for (const fn of callbacks) {
    try {
      fn();
    } catch {
      // Silently ignore cleanup errors to ensure all callbacks run
    }
  }
}

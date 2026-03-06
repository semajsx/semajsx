/**
 * Component lifecycle management for terminal rendering.
 *
 * Provides an onCleanup registry that components can use to register
 * cleanup callbacks (timers, listeners, etc.) that run during unmount.
 *
 * Supports two modes:
 * - Per-component scope (via onBeforeComponent/onAfterComponent hooks in core)
 *   Cleanups attached to RenderedNode.subscriptions, run when component unmounts
 * - Global fallback (when called outside component render)
 *   Cleanups stored in TerminalSession.cleanupCallbacks, run on full unmount
 */

import { getActiveSession } from "./context";

/**
 * Stack of per-component cleanup scopes.
 * Pushed by onBeforeComponent(), popped by onAfterComponent().
 */
const cleanupScopes: Array<Array<() => void>> = [];

/**
 * Push a new per-component cleanup scope.
 * Called by core's renderComponent via onBeforeComponent strategy hook.
 */
export function pushCleanupScope(): void {
  cleanupScopes.push([]);
}

/**
 * Pop the current cleanup scope and return collected callbacks.
 * Called by core's renderComponent via onAfterComponent strategy hook.
 */
export function popCleanupScope(): Array<() => void> {
  return cleanupScopes.pop() ?? [];
}

/**
 * Register a cleanup callback that will run when the component unmounts.
 *
 * When called during component rendering, the callback is attached to
 * the component's RenderedNode and runs when that component is unmounted
 * (including via conditional rendering with when()/signal).
 *
 * When called outside component rendering (e.g., in render setup code),
 * falls back to the global session cleanup list.
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
  // If inside a component render, use per-component scope
  if (cleanupScopes.length > 0) {
    cleanupScopes[cleanupScopes.length - 1]!.push(fn);
    return;
  }
  // Fallback to global session cleanups
  const ctx = getActiveSession();
  if (ctx) {
    ctx.cleanupCallbacks.push(fn);
  }
}

/**
 * Run all registered global cleanup callbacks and clear the registry.
 * Called internally by render() during unmount.
 *
 * Note: Per-component cleanups are handled by core's unmount/cleanupSubscriptions.
 * This only flushes the global fallback list.
 */
export function flushCleanups(): void {
  const ctx = getActiveSession();
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

/**
 * Component lifecycle management for DOM rendering.
 *
 * Provides an onCleanup registry that components can use to register
 * cleanup callbacks (timers, listeners, etc.) that run during unmount.
 *
 * Uses per-component scope (via onBeforeComponent/onAfterComponent hooks in core).
 * Cleanups are attached to RenderedNode.subscriptions and run when the component unmounts.
 */

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
 * @example
 * ```tsx
 * function Timer() {
 *   const elapsed = signal(0);
 *   const timer = setInterval(() => { elapsed.value++ }, 1000);
 *   onCleanup(() => clearInterval(timer));
 *   return <div>Elapsed: {elapsed}s</div>;
 * }
 * ```
 */
export function onCleanup(fn: () => void): void {
  if (cleanupScopes.length > 0) {
    cleanupScopes[cleanupScopes.length - 1]!.push(fn);
    return;
  }
  console.warn(
    "[semajsx/dom] onCleanup() called outside component render scope. Callback will not run.",
  );
}

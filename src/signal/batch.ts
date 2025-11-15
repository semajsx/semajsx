/**
 * Batch multiple signal updates
 *
 * This is a simple implementation that doesn't actually batch.
 * Can be enhanced later with microtask scheduling if needed.
 */

export function batch<T>(fn: () => T): T {
  return fn();
}

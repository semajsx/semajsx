/**
 * Browser-side noop implementation of island()
 *
 * When component files are loaded in the browser, they still import the island() function.
 * This noop version just returns the original component without any wrapping,
 * avoiding the need to load server-side dependencies like Vite in the browser.
 */

import type { Component } from "../runtime/types";

/**
 * No-op island marker for browser environment
 * Simply returns the original component without any server-side wrapping
 */
export function island<P extends Record<string, any> = {}>(
  component: Component<P>,
  _modulePath: string,
): Component<P> {
  // In the browser, just return the original component
  // The actual island hydration is handled by the island entry point scripts
  return component;
}

/**
 * Check if a component is marked as an Island (always false in browser)
 */
export function isIslandComponent(_component: any): boolean {
  return false;
}

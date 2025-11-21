/**
 * Browser-side client utilities for SemaJSX islands
 * This entry point is used when importing @semajsx/server/client in browser context
 */

// Hydration utilities (browser-safe)
export {
  hydrateIslands,
  hydrateIslandById,
  hasIslands,
  getIslandIds,
  markIslandHydrated,
} from "./hydrate";

// Browser noop versions of island functions
import type { Component } from "@semajsx/core/types";

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

/**
 * Check if a VNode is an Island instance (always false in browser)
 */
export function isIslandVNode(_vnode: any): boolean {
  return false;
}

/**
 * Get island metadata from a VNode (always undefined in browser)
 */
export function getIslandMetadata(_vnode: any): undefined {
  return undefined;
}

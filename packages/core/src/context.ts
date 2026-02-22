/**
 * Context API implementation
 */

import { h } from "./vnode";
import { Fragment } from "./types";
import type { ComponentAPI, Context as ContextType, ContextProps, VNode } from "./types";

// Context map type - stores context values for current render environment
export type ContextMap = Map<symbol, any>;

/**
 * Create a new Context (returns a typed Symbol)
 *
 * @param name - Optional name for debugging (defaults to "anonymous")
 * @returns Context symbol
 *
 * @example
 * ```typescript
 * const ThemeContext = context<Theme>();
 * const UserContext = context<User>('user'); // With debug name
 *
 * <Context provide={[ThemeContext, theme]}>
 *   <App />
 * </Context>
 * ```
 */
export function context<T>(name?: string): ContextType<T> {
  const debugName = name || "anonymous";
  return Symbol(debugName) as ContextType<T>;
}

/**
 * Context component - provides context values to child components
 *
 * @example
 * ```typescript
 * // Single context
 * <Context provide={[ThemeContext, theme]}>
 *   <App />
 * </Context>
 *
 * // Multiple contexts
 * <Context provide={[
 *   [ThemeContext, theme],
 *   [UserContext, user]
 * ]}>
 *   <App />
 * </Context>
 * ```
 */
export function Context(props: ContextProps): VNode {
  const children = props.children
    ? Array.isArray(props.children)
      ? props.children
      : [props.children]
    : [];
  return h(Fragment, null, ...children);
}

/**
 * Symbol to mark context provider components
 * Using Symbol ensures type safety and avoids property name conflicts
 */
export const CONTEXT_PROVIDER_SYMBOL = Symbol.for("__isContextProvider");

// Mark as special context provider component
(Context as { [CONTEXT_PROVIDER_SYMBOL]?: boolean })[CONTEXT_PROVIDER_SYMBOL] = true;

/**
 * Create ComponentAPI instance for a component
 *
 * @param contextMap - The context map for current render environment
 * @returns ComponentAPI instance
 */
export function createComponentAPI(contextMap: ContextMap): ComponentAPI {
  return {
    inject<T>(context: ContextType<T>): T | undefined {
      return contextMap.get(context);
    },
  };
}

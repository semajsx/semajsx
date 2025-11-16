/**
 * Context API implementation
 */

import { h } from "./vnode";
import { Fragment } from "./types";
import type { Context, ProviderProps, ComponentAPI } from "./types";

// Context counter for unique IDs
let contextCounter = 0;

// Context map type - stores context values for current render environment
export type ContextMap = Map<symbol, any>;

/**
 * Create a new Context
 *
 * @param defaultValue - The default value for the context
 * @returns Context object with Provider component
 *
 * @example
 * ```typescript
 * const ThemeContext = createContext({ mode: 'light' });
 *
 * function App() {
 *   return (
 *     <ThemeContext.Provider value={{ mode: 'dark' }}>
 *       <Content />
 *     </ThemeContext.Provider>
 *   );
 * }
 * ```
 */
export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol(`context-${contextCounter++}`);

  // Provider is a regular component that returns Fragment
  const Provider = (props: ProviderProps<T>) => {
    const children = Array.isArray(props.children)
      ? props.children
      : props.children
        ? [props.children]
        : [];
    return h(Fragment, null, ...children);
  };

  // Mark as Provider for renderer to detect
  (Provider as any).__isContextProvider = true;
  (Provider as any).__contextId = id;

  return {
    id,
    defaultValue,
    Provider,
  };
}

/**
 * Create ComponentAPI instance for a component
 *
 * @param contextMap - The context map for current render environment
 * @returns ComponentAPI instance
 */
export function createComponentAPI(contextMap: ContextMap): ComponentAPI {
  return {
    inject<T>(context: Context<T>): T {
      return contextMap.has(context.id)
        ? contextMap.get(context.id)
        : context.defaultValue;
    },
  };
}

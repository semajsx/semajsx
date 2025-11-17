import type { Signal, WritableSignal } from "../signal";

/**
 * Special VNode type for fragment support
 */
export const Fragment = Symbol.for("semajsx.fragment");

/**
 * Special VNode type for portal support
 */
export const Portal = Symbol.for("semajsx.portal");

/**
 * VNode types
 * - The runtime VNode tree always resolves to these `type` values
 */
export type VNodeType =
  | string
  | Component<any>
  | typeof Fragment
  | typeof Portal;

/**
 * VNode: The basic unit of the runtime render tree
 * - `type`: the element/component type
 * - `props`: attributes or props passed to the node (may be null)
 * - `children`: resolved child nodes (always normalized to VNode[] at render time)
 */
export interface VNode {
  type: VNodeType;
  props: Record<string, any> | null;
  children: VNode[];
  key?: string | number | null;
}

/**
 * Primitive values allowed in JSX
 * - These are normalized during VNode construction
 */
export type JSXPrimitive = string | number | boolean | null | undefined;

/**
 * A JSXNode represents any valid "JSX expression result"
 * - Could be a raw VNode/primitive, or wrapped in a reactive/async container
 */
export type JSXNode =
  | VNode
  | JSXPrimitive
  | Iterable<JSXNode>
  | Signal<JSXNode>
  | Promise<JSXNode>
  | AsyncIterableIterator<JSXNode>;

/**
 * Component type
 * - Optional `ctx` parameter allows passing in custom API/runtime helpers
 */
export type Component<P = any> = (props: P, ctx?: ComponentAPI) => JSXNode;

/**
 * ComponentAPI - Runtime API available to components via second parameter
 */
export interface ComponentAPI {
  /**
   * Inject a context value
   * @param context - The context to inject
   * @returns The current value of the context, or undefined if not provided
   */
  inject<T>(context: Context<T>): T | undefined;
}

/**
 * Rendered node tracking
 */
export interface RenderedNode {
  vnode: VNode;
  dom: Node | null;
  subscriptions: Array<() => void>;
  children: RenderedNode[];
}

/**
 * Ref types
 */

/**
 * Ref - can be a WritableSignal or a callback function
 * This allows both reactive refs and imperative refs
 */
export type Ref<T> = WritableSignal<T | null> | ((instance: T | null) => void);

/**
 * Context types
 */

/**
 * Context - a typed Symbol for identifying context
 */
export type Context<T> = symbol & { __type?: T };

/**
 * Context provide entry: [Context, value]
 */
export type ContextProvide<T = any> = [Context<T>, T];

/**
 * Context component props - supports single or multiple context provides
 */
export interface ContextProps {
  // Single context: [ThemeContext, theme]
  // Multiple contexts: [[ThemeContext, theme], [UserContext, user]]
  provide: ContextProvide | ContextProvide[];
  children?: JSXNode;
}

/**
 * Helper type to allow Signal values for any attribute
 */
export type SignalOr<T> = T | Signal<T>;

/**
 * Makes all properties in T accept Signal values
 * Excludes event handlers (functions) and children
 */
export type WithSignals<T> = {
  [K in keyof T]: K extends `on${string}`
    ? T[K] // Event handlers don't need Signal wrapper
    : K extends "children"
      ? T[K] // Children handled separately
      : T[K] extends (...args: any[]) => any
        ? T[K] // Other functions don't need Signal wrapper
        : SignalOr<T[K]>;
};

/**
 * Adds key property to element attributes for list reconciliation
 */
export type WithKey<T> = T & {
  key?: string | number;
};

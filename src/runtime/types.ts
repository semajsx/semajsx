import type { Signal } from "../signal";

/**
 * VNode types
 */

export type VNodeType = string | Component | typeof Fragment;

export interface VNode {
  type: VNodeType;
  props: Record<string, any> | null;
  children: VNode[];
  key?: string | number;
}

/**
 * ComponentAPI - Runtime API available to components via second parameter
 */
export interface ComponentAPI {
  /**
   * Inject a context value
   * @param context - The context to inject
   * @returns The current value of the context
   */
  inject<T>(context: Context<T>): T;
}

/**
 * Component type - supports optional second parameter for ComponentAPI
 */
export type Component<P = any> =
  | ((props: P) => VNode)
  | ((props: P, ctx: ComponentAPI) => VNode)
  | ((props: P) => Promise<VNode>)
  | ((props: P, ctx: ComponentAPI) => Promise<VNode>)
  | ((props: P) => AsyncIterableIterator<VNode>)
  | ((props: P, ctx: ComponentAPI) => AsyncIterableIterator<VNode>)
  | ((props: P) => Signal<VNode>)
  | ((props: P, ctx: ComponentAPI) => Signal<VNode>);

export type JSXChild =
  | VNode
  | Promise<VNode>
  | AsyncIterableIterator<VNode>
  | Signal<JSXChild>
  | string
  | number
  | boolean
  | null
  | undefined;

export type JSXChildren = JSXChild | JSXChild[];

/**
 * Special types
 */
export const Fragment = Symbol.for("semajsx.fragment");

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
 * Context types
 */

/**
 * Context object
 */
export interface Context<T> {
  id: symbol;
  defaultValue: T;
  Provider: Component<ProviderProps<T>>;
}

/**
 * Provider component props
 */
export interface ProviderProps<T> {
  value: T;
  children?: JSXChildren;
}

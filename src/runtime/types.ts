import type { Signal } from '../signal';

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

export type Component<P = any> = (props: P) => VNode;

export type JSXChild =
  | VNode
  | Signal<VNode>
  | string
  | number
  | boolean
  | null
  | undefined;

export type JSXChildren = JSXChild | JSXChild[];

/**
 * Special types
 */
export const Fragment = Symbol.for('semajsx.fragment');

/**
 * Rendered node tracking
 */
export interface RenderedNode {
  vnode: VNode;
  dom: Node | null;
  subscriptions: Array<() => void>;
  children: RenderedNode[];
}

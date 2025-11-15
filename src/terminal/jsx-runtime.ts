/**
 * JSX automatic runtime for Terminal (production)
 * Use with: @jsxImportSource semajsx/terminal
 */

import { h } from "../runtime/vnode";
import { Fragment } from "../runtime/types";
import type { VNode, JSXChildren } from "../runtime/types";
import type { TerminalStyle } from "./types";
import type { Signal } from "../signal/types";

export { Fragment };

/**
 * Helper type to allow Signal values for any attribute
 */
type SignalOr<T> = T | Signal<T>;

/**
 * Makes all properties in T accept Signal values
 */
type WithSignals<T> = {
  [K in keyof T]: K extends "children" ? T[K] : SignalOr<T[K]>;
};

/**
 * Base terminal element attributes (without Signal support)
 */
interface BaseTerminalAttributes extends TerminalStyle {
  // Special props
  key?: string | number;
  children?: JSXChildren;
}

/**
 * Terminal element attributes with Signal support
 * All style properties can accept Signal values
 */
export type TerminalAttributes = WithSignals<BaseTerminalAttributes>;

/**
 * Box element attributes
 * Used for layout containers with flexbox support
 *
 * All properties support both plain values and Signals:
 * - flexDirection, justifyContent, alignItems
 * - flexGrow, flexShrink, flexBasis
 * - width, height, minWidth, minHeight, maxWidth, maxHeight
 * - margin, marginLeft, marginRight, marginTop, marginBottom
 * - padding, paddingLeft, paddingRight, paddingTop, paddingBottom
 * - border, borderColor
 * - backgroundColor
 */
export type BoxAttributes = TerminalAttributes;

/**
 * Text element attributes
 * Used for displaying styled text content
 *
 * All properties support both plain values and Signals:
 * - color: Text color
 * - bold: Bold text
 * - italic: Italic text
 * - underline: Underlined text
 * - strikethrough: Strikethrough text
 * - dim: Dimmed text
 * - Layout props: flexGrow, flexShrink, flexBasis, margin, etc.
 */
export type TextAttributes = TerminalAttributes;

/**
 * JSX namespace for Terminal elements
 */
export namespace JSX {
  export type Element = VNode | Promise<VNode> | AsyncGenerator<VNode>;

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface ElementType {
    (props: any): Element | null;
  }

  export interface IntrinsicElements {
    /**
     * Box component for layout and containers
     *
     * Supports flexbox layout with Yoga:
     * - flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse'
     * - justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
     * - alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'
     *
     * Supports sizing:
     * - width, height: number | string (e.g., '50%')
     * - minWidth, minHeight, maxWidth, maxHeight: number
     *
     * Supports spacing:
     * - margin, marginLeft, marginRight, marginTop, marginBottom: number
     * - padding, paddingLeft, paddingRight, paddingTop, paddingBottom: number
     *
     * Supports borders:
     * - border: 'single' | 'double' | 'round' | 'bold' | 'none'
     * - borderColor: string (color name or hex)
     *
     * Supports background:
     * - backgroundColor: string (color name or hex)
     *
     * @example
     * <box border="round" padding={1} borderColor="green">
     *   <text>Content</text>
     * </box>
     */
    box: BoxAttributes;

    /**
     * Text component for displaying styled text
     *
     * Supports text styling:
     * - color: string (color name or hex)
     * - bold: boolean
     * - italic: boolean
     * - underline: boolean
     * - strikethrough: boolean
     * - dim: boolean
     *
     * Supports layout from parent box:
     * - flexGrow, flexShrink, flexBasis
     * - margin, marginLeft, marginRight, marginTop, marginBottom
     *
     * @example
     * <text color="green" bold>
     *   Success message
     * </text>
     */
    text: TextAttributes;
  }
}

export function jsx(type: any, props: any, key?: any): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    return h(type, restProps, children);
  }

  return h(type, restProps);
}

export function jsxs(type: any, props: any, key?: any): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    const childArray = Array.isArray(children) ? children : [children];
    return h(type, restProps, ...childArray);
  }

  return h(type, restProps);
}

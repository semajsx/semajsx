/**
 * Global JSX type definitions for SemaJSX
 */

import type { VNode } from "./runtime/types";

declare global {
  namespace JSX {
    type Element = VNode;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes {
      key?: string | number;
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};

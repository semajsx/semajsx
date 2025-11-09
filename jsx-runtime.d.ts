/**
 * JSX type definitions
 */

import type { Signal } from './dist/signal';

declare global {
  namespace JSX {
    interface Element extends ReturnType<typeof import('./dist/runtime').h> {}

    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface ElementChildrenAttribute {
      children: {};
    }
  }
}

export {};

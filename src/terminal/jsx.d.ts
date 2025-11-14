import type { TerminalStyle } from './types';
import type { Signal } from '../signal/types';

type JSXChild =
  | JSX.Element
  | string
  | number
  | boolean
  | null
  | undefined
  | Signal<JSXChild>;

declare global {
  namespace JSX {
    type Element = import('../runtime/types').VNode;

    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicAttributes {
      key?: string | number;
    }

    /**
     * Terminal element types
     */
    interface IntrinsicElements {
      // Box container element
      box: Partial<TerminalStyle> & {
        children?: JSXChild | JSXChild[];
      };

      // Text element
      text: Partial<TerminalStyle> & {
        children?: JSXChild | JSXChild[];
      };
    }
  }
}

export {};

declare global {
  namespace JSX {
    type Element = import('./runtime/types').VNode;
    interface ElementChildrenAttribute { children: {} }
    interface IntrinsicAttributes { key?: string | number }
    interface IntrinsicElements { [elemName: string]: any }
  }
}

export {};
// Signal Protocol
export interface Signal<T = any> {
  readonly value: T;
  subscribe(listener: (value: T, prev?: T) => void): () => void;
  dispose?(): void;
}

// Granularity Type Constraints
export type SignalProps<T> = {
  [K in keyof T]: T[K] extends object 
    ? T[K] extends Signal 
      ? T[K]  // Allow Signal<object>
      : T[K] extends Record<string, Signal>
        ? never  // Prevent { prop: signal1, prop2: signal2 }
        : T[K]
    : T[K] | Signal<T[K]>
};

// VNode representation
export interface VNode {
  type: string | Component | typeof Fragment | typeof ErrorBoundary | typeof Suspense;
  props: Record<string, any> | null;
  children: VNode[];
  key?: string | number;
}

// Rendered node tracking
export interface RenderedNode {
  vnode: VNode;
  element: any;              // Platform-specific node
  subscriptions: (() => void)[]; // Signal cleanup functions
  children: RenderedNode[];
}

// Component definition
export interface Component<P = any> {
  (props: P & { children?: JSXNode }): VNode | Promise<VNode>;
  displayName?: string;
}

export type JSXNode = VNode | string | number | boolean | null | undefined | JSXNode[];

// Built-in components
export const Fragment = Symbol('Fragment');
export const ErrorBoundary = Symbol('ErrorBoundary');
export const Suspense = Symbol('Suspense');

// ErrorBoundary Props
export interface ErrorBoundaryProps {
  fallback?: VNode | ((error: Error, retry: () => void) => VNode);
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  children: VNode | VNode[];
}

// Suspense Props
export interface SuspenseProps {
  fallback?: VNode;
  children: VNode | VNode[];
}

// Render Strategies Interface
export interface RenderStrategies<TNode, TContainer> {
  // Element creation
  createElement(tagName: string, container: TContainer): TNode;
  createTextNode(text: string, container: TContainer): TNode;
  createFragment(container: TContainer): TNode;
  
  // Property handling
  setProperty(element: TNode, key: string, value: any): void;
  setSignalProperty<T>(element: TNode, key: string, signal: Signal<T>): () => void;
  
  // Tree manipulation
  appendChild(parent: TNode, child: TNode): void;
  removeChild(parent: TNode, child: TNode): void;
  insertBefore(parent: TNode, child: TNode, before: TNode): void;
  replaceChild(parent: TNode, newChild: TNode, oldChild: TNode): void;
  
  // Lifecycle
  onMount?(element: TNode, container: TContainer): void;
  onUnmount?(element: TNode): void;
}

// Plugin Interface
export interface Plugin {
  name: string;
  enforce?: 'pre' | 'post';
  apply?: string | string[] | ((platform: string) => boolean);
  
  // Core transformation hooks
  transform?(vnode: VNode, parent?: VNode): VNode | null | void;
  props?(props: Record<string, any>, vnode: VNode): Record<string, any> | void;
  
  // Lifecycle hooks
  create?(element: any, vnode: VNode): void;
  mount?(element: any, vnode: VNode): void;
  unmount?(element: any, vnode: VNode): void;
  
  // Fallback providers
  loading?(): VNode;
  error?(error: Error, retry: () => void): VNode;
}

export type PluginFactory<T = any> = (options?: T) => Plugin;

// Renderer Config
export interface RendererConfig {
  plugins?: Plugin[];
  platform: string;
}

// Render Context
export interface RenderContext {
  platform: string;
  componentStack: VNode[];
  plugins: PluginManager;
  globalErrorHandler?: (error: Error, vnode: VNode) => void;
}

// Plugin Manager (forward declaration, implemented in plugins/manager.ts)
export interface PluginManager {
  use(plugin: Plugin): void;
  transform(vnode: VNode, parent?: VNode): VNode | null;
  props(props: Record<string, any>, vnode: VNode): Record<string, any>;
  getLoading(): VNode | null;
  getError(error: Error, retry: () => void): VNode | null;
  create(element: any, vnode: VNode): void;
  mount(element: any, vnode: VNode): void;
  unmount(element: any, vnode: VNode): void;
}
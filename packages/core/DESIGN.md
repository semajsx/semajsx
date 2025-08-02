# DESIGN.md

# @semajsx/core Architecture Design

## Design Philosophy

### 1. Runtime Signal Integration
Process Signals at runtime without compile-time transforms, enabling dynamic behavior and platform independence.

### 2. Reasonable Granularity over Theoretical Fineness
Optimize for practical performance rather than maximum fine-grainedness. Property-level updates often cost more than they save.

### 3. Explicit Dependencies
All reactive operations require explicit dependency declaration to maintain predictable behavior and performance characteristics.

### 4. Platform Abstraction
Core logic completely separated from rendering platforms through strategy pattern.

### 5. Standardized Async Patterns
Built-in ErrorBoundary and Suspense components provide consistent async/error handling across all platforms.

## Core Abstractions

### Signal Protocol

```typescript
interface Signal<T = any> {
  readonly value: T;
  subscribe(listener: (value: T, prev?: T) => void): () => void;
  dispose?(): void;
}
```

**Design Decision**: Minimal interface for maximum compatibility. Any reactive system can implement this protocol.

**Implementation Constraint**: Signals are immutable references - the `value` property should be readonly to prevent direct mutation.

### Granularity Type Constraints

```typescript
type SignalProps<T> = {
  [K in keyof T]: T[K] extends object 
    ? T[K] extends Signal 
      ? T[K]  // Allow Signal<object>
      : T[K] extends Record<string, Signal>
        ? never  // Prevent { prop: signal1, prop2: signal2 }
        : T[K]
    : T[K] | Signal<T[K]>
};

// Usage example:
interface ButtonProps {
  className?: string;
  style?: CSSProperties;  // Must be Signal<CSSProperties> or CSSProperties
  children?: JSXNode;
}

// ✅ Allowed
<button style={styleSignal} />           // Signal<CSSProperties>
<button style={{ color: 'red' }} />     // CSSProperties

// ❌ Prevented by TypeScript
<button style={{ color: colorSignal }} />  // Record<string, Signal> not allowed
```

**Rationale**: TypeScript prevents over-granular Signal usage at compile time, enforcing performance-friendly patterns.

## Architecture Layers

### 1. Core Runtime (`@semajsx/core`)

```typescript
// VNode representation
interface VNode {
  type: string | Component | Fragment | typeof ErrorBoundary | typeof Suspense;
  props: Record<string, any> | null;
  children: VNode[];
  key?: string | number;
}

// Rendered node tracking
interface RenderedNode {
  vnode: VNode;
  element: any;              // Platform-specific node
  subscriptions: (() => void)[]; // Signal cleanup functions
  children: RenderedNode[];
}

// Component definition
interface Component<P = any> {
  (props: P & { children?: JSXNode }): VNode | Promise<VNode>;
  displayName?: string;
}

type JSXNode = VNode | string | number | boolean | null | undefined | JSXNode[];
```

**Responsibilities**:
- VNode creation and traversal
- Signal detection and subscription management
- Component lifecycle coordination
- Plugin hook execution
- Built-in ErrorBoundary and Suspense handling

### 2. Platform Strategy (`RenderStrategies`)

```typescript
interface RenderStrategies<TNode, TContainer> {
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
  
  // Lifecycle
  onMount?(element: TNode, container: TContainer): void;
  onUnmount?(element: TNode): void;
}
```

**Design Decision**: Strategies pattern allows core to remain platform-agnostic while enabling platform-specific optimizations.

### 3. Signal Integration (`@semajsx/signal`)

```typescript
// Explicit dependency tracking
export function effect(fn: () => void, deps: Signal[]): () => void;
export function computed<T>(fn: () => T, deps: Signal[]): Signal<T>;
export function signal<T>(initial: T): Signal<T>;
export function batch(fn: () => void): void;

// Usage
const count = signal(0);
const doubled = computed(() => count.value * 2, [count]);

effect(() => {
  console.log('Count changed:', count.value);
}, [count]);

// Batching multiple updates
batch(() => {
  count.value = 5;
  otherSignal.value = 'updated';
}); // Only one update cycle
```

**Design Decision**: Explicit dependencies prevent hidden reactivity and make performance characteristics predictable.

## Built-in Components

### 1. ErrorBoundary

```typescript
export const ErrorBoundary = Symbol('ErrorBoundary');

interface ErrorBoundaryProps {
  fallback?: VNode | ((error: Error, retry: () => void) => VNode);
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  children: VNode | VNode[];
}

// Usage
function App() {
  return (
    <ErrorBoundary 
      fallback={(error, retry) => <CustomErrorPage error={error} onRetry={retry} />}
      onError={(error) => analytics.track('error', error)}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### 2. Suspense

```typescript
export const Suspense = Symbol('Suspense');

interface SuspenseProps {
  fallback?: VNode;
  children: VNode | VNode[];
}

// Usage
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AsyncUserProfile userId="123" />
      <AsyncUserPosts userId="123" />
    </Suspense>
  );
}

// Async components work naturally
async function AsyncUserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId);
  return <div>Hello, {user.name}!</div>;
}
```

### 3. Fragment

```typescript
export const Fragment = Symbol('Fragment');

// JSX Transform support
function App() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}
```

## Core Rendering Algorithm

### 1. VNode Processing

```typescript
function renderNode(
  vnode: VNode, 
  container: any, 
  strategies: RenderStrategies,
  plugins: PluginManager
): RenderedNode {
  
  // Plugin transformation
  vnode = plugins.transform(vnode);
  if (!vnode) return null; // Plugin filtered out this vnode
  
  // Built-in component handling
  if (vnode.type === ErrorBoundary) {
    return renderErrorBoundary(vnode, container, strategies, plugins);
  }
  
  if (vnode.type === Suspense) {
    return renderSuspense(vnode, container, strategies, plugins);
  }
  
  if (vnode.type === Fragment) {
    return renderFragment(vnode, container, strategies, plugins);
  }
  
  // Regular elements and components
  if (typeof vnode.type === 'string') {
    return renderElement(vnode, container, strategies, plugins);
  }
  
  if (typeof vnode.type === 'function') {
    return renderComponent(vnode, container, strategies, plugins);
  }
  
  throw new Error(`Unknown vnode type: ${vnode.type}`);
}
```

### 2. Signal Property Handling

```typescript
function applyProps(
  element: any,
  props: Record<string, any>,
  strategies: RenderStrategies
): (() => void)[] {
  const subscriptions: (() => void)[] = [];
  
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue;
    
    if (isSignal(value)) {
      const unsubscribe = strategies.setSignalProperty(element, key, value);
      subscriptions.push(unsubscribe);
    } else {
      strategies.setProperty(element, key, value);
    }
  }
  
  return subscriptions;
}

function isSignal(value: any): value is Signal {
  return value != null && 
         typeof value === 'object' && 
         'value' in value && 
         'subscribe' in value &&
         typeof value.subscribe === 'function';
}
```

### 3. Built-in Component Rendering

```typescript
function renderErrorBoundary(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies,
  plugins: PluginManager
): RenderedNode {
  const { fallback, onError, children } = vnode.props;
  
  try {
    // Render children
    const childrenArray = Array.isArray(children) ? children : [children];
    const renderedChildren = childrenArray.map(child => 
      renderNode(child, container, strategies, plugins)
    );
    
    return {
      vnode,
      element: null, // ErrorBoundary is logical, creates no DOM
      subscriptions: [],
      children: renderedChildren
    };
    
  } catch (error) {
    // Error callback
    onError?.(error, { componentStack: getComponentStack() });
    
    // Get fallback
    let fallbackVNode: VNode;
    const retry = () => renderErrorBoundary(vnode, container, strategies, plugins);
    
    if (fallback) {
      // User provided fallback
      fallbackVNode = typeof fallback === 'function' ? fallback(error, retry) : fallback;
    } else {
      // Plugin provided fallback
      fallbackVNode = plugins.getError(error, retry) || 
                      <div>An error occurred: {error.message}</div>; // System fallback
    }
    
    const renderedFallback = renderNode(fallbackVNode, container, strategies, plugins);
    
    return {
      vnode,
      element: null,
      subscriptions: [],
      children: [renderedFallback]
    };
  }
}

function renderSuspense(
  vnode: VNode,
  container: any,
  strategies: RenderStrategies,
  plugins: PluginManager
): RenderedNode {
  const { fallback, children } = vnode.props;
  const suspenseKey = `suspense-${vnode.key || Math.random()}`;
  
  // Check for pending async operations
  const pendingPromises = getSuspenseState(suspenseKey);
  
  if (pendingPromises.length > 0) {
    // Render loading fallback
    let fallbackVNode: VNode;
    
    if (fallback) {
      fallbackVNode = fallback;
    } else {
      // Plugin provided loading
      fallbackVNode = plugins.getLoading() || 
                      <div>Loading...</div>; // System fallback
    }
    
    const renderedFallback = renderNode(fallbackVNode, container, strategies, plugins);
    
    return {
      vnode,
      element: null,
      subscriptions: [],
      children: [renderedFallback]
    };
  }
  
  // Try to render children
  try {
    const childrenArray = Array.isArray(children) ? children : [children];
    const results = childrenArray.map(child => {
      const result = renderNode(child, container, strategies, plugins);
      
      // Check for async components
      if (result instanceof Promise) {
        setSuspenseState(suspenseKey, [result]);
        throw result; // Trigger Suspense
      }
      
      return result;
    });
    
    return {
      vnode,
      element: null,
      subscriptions: [],
      children: results
    };
    
  } catch (promise) {
    if (promise instanceof Promise) {
      // Wait for async completion then re-render
      promise.then(() => {
        clearSuspenseState(suspenseKey);
        reRender(vnode, container);
      });
      
      // Render loading fallback
      const fallbackVNode = fallback || 
                           plugins.getLoading() || 
                           <div>Loading...</div>;
      
      const renderedFallback = renderNode(fallbackVNode, container, strategies, plugins);
      
      return {
        vnode,
        element: null,
        subscriptions: [],
        children: [renderedFallback]
      };
    }
    
    // Other errors continue to throw
    throw promise;
  }
}
```

### 4. Memory Management

```typescript
function unmountNode(node: RenderedNode, strategies: RenderStrategies): void {
  // Cleanup signal subscriptions
  node.subscriptions.forEach(unsubscribe => unsubscribe());
  
  // Recursively unmount children
  node.children.forEach(child => unmountNode(child, strategies));
  
  // Platform-specific cleanup
  if (strategies.onUnmount && node.element) {
    strategies.onUnmount(node.element);
  }
}
```

## Plugin System Design

### 1. Plugin Interface

```typescript
interface Plugin {
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

type PluginFactory<T = any> = (options?: T) => Plugin;
```

### 2. Plugin Examples

```typescript
// Theme plugin
function themePlugin(options: {
  theme: 'dark' | 'light';
  loadingStyle?: 'spinner' | 'skeleton' | 'dots';
  errorStyle?: 'card' | 'toast' | 'minimal';
}): Plugin {
  return {
    name: 'theme',
    
    loading() {
      const baseClass = `theme-${options.theme}`;
      
      switch (options.loadingStyle) {
        case 'skeleton':
          return (
            <div className={`${baseClass} loading-skeleton`}>
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
          );
          
        case 'dots':
          return (
            <div className={`${baseClass} loading-dots`}>
              <span></span><span></span><span></span>
            </div>
          );
          
        default: // spinner
          return (
            <div className={`${baseClass} loading-spinner`}>
              <div className="spinner"></div>
              <span>Loading...</span>
            </div>
          );
      }
    },
    
    error(error, retry) {
      const baseClass = `theme-${options.theme}`;
      
      switch (options.errorStyle) {
        case 'toast':
          return (
            <div className={`${baseClass} error-toast`}>
              <span className="error-icon">⚠️</span>
              <span className="error-message">{error.message}</span>
              <button onClick={retry} className="retry-btn">Retry</button>
            </div>
          );
          
        case 'minimal':
          return (
            <div className={`${baseClass} error-minimal`}>
              Something went wrong. <button onClick={retry} className="retry-link">Try again?</button>
            </div>
          );
          
        default: // card
          return (
            <div className={`${baseClass} error-card`}>
              <div className="error-header">
                <span className="error-icon">❌</span>
                <h4>Oops! Something went wrong</h4>
              </div>
              <p className="error-details">{error.message}</p>
              <button onClick={retry} className="retry-button">
                Try Again
              </button>
            </div>
          );
      }
    },
    
    // Apply theme classes to all elements
    props(props, vnode) {
      if (typeof vnode.type === 'string') {
        props.className = [props.className, `theme-${options.theme}`]
          .filter(Boolean).join(' ');
      }
      return props;
    }
  };
}

// Brand plugin with higher priority
function brandPlugin(): Plugin {
  return {
    name: 'brand',
    enforce: 'pre', // Higher priority than theme
    
    loading() {
      return (
        <div className="brand-loading">
          <img src="/logo.svg" alt="Loading" className="loading-logo" />
          <div className="loading-text">Loading awesome content...</div>
          <div className="loading-progress"></div>
        </div>
      );
    },
    
    error(error, retry) {
      return (
        <div className="brand-error">
          <div className="error-illustration">
            <img src="/error-illustration.svg" alt="Error" />
          </div>
          <h3>Whoops! Something didn't go as planned</h3>
          <p>Don't worry, these things happen. Let's try again!</p>
          <details className="error-details">
            <summary>Technical details</summary>
            <code>{error.message}</code>
          </details>
          <div className="error-actions">
            <button onClick={retry} className="primary-btn">Try Again</button>
            <button onClick={() => window.location.reload()} className="secondary-btn">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };
}

// Development plugin
function devPlugin(): Plugin {
  return {
    name: 'dev',
    apply: () => process.env.NODE_ENV === 'development',
    
    error(error, retry) {
      return (
        <div className="dev-error">
          <h3>🐛 Development Error</h3>
          <div className="error-stack">
            <h4>Error:</h4>
            <pre>{error.message}</pre>
            <h4>Stack Trace:</h4>
            <pre>{error.stack}</pre>
          </div>
          <div className="dev-actions">
            <button onClick={retry}>🔄 Retry</button>
            <button onClick={() => console.error(error)}>📝 Log to Console</button>
          </div>
        </div>
      );
    },
    
    transform(vnode) {
      // Add debug info in development
      if (vnode.props && typeof vnode.type === 'string') {
        vnode.props['data-component'] = vnode.type;
        vnode.props['data-timestamp'] = Date.now();
      }
      return vnode;
    }
  };
}
```

### 3. Plugin Manager

```typescript
class PluginManager {
  private plugins: Plugin[] = [];
  private platform: string;
  
  constructor(platform: string) {
    this.platform = platform;
  }
  
  use(plugin: Plugin): void {
    // Check platform compatibility
    if (plugin.apply) {
      if (typeof plugin.apply === 'function') {
        if (!plugin.apply(this.platform)) return;
      } else {
        const platforms = Array.isArray(plugin.apply) ? plugin.apply : [plugin.apply];
        if (!platforms.includes(this.platform)) return;
      }
    }
    
    this.plugins.push(plugin);
    this.sortPlugins();
  }
  
  private sortPlugins(): void {
    this.plugins.sort((a, b) => {
      const orderA = a.enforce === 'pre' ? 0 : a.enforce === 'post' ? 2 : 1;
      const orderB = b.enforce === 'pre' ? 0 : b.enforce === 'post' ? 2 : 1;
      return orderA - orderB;
    });
  }
  
  // Transform hook execution
  transform(vnode: VNode, parent?: VNode): VNode | null {
    for (const plugin of this.plugins) {
      if (plugin.transform) {
        const result = plugin.transform(vnode, parent);
        if (result === null) return null; // Skip this vnode
        if (result) vnode = result; // Update vnode for next plugin
      }
    }
    return vnode;
  }
  
  // Props hook execution
  props(props: Record<string, any>, vnode: VNode): Record<string, any> {
    for (const plugin of this.plugins) {
      if (plugin.props) {
        const result = plugin.props(props, vnode);
        if (result) props = result;
      }
    }
    return props;
  }
  
  // Fallback providers
  getLoading(): VNode | null {
    // First plugin that provides loading wins
    for (const plugin of this.plugins) {
      if (plugin.loading) {
        return plugin.loading();
      }
    }
    return null;
  }
  
  getError(error: Error, retry: () => void): VNode | null {
    // First plugin that provides error handling wins
    for (const plugin of this.plugins) {
      if (plugin.error) {
        return plugin.error(error, retry);
      }
    }
    return null;
  }
  
  // Lifecycle hooks
  create(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.create?.(element, vnode);
    }
  }
  
  mount(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.mount?.(element, vnode);
    }
  }
  
  unmount(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.unmount?.(element, vnode);
    }
  }
}
```

## Platform Implementation Guidelines

### 1. DOM Platform

```typescript
const domStrategies: RenderStrategies<Node, Element> = {
  createElement(tagName: string, container: Element): Element {
    return document.createElement(tagName);
  },
  
  createTextNode(text: string, container: Element): Text {
    return document.createTextNode(text);
  },
  
  createFragment(container: Element): DocumentFragment {
    return document.createDocumentFragment();
  },
  
  setProperty(element: Element, key: string, value: any): void {
    if (key === 'className') {
      element.className = value ?? '';
    } else if (key === 'style') {
      handleStyleProperty(element as HTMLElement, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else if (value == null) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, String(value));
    }
  },
  
  setSignalProperty<T>(element: Element, key: string, signal: Signal<T>): () => void {
    // Set initial value
    this.setProperty(element, key, signal.value);
    
    // Subscribe to changes
    return signal.subscribe((newValue) => {
      this.setProperty(element, key, newValue);
    });
  },
  
  appendChild(parent: Element, child: Node): void {
    parent.appendChild(child);
  },
  
  removeChild(parent: Element, child: Node): void {
    parent.removeChild(child);
  },
  
  insertBefore(parent: Element, child: Node, before: Node): void {
    parent.insertBefore(child, before);
  }
};

function handleStyleProperty(element: HTMLElement, value: any): void {
  if (typeof value === 'string') {
    element.setAttribute('style', value);
  } else if (value && typeof value === 'object') {
    // Clear existing styles first
    element.style.cssText = '';
    Object.assign(element.style, value);
  } else {
    element.removeAttribute('style');
  }
}

// Export DOM renderer
export const render = createRenderer(domStrategies);
```

### 2. CLI TUI Platform

```typescript
interface TUINode {
  type: 'text' | 'box' | 'list' | 'input' | 'button';
  content: string;
  style: TUIStyle;
  bounds: { x: number; y: number; width: number; height: number };
  children: TUINode[];
  parent?: TUINode;
}

interface TUIStyle {
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  border?: 'single' | 'double' | 'rounded' | 'none';
  padding?: { top: number; right: number; bottom: number; left: number };
}

interface TUIContainer {
  width: number;
  height: number;
  buffer: string[][];
  cursor: { x: number; y: number };
  focused?: TUINode;
}

const tuiStrategies: RenderStrategies<TUINode, TUIContainer> = {
  createElement(tagName: string, container: TUIContainer): TUINode {
    const nodeType = mapHTMLToTUI(tagName);
    return {
      type: nodeType,
      content: '',
      style: {},
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      children: []
    };
  },
  
  createTextNode(text: string, container: TUIContainer): TUINode {
    return {
      type: 'text',
      content: text,
      style: {},
      bounds: { x: 0, y: 0, width: text.length, height: 1 },
      children: []
    };
  },
  
  setProperty(element: TUINode, key: string, value: any): void {
    switch (key) {
      case 'className':
        // Map CSS classes to TUI styles
        element.style = { ...element.style, ...mapClassToTUIStyle(value) };
        break;
        
      case 'style':
        if (typeof value === 'object') {
          element.style = { ...element.style, ...mapCSSToTUIStyle(value) };
        }
        break;
        
      case 'onClick':
        // Store event handler for keyboard/mouse events
        (element as any)._onClick = value;
        break;
        
      case 'value':
        if (element.type === 'input') {
          element.content = String(value);
        }
        break;
        
      default:
        // Store as custom property
        (element as any)[key] = value;
    }
  },
  
  setSignalProperty<T>(element: TUINode, key: string, signal: Signal<T>): () => void {
    this.setProperty(element, key, signal.value);
    
    return signal.subscribe((newValue) => {
      this.setProperty(element, key, newValue);
      // Trigger re-render of this element
      scheduleElementUpdate(element);
    });
  },
  
  appendChild(parent: TUINode, child: TUINode): void {
    parent.children.push(child);
    child.parent = parent;
    // Recalculate layout
    updateLayout(parent);
  },
  
  removeChild(parent: TUINode, child: TUINode): void {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
      child.parent = undefined;
      updateLayout(parent);
    }
  },
  
  insertBefore(parent: TUINode, child: TUINode, before: TUINode): void {
    const index = parent.children.indexOf(before);
    if (index !== -1) {
      parent.children.splice(index, 0, child);
      child.parent = parent;
      updateLayout(parent);
    }
  }
};

// HTML to TUI mapping
function mapHTMLToTUI(tagName: string): TUINode['type'] {
  const mapping: Record<string, TUINode['type']> = {
    'div': 'box',
    'span': 'text',
    'p': 'text',
    'button': 'button',
    'input': 'input',
    'ul': 'list',
    'ol': 'list',
    'li': 'text'
  };
  
  return mapping[tagName] || 'box';
}

// CSS to TUI style mapping
function mapCSSToTUIStyle(cssStyle: any): TUIStyle {
  const tuiStyle: TUIStyle = {};
  
  if (cssStyle.color) {
    tuiStyle.color = mapColorToANSI(cssStyle.color);
  }
  
  if (cssStyle.backgroundColor) {
    tuiStyle.background = mapColorToANSI(cssStyle.backgroundColor);
  }
  
  if (cssStyle.fontWeight === 'bold') {
    tuiStyle.bold = true;
  }
  
  if (cssStyle.fontStyle === 'italic') {
    tuiStyle.italic = true;
  }
  
  if (cssStyle.textDecoration === 'underline') {
    tuiStyle.underline = true;
  }
  
  if (cssStyle.border) {
    tuiStyle.border = parseBorderStyle(cssStyle.border);
  }
  
  return tuiStyle;
}

// Export TUI renderer
export const renderTUI = createRenderer(tuiStrategies);
```

## Renderer Creation

```typescript
interface RendererConfig {
  plugins?: Plugin[];
  platform: string;
}

function createRenderer<TNode, TContainer>(
  strategies: RenderStrategies<TNode, TContainer>,
  config: RendererConfig
) {
  const pluginManager = new PluginManager(config.platform);
  
  // Register plugins
  config.plugins?.forEach(plugin => pluginManager.use(plugin));
  
  function render(vnode: VNode, container: TContainer): RenderedNode {
    return renderNode(vnode, container, strategies, pluginManager);
  }
  
  return { 
    render, 
    plugins: pluginManager,
    unmount: (node: RenderedNode) => unmountNode(node, strategies)
  };
}
```

## Performance Characteristics

### 1. Signal Subscription Overhead

**Analysis**: Each Signal usage creates one subscription. For a typical component tree:
- 100 components × 3 signals each = 300 subscriptions
- Each subscription: ~40 bytes overhead
- Total overhead: ~12KB

**Mitigation**: Use coarser-grained signals when possible.

### 2. Update Granularity Trade-offs

```typescript
// Performance comparison
interface PerformanceProfile {
  subscriptionCost: number;    // Memory + CPU for subscriptions
  updateCost: number;          // CPU cost per update
  batchingBenefit: number;     // Reduction from batching
}

const granularStyle: PerformanceProfile = {
  subscriptionCost: 3,         // 3 subscriptions for color, bg, padding
  updateCost: 0.5,             // Direct property update
  batchingBenefit: 0           // No batching possible
};

const coarseStyle: PerformanceProfile = {
  subscriptionCost: 1,         // 1 subscription for style object
  updateCost: 1.2,             // Object assignment overhead
  batchingBenefit: 0.8         // Multiple style changes in one update
};
```

**Design Decision**: Default to coarse granularity unless fine granularity provides measurable benefits.

### 3. Batching Strategy

```typescript
// Automatic batching for synchronous updates
function batchUpdates(fn: () => void): void {
  const prevBatchingState = isBatching;
  isBatching = true;
  
  try {
    fn();
  } finally {
    isBatching = prevBatchingState;
    
    if (!isBatching) {
      flushPendingUpdates();
    }
  }
}
```

## Error Handling Strategy

### 1. Error Propagation

```typescript
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: VNode;
  platform: string;
}

function handleRenderError(
  error: Error,
  vnode: VNode,
  context: RenderContext
): VNode | null {
  const boundary = findErrorBoundary(context.componentStack);
  
  if (boundary) {
    const { onError, fallback } = boundary.props;
    
    // Call error callback
    onError?.(error, { 
      componentStack: context.componentStack,
      errorBoundary: boundary,
      platform: context.platform
    });
    
    // Return fallback or plugin-provided error UI
    return fallback || context.plugins.getError(error, () => {
      // Retry logic
      rerenderFromBoundary(boundary);
    });
  }
  
  // No boundary found, propagate to global handler
  context.globalErrorHandler?.(error, vnode);
  return null;
}
```

### 2. Signal Error Safety

```typescript
function createSafeSignal<T>(signal: Signal<T>, fallbackValue: T): Signal<T> {
  return {
    get value() {
      try {
        return signal.value;
      } catch (error) {
        console.error('Signal evaluation error:', error);
        return fallbackValue;
      }
    },
    
    subscribe(listener) {
      return signal.subscribe((value, prev) => {
        try {
          listener(value, prev);
        } catch (error) {
          console.error('Signal listener error:', error);
        }
      });
    },
    
    dispose() {
      signal.dispose?.();
    }
  };
}
```

## Complete Usage Example

```typescript
import { signal, computed, effect } from '@semajsx/signal';
import { render } from '@semajsx/dom';
import { themePlugin, brandPlugin, devPlugin } from './plugins';

// Signal setup
const todos = signal([
  { id: 1, text: 'Learn semajsx', completed: false },
  { id: 2, text: 'Build an app', completed: false }
]);

const filter = signal('all');
const theme = signal('dark');

// Derived signals
const filteredTodos = computed(() => {
  const todoList = todos.value;
  const currentFilter = filter.value;
  
  switch (currentFilter) {
    case 'completed': return todoList.filter(todo => todo.completed);
    case 'active': return todoList.filter(todo => !todo.completed);
    default: return todoList;
  }
}, [todos, filter]);

// Components
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <input 
        type="checkbox" 
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}

function TodoList() {
  const toggleTodo = (id) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };
  
  const deleteTodo = (id) => {
    todos.value = todos.value.filter(todo => todo.id !== id);
  };
  
  return (
    <div className="todo-app">
      <ErrorBoundary onError={(error) => console.error('Todo error:', error)}>
        <header>
          <h1>Todo List</h1>
          <div className="theme-toggle">
            <button onClick={() => theme.value = theme.value === 'dark' ? 'light' : 'dark'}>
              Switch to {theme.value === 'dark' ? 'light' : 'dark'} theme
            </button>
          </div>
        </header>
        
        <nav className="filters">
          <button 
            className={filter.value === 'all' ? 'active' : ''}
            onClick={() => filter.value = 'all'}
          >
            All
          </button>
          <button 
            className={filter.value === 'active' ? 'active' : ''}
            onClick={() => filter.value = 'active'}
          >
            Active
          </button>
          <button 
            className={filter.value === 'completed' ? 'active' : ''}
            onClick={() => filter.value = 'completed'}
          >
            Completed
          </button>
        </nav>
        
        <Suspense>
          <main>
            <ul className="todo-list">
              {filteredTodos.value.map(todo => (
                <TodoItem 
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          </main>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Configure and render
const renderer = createRenderer(domStrategies, {
  platform: 'dom',
  plugins: [
    brandPlugin(),
    devPlugin(),
    themePlugin({
      theme: theme.value, // Initial theme
      loadingStyle: 'skeleton',
      errorStyle: 'card'
    })
  ]
});

// Update theme plugin when theme signal changes
effect(() => {
  // Re-register theme plugin with new theme
  renderer.plugins.use(themePlugin({
    theme: theme.value,
    loadingStyle: 'skeleton',
    errorStyle: 'card'
  }));
}, [theme]);

// Render app
renderer.render(<TodoList />, document.getElementById('root'));
```

## Migration Strategy

### 1. From React

```typescript
// React patterns → semajsx patterns
// useState → signal
const [count, setCount] = useState(0); // React
const count = signal(0);               // semajsx

// useEffect → effect
useEffect(() => {                      // React
  console.log(count);
}, [count]);

effect(() => {                         // semajsx
  console.log(count.value);
}, [count]);

// useMemo → computed
const doubled = useMemo(() => count * 2, [count]); // React
const doubled = computed(() => count.value * 2, [count]); // semajsx
```

### 2. Incremental Adoption

```typescript
// Bridge component for gradual migration
function ReactBridge({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      // Render semajsx components inside React
      render(children, containerRef.current);
    }
  }, [children]);
  
  return <div ref={containerRef} />;
}

// Use in existing React app
function ExistingReactApp() {
  return (
    <div>
      <ReactHeader />
      <ReactBridge>
        <SemajsxTodoList />
      </ReactBridge>
      <ReactFooter />
    </div>
  );
}
```

## Future Extensibility

### 1. Signal Protocol Extensions

```typescript
// Future signal capabilities (backward compatible)
interface ExtendedSignal<T> extends Signal<T> {
  // Batching
  batch?(fn: () => void): void;
  
  // Debugging
  debug?: {
    name: string;
    trace: boolean;
  };
  
  // Performance hints
  hints?: {
    updateFrequency: 'low' | 'medium' | 'high';
    batchable: boolean;
  };
  
  // Transformation
  map?<U>(fn: (value: T) => U): Signal<U>;
  filter?(predicate: (value: T) => boolean): Signal<T>;
}
```

### 2. Platform Extensions

```typescript
// Platform-specific optimizations
interface ExtendedRenderStrategies<TNode, TContainer> extends RenderStrategies<TNode, TContainer> {
  // Batch updates
  batchUpdates?(fn: () => void): void;
  
  // Performance measurement
  measureRender?(vnode: VNode): PerformanceMeasure;
  
  // Platform-specific features
  platformFeatures?: Record<string, any>;
  
  // Optimization hints
  optimizeFor?: 'speed' | 'memory' | 'battery';
}
```

### 3. Advanced Plugin Capabilities

```typescript
// Future plugin extensions
interface AdvancedPlugin extends Plugin {
  // Global state management
  state?: {
    initial?: Record<string, any>;
    reducers?: Record<string, (state: any, action: any) => any>;
  };
  
  // Cross-component communication
  events?: {
    emit?(event: string, data: any): void;
    on?(event: string, handler: (data: any) => void): () => void;
  };
  
  // Performance hooks
  measurePerformance?: boolean;
  onPerformanceData?(data: PerformanceMetrics): void;
}
```

This design provides a comprehensive foundation for implementing a next-generation JSX runtime that solves real problems in modern UI development while maintaining simplicity and performance. 
# @semajsx/web Architecture Design

## Overview

`@semajsx/web` provides DOM-specific rendering strategies, web platform optimizations, and browser-focused plugins for the semajsx framework. It implements the `RenderStrategies<Node, Element>` interface defined in `@semajsx/core` to enable efficient DOM manipulation with signal-based reactivity.

## Design Principles

### 1. Performance-First DOM Manipulation
Minimize DOM operations through intelligent batching, caching, and targeted updates. Leverage browser APIs like `requestAnimationFrame` for optimal rendering performance.

### 2. Signal-to-DOM Efficiency
Direct property binding from signals to DOM elements without virtual DOM overhead. Signal subscriptions update DOM properties immediately while batching multiple updates within the same frame.

### 3. Web Platform Integration
Full integration with web standards including:
- DOM Events with proper cleanup and delegation
- CSS Object Model for type-safe styling
- History API for routing
- Web APIs for enhanced functionality

### 4. Developer Experience
Rich debugging tools, comprehensive error boundaries, and hot reload integration for optimal development workflow.

## Core Architecture

### DOM Strategies Implementation

```typescript
interface WebRenderStrategies extends RenderStrategies<Node, Element> {
  // Enhanced with web-specific optimizations
  batchUpdates(fn: () => void): void;
  scheduleUpdate(element: Element, update: () => void): void;
  delegateEvent(container: Element, eventType: string): void;
}
```

**Key Features**:
- **Batched Updates**: Use `requestAnimationFrame` to batch DOM updates
- **Event Delegation**: Efficient event handling at container level
- **Element Recycling**: Reuse DOM nodes for list rendering
- **Memory Management**: Automatic cleanup of event listeners and subscriptions

### Signal Property Binding

```typescript
// Efficient signal-to-DOM property updates
function setSignalProperty<T>(
  element: Element, 
  key: string, 
  signal: Signal<T>
): () => void {
  // Immediate initial update
  setProperty(element, key, signal.value);
  
  // Batched subscription updates
  return signal.subscribe((newValue, prevValue) => {
    scheduleUpdate(element, () => {
      setProperty(element, key, newValue);
    });
  });
}
```

**Optimizations**:
- Property-specific update strategies (className vs style vs attributes)
- Diff-based style object updates
- Event handler caching and reuse
- Text content optimization for dynamic strings

### Event System

```typescript
interface WebEventSystem {
  // High-level event delegation
  delegate(container: Element, selector: string, eventType: string, handler: Function): void;
  
  // Direct event binding with cleanup
  bind(element: Element, eventType: string, handler: Function): () => void;
  
  // Synthetic event creation for cross-browser compatibility
  createSyntheticEvent(nativeEvent: Event): SyntheticEvent;
}
```

**Features**:
- Automatic event listener cleanup on unmount
- Cross-browser event normalization
- Support for custom events and bubbling
- Memory-efficient delegation for dynamic lists

## Web-Specific Components

### Enhanced Error Boundary

```typescript
function WebErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  // Enhanced error reporting with:
  // - Component stack traces
  // - Browser environment info
  // - Network request context
  // - Performance metrics at error time
}
```

### Performance Monitor

```typescript
function PerformanceMonitor({ children, onMetrics }: PerformanceMonitorProps) {
  // Tracks:
  // - Render times per component
  // - Signal update frequency
  // - DOM operation counts
  // - Memory usage patterns
}
```

## Built-in Plugins

### 1. Development Plugin

```typescript
function webDevPlugin(): Plugin {
  return {
    name: 'web-dev',
    apply: () => process.env.NODE_ENV === 'development',
    
    error(error, retry) {
      return (
        <div className="semajsx-dev-error">
          <header>
            <h3>🐛 Development Error</h3>
            <button onClick={() => window.location.reload()}>
              🔄 Reload Page
            </button>
          </header>
          
          <div className="error-content">
            <section>
              <h4>Error Message</h4>
              <pre>{error.message}</pre>
            </section>
            
            <section>
              <h4>Component Stack</h4>
              <pre>{getComponentStack()}</pre>
            </section>
            
            <section>
              <h4>Browser Info</h4>
              <pre>{JSON.stringify(getBrowserInfo(), null, 2)}</pre>
            </section>
          </div>
          
          <footer>
            <button onClick={retry} className="retry-btn">
              🔄 Retry Component
            </button>
            <button onClick={() => console.error(error)}>
              📝 Log to Console
            </button>
          </footer>
        </div>
      );
    },
    
    transform(vnode) {
      // Add development attributes
      if (vnode.props && typeof vnode.type === 'string') {
        vnode.props['data-semajsx-component'] = vnode.type;
        vnode.props['data-semajsx-timestamp'] = Date.now();
        vnode.props['data-semajsx-render-id'] = generateRenderID();
      }
      return vnode;
    },
    
    mount(element, vnode) {
      // Track component mount timing
      performance.mark(`semajsx-mount-${vnode.type}-start`);
    },
    
    unmount(element, vnode) {
      // Track component lifecycle and cleanup
      performance.mark(`semajsx-unmount-${vnode.type}`);
      validateCleanup(element);
    }
  };
}
```

### 2. Theme Plugin

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  customProperties: Record<string, string>;
  mediaQueries: Record<string, string>;
  transitions: boolean;
}

function webThemePlugin(config: ThemeConfig): Plugin {
  return {
    name: 'web-theme',
    
    loading() {
      return (
        <div className="semajsx-theme-loading">
          <div className="loading-spinner" />
          <span>Loading...</span>
        </div>
      );
    },
    
    create(element, vnode) {
      // Apply theme-aware CSS custom properties
      if (element instanceof HTMLElement) {
        applyThemeProperties(element, config);
      }
    },
    
    props(props, vnode) {
      // Enhance className with theme-aware classes
      if (typeof vnode.type === 'string') {
        const themeClass = `theme-${getCurrentTheme(config)}`;
        props.className = [props.className, themeClass]
          .filter(Boolean)
          .join(' ');
      }
      return props;
    }
  };
}
```

### 3. Router Plugin

```typescript
interface RouteConfig {
  path: string;
  component: Component;
  lazy?: boolean;
  guards?: RouteGuard[];
}

function webRouterPlugin(routes: RouteConfig[]): Plugin {
  return {
    name: 'web-router',
    
    create(element, vnode) {
      // Set up history API listeners
      if (element === document.body) {
        setupHistoryListeners(routes);
      }
    },
    
    transform(vnode) {
      // Transform route components based on current path
      if (isRouteComponent(vnode)) {
        return resolveRoute(vnode, routes, getCurrentPath());
      }
      return vnode;
    }
  };
}
```

## Style Handling System

### CSS Object Support

```typescript
interface CSSStyleObject {
  [property: string]: string | number | Signal<string | number>;
}

function handleStyleProperty(element: HTMLElement, value: CSSStyleObject | string) {
  if (typeof value === 'string') {
    element.style.cssText = value;
  } else if (value && typeof value === 'object') {
    // Efficient diff-based updates
    updateStyleObject(element, value);
  } else {
    element.style.cssText = '';
  }
}

function updateStyleObject(element: HTMLElement, styles: CSSStyleObject) {
  for (const [property, value] of Object.entries(styles)) {
    if (isSignal(value)) {
      // Create signal binding for this style property
      const unsubscribe = value.subscribe((newValue) => {
        element.style.setProperty(property, String(newValue));
      });
      
      // Store cleanup function
      storeCleanup(element, unsubscribe);
    } else {
      element.style.setProperty(property, String(value));
    }
  }
}
```

### CSS Custom Properties Integration

```typescript
function setCSSCustomProperty(name: string, value: string | Signal<string>) {
  if (isSignal(value)) {
    document.documentElement.style.setProperty(name, value.value);
    return value.subscribe((newValue) => {
      document.documentElement.style.setProperty(name, newValue);
    });
  } else {
    document.documentElement.style.setProperty(name, value);
    return () => {};
  }
}
```

## Performance Optimizations

### 1. Update Batching

```typescript
class UpdateScheduler {
  private pendingUpdates = new Set<() => void>();
  private isScheduled = false;
  
  schedule(update: () => void) {
    this.pendingUpdates.add(update);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }
  
  private flush() {
    for (const update of this.pendingUpdates) {
      try {
        update();
      } catch (error) {
        console.error('Update error:', error);
      }
    }
    
    this.pendingUpdates.clear();
    this.isScheduled = false;
  }
}
```

### 2. Element Recycling

```typescript
class ElementPool {
  private pools = new Map<string, Element[]>();
  
  acquire(tagName: string): Element {
    const pool = this.pools.get(tagName);
    if (pool && pool.length > 0) {
      const element = pool.pop()!;
      this.resetElement(element);
      return element;
    }
    return document.createElement(tagName);
  }
  
  release(element: Element) {
    const tagName = element.tagName.toLowerCase();
    const pool = this.pools.get(tagName) || [];
    if (pool.length < 100) { // Max pool size
      pool.push(element);
      this.pools.set(tagName, pool);
    }
  }
  
  private resetElement(element: Element) {
    element.textContent = '';
    element.className = '';
    element.removeAttribute('style');
    // Reset other attributes as needed
  }
}
```

### 3. Memory Management

```typescript
interface ElementCleanup {
  subscriptions: (() => void)[];
  observers: ResizeObserver[];
  timers: number[];
}

const cleanupMap = new WeakMap<Element, ElementCleanup>();

function scheduleCleanup(element: Element, cleanup: () => void) {
  const elementCleanup = cleanupMap.get(element) || {
    subscriptions: [],
    observers: [],
    timers: []
  };
  
  elementCleanup.subscriptions.push(cleanup);
  cleanupMap.set(element, elementCleanup);
}

function performCleanup(element: Element) {
  const cleanup = cleanupMap.get(element);
  if (cleanup) {
    cleanup.subscriptions.forEach(fn => fn());
    cleanup.observers.forEach(observer => observer.disconnect());
    cleanup.timers.forEach(timer => clearTimeout(timer));
    cleanupMap.delete(element);
  }
}
```

## Browser Compatibility

### Feature Detection

```typescript
interface BrowserFeatures {
  requestAnimationFrame: boolean;
  customElements: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  cssCustomProperties: boolean;
}

const browserFeatures: BrowserFeatures = {
  requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
  customElements: typeof customElements !== 'undefined',
  intersectionObserver: typeof IntersectionObserver !== 'undefined',
  resizeObserver: typeof ResizeObserver !== 'undefined',
  cssCustomProperties: CSS.supports('--custom-property', 'value')
};
```

### Polyfill Integration

```typescript
function applyPolyfills() {
  if (!browserFeatures.requestAnimationFrame) {
    // Fallback to setTimeout
    window.requestAnimationFrame = (callback) => 
      setTimeout(callback, 16);
  }
  
  if (!browserFeatures.cssCustomProperties) {
    // Load CSS custom properties polyfill
    import('css-vars-ponyfill').then(ponyfill => {
      ponyfill.default();
    });
  }
}
```

## Usage Examples

### Basic Setup

```typescript
import { render } from '@semajsx/web';
import { signal } from '@semajsx/signals';

const count = signal(0);

function Counter() {
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
}

render(<Counter />, document.getElementById('root')!);
```

### With Plugins

```typescript
import { createRenderer } from '@semajsx/web';
import { webDevPlugin, webThemePlugin } from '@semajsx/web/plugins';

const renderer = createRenderer({
  platform: 'web',
  plugins: [
    webDevPlugin(),
    webThemePlugin({
      mode: 'auto',
      customProperties: {
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d'
      },
      transitions: true
    })
  ]
});

renderer.render(<App />, document.getElementById('root')!);
```

### Advanced Signal Usage

```typescript
import { signal, computed, effect } from '@semajsx/signals';

const theme = signal<'light' | 'dark'>('light');
const user = signal<User | null>(null);

const userStyles = computed(() => {
  const base = {
    padding: '1rem',
    borderRadius: '8px'
  };
  
  if (theme.value === 'dark') {
    return {
      ...base,
      backgroundColor: '#2d3748',
      color: '#fff'
    };
  }
  
  return {
    ...base,
    backgroundColor: '#fff',
    color: '#000'
  };
}, [theme]);

function UserProfile() {
  return (
    <div style={userStyles}>
      {user.value ? (
        <div>
          <h2>Welcome, {user.value.name}!</h2>
          <button onClick={() => theme.value = theme.value === 'light' ? 'dark' : 'light'}>
            Switch to {theme.value === 'light' ? 'dark' : 'light'} mode
          </button>
        </div>
      ) : (
        <div>Please log in</div>
      )}
    </div>
  );
}
```

## Future Extensions

### Web Components Integration

```typescript
interface WebComponentConfig {
  tagName: string;
  shadowDOM: boolean;
  observedAttributes: string[];
}

function webComponentPlugin(config: WebComponentConfig): Plugin {
  return {
    name: 'web-components',
    
    create(element, vnode) {
      if (element instanceof HTMLElement && config.shadowDOM) {
        const shadow = element.attachShadow({ mode: 'open' });
        // Render semajsx components inside shadow DOM
      }
    }
  };
}
```

### Service Worker Integration

```typescript
function serviceWorkerPlugin(): Plugin {
  return {
    name: 'service-worker',
    
    mount() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          });
      }
    }
  };
}
```

This architecture provides a comprehensive, performant, and developer-friendly web rendering solution that leverages semajsx's signal-based reactivity while providing optimal DOM performance and modern web platform integration.
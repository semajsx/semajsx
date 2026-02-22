# Type Safety Fixes for SemaJSX

## Critical Issues and Solutions

### 1. Event Listener Storage (`properties.ts:64`)

**Current (unsafe):**

```typescript
const element_any = element as any;
// Remove old listener if exists (stored on element)
const oldListener = element_any[`__${key}`];
```

**Fixed (type-safe):**

```typescript
// Use WeakMap for type-safe event listener storage
const eventListeners = new WeakMap<Element, Map<string, EventListener>>();

function getEventListeners(element: Element): Map<string, EventListener> {
  let listeners = eventListeners.get(element);
  if (!listeners) {
    listeners = new Map();
    eventListeners.set(element, listeners);
  }
  return listeners;
}

// Usage:
const listeners = getEventListeners(element);
const oldListener = listeners.get(key);
if (oldListener) {
  element.removeEventListener(eventName, oldListener);
}
listeners.set(key, value as EventListener);
```

### 2. Context Provider Markers (`render-core.ts:379`, `context.ts:62`)

**Current (unsafe):**

```typescript
(Context as any).__isContextProvider = true;
const isContextProvider = (Component as any).__isContextProvider;
```

**Fixed (type-safe):**

```typescript
// Define Symbol for internal markers
const CONTEXT_PROVIDER_SYMBOL = Symbol.for("__isContextProvider");

// Type declaration
declare global {
  interface Function {
    [CONTEXT_PROVIDER_SYMBOL]?: boolean;
  }
}

// Usage in context.ts:
Context[CONTEXT_PROVIDER_SYMBOL] = true;

// Usage in render-core.ts:
const isContextProvider = Component[CONTEXT_PROVIDER_SYMBOL] === true;
```

### 3. Config Access (`vite-router.ts:64`)

**Current (unsafe):**

```typescript
const cacheSize = (config as any).islandCacheSize ?? 1000;
```

**Fixed (type-safe):**

```typescript
// Define proper config type
interface ViteRouterConfig {
  islandCacheSize?: number;
  // other config properties...
}

// Update function signature
constructor(config: ViteRouterConfig = {}) {
  const cacheSize = config.islandCacheSize ?? 1000;
  // ...
}
```

### 4. Type Guards (`component.ts:85`, `render-core.ts:100,107`)

**Current (unsafe):**

```typescript
function isIterable(value: unknown): value is Iterable<unknown> {
  return value != null && typeof (value as any)[Symbol.iterator] === "function";
}
```

**Fixed (type-safe):**

```typescript
function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    value != null &&
    typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function"
  );
}

function isPromise<T>(value: unknown): value is Promise<T> {
  return value != null && typeof (value as { then?: unknown }).then === "function";
}

function isAsyncIterator<T>(value: unknown): value is AsyncIterableIterator<T> {
  return (
    value != null &&
    typeof (value as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] === "function"
  );
}
```

### 5. Computed Signal Disposal (`computed.ts:66`)

**Current (problematic):**

```typescript
// @ts-ignore - TS6133: variable is declared but never used
const _unsubscribers = depsArray.map((dep) => dep.subscribe(recompute));
```

**Fixed (proper disposal):**

```typescript
const unsubscribers = depsArray.map((dep) => dep.subscribe(recompute));

// Add dispose method to returned signal
return {
  get value() {
    return value;
  },

  subscribe(listener: (value: any) => void) {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },

  dispose() {
    // Unsubscribe from all dependencies
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
    // Clear subscribers
    subscribers.clear();
  },
};
```

## Implementation Priority

1. **Immediate** (Day 1):
   - Fix event listener storage (WeakMap)
   - Fix context provider markers (Symbol)
   - Fix computed signal disposal

2. **Short-term** (Week 1):
   - Fix type guards
   - Fix config typing
   - Add error handling to signal listeners

3. **Medium-term** (Week 2):
   - Add validation for portals, refs, keys
   - Optimize performance issues
   - Add missing lifecycle hooks

## Testing Strategy

For each fix:

1. Write unit tests for the fixed behavior
2. Add type tests to ensure TypeScript catches errors
3. Test edge cases (null/undefined values, etc.)
4. Verify no runtime errors in existing tests

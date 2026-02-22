# Phase 4: Implementation Guide - Concrete Fixes

Based on my synthesis and code examination, here are the concrete fixes needed for SemaJSX:

## ✅ **Already Implemented (Good Work!)**

1. **WeakMap for event listeners** - `properties.ts:10`
2. **Computed signal disposal** - `computed.ts:67-76` (dispose function)
3. **Signal listener error handling** - `signal.ts:46-56` (try/catch)
4. **CONTEXT_PROVIDER_SYMBOL** - `context.ts:39` (Symbol-based marker)

## 🚨 **Critical Fixes Needed**

### **1. Type Safety Fixes**

#### **Issue 1: `render-core.ts:403` - `(props as any).provide`**

```typescript
// CURRENT (unsafe):
const provide = (props as any).provide;

// FIX (type-safe):
interface ContextProps {
  provide: ContextProvide | ContextProvide[];
  children?: JSXNode;
}

const provide = (props as ContextProps).provide;
```

#### **Issue 2: Context provider type assertion**

```typescript
// CURRENT (property pollution):
(Context as { [CONTEXT_PROVIDER_SYMBOL]?: boolean })[CONTEXT_PROVIDER_SYMBOL] = true;

// FIX (type-safe function):
function isContextProvider(component: Function): boolean {
  return (component as { [CONTEXT_PROVIDER_SYMBOL]?: boolean })[CONTEXT_PROVIDER_SYMBOL] === true;
}
```

### **2. Error Handling Improvements**

#### **Issue 1: Computed signal missing error handling**

```typescript
// In computed.ts notify() function:
const notify = () => {
  scheduleUpdate(() => {
    for (const listener of subscribers) {
      try {
        listener(value);
      } catch (error) {
        console.error("[Computed] Error in computed signal listener:", error);
      }
    }
  });
};
```

#### **Issue 2: Component error boundaries**

```typescript
// Add to render-core.ts renderComponent function:
function renderComponent(vnode: VNode, parentContext: ContextMap): RenderedNode<TNode> {
  try {
    // Existing component rendering logic...
  } catch (error) {
    // Create error boundary node
    return createErrorNode(error, vnode);
  }
}

function createErrorNode(error: Error, originalVNode: VNode): RenderedNode<TNode> {
  // Return a fallback UI or error message node
  return {
    vnode: { type: "div", props: { className: "error-boundary" }, children: [] },
    node: strategy.createElement("div"),
    subscriptions: [],
    children: [],
  };
}
```

### **3. Performance Optimizations**

#### **Issue 1: Attribute reconciliation (render.ts:215-227)**

```typescript
// CURRENT (two passes):
// Remove old attributes
for (let i = oldElement.attributes.length - 1; i >= 0; i--) { ... }
// Set new attributes
for (let i = 0; i < newElement.attributes.length; i++) { ... }

// FIX (single pass with Set):
function reconcileAttributes(oldElement: Element, newElement: Element) {
  const oldAttrs = new Set<string>();
  const newAttrs = new Set<string>();

  // Collect all attribute names
  for (let i = 0; i < oldElement.attributes.length; i++) {
    oldAttrs.add(oldElement.attributes[i].name);
  }

  for (let i = 0; i < newElement.attributes.length; i++) {
    const attr = newElement.attributes[i];
    newAttrs.add(attr.name);

    // Set or update attribute
    if (oldElement.getAttribute(attr.name) !== attr.value) {
      oldElement.setAttribute(attr.name, attr.value);
    }
  }

  // Remove attributes not in new set
  for (const attrName of oldAttrs) {
    if (!newAttrs.has(attrName)) {
      oldElement.removeAttribute(attrName);
    }
  }
}
```

#### **Issue 2: Style token caching**

```typescript
// Add to properties.ts:
const styleTokenCache = new WeakMap<StyleToken, string>();

function resolveClass(value: ClassValue): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (isStyleToken(value)) {
    // Check cache first
    if (styleTokenCache.has(value)) {
      return styleTokenCache.get(value)!;
    }

    // Inject CSS and cache result
    inject(value);
    const className = value._ ?? "";
    styleTokenCache.set(value, className);
    return className;
  }

  if (Array.isArray(value)) {
    return value.map(resolveClass).filter(Boolean).join(" ");
  }

  return "";
}
```

## 📋 **Implementation Priority**

### **Week 1 (Critical)**

1. Fix `(props as any).provide` type assertion
2. Add error handling to computed signals
3. Verify computed signal disposal is called on unmount

### **Week 2 (High Priority)**

1. Implement single-pass attribute reconciliation
2. Add style token caching
3. Create basic error boundary component

### **Week 3 (Medium Priority)**

1. Add portal container validation
2. Implement lifecycle hooks API
3. Add development-mode warnings

## 🔍 **Code Quality Checklist**

### **Type Safety**

- [ ] No `as any` in source files (only in tests if necessary)
- [ ] All internal markers use Symbols
- [ ] Proper type guards for runtime checks

### **Error Handling**

- [ ] All signal listeners have try/catch
- [ ] Component errors have boundaries
- [ ] Promise/AsyncIterator errors are caught

### **Memory Management**

- [ ] All subscriptions have cleanup
- [ ] WeakMap used for DOM element storage
- [ ] Computed signals dispose on unmount

### **Performance**

- [ ] O(n) algorithms for reconciliation
- [ ] Caching for expensive operations
- [ ] Efficient attribute diffing

## 🧪 **Testing Strategy**

### **New Tests Needed**

1. **Error scenario tests**
   - Component throwing errors
   - Signal listener errors
   - Memory leak detection

2. **Performance tests**
   - Large list rendering
   - Attribute reconciliation benchmarks
   - Memory usage over time

3. **Type safety tests**
   - TypeScript compilation tests
   - Runtime type validation

## 📊 **Progress Tracking**

| Fix                            | Status                  | File           | Priority |
| ------------------------------ | ----------------------- | -------------- | -------- |
| WeakMap event listeners        | ✅ Done                 | properties.ts  | High     |
| Computed signal disposal       | ✅ Done                 | computed.ts    | High     |
| Signal error handling          | ✅ Done                 | signal.ts      | High     |
| `(props as any).provide`       | ❌ Needs fix            | render-core.ts | Critical |
| Computed signal error handling | ❌ Needs fix            | computed.ts    | High     |
| Attribute reconciliation       | ❌ Needs optimization   | render.ts      | Medium   |
| Style token caching            | ❌ Needs implementation | properties.ts  | Medium   |
| Error boundaries               | ❌ Needs implementation | render-core.ts | Critical |

## 🎯 **Quick Wins (1-2 hours each)**

1. **Fix `(props as any).provide`** - Simple type assertion fix
2. **Add error handling to computed signals** - Copy pattern from signal.ts
3. **Add portal validation** - Simple runtime check in render-core.ts

## 📈 **Long-term Improvements**

1. **Devtools integration** - Signal debugging, performance profiling
2. **Bundle optimization** - Tree shaking, code splitting
3. **SSR improvements** - Streaming, hydration optimizations

---

**Summary**: The codebase is in good shape architecturally. Focus on the critical type safety and error handling fixes first, then move to performance optimizations. Most issues have clear, straightforward solutions.

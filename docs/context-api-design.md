# Context API Design

## Overview

This document describes the design of the Context mechanism for SemaJSX. Context provides a way to pass data through the component tree without having to pass props down manually at every level, avoiding "prop drilling".

## Core Principles

1. **Context is a pure value container** - It does not manage reactivity
2. **Users control reactivity** - Choose to pass static values or Signals
3. **Async-safe** - Context is naturally captured by function parameters
4. **No global pollution** - Context is passed through the render tree
5. **Backward compatible** - Existing components work unchanged

## Design: Component Second Parameter

### Key Innovation

Components can optionally receive a second parameter `ctx` for accessing runtime APIs:

```typescript
// No context needed - backward compatible
function Button(props) {
  return <button>{props.label}</button>;
}

// Need context - use second parameter
function ThemedButton(props, ctx) {
  const theme = ctx.inject(ThemeContext);
  return <button class={theme}>{props.label}</button>;
}
```

### API Design

#### 1. Creating Context

```typescript
import { createContext } from 'semajsx/runtime';

const ThemeContext = createContext<Theme>({ mode: 'light' });
```

A context is just an identifier with a default value.

#### 2. Providing Values

```typescript
<ThemeContext.Provider value={currentTheme}>
  <App />
</ThemeContext.Provider>
```

The Provider component creates a new context layer that overrides the value for its subtree.

#### 3. Injecting Context

```typescript
function ThemedComponent(props, ctx) {
  const theme = ctx.inject(ThemeContext);

  return <div class={theme.mode}>{props.children}</div>;
}
```

Use `ctx.inject()` to read the current context value.

### Naming: `inject` + `Provider`

The API uses **`inject`** for consuming and **`Provider`** component for providing:

- **`inject`** - Inspired by Vue 3's `provide/inject` API, concise and semantic
- **`Provider`** - React-style component approach, clear scope boundaries

This combines the best of both worlds:
- Vue's elegant naming (`inject` vs `getContext`)
- React's explicit scoping (JSX nesting shows context boundary)

**Why Provider component instead of `ctx.provide()`?**

1. **Clear scope** - JSX nesting visually shows where context applies
2. **Async-safe** - Provider is a component, follows consistent render flow
3. **No timing issues** - Component lifecycle is well-defined
4. **Pattern consistency** - Components are components, not magic functions

```typescript
// ✅ Clear scope with Provider component
<ThemeContext.Provider value={theme}>
  <Content />  {/* Theme applies to this subtree */}
</ThemeContext.Provider>

// ❌ Unclear scope with ctx.provide()
function App(props, ctx) {
  ctx.provide(ThemeContext, theme);  // Where does this apply?
  return <Content />;
}
```

### ComponentAPI - Not Just Context

The second parameter provides a `ComponentAPI` interface that can be extended beyond just context:

```typescript
interface ComponentAPI {
  // Inject context value
  inject<T>(context: Context<T>): T;

  // Future extensions:
  // onCleanup(fn: () => void): void;
  // emit(event: string, data: any): void;
  // ref<T>(value: T): Ref<T>;
}
```

This provides a clean, extensible API surface for component runtime capabilities.

## Why Second Parameter?

### Comparison with Other Approaches

#### ❌ Global Stack (React-like)

```typescript
let currentContext = null;

function useContext(context) {
  return currentContext.get(context.id);
}
```

**Problems:**
- Not async-safe
- Relies on global state
- Doesn't work with concurrent rendering

#### ❌ Global Hook Function

```typescript
// React Hooks approach
function useContext(context) {
  // Magic: reads from implicit global state
}

function MyComponent(props) {
  const theme = useContext(ThemeContext);  // Must follow Hook rules
}
```

**Problems:**
- Requires "rules of hooks" (must call at top level)
- Can't be used after `await` in async components
- Relies on closure magic and global state

#### ✅ Second Parameter with `inject`

```typescript
function MyComponent(props, ctx) {
  const theme = ctx.inject(ThemeContext);  // Simple and explicit
}
```

**Advantages:**
- Async-safe: parameters are naturally captured
- No global state
- No "rules" - call anytime in the function
- Explicit over implicit
- Future-proof: can extend `ComponentAPI`
- Clean naming: inspired by Vue 3's `inject`

### Other Frameworks

This pattern is proven in other frameworks:

- **Vue 3**: `setup(props, { emit, slots, attrs })` for second parameter, and `provide()/inject()` for context
- **Svelte**: Module imports for context (different approach)
- **Solid.js**: Similar parameter-based APIs in some cases

SemaJSX combines Vue 3's `inject` naming with React's `Provider` component pattern for the best of both approaches.

## Implementation Details

### Type Definitions

```typescript
// src/runtime/types.ts

export interface Context<T> {
  id: symbol;
  defaultValue: T;
  Provider: Component<ProviderProps<T>>;
}

export interface ProviderProps<T> {
  value: T;
  children?: JSXChildren;
}

export interface ComponentAPI {
  inject<T>(context: Context<T>): T;
}

// Component type supports both single and dual parameter forms
export type Component<P = any> =
  | ((props: P) => VNode)
  | ((props: P, ctx: ComponentAPI) => VNode)
  | ((props: P) => Promise<VNode>)
  | ((props: P, ctx: ComponentAPI) => Promise<VNode>)
  | ((props: P) => AsyncIterableIterator<VNode>)
  | ((props: P, ctx: ComponentAPI) => AsyncIterableIterator<VNode>)
  | ((props: P) => Signal<VNode>)
  | ((props: P, ctx: ComponentAPI) => Signal<VNode>);

// Context map - stores context values for current render environment
type ContextMap = Map<symbol, any>;
```

### Context Implementation

```typescript
// src/runtime/context.ts

let contextCounter = 0;

export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol(`context-${contextCounter++}`);

  // Provider is a regular component
  const Provider: Component<ProviderProps<T>> = (props) => {
    return h(Fragment, null, ...props.children);
  };

  // Mark as Provider for renderer
  (Provider as any).__isContextProvider = true;
  (Provider as any).__contextId = id;

  return {
    id,
    defaultValue,
    Provider,
  };
}

// Create ComponentAPI instance
export function createComponentAPI(contextMap: ContextMap): ComponentAPI {
  return {
    inject<T>(context: Context<T>): T {
      return contextMap.has(context.id)
        ? contextMap.get(context.id)
        : context.defaultValue;
    },
  };
}
```

### Rendering Implementation

```typescript
// src/dom/render.ts

function renderComponent(
  vnode: VNode,
  parentContext: ContextMap
): RenderedNode {
  const Component = vnode.type as Function;
  const props = { ...vnode.props, children: vnode.children };

  // Prepare current component's context
  let currentContext = parentContext;

  // Check if this is a Provider
  const isProvider = (Component as any).__isContextProvider;
  const contextId = (Component as any).__contextId;

  if (isProvider && contextId) {
    // Provider: create new context map with overridden value
    currentContext = new Map(parentContext);
    currentContext.set(contextId, props.value);
  }

  // Create ComponentAPI
  const ctx = createComponentAPI(currentContext);

  // Call component with both props and ctx
  const result = Component(props, ctx);

  // Handle different return types (VNode, Signal, Promise, AsyncIterator)
  // ... (existing logic, passing currentContext to child renders)
}
```

All other render functions (`renderElement`, `renderFragment`, etc.) receive and pass along the `ContextMap` parameter.

### Async Safety

For async components, the context is naturally captured:

```typescript
async function AsyncComponent(props, ctx) {
  // ctx is captured in function parameters
  const theme = ctx.inject(ThemeContext);

  await fetchData(); // Safe to await

  // theme is still the value from when component was called
  return <div class={theme.mode}>Content</div>;
}
```

When rendering the Promise result, we use the captured context:

```typescript
if (isPromise(result)) {
  const pending: VNode = { type: "#text", props: { nodeValue: "" }, children: [] };
  const resultSignal = resource(result, pending);

  const signalVNode: VNode = {
    type: "#signal",
    props: { signal: resultSignal, context: currentContext },
    children: [],
  };

  // Render with captured context
  const rendered = renderNode(signalVNode, currentContext);
  // ...
}
```

## TypeScript Compatibility

### No Changes Required to JSX

The second parameter approach is fully compatible with TypeScript's JSX system:

```typescript
// JSX source
<MyComponent foo="bar" />

// Compiles to
jsx(MyComponent, { foo: "bar" })

// Renderer calls
MyComponent({ foo: "bar" }, ctx)
```

The second parameter is a **runtime concern**, not a compile-time concern.

### What TypeScript Checks

TypeScript's JSX type checking only validates:

1. ✅ Component is valid (function or class)
2. ✅ Props match expected type
3. ✅ Return type is correct

TypeScript **does not care** about the number of parameters!

### Function Parameter Contravariance

TypeScript's function types are contravariant in parameters:

```typescript
// Expected: 1 parameter
type Expected = (props: Props) => VNode;

// Actual: 2 parameters (second optional)
type Actual = (props: Props, ctx?: ComponentAPI) => VNode;

// ✅ Compatible!
const fn: Expected = (props: Props, ctx?: ComponentAPI) => { ... };
```

### Full Type Inference

```typescript
const ThemeContext = createContext<Theme>({ mode: 'light' });

function MyComponent(props: Props, ctx: ComponentAPI) {
  const theme = ctx.inject(ThemeContext);
  // ^? const theme: Theme (fully inferred ✅)

  return <div class={theme.mode}>{props.children}</div>;
}
```

### No Modifications Needed

- ❌ JSX namespace - no changes
- ❌ `jsx()` helper function - no changes
- ❌ Existing component code - works unchanged

## Usage Examples

### Example 1: Basic Usage

```typescript
import { createContext } from 'semajsx/runtime';

const ThemeContext = createContext({ mode: 'light', color: 'blue' });

function App() {
  const theme = { mode: 'dark', color: 'purple' };

  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Button />
    </ThemeContext.Provider>
  );
}

// No context - backward compatible
function Button(props) {
  return <button>{props.children}</button>;
}

// Uses context - second parameter
function Header(props, ctx) {
  const theme = ctx.inject(ThemeContext);

  return (
    <header style={{ background: theme.color }}>
      Mode: {theme.mode}
    </header>
  );
}
```

### Example 2: Reactive Theme with Signals

```typescript
import { signal } from 'semajsx/signal';

const ThemeContext = createContext(signal({ mode: 'light' }));

function App() {
  const themeSignal = signal({ mode: 'light', color: 'blue' });

  const toggleTheme = () => {
    themeSignal.value = {
      ...themeSignal.value,
      mode: themeSignal.value.mode === 'light' ? 'dark' : 'light'
    };
  };

  return (
    <ThemeContext.Provider value={themeSignal}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <ThemedDiv />
    </ThemeContext.Provider>
  );
}

function ThemedDiv(props, ctx) {
  const themeSignal = ctx.inject(ThemeContext);

  // Signal automatically subscribes in JSX
  return (
    <div style={{
      background: themeSignal.value.mode === 'dark' ? '#333' : '#fff',
      color: themeSignal.value.mode === 'dark' ? '#fff' : '#333'
    }}>
      Current theme: {themeSignal.value.mode}
    </div>
  );
}
```

### Example 3: Async Component (Context Captured)

```typescript
const UserContext = createContext(null);

async function UserProfile(props, ctx) {
  // Context captured immediately when function is called
  const user = ctx.inject(UserContext);

  // Safe to await
  await new Promise(resolve => setTimeout(resolve, 1000));
  const data = await fetchUserData(user.id);

  // Uses captured user (unaffected by later Provider changes)
  return (
    <div>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
    </div>
  );
}

function App() {
  const currentUser = { id: 123, name: 'Alice' };

  return (
    <UserContext.Provider value={currentUser}>
      <UserProfile />
    </UserContext.Provider>
  );
}
```

### Example 4: Nested Context

```typescript
const ThemeContext = createContext('light');
const SizeContext = createContext('medium');
const UserContext = createContext(null);

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <SizeContext.Provider value="large">
        <UserContext.Provider value={{ name: 'Alice' }}>
          <ComplexComponent />
        </UserContext.Provider>
      </SizeContext.Provider>
    </ThemeContext.Provider>
  );
}

function ComplexComponent(props, ctx) {
  const theme = ctx.inject(ThemeContext);
  const size = ctx.inject(SizeContext);
  const user = ctx.inject(UserContext);

  return (
    <div class={`${theme}-${size}`}>
      Welcome, {user.name}!
    </div>
  );
}
```

### Example 5: Nested Providers (Override)

```typescript
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="light">
      <Section title="Light Section" />

      <ThemeContext.Provider value="dark">
        <Section title="Dark Section" />
      </ThemeContext.Provider>

      <Section title="Back to Light" />
    </ThemeContext.Provider>
  );
}

function Section(props, ctx) {
  const theme = ctx.inject(ThemeContext);

  return (
    <div class={`theme-${theme}`}>
      <h2>{props.title}</h2>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

## Advantages

### 1. ✅ Backward Compatible

Components not using context are unaffected:

```typescript
// Existing code works unchanged
function Button(props) {
  return <button>{props.label}</button>;
}
```

### 2. ✅ Async-Safe

Function parameters are naturally captured:

```typescript
async function AsyncComp(props, ctx) {
  const theme = ctx.inject(ThemeContext); // Captured
  await fetchData();
  return <div>{theme}</div>; // Safe
}
```

### 3. ✅ No Global State

Context is passed through the render tree, not stored globally.

### 4. ✅ Type-Safe

Full TypeScript inference:

```typescript
interface ComponentAPI {
  inject<T>(context: Context<T>): T; // Complete type inference
}
```

### 5. ✅ Extensible

Easy to add more APIs in the future:

```typescript
interface ComponentAPI {
  inject<T>(context: Context<T>): T;

  // Future additions:
  onCleanup(fn: () => void): void;
  emit(event: string, data: any): void;
  ref<T>(initialValue: T): Ref<T>;
}
```

### 6. ✅ Context Doesn't Manage Reactivity

Users choose whether to pass Signal or static value:

```typescript
// Static
<ThemeContext.Provider value={staticTheme}>

// Reactive
<ThemeContext.Provider value={signal(theme)}>
```

### 7. ✅ Explicit Over Implicit

Clear function signature shows what's available:

```typescript
function MyComponent(props, ctx) {
  // ctx is explicit, not magic
}
```

## Implementation Checklist

### New Files

- [ ] `src/runtime/context.ts`
  - `createContext()`
  - `createComponentAPI()`
  - `Context<T>` type
  - `ComponentAPI` interface

### Modified Files

- [ ] `src/runtime/types.ts`
  - Update `Component` type to include optional second parameter
  - Add `Context<T>` interface
  - Add `ProviderProps<T>` interface
  - Add `ComponentAPI` interface

- [ ] `src/dom/render.ts`
  - Add `context: ContextMap` parameter to all `renderXxx` functions
  - `renderComponent` creates `ComponentAPI` and passes to component
  - `renderComponent` handles Provider detection
  - `renderSignalNode` supports captured context
  - `render()` entry point initializes empty context map

- [ ] `src/terminal/render.ts`
  - Same modifications as DOM renderer

### Test Files

- [ ] `tests/runtime/context.test.ts`
  - Basic context creation and usage
  - Nested Providers
  - Default values
  - Signal as context value
  - Async components
  - Components not using context (backward compatibility)

### Examples

- [ ] `examples/context-basic.tsx`
- [ ] `examples/context-theme.tsx`
- [ ] `examples/context-async.tsx`

## Performance Considerations

### Context Lookup: O(1)

Using `Map` for context storage provides constant-time lookup:

```typescript
ctx.inject(ThemeContext) // O(1) via Map.get()
```

### No Unnecessary Re-renders

Context changes don't trigger re-renders. If the context value is a Signal, users can choose to subscribe:

```typescript
function ThemedComponent(props, ctx) {
  const themeSignal = ctx.inject(ThemeContext);

  // Automatic subscription via JSX
  return <div>{themeSignal.value.mode}</div>;
}
```

### Memory Efficiency

Each component render creates a new `ComponentAPI` instance, but this is lightweight (just an object with methods). Context maps are shared when possible (only cloned when Provider overrides a value).

## Comparison with Alternative Designs

| Feature | Global Stack | Render Tree + useContext | Second Parameter |
|---------|--------------|---------------------------|------------------|
| Async-safe | ❌ | ⚠️ Hook rules | ✅ |
| Backward compatible | ✅ | ✅ | ✅ |
| Global state | ❌ Depends on it | ⚠️ Temporary | ✅ None |
| API complexity | Low | Medium | Low |
| Type-safe | ✅ | ✅ | ✅ |
| Extensible | Low | Low | ✅ High |
| Concurrent-safe | ❌ | ✅ | ✅ |

## Migration Guide

### Existing Code

No changes required - fully compatible:

```typescript
function MyComponent(props) {
  return <div>{props.children}</div>;
}
```

### Using Context

Add the second parameter:

```typescript
function MyComponent(props, ctx) {
  const theme = ctx.inject(ThemeContext);
  return <div class={theme}>{props.children}</div>;
}
```

## Future Extensions

The `ComponentAPI` can be extended with additional runtime capabilities:

```typescript
interface ComponentAPI {
  // Current
  inject<T>(context: Context<T>): T;

  // Potential future additions
  onCleanup(fn: () => void): void;           // Cleanup on unmount
  emit(event: string, data: any): void;      // Component events
  ref<T>(value: T): Ref<T>;                  // Local refs
  onError(handler: ErrorHandler): void;      // Error boundaries
  getSlot(name: string): VNode[];            // Named slots
}
```

## Summary

The **second parameter approach** provides the best solution for Context in SemaJSX:

1. ✅ **Async-safe** - Parameters are naturally captured
2. ✅ **Backward compatible** - Second parameter is optional
3. ✅ **No global state** - Context passed through render tree
4. ✅ **Extensible** - `ComponentAPI` can grow over time
5. ✅ **Simple and explicit** - Clear from function signature
6. ✅ **Type-safe** - Full TypeScript inference
7. ✅ **Aligns with SemaJSX philosophy** - Functional, explicit, user-controlled

This design is simpler, safer, and more flexible than React's Hooks-based approach, while maintaining full backward compatibility with existing SemaJSX code.

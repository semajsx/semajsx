# RFC: Style System (@semajsx/style)

**Date**: 2026-01-10
**Author**: SemaJSX Team
**Status**: Draft

---

## 1. Summary

A modular styling system that treats CSS as JavaScript modules, enabling tree-shaking at the import level while maintaining native CSS syntax for developer ergonomics.

---

## 2. Motivation

### 2.1 Problem Statement

Current CSS solutions have fundamental trade-offs:

1. **CSS-in-JS** (Styled Components, Emotion): Good tree-shaking, but awkward syntax - writing CSS as JS objects or template literals loses native CSS tooling support.

2. **Traditional CSS/Sass**: Great developer experience, but build systems bundle all CSS into one file - no tree-shaking based on component usage.

3. **CSS Modules**: Scoped styles, but still bundled together - unused component styles remain in the bundle.

4. **Tailwind CSS**: Utility-first is powerful, but class strings lack type safety and IDE intelligence.

5. **Component Libraries**: Styles are tightly coupled to components (e.g., Material UI, Chakra). Even Radix UI + shadcn requires significant styling ceremony.

6. **Shadow DOM**: Most styling solutions don't handle Shadow DOM well - styles need to be injected into the shadow root, not document.head.

### 2.2 User Scenarios

- **As a component author**, I want to write styles in native CSS syntax, so that I get full IDE support (autocomplete, linting, formatting).

- **As an application developer**, I want unused component styles to be tree-shaken, so that my bundle only includes styles for components I actually use.

- **As a web component developer**, I want to control where styles are injected (Shadow DOM), so that my components are properly encapsulated.

- **As a design system maintainer**, I want to separate component logic from styling, so that consumers can easily customize or replace styles.

### 2.3 Success Metrics

- Styles tree-shake at the JS module level
- CSS syntax remains native (works with existing CSS tooling)
- Type-safe class name references
- Zero runtime CSS parsing
- Works with Shadow DOM out of the box

---

## 3. Background

### 3.1 Current State

SemaJSX currently has basic style support:

```tsx
// Inline styles
<div style={{ color: 'red' }}>

// Class strings
<div class="btn btn-primary">

// Signal-based reactive styles
const color = signal('red');
<div style={{ color }}>
```

No built-in solution for:

- Scoped styles
- Tree-shakeable CSS
- Shadow DOM style injection
- Type-safe class names

### 3.2 Why Now?

- Component library development is a common use case
- Shadow DOM adoption is increasing (Web Components)
- Bundle size optimization is critical for performance
- The signal-based architecture provides natural integration points for style injection lifecycle

---

## 4. Goals

- **Native CSS syntax**: Write real CSS, not JS objects
- **Tree-shakeable**: Unused styles are eliminated at build time
- **Type-safe**: Class names are typed, with IDE autocomplete
- **Framework-agnostic core**: `@semajsx/style` works standalone
- **SemaJSX integration**: Seamless integration with render lifecycle
- **Shadow DOM support**: Control style injection targets
- **Zero runtime parsing**: All CSS processing happens at definition time

---

## 5. Non-Goals

- **CSS preprocessor features**: No built-in Sass/Less compilation (use external tools)
- **Atomic CSS generation**: Not auto-generating utility classes like Tailwind
- **CSS-in-JS object syntax**: We explicitly prefer native CSS strings
- **Runtime HMR**: HMR is handled by build tools (Vite plugin), not the runtime

---

## 6. Research

### 6.1 Existing Solutions Comparison

| Solution        | Pros                                | Cons                                        | Applicability |
| --------------- | ----------------------------------- | ------------------------------------------- | ------------- |
| CSS Modules     | - Native CSS<br>- Scoped            | - No tree-shaking<br>- Build tool dependent | Medium        |
| Vanilla Extract | - Type-safe<br>- Zero runtime       | - CSS-in-JS syntax<br>- Complex setup       | Medium        |
| Linaria         | - Native CSS feel<br>- Zero runtime | - Build complexity<br>- Limited dynamic     | Medium        |
| StyleX (Meta)   | - Atomic<br>- Tree-shakeable        | - CSS-in-JS objects<br>- Meta-specific      | Low           |
| Panda CSS       | - Type-safe<br>- Flexible           | - Learning curve<br>- Build complexity      | Medium        |

### 6.2 Technical Feasibility

- **Dependencies**: None for core runtime
- **Build tools**: Optional Vite/esbuild plugin for .css → .css.ts transformation
- **Compatibility**: Works with any JS framework

### 6.3 Key Insight

The key insight is treating styles as **JavaScript modules** that bundlers can analyze and eliminate.

### 6.4 Tree-Shaking: How It Works

**Recommended Pattern: Named Exports**

```ts
// button.style.ts
import { classes, rule } from "@semajsx/style";

const c = classes(["root", "icon", "primary", "secondary", "large"]);

export const root = rule`${c.root} { display: inline-flex; padding: 8px 16px; }`;
export const icon = rule`${c.icon} { width: 18px; height: 18px; }`;
export const primary = rule`${c.primary} { background: var(--primary); color: white; }`;
export const secondary = rule`${c.secondary} { background: var(--secondary); }`;
export const large = rule`${c.large} { padding: 12px 24px; font-size: 18px; }`;
```

**Usage options:**

```ts
// Option 1: Namespace import (recommended - feels like object access)
import * as button from "./button.style";
<div class={[button.root, button.primary]}>

// Option 2: Named imports (explicit, best tree-shaking)
import { root, primary } from "./button.style";
<div class={[root, primary]}>
```

**Tree-shaking behavior:**

```
// If component only uses: import { root, primary } from "./button.style"
// Bundler eliminates: icon, secondary, large ✅

// If component uses: import * as button from "./button.style"
// And only accesses button.root and button.primary
// Modern bundlers (Rollup, esbuild) can still eliminate unused exports ✅
```

**Module-level elimination also works:**

```
components/
├── Button/
│   └── button.style.ts   → imported by Button.tsx → included
├── Card/
│   └── card.style.ts     → imported by Card.tsx → included
└── Tooltip/
    └── tooltip.style.ts  → NOT imported anywhere → ELIMINATED
```

**Why NOT object exports:**

```ts
// ❌ Avoid this pattern - no tree-shaking
export const button = {
  root: rule`...`,
  icon: rule`...`, // Included even if unused
  large: rule`...`, // Included even if unused
};
```

Object properties cannot be tree-shaken. If you import `button`, you get everything.

**Practical impact:**

| Pattern                         | Bundle Size        | DOM Size              |
| ------------------------------- | ------------------ | --------------------- |
| Named exports, selective import | ✅ Only imported   | ✅ Only used injected |
| `import * as styles`, some used | ✅ Only accessed\* | ✅ Only used injected |
| Object export, some used        | ❌ All properties  | ✅ Only used injected |
| Module not imported             | ✅ Eliminated      | ✅ No styles          |

\*Modern bundlers with good static analysis

**Summary:**

- **Default to named exports** (`export const primary = ...`)
- **Use `import * as styles`** for namespace-style access
- **Use `import { primary }`** for explicit imports
- **Avoid object exports** (`export const button = { ... }`)

---

## 7. High-Level Proposal

### 7.1 Core Concept: Style as Module

```ts
// button.style.ts
import { classes, rule, rules } from "@semajsx/style";

const c = classes(["root", "icon", "label"]);

/** display: inline-flex; padding: 8px 16px */
export const root = rule`${c.root} {
  display: inline-flex;
  padding: 8px 16px;
}`;

/** width: 18px; height: 18px */
export const icon = rule`${c.icon} {
  width: 18px;
  height: 18px;
}`;

/** font-weight: 500 */
export const label = rule`${c.label} {
  font-weight: 500;
}`;

/** margin-right: 8px (icon inside root) */
export const rootIcon = rule`${c.root} > ${c.icon} {
  margin-right: 8px;
}`;

/** hover state */
export const rootHover = rule`${c.root}:hover {
  background: var(--hover);
}`;

/** multiple rules for states */
export const states = rules(
  rule`${c.root}:active { transform: scale(0.98); }`,
  rule`${c.root}:disabled { opacity: 0.5; cursor: not-allowed; }`,
);
```

**Usage:**

```tsx
// Namespace import (recommended)
import * as button from "./button.style";

<button class={[button.root, button.states]}>
  <span class={button.icon}>{icon}</span>
  <span class={button.label}>{children}</span>
</button>;
```

### 7.2 Key Components

1. **ClassRef**: A reference to a class name that stringifies to a hashed value
2. **StyleToken**: Contains className (if applicable) + CSS rule, can be used in class prop or injected
3. **StyleAnchor**: Controls where styles are injected in the DOM

### 7.3 Two-Level Anchor System

**App Anchor**: Global style injection target

```tsx
// Default: document.head
// Can be set for Shadow DOM:
<AppStyleAnchor target={shadowRoot} />
```

**Component Anchor**: Per-component injection (does NOT affect children)

```tsx
function MyComponent() {
  return (
    <ComponentStyleAnchor target={localStyleContainer}>
      <div class={button.root}>...</div>
    </ComponentStyleAnchor>
  );
}
```

Rules:

- Component Anchor only affects the component where it's declared
- Child components use their own anchor or fall back to App Anchor
- If no anchor exists, defaults to `document.head`

---

## 8. Detailed API Design

### 8.1 `@semajsx/style` (Standalone Package)

#### `classes(names: string[]): ClassRefs`

Creates class name references with hashed values.

```ts
const c = classes(["root", "icon", "label"]);

c.root.toString(); // "root-x7f3a"
`${c.root}`; // "root-x7f3a"
```

#### `` rule`selector { css }` `` - Tagged Template Syntax

Creates a StyleToken from a tagged template containing selector and CSS block.

```ts
// Simple class selector
const root = rule`${c.root} {
  padding: 8px 16px;
  display: flex;
}`;
// root._ = "root-x7f3a"
// root.__css = ".root-x7f3a { padding: 8px 16px; display: flex; }"

// Pseudo-class selector
const rootHover = rule`${c.root}:hover {
  background: blue;
}`;
// rootHover._ = undefined (no direct className, injection only)
// rootHover.__css = ".root-x7f3a:hover { background: blue; }"

// Descendant combinator
const rootIcon = rule`${c.root} > ${c.icon} {
  margin-right: 8px;
}`;
// rootIcon.__css = ".root-x7f3a > .icon-b2c4d { margin-right: 8px; }"

// Attribute selector
const rootDisabled = rule`${c.root}[disabled] { opacity: 0.5; }`;

// Global selector (no ClassRef)
const bodyReset = rule`body { margin: 0; }`;
```

**Why tagged template?**

- Single unified syntax for all selectors (simple, complex, global)
- ClassRef interpolation preserves type information and generates correct hashes
- Native CSS syntax - selector and block together, just like real CSS
- No confusion between function call vs tagged template

#### `rules(...tokens): StyleToken` - Combine Multiple Rules

Combines multiple StyleTokens into a single token for grouped injection.

```ts
const buttonStates = rules(
  rule`${c.root}:hover { background: blue; }`,
  rule`${c.root}:active { transform: scale(0.98); }`,
  rule`${c.root}:disabled { opacity: 0.5; }`,
);
// buttonStates.__css contains all three rules concatenated

// Combine base styles with states
const allStyles = rules(
  rule`${c.root} { padding: 8px; }`,
  rule`${c.icon} { width: 18px; }`,
  rule`${c.root} > ${c.icon} { margin-right: 8px; }`,
);
```

#### Reactive Values with Signals

When a signal is interpolated in `rule`, the system automatically:

1. Generates CSS with `var()` placeholders
2. Binds signals to CSS variables when the token is used in `class`
3. Updates element styles when signals change

**Design Principle:**

```
┌─────────────────────────────────────────────────────────────┐
│  rule`${c.box} { height: ${signal}px; }`                    │
│                 ↓                                           │
│  CSS generated: .box-xxx { height: var(--_v0); }            │
│  Token stores:  __bindings: [[signal, '--_v0', 'px']]       │
│                 ↓                                           │
│  class={token}  →  Inject CSS + subscribe signals           │
│                 ↓                                           │
│  Signal update  →  element.style.setProperty('--_v0', ...)  │
└─────────────────────────────────────────────────────────────┘
```

**Dynamic Rule with Signal Interpolation:**

```ts
// box.style.ts
import { classes, rule } from "@semajsx/style";
import type { Signal } from "@semajsx/signal";

const c = classes(["box"]);

// Signals are interpolated directly in the template
export const box = (height: Signal<number>, bg: Signal<string>) =>
  rule`${c.box} {
    height: ${height}px;
    background: ${bg};
    transition: all 0.3s;
  }`;
```

**Usage in SemaJSX - signal binding is automatic:**

```tsx
import { signal } from "@semajsx/signal";
import * as styles from "./box.style";

function Box() {
  const height = signal(100);
  const color = signal("#3b82f6");

  // Just use the token - signal binding is automatic
  return (
    <div class={styles.box(height, color)} onClick={() => (height.value += 10)}>
      Click to grow
    </div>
  );
}

// Rendered:
// <div class="box-x7f3a" style="--_v0: 100px; --_v1: #3b82f6">
//
// After click (signal update, no re-render):
// <div class="box-x7f3a" style="--_v0: 110px; --_v1: #3b82f6">
```

**How it works internally:**

```ts
function rule(strings: TemplateStringsArray, ...values: unknown[]): StyleToken {
  const bindings: SignalBinding[] = [];
  let varIndex = 0;

  // Build CSS, replacing signals with var() references
  const css = strings.reduce((acc, str, i) => {
    if (i === 0) return str;

    const value = values[i - 1];

    if (isClassRef(value)) {
      return acc + value.toString() + str;
    }

    if (isSignal(value)) {
      const varName = `--_v${varIndex++}`;
      // Check if next char is a unit (px, em, %, etc.)
      const unit = extractUnit(str);
      bindings.push([value, varName, unit]);
      return acc + `var(${varName})` + str;
    }

    return acc + String(value) + str;
  }, "");

  return {
    __kind: "style",
    _: extractClassName(css),
    __css: css,
    __bindings: bindings.length > 0 ? bindings : undefined,
    __injected: new WeakSet(),
  };
}
```

**Static Rules (no signals):**

For static styles, just use regular values:

```ts
export const root = rule`${c.root} {
  display: flex;
  padding: 8px 16px;
}`;
// No __bindings, purely static CSS
```

**Token Caching:**

Same signal instances produce the same token:

```ts
const h = signal(100);
const c = signal("red");

const token1 = box(h, c);
const token2 = box(h, c);
token1 === token2; // true - same signals, cached token

const h2 = signal(100);
const token3 = box(h2, c);
token1 === token3; // false - different signal instance
```

**Usage in React:**

```tsx
import { useStyle, useSignal, StyleAnchor } from "@semajsx/style/react";
import * as styles from "./box.style";

function Box() {
  const cx = useStyle();
  const height = useSignal(100);
  const color = useSignal("#3b82f6");

  // cx() always returns string
  // StyleAnchor handles both CSS injection and signal bindings
  return (
    <StyleAnchor>
      <div className={cx(styles.box(height, color))} onClick={() => (height.value += 10)}>
        Click to grow
      </div>
    </StyleAnchor>
  );
}

// DOM structure:
// <div style="--_v0: 100px; --_v1: #3b82f6">  <!-- StyleAnchor -->
//   <div class="box-x7f3a">Click to grow</div>
// </div>
//
// After click (signal update directly to anchor, no React re-render!):
// <div style="--_v0: 110px; --_v1: #3b82f6">
//   <div class="box-x7f3a">Click to grow</div>
// </div>
```

**How it works:**

The `<StyleAnchor>` component handles both CSS injection and signal bindings. CSS variables are set on the anchor element and cascade to descendants via CSS inheritance. The anchor uses `display: contents` to avoid affecting layout.

**Benefits:**

- **Ergonomic**: Signal interpolation looks natural in CSS
- **Automatic binding**: No manual CSS variable mapping
- **Efficient updates**: Only CSS variable values change, no CSS re-injection
- **CSS transitions work**: `transition: all 0.3s` applies to variable changes
- **Memoized tokens**: Same signals = same cached token

#### `inject(tokens, options?): () => void`

Manually injects CSS into DOM. Supports single token, array, or object. Returns cleanup function.

**Important**: `inject()` only handles CSS stylesheet injection. It does NOT set up signal bindings for reactive tokens. Signal binding is handled separately:

- **SemaJSX**: The render system (`resolveClass()`) handles signal binding when processing `class` props (see Section 8.3)
- **React/Vue**: The `<StyleAnchor>` component captures signal bindings and sets up subscriptions (see Section 9.3)

```ts
// Single token
inject(button.root);

// Array of tokens
inject([button.root, button.icon, button.rootIcon]);

// Object - extracts all StyleTokens
inject(button);

// With target
inject(button, { target: shadowRoot });

// Cleanup removes the <style> element
const cleanup = inject(button);
cleanup();

// For reactive tokens, inject() only adds the CSS:
// .box-xxx { height: var(--_v0); }
// The signal → CSS variable binding must be set up separately
const boxToken = boxStyle(heightSignal, bgSignal);
inject(boxToken); // Injects CSS with var() placeholders
// Signal binding is set up by StyleAnchor in React/Vue
```

#### `createRegistry(options?): StyleRegistry`

Creates a style injection manager.

```ts
const registry = createRegistry({
  target: document.head, // default target
  dedupe: true, // prevent duplicate injection
});

registry.inject(button);
registry.inject(card);
registry.clear(); // remove all injected styles
```

#### `isStyleToken(value): boolean`

Type guard for StyleToken.

```ts
if (isStyleToken(value)) {
  // value is StyleToken
}
```

### 8.2 Type Definitions

```ts
// Class name reference
interface ClassRef {
  readonly id: symbol;
  toString(): string; // returns hashed class name
}

// Collection of class refs
type ClassRefs<T extends readonly string[]> = {
  readonly [K in T[number]]: ClassRef;
};

// Discriminated union for token types
// Use __kind for type narrowing in TypeScript

/** Signal binding: [signal, varName, unit] */
type SignalBinding = [Signal<unknown>, string, string];

/** Style token - CSS with optional signal bindings */
interface StyleToken {
  readonly __kind: "style";
  readonly _?: string; // className (only for class selectors)
  readonly __css: string; // CSS with var() for signals
  readonly __bindings?: SignalBinding[]; // signal → CSS variable bindings
  readonly __injected: WeakSet<Element | ShadowRoot>;
  toString(): string; // returns _ or empty string
}

/** Arbitrary value token (for Tailwind integration) */
interface ArbitraryStyleToken {
  readonly __kind: "arbitrary";
  readonly _: string; // e.g., "p-v"
  readonly __var: string; // e.g., "--p"
  readonly __value: string; // e.g., "4px"
  toString(): string;
}

/** All token types */
type AnyStyleToken = StyleToken | ArbitraryStyleToken;

// Type guards
function isStyleToken(value: unknown): value is StyleToken {
  return (
    typeof value === "object" && value !== null && "__kind" in value && value.__kind === "style"
  );
}

function isArbitraryToken(value: unknown): value is ArbitraryStyleToken {
  return (
    typeof value === "object" && value !== null && "__kind" in value && value.__kind === "arbitrary"
  );
}

// Registry options
interface RegistryOptions {
  target?: Element | ShadowRoot;
  dedupe?: boolean;
}

// rule`` tagged template - creates StyleToken from selector + CSS block
// Accepts ClassRef, Signal, string, or number as interpolated values
function rule(
  strings: TemplateStringsArray,
  ...values: (ClassRef | Signal<unknown> | string | number)[]
): StyleToken;

// rules() - combines multiple StyleTokens
function rules(...tokens: StyleToken[]): StyleToken;
```

### 8.3 Type Narrowing Examples

```ts
// Using discriminated union for type-safe handling
function processToken(token: AnyStyleToken) {
  switch (token.__kind) {
    case "style":
      // TypeScript knows: token is StyleToken
      inject(token);
      break;

    case "arbitrary":
      // TypeScript knows: token is ArbitraryStyleToken
      applyVariable(token.__var, token.__value);
      break;
  }
}

// In render system
function resolveClass(value: AnyStyleToken, element: HTMLElement) {
  if (value.__kind === "arbitrary") {
    element.style.setProperty(value.__var, value.__value);
    return value._;
  }

  // StyleToken - set up signal bindings if present
  if (value.__bindings) {
    for (const [signal, varName, unit] of value.__bindings) {
      const update = () => {
        const v = unit ? `${signal.value}${unit}` : String(signal.value);
        element.style.setProperty(varName, v);
      };
      update(); // Initial value
      signal.subscribe(update);
    }
  }

  return value._ ?? "";
}
```

### 8.4 Global Token Registry

The runtime maintains a global registry that maps token hashes to their definitions. This is essential for SSR hydration, deduplication, and signal-based token caching.

```ts
// Internal global registry
const globalTokenRegistry = new Map<string, StyleToken>();

// WeakMap to assign unique IDs to signal instances
// Since Signal objects don't have an inherent `id` property, we generate one
let signalIdCounter = 0;
const signalIdMap = new WeakMap<object, number>();

function getSignalId(signal: Signal<unknown>): number {
  let id = signalIdMap.get(signal);
  if (id === undefined) {
    id = signalIdCounter++;
    signalIdMap.set(signal, id);
  }
  return id;
}

// Automatically populated when rule() is called
function rule(strings: TemplateStringsArray, ...values: unknown[]): StyleToken {
  // Build hashKey from template strings + value identities
  // For signals, use their unique ID (not their current value)
  // For other values, use their string representation
  const hashKey =
    strings.join("\0") +
    "\0" +
    values.map((v) => (isSignal(v) ? `signal:${getSignalId(v)}` : String(v))).join("\0");

  // Compute a short hash from the hashKey for storage efficiency
  const hash = computeHash(hashKey);

  // Return cached token if exists (same template + same signal instances)
  if (globalTokenRegistry.has(hash)) {
    return globalTokenRegistry.get(hash)!;
  }

  // Build CSS with var() for signals
  const { css, bindings } = buildCSSWithBindings(strings, values);

  const token: StyleToken = {
    __kind: "style",
    _: extractClassName(css),
    __css: css,
    __bindings: bindings.length > 0 ? bindings : undefined,
    __injected: new WeakSet(),
  };

  globalTokenRegistry.set(hash, token);
  return token;
}
```

**Hash computation explained**:

1. **hashKey**: A composite string built from template literals and value identities
   - Template strings are joined with null separators (`\0`)
   - Signal values use their unique ID from `signalIdMap` (not their current value)
   - Non-signal values are stringified

2. **hash**: The result of `computeHash(hashKey)` - a short, fixed-length string suitable as a Map key

3. **Why WeakMap for signal IDs?**: Since `@semajsx/signal` doesn't expose an `id` property on Signal objects, we use a WeakMap to lazily assign unique IDs. This allows garbage collection of signals while maintaining identity tracking during their lifetime.

**Why a global registry?**

1. **Token caching**: Same template + same signals = same token instance
2. **CSS deduplication**: Same CSS (even with different signals) shares the same stylesheet
3. **SSR Hydration**: `hydrateStyles()` can mark existing tokens as already injected
4. **Memory efficiency**: Avoid creating duplicate token objects

**Registry Lifecycle**:

- Static tokens are registered at module load time
- Dynamic tokens (with signals) are registered on first call with those signal instances
- Registry persists for the application lifetime
- In SSR, each request should use a fresh registry (via `collectStyles()` context)

**Dynamic Rules and Token Caching**:

```ts
// Dynamic rule definition
const boxStyle = (height: Signal<number>, bg: Signal<string>) =>
  rule`${c.box} { height: ${height}px; background: ${bg}; }`;

// Same signal instances = same cached token
const h = signal(100);
const c = signal("red");

const token1 = boxStyle(h, c);
const token2 = boxStyle(h, c);
token1 === token2; // true - same signals, cached token

// Different signal instances = different tokens
const h2 = signal(100); // new signal with same value
const token3 = boxStyle(h2, c);
token1 === token3; // false - different signal instance
```

**Why cache by signal identity?**

Each token stores its own `__bindings` array referencing specific signal instances. If two different signals were used to create the "same" token, they would conflict when setting up subscriptions.

**Preventing unbounded growth**:

1. **Same signals → same token**: Hash by signal identity prevents duplicates
2. **Typical usage**: Components create signals once, so tokens are created once
3. **Token footprint is small**: Just CSS string + binding references
4. **Signals GC'd, tokens remain**: Tokens stay in registry but bindings become inactive

### 8.5 rules() Return Type

When combining multiple tokens with `rules()`, bindings from all tokens are merged:

```ts
function rules(...tokens: StyleToken[]): StyleToken {
  const combinedCSS = tokens.map((t) => t.__css).join("\n");
  const allBindings = tokens.flatMap((t) => t.__bindings ?? []);

  return {
    __kind: "style",
    _: undefined, // Combined rules have no single class name
    __css: combinedCSS,
    __bindings: allBindings.length > 0 ? allBindings : undefined,
    __injected: new WeakSet(),
  };
}
```

**Behavior**:

- All CSS rules are concatenated
- All signal bindings are merged into a single array
- The combined token has no `_` (class name) since it may contain multiple selectors
- When used in `class`, all signal subscriptions are set up on the element

### 8.6 SemaJSX Integration (`@semajsx/dom`)

#### Class Property Enhancement

```tsx
// StyleToken directly in class prop
<div class={button.root}>

// Array with conditions
<div class={[button.root, isLarge && button.large]}>

// Mixed with strings
<div class={[button.root, "custom-class"]}>
```

#### `<AppStyleAnchor>`

Sets the global style injection target.

```tsx
import { AppStyleAnchor } from "@semajsx/dom";

// For Shadow DOM
function MyWebComponent() {
  const shadow = useShadowRoot();

  return (
    <AppStyleAnchor target={shadow}>
      <App />
    </AppStyleAnchor>
  );
}
```

#### `<ComponentStyleAnchor>`

Sets style injection target for current component only.

```tsx
import { ComponentStyleAnchor } from "@semajsx/dom";

function IsolatedComponent() {
  const containerRef = signal<HTMLElement | null>(null);

  return (
    <div>
      <style-container ref={containerRef} />
      <ComponentStyleAnchor target={containerRef}>
        {/* Styles for THIS component inject into style-container */}
        <div class={card.root}>...</div>

        {/* Child components use App Anchor, NOT this anchor */}
        <ChildComponent />
      </ComponentStyleAnchor>
    </div>
  );
}
```

#### Injection Lifecycle

```ts
// Pseudo-code for class prop handling
function resolveClass(value, context) {
  if (isStyleToken(value)) {
    const target = context.componentAnchor ?? context.appAnchor ?? document.head;

    if (!value.__bundle.__injected.has(target)) {
      injectStyles(value.__bundle.__css, target);
      value.__bundle.__injected.add(target);
    }

    return value._;
  }

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((v) => resolveClass(v, context))
      .join(" ");
  }

  return String(value);
}
```

---

## 9. Usage Examples

### 9.1 Basic Component

```ts
// button.style.ts
import { classes, rule, rules } from "@semajsx/style";

const c = classes(["root", "icon", "label", "large", "primary"]);

/** Base button styles */
export const root = rule`${c.root} {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}`;

/** Button states */
export const states = rules(
  rule`${c.root}:hover { transform: translateY(-1px); }`,
  rule`${c.root}:disabled { opacity: 0.5; cursor: not-allowed; }`,
);

/** Icon styling */
export const icon = rule`${c.icon} { width: 18px; height: 18px; }`;
export const iconInRoot = rule`${c.root} > ${c.icon}:first-child { margin-right: 8px; }`;

/** Label styling */
export const label = rule`${c.label} { font-weight: 500; }`;

/** Size variants */
export const large = rule`${c.large} { padding: 12px 24px; }`;

/** Color variants */
export const primary = rule`${c.primary} { background: var(--primary); color: white; }`;
```

```tsx
// Button.tsx
import * as button from "./button.style";

export function Button({ large, primary, icon, children }) {
  return (
    <button class={[button.root, large && button.large, primary && button.primary]}>
      {icon && <span class={button.icon}>{icon}</span>}
      <span class={button.label}>{children}</span>
    </button>
  );
}
```

### 9.2 With Shadow DOM

```tsx
import { AppStyleAnchor } from "@semajsx/dom";
import * as button from "./button.style";

class MyElement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    render(
      <AppStyleAnchor target={shadow}>
        <button class={button.root}>Click me</button>
      </AppStyleAnchor>,
      shadow,
    );
  }
}
```

### 9.3 Framework Integrations

#### React Integration (`@semajsx/style/react`)

Anchor + hook pattern for seamless React usage:

```tsx
// App.tsx
import { StyleAnchor } from "@semajsx/style/react";

function App() {
  return (
    <StyleAnchor>
      <MyApp />
    </StyleAnchor>
  );
}

// For Shadow DOM
function WebComponent() {
  const shadowRef = useRef<ShadowRoot>(null);

  return (
    <StyleAnchor target={shadowRef.current}>
      <Content />
    </StyleAnchor>
  );
}
```

```tsx
// Button.tsx
import { useStyle } from "@semajsx/style/react";
import * as button from "./button.style";

function Button({ large, primary, disabled, children }) {
  const cx = useStyle();

  return (
    <button
      className={cx(
        button.root, // StyleToken
        button.states, // Combined rules
        large && button.large, // Conditional
        primary && button.primary,
        "custom-class", // Plain string
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

The `useStyle()` hook returns a `cx` function that:

- Accepts StyleTokens, strings, and falsy values (like clsx)
- Auto-injects CSS for StyleTokens into the Provider's target
- Returns a combined className string
- Deduplicates injections automatically

```ts
// @semajsx/style/react implementation sketch
import { createContext, useContext, useCallback, useRef, useEffect } from "react";
import { inject, isStyleToken, type StyleToken, type SignalBinding } from "@semajsx/style";

// Unified context for both CSS injection and signal bindings
const StyleAnchorContext = createContext<{
  target: Element | ShadowRoot | null;
  register: (bindings: SignalBinding[]) => void;
} | null>(null);

type CxArg = StyleToken | string | false | null | undefined;

export function useStyle() {
  const anchor = useContext(StyleAnchorContext);

  // cx() always returns string
  const cx = useCallback((...args: CxArg[]): string => {
    const classes: string[] = [];

    for (const arg of args) {
      if (!arg) continue;

      if (isStyleToken(arg)) {
        // Inject CSS to anchor target
        inject(arg, { target: anchor?.target ?? undefined });
        if (arg._) classes.push(arg._);

        // Register signal bindings to anchor
        if (arg.__bindings && anchor) {
          anchor.register(arg.__bindings);
        }
      } else {
        classes.push(arg);
      }
    }

    return classes.join(" ");
  }, [anchor]);

  return cx;
}

/**
 * StyleAnchor - Unified anchor for CSS injection and signal bindings
 *
 * Handles both:
 * 1. CSS injection target (where <style> tags are inserted)
 * 2. Signal bindings (CSS variables set on anchor element, cascade to descendants)
 */
export function StyleAnchor({
  target,
  children,
}: {
  target?: ShadowRoot;  // For Shadow DOM; omit for regular DOM
  children: React.ReactNode;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const bindingsRef = useRef<SignalBinding[]>([]);
  const unsubscribesRef = useRef<(() => void)[]>([]);

  // Register bindings (called by cx() in children)
  const register = useCallback((bindings: SignalBinding[]) => {
    bindingsRef.current.push(...bindings);
  }, []);

  // Set up subscriptions after render
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Clean up previous subscriptions
    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];

    // Set up new subscriptions
    for (const [signal, varName, unit] of bindingsRef.current) {
      // Set initial value
      const value = unit ? `${signal.value}${unit}` : String(signal.value);
      element.style.setProperty(varName, value);

      // Subscribe to changes
      const unsub = signal.subscribe((newValue) => {
        const v = unit ? `${newValue}${unit}` : String(newValue);
        element.style.setProperty(varName, v);
      });
      unsubscribesRef.current.push(unsub);
    }

    // Clear bindings for next render cycle
    bindingsRef.current = [];

    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
    };
  });

  // CSS injection target: shadowRoot if provided, else anchor element itself
  const injectionTarget = target ?? elementRef.current;

  return (
    <StyleAnchorContext.Provider value={{ target: injectionTarget, register }}>
      <div ref={elementRef} style={{ display: "contents" }}>
        {children}
      </div>
    </StyleAnchorContext.Provider>
  );
}
```

**Key insight**: CSS injection and signal bindings share a single `<StyleAnchor>`:

- `cx()` always returns `string` (simple, predictable)
- `<StyleAnchor>` handles both CSS injection target and signal → CSS variable bindings
- For Shadow DOM, pass `target={shadowRoot}` to inject styles there
- CSS variables are set on the anchor element and cascade to descendants via CSS inheritance

#### Vue Integration (`@semajsx/style/vue`)

```vue
<script setup lang="ts">
import { useStyle } from "@semajsx/style/vue";
import * as button from "./button.style";

const props = defineProps<{ large?: boolean; primary?: boolean }>();
const cx = useStyle();
</script>

<template>
  <button :class="cx(button.root, large && button.large, primary && button.primary)">
    <slot />
  </button>
</template>
```

#### Vanilla JS

```ts
import { inject, cx } from "@semajsx/style";
import * as button from "./button.style";
import { root, primary } from "./button.style";

// Option 1: Pre-inject specific styles
inject(root);
inject(primary);

const btn = document.createElement("button");
btn.className = String(button.root);

// Option 2: Use cx() helper (auto-injects)
const btn2 = document.createElement("button");
btn2.className = cx(button.root, button.primary, "custom");
```

#### Reactive Styles in React/Vue

React and Vue use the same signal-based approach via `useSignal` hook and `StyleAnchor`:

```tsx
// React - Reactive values with useSignal and StyleAnchor
import { useStyle, useSignal, StyleAnchor } from "@semajsx/style/react";
import { classes, rule } from "@semajsx/style";

const c = classes(["box"]);

// Dynamic rule - function that accepts props object
interface BoxStyleProps {
  height: Signal<number>;
  bg: Signal<string>;
}

const boxStyle = ({ height, bg }: BoxStyleProps) =>
  rule`${c.box} {
    height: ${height}px;
    background: ${bg};
    transition: all 0.3s;
  }`;

function Box() {
  const cx = useStyle();
  const height = useSignal(100);
  const color = useSignal("#3b82f6");

  // cx() always returns string
  // StyleAnchor handles both CSS injection and signal bindings
  return (
    <StyleAnchor>
      <div className={cx(boxStyle({ height, bg: color }))} onClick={() => (height.value += 10)}>
        Click to grow
      </div>
    </StyleAnchor>
  );
}

// DOM structure:
// <div style="--_v0: 100px; --_v1: #3b82f6">  <!-- StyleAnchor wrapper -->
//   <div class="box-x7f3a">Click to grow</div>
// </div>
//
// After click (signal update directly to DOM, no React re-render!):
// <div style="--_v0: 110px; --_v1: #3b82f6">  <!-- CSS vars updated -->
//   <div class="box-x7f3a">Click to grow</div>
// </div>
```

**How it works**: CSS variables set on the anchor element cascade to descendants via CSS inheritance. The anchor uses `display: contents` to avoid affecting layout.

Vue with `useSignal` and `StyleAnchor`:

```vue
<script setup lang="ts">
import { useStyle, useSignal } from "@semajsx/style/vue";
import StyleAnchor from "@semajsx/style/vue/StyleAnchor.vue";

const cx = useStyle();
const height = useSignal(100);
const color = useSignal("#3b82f6");
</script>

<template>
  <StyleAnchor>
    <div :class="cx(boxStyle({ height, bg: color }))" @click="height.value += 10">
      Click to grow
    </div>
  </StyleAnchor>
</template>
```

**Unified API across frameworks:**

| Aspect           | SemaJSX                    | React/Vue                      |
| ---------------- | -------------------------- | ------------------------------ |
| Create signal    | `signal(100)`              | `useSignal(100)`               |
| Dynamic rule     | `boxStyle({ height, bg })` | `boxStyle({ height, bg })`     |
| Update           | `height.value += 10`       | `height.value += 10`           |
| Re-render needed | No - direct DOM update     | No - signal bypasses React/Vue |
| Syntax           | `<div class={style}>`      | `<StyleAnchor>` + `cx(style)`  |

The key insight: **signals bypass framework re-renders**. The CSS variable update happens directly on the anchor element via signal subscription, not through React/Vue's reconciliation. CSS variables cascade to descendants via CSS inheritance.

### 9.4 Global Styles

```ts
import { classes, rule, rules, inject } from "@semajsx/style";

const c = classes(["reset"]);

export const globals = rules(
  rule`:root {
    --primary: #3b82f6;
    --hover: #2563eb;
  }`,

  rule`*, *::before, *::after { box-sizing: border-box; }`,

  rule`body {
    margin: 0;
    font-family: system-ui, sans-serif;
  }`,

  // Scoped class
  rule`${c.reset} { all: unset; }`,
);

// Inject globals at app start
inject(globals);
```

### 9.5 Shared Class Names Across Files

```ts
// tokens.ts
import { classes } from "@semajsx/style";
export const c = classes(["button", "card", "input", "icon"]);

// button.style.ts
import { rule } from "@semajsx/style";
import { c } from "./tokens";

export const root = rule`${c.button} { ... }`;
export const withIcon = rule`${c.button} > ${c.icon} { ... }`;

// card.style.ts
import { rule } from "@semajsx/style";
import { c } from "./tokens";

export const root = rule`${c.card} { ... }`;
export const cardButton = rule`${c.card} ${c.button} { width: 100%; }`;
```

---

## 10. Tailwind CSS Integration

The style system can integrate with Tailwind CSS to provide type-safe utility classes.

### 10.1 Package Structure

```
@semajsx/tailwind/
  ├── spacing.ts      # p, m, gap
  ├── sizing.ts       # w, h, min-w, max-w
  ├── colors.ts       # bg, text, border
  ├── flex.ts         # flex, justify, items
  ├── typography.ts   # font, text-size, leading
  ├── arbitrary.ts    # Arbitrary value functions
  └── index.ts        # Re-export all
```

### 10.2 Predefined Values

Predefined Tailwind scale values are exported as object properties with JSDoc comments for IDE hover hints.

**Note on tree-shaking**: Unlike component styles (Section 6.4), Tailwind utilities use object exports for ergonomics. This is acceptable because:

1. **Module-level tree-shaking still works**: If you don't import `spacing.ts`, it's eliminated
2. **Utilities are small**: Each rule is ~50 bytes, entire `spacing` object is ~500 bytes
3. **Typically used together**: Users import a category (spacing, colors) and use many values
4. **DOM injection is selective**: Even if bundled, only used rules are injected

For component styles where each rule is larger and usage is selective, prefer named exports (Section 6.4).

```ts
// @semajsx/tailwind/spacing.ts
import { classes, rule } from "@semajsx/style";

const c = classes([
  "p0",
  "p1",
  "p2",
  "p4",
  "p8",
  "px",
  "m0",
  "m1",
  "m2",
  "m4",
  "m8",
  "mauto",
  // ...
]);

export const spacing = {
  /** padding: 0 */
  p0: rule`${c.p0} { padding: 0; }`,
  /** padding: 0.25rem (4px) */
  p1: rule`${c.p1} { padding: 0.25rem; }`,
  /** padding: 0.5rem (8px) */
  p2: rule`${c.p2} { padding: 0.5rem; }`,
  /** padding: 1rem (16px) */
  p4: rule`${c.p4} { padding: 1rem; }`,
  /** padding: 2rem (32px) */
  p8: rule`${c.p8} { padding: 2rem; }`,
  /** padding: 1px */
  px: rule`${c.px} { padding: 1px; }`,

  /** margin: 0 */
  m0: rule`${c.m0} { margin: 0; }`,
  /** margin: 0.25rem (4px) */
  m1: rule`${c.m1} { margin: 0.25rem; }`,
  /** margin: 0.5rem (8px) */
  m2: rule`${c.m2} { margin: 0.5rem; }`,
  /** margin: 1rem (16px) */
  m4: rule`${c.m4} { margin: 1rem; }`,
  /** margin: 2rem (32px) */
  m8: rule`${c.m8} { margin: 2rem; }`,
  /** margin: auto */
  mauto: rule`${c.mauto} { margin: auto; }`,
  // ...
};
```

IDE hover example:

```
spacing.p4
         ↓
┌─────────────────────────┐
│ (property) p4           │
│ padding: 1rem (16px)    │
└─────────────────────────┘
```

Batch injection:

```ts
// Inject all spacing styles at once
inject(spacing);

// Or inject specific ones
inject([spacing.p4, spacing.m2]);
```

Usage:

```tsx
import { spacing, colors } from "@semajsx/tailwind";

<div class={[spacing.p4, spacing.m2, colors.bgBlue500, colors.textWhite]}>Hello</div>;
```

### 10.3 Arbitrary Values with CSS Variables

For Tailwind's arbitrary value syntax (e.g., `p-[4px]`), we use CSS custom properties instead of generating new classes dynamically:

```css
/* @semajsx/tailwind/arbitrary.css - Pre-generated CSS */
.p-v {
  padding: var(--p);
}
.m-v {
  margin: var(--m);
}
.w-v {
  width: var(--w);
}
.h-v {
  height: var(--h);
}
.bg-v {
  background-color: var(--bg);
}
.text-v {
  color: var(--text);
}
/* ... */
```

Template string functions return a special `ArbitraryStyleToken`:

```ts
// @semajsx/tailwind/arbitrary.ts

interface ArbitraryStyleToken {
  readonly __kind: "arbitrary";
  readonly _: string; // "p-v"
  readonly __var: string; // "--p"
  readonly __value: string; // "4px"
}

export function p(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken {
  const value = String.raw(strings, ...values);
  return {
    __kind: "arbitrary",
    _: "p-v",
    __var: "--p",
    __value: value,
  };
}

export function m(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken;
export function w(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken;
export function h(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken;
export function bg(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken;
// ...
```

Usage:

```tsx
import { spacing } from "@semajsx/tailwind";
import { p, m, w, bg } from "@semajsx/tailwind/arbitrary";

<div
  class={[
    spacing.p4, // Predefined: padding: 1rem
    w`calc(100% - 40px)`, // Arbitrary: width: var(--w)
    bg`#f5f5f5`, // Arbitrary: background: var(--bg)
  ]}
>
  ...
</div>;
```

### 10.4 Render Handling

The render system detects `ArbitraryStyleToken` and merges CSS variables into the style attribute:

```ts
function resolveClassAndStyle(values: Array<StyleToken | ArbitraryStyleToken>) {
  const classes: string[] = [];
  const styleVars: Record<string, string> = {};

  for (const token of values.flat().filter(Boolean)) {
    if (isArbitraryToken(token)) {
      classes.push(token._);
      styleVars[token.__var] = token.__value;
    } else if (isStyleToken(token)) {
      classes.push(token._);
    }
  }

  return {
    class: classes.join(" "),
    style: styleVars,
  };
}
```

Rendered output:

```tsx
// Input
<div class={[spacing.p4, w`calc(100% - 40px)`, bg`#f5f5f5`]}>

// Output
<div class="p-4 w-v bg-v" style="--w: calc(100% - 40px); --bg: #f5f5f5">
```

### 10.5 Advantages of CSS Variable Approach

| Aspect            | Dynamic Class Generation | CSS Variable Approach |
| ----------------- | ------------------------ | --------------------- |
| Generated classes | One per unique value     | Fixed set             |
| CSS bundle size   | Grows with usage         | Fixed                 |
| Runtime overhead  | Need to inject new rules | Only set variables    |
| Implementation    | Requires hash/cache      | Simple                |

### 10.6 Complete Example

```tsx
import { spacing, colors, flex } from "@semajsx/tailwind";
import { p, m, w, h, bg } from "@semajsx/tailwind/arbitrary";

function Card({ width, children }) {
  return (
    <div
      class={[
        // Predefined values (IDE autocomplete)
        spacing.p4,
        spacing.m2,
        colors.bgWhite,
        flex.col,

        // Arbitrary values (template strings)
        w`${width}px`,
        h`calc(100vh - 80px)`,
      ]}
    >
      {children}
    </div>
  );
}

// Rendered:
// <div
//   class="p-4 m-2 bg-white flex-col w-v h-v"
//   style="--w: 300px; --h: calc(100vh - 80px)"
// >
```

### 10.7 Code Generation from Tailwind Config

A code generator reads Tailwind config to produce the rule objects with JSDoc comments:

```ts
// scripts/generate-tailwind.ts
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../tailwind.config";

const config = resolveConfig(tailwindConfig);

function generateSpacing(): string {
  const names: string[] = [];
  const props: string[] = [];

  for (const [key, value] of Object.entries(config.theme.spacing)) {
    const name = `p${key}`;
    names.push(name);

    // Generate property with JSDoc
    const pxValue = convertToPixels(value); // e.g., "1rem" -> "16px"
    props.push(`  /** padding: ${value}${pxValue ? ` (${pxValue})` : ""} */`);
    props.push(`  ${name}: rule\`\${c.${name}} { padding: ${value}; }\`,`);
  }

  return `
import { classes, rule } from "@semajsx/style";

const c = classes(${JSON.stringify(names)});

export const spacing = {
${props.join("\n")}
};
`;
}

// Generate all category files
generateSpacing();
generateColors();
generateFlex();
// ...
```

---

## 11. Alternatives Considered

### Alternative A: CSS-in-JS Object Syntax

```ts
const button = style({
  root: {
    padding: "8px 16px",
    "&:hover": { background: "blue" },
  },
});
```

**Why not**: Loses native CSS syntax, IDE support, and familiar developer experience.

### Alternative B: Tagged Template Without Class Declaration

```ts
const button = css`
  .root {
    padding: 8px;
  }
  .icon {
    width: 18px;
  }
`;
```

**Why not**: Requires runtime CSS parsing to extract class names. Less type-safe.

### Alternative C: Compile-time Only (like Vanilla Extract)

**Why not**: Requires complex build setup. We want a runtime that works out of the box, with optional compile-time optimization.

---

## 12. Risks and Mitigation

| Risk                               | Impact | Probability | Mitigation                                                     |
| ---------------------------------- | ------ | ----------- | -------------------------------------------------------------- |
| CSS string parsing overhead        | Medium | Low         | Parsing happens once at definition time, not render time       |
| Hash collisions                    | High   | Very Low    | Use crypto-grade hash + namespace prefix + collision detection |
| Memory leaks from injected styles  | Medium | Medium      | Use WeakSet for tracking, provide explicit cleanup API         |
| Breaking existing class prop usage | High   | Low         | StyleToken stringifies to class name, backward compatible      |
| Layout thrashing on first inject   | Medium | Medium      | Batch injections, provide preload API                          |
| Invalid CSS strings                | Low    | Medium      | Validate at definition time in dev mode, skip invalid rules    |
| Target element removed from DOM    | Medium | Low         | WeakRef for targets, auto-cleanup on GC                        |

### 12.1 Memory Management Strategy

```ts
// Use WeakSet to track injection targets - allows GC when targets are removed
interface StyleToken {
  readonly _?: string;
  readonly __css: string;
  readonly __injected: WeakSet<Element | ShadowRoot>;
}

// WeakRef for registry targets
class StyleRegistry {
  private targetRef: WeakRef<Element | ShadowRoot>;
  private injectedStyles: Set<string>;

  inject(token: StyleToken) {
    const target = this.targetRef.deref();
    if (!target) {
      // Target was GC'd, cleanup registry
      this.dispose();
      return;
    }
    // ... injection logic
  }

  dispose() {
    // Explicit cleanup
  }
}
```

### 12.2 Performance: Explicit Preload

```ts
// Problem: Multiple cx() calls cause multiple style injections
cx(button.root); // inject
cx(button.icon); // inject
cx(button.label); // inject  <- 3 separate DOM writes

// Solution: Explicit preload() at app/route entry
import { preload } from "@semajsx/style";

// At app startup
preload(button, card, input); // Single batched injection

// Or at route entry
function ProductPage() {
  // Preload all styles needed for this page
  preload(productCard, pricing, gallery);

  return <div>...</div>;
}
```

Benefits of explicit preload:

- Predictable injection timing
- Developer controls when styles are added
- No hidden microtask overhead
- Easier to debug and profile

Development mode warning for non-preloaded injections:

```ts
// Track which tokens have been preloaded
const preloadedTokens = new WeakSet<StyleToken>();

export function preload(...styles: StyleToken[]) {
  for (const token of styles.flat()) {
    preloadedTokens.add(token);
  }
  batchInject(styles);
}

// In inject() or cx()
function inject(token: StyleToken, options?: InjectOptions) {
  if (process.env.NODE_ENV === "development" && !preloadedTokens.has(token)) {
    console.warn(
      `[@semajsx/style] Injecting "${token._}" without preload. ` +
        `Consider using preload() at app/route entry for better performance.`,
    );
  }
  // ... injection logic
}
```

### 12.3 Error Handling

```ts
// Dev mode: validate CSS at definition time
function rule(strings: TemplateStringsArray, ...values: unknown[]): StyleToken {
  const cssBlock = buildCSSBlock(strings, values);

  if (process.env.NODE_ENV === "development") {
    validateCSS(cssBlock); // Throws with helpful message
  }
  // ...
}

// Hash collision detection
const hashRegistry = new Map<string, string>();

function generateHash(content: string): string {
  const hash = computeHash(content);

  if (hashRegistry.has(hash) && hashRegistry.get(hash) !== content) {
    console.warn(`Hash collision detected for ${hash}, using fallback`);
    return computeHash(content + Date.now());
  }

  hashRegistry.set(hash, content);
  return hash;
}
```

---

## 13. Shadow DOM Considerations

### 13.1 Nested Shadow DOM

```tsx
// Outer shadow root
<AppStyleAnchor target={outerShadow}>
  <div class={button.root}>
    {/* Inner web component with its own shadow */}
    <inner-component>
      #shadow-root
      {/* Styles here need separate injection */}
      <AppStyleAnchor target={innerShadow}>
        <div class={button.root}>...</div>
      </AppStyleAnchor>
    </inner-component>
  </div>
</AppStyleAnchor>
```

Each Shadow DOM boundary requires its own `AppStyleAnchor`. Styles don't pierce shadow boundaries.

### 13.2 Anchor Target Removal

```ts
// When anchor target is removed from DOM
const registry = createRegistry({ target: shadowRoot });

// Later, shadowRoot is removed
shadowRoot.host.remove();

// Next injection attempt detects removed target
registry.inject(button); // No-op, logs warning in dev mode
```

### 13.3 Multiple Shadow Roots Performance

For apps with many shadow roots (e.g., micro-frontends):

```ts
// Shared style cache across shadow roots
const sharedCache = new Map<string, CSSStyleSheet>();

function injectToShadow(token: StyleToken, shadow: ShadowRoot) {
  // Use constructable stylesheets for efficient sharing
  let sheet = sharedCache.get(token.__css);

  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(token.__css);
    sharedCache.set(token.__css, sheet);
  }

  // Adopt shared stylesheet (no duplication)
  shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
}
```

---

## 14. Server-Side Rendering (SSR)

### 14.1 SSR Strategy

The style system supports SSR by collecting styles during server render and injecting them into the HTML:

```ts
// @semajsx/style/server
import { collectStyles, renderStylesToString } from "@semajsx/style/server";

// Server-side render
const styleCollector = collectStyles();

const html = renderToString(
  <StyleCollectorProvider collector={styleCollector}>
    <App />
  </StyleCollectorProvider>
);

// Get collected CSS
const css = renderStylesToString(styleCollector);

// Inject into HTML
const fullHtml = `
<!DOCTYPE html>
<html>
  <head>
    <style id="__semajsx_styles__">${css}</style>
  </head>
  <body>
    <div id="root">${html}</div>
  </body>
</html>
`;
```

### 14.2 Style Collection

During SSR, the `cx()` function collects styles instead of injecting to DOM:

```ts
// Server-side cx() implementation
function createServerCx(collector: StyleCollector) {
  return function cx(...args: CxArg[]): string {
    const classes: string[] = [];

    for (const arg of args) {
      if (!arg) continue;

      if (isStyleToken(arg)) {
        // Collect CSS instead of injecting
        collector.add(arg.__css);
        if (arg._) classes.push(arg._);
      } else {
        classes.push(String(arg));
      }
    }

    return classes.join(" ");
  };
}

interface StyleCollector {
  styles: Set<string>;
  add(css: string): void;
}

export function collectStyles(): StyleCollector {
  return {
    styles: new Set(),
    add(css: string) {
      this.styles.add(css);
    },
  };
}

export function renderStylesToString(collector: StyleCollector): string {
  return [...collector.styles].join("\n");
}
```

### 14.3 Hydration

On client-side hydration, skip re-injection for styles already in the page:

```ts
// Client-side hydration
import { hydrateStyles } from "@semajsx/style";

// Mark existing styles as injected
hydrateStyles();

// Now cx() won't re-inject styles that are already in <style id="__semajsx_styles__">
```

**Timing Considerations**:

1. `hydrateStyles()` should be called **after** style modules are imported
2. Since `rule()` registers tokens at module load time, ensure style imports come before `hydrateStyles()`
3. For lazy-loaded modules, hydration happens on-demand via the inject check

```ts
// Correct order - style imports first
import * as button from "./button.style"; // rule() registers tokens here
import * as card from "./card.style";
import { hydrateStyles } from "@semajsx/style";

hydrateStyles(); // Now globalTokenRegistry contains all tokens
```

**Implementation with hash-based matching**:

SSR embeds token hashes in a data attribute, enabling reliable matching even after CSS minification:

```html
<!-- Server-rendered HTML -->
<style id="__semajsx_styles__" data-hashes="a1b2c3,d4e5f6,g7h8i9">
  .root-a1b2c3 { ... }
  .icon-d4e5f6 { ... }
</style>
```

```ts
let hydratedHashes: Set<string> | null = null;

function getHydratedHashes(): Set<string> {
  if (hydratedHashes === null) {
    const styleEl = document.getElementById("__semajsx_styles__");
    const hashAttr = styleEl?.getAttribute("data-hashes") || "";
    hydratedHashes = new Set(hashAttr.split(",").filter(Boolean));
  }
  return hydratedHashes;
}

export function hydrateStyles() {
  const hashes = getHydratedHashes();
  if (hashes.size === 0) return;

  // Mark tokens whose hash exists in SSR'd styles
  for (const [hash, token] of globalTokenRegistry) {
    if (hashes.has(hash)) {
      token.__injected.add(document.head);
    }
  }
}

// Lazy hydration check in inject()
function inject(token: StyleToken, options?: InjectOptions) {
  const target = options?.target ?? document.head;

  if (target === document.head && !token.__injected.has(target)) {
    const hashes = getHydratedHashes();
    const tokenHash = computeHash(token.__css);

    if (hashes.has(tokenHash)) {
      token.__injected.add(target);
      return; // Already in page, skip injection
    }
  }

  // ... proceed with injection
}
```

**Why hash-based matching?**

1. **Minification-safe**: Hash comparison works regardless of whitespace changes
2. **Fast lookup**: `Set.has()` is O(1) vs `String.includes()` which is O(n)
3. **Reliable**: Exact match via hash, no false positives from partial matches

**SSR style rendering with hashes**:

```ts
export function renderStylesToString(collector: StyleCollector): string {
  const hashes: string[] = [];
  const css: string[] = [];

  for (const [hash, cssContent] of collector.styles) {
    hashes.push(hash);
    css.push(cssContent);
  }

  return `<style id="__semajsx_styles__" data-hashes="${hashes.join(",")}">${css.join("\n")}</style>`;
}
```

This dual approach ensures:

- **Eager hydration**: `hydrateStyles()` marks all known tokens immediately
- **Lazy hydration**: Tokens from lazy-loaded modules are checked on first use
- **Minification-safe**: Hash comparison works after CSS minification

### 14.4 Streaming SSR

For streaming SSR (React 18+), styles can be flushed incrementally. **The same `StyleCollectorProvider` and `collectStyles()` are used** - streaming vs sync is determined by how you consume the collector.

```ts
// Streaming SSR with style chunks
import { renderToPipeableStream } from "react-dom/server";
import { StyleCollectorProvider, collectStyles, flushStyles } from "@semajsx/style/server";

const collector = collectStyles();

const { pipe } = renderToPipeableStream(
  <StyleCollectorProvider collector={collector}>
    <App />
  </StyleCollectorProvider>,
  {
    onShellReady() {
      // Flush styles collected so far (clears the collector)
      const css = flushStyles(collector);
      res.write(`<style>${css}</style>`);
      pipe(res);
    },
    onAllReady() {
      // Optionally flush any remaining styles after full render
      const remainingCss = flushStyles(collector);
      if (remainingCss) {
        res.write(`<style>${remainingCss}</style>`);
      }
    },
  }
);
```

**API difference**:

- `renderStylesToString(collector)`: Returns all styles, leaves collector intact (for sync SSR)
- `flushStyles(collector)`: Returns new styles since last flush, clears them (for streaming)

### 14.5 Framework Integration

**Next.js App Router:**

```tsx
// lib/style-registry.tsx
"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";
import { collectStyles, renderStylesToString, StyleCollectorProvider } from "@semajsx/style/server";

export function StyleRegistry({ children }: { children: React.ReactNode }) {
  const collectorRef = useRef(collectStyles());
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInserted.current) return null;
    isServerInserted.current = true;

    const css = renderStylesToString(collectorRef.current);
    return <style id="__semajsx_styles__" dangerouslySetInnerHTML={{ __html: css }} />;
  });

  return (
    <StyleCollectorProvider collector={collectorRef.current}>{children}</StyleCollectorProvider>
  );
}

// app/layout.tsx
import { StyleRegistry } from "@/lib/style-registry";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head />
      <body>
        <StyleRegistry>{children}</StyleRegistry>
      </body>
    </html>
  );
}
```

**Remix:**

```tsx
// root.tsx
import { collectStyles, renderStylesToString } from "@semajsx/style/server";

export default function App() {
  const collector = collectStyles();

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: renderStylesToString(collector) }} />
      </head>
      <body>
        <StyleCollectorProvider collector={collector}>
          <Outlet />
        </StyleCollectorProvider>
      </body>
    </html>
  );
}
```

---

## 15. Dependencies

### 15.1 Technical Dependencies

- None for core `@semajsx/style` package
- `@semajsx/dom` for SemaJSX integration (optional)

### 15.2 Optional Build Tools

- Vite plugin for `.css` → `.css.ts` transformation
- CSS minification in production builds

---

## 16. Open Questions

- [ ] **Q1**: Should CSS be auto-split per class for finer tree-shaking?
  - **Context**: Currently, entire `rule` block is one unit
  - **Options**: A) Keep as-is (simpler), B) Compile-time splitting
  - **Leaning**: A - per-component granularity is sufficient

- [ ] **Q2**: How to handle CSS custom properties (variables)?
  - **Context**: Variables don't need hashing but should be type-safe
  - **Options**: A) Separate API, B) Convention (--prefix), C) Just use strings

- [ ] **Q3**: Should we provide a CSS-to-TS transformation tool?
  - **Context**: Users may prefer writing `.css` files
  - **Options**: A) Vite plugin, B) CLI tool, C) Both, D) None (manual)

- [x] ~~**Q4**: Is the dual syntax for `rule()` confusing?~~
  - **Resolved**: Unified to single tagged template syntax: `` rule`${c.root} { ... }` ``

---

## 17. Success Criteria

- [ ] `@semajsx/style` works standalone with any framework
- [ ] Tree-shaking eliminates unused style bundles
- [ ] Native CSS syntax with full IDE support
- [ ] Type-safe class name references
- [ ] Shadow DOM injection works correctly
- [ ] Zero runtime CSS parsing (parse once at definition)
- [ ] Backward compatible with existing string class names
- [ ] No memory leaks with proper cleanup
- [ ] Performant with batched injections

---

## 18. Next Steps

If accepted:

### 18.1 Phase 1: Core Implementation

- [ ] Create design document: `docs/designs/style-system-design.md`
- [ ] Implement `@semajsx/style` package (core runtime)
- [ ] Integrate with `@semajsx/dom` class property handling
- [ ] Add StyleAnchor components
- [ ] Implement `preload()` and dev mode warnings
- [ ] Write documentation and examples

### 18.2 Phase 2: Framework Integrations

- [ ] Implement `@semajsx/style/react` (StyleAnchor, useStyle, useSignal)
- [ ] Implement `@semajsx/style/vue` (useStyle, useSignal composables)
- [ ] Implement `@semajsx/style/server` (SSR support)
- [ ] Add hydration support

### 18.3 Phase 3: Toolchain

- [ ] **Vite Plugin** (`vite-plugin-semajsx-style`)
  - Transform `.css` files to `.css.ts` modules
  - Automatic class name extraction
  - HMR support for style changes
  - Production CSS minification

- [ ] **VSCode Extension** (`vscode-semajsx-style`)
  - CSS syntax highlighting in `rule\`\`` templates
  - Go-to-definition for ClassRef references
  - Autocomplete for class names
  - CSS validation and linting
  - Hover hints for class name hashes

- [ ] **ESLint Plugin** (`eslint-plugin-semajsx-style`)
  - Warn on unused style tokens
  - Enforce `preload()` usage
  - Detect potential memory leaks

---

## 19. Appendix

### References

- [CSS Modules](https://github.com/css-modules/css-modules)
- [Vanilla Extract](https://vanilla-extract.style/)
- [StyleX](https://stylexjs.com/)
- [Panda CSS](https://panda-css.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadow DOM Styling](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

### Glossary

- **ClassRef**: A reference object that stringifies to a hashed class name
- **StyleToken**: Contains className (optional) + CSS rule(s), used in class props or injected
- **ArbitraryStyleToken**: A token for arbitrary values that uses CSS variables instead of generating classes
- **ReactiveVar**: Signal binding info for dynamic CSS variables
- **Dynamic Rule**: A function that accepts props object with signals and returns a StyleToken (like Component)
- **App Anchor**: Global style injection target (default: document.head)
- **Component Anchor**: Per-component injection target (doesn't affect children)

### Change Log

| Date       | Change                                                                    | Author       |
| ---------- | ------------------------------------------------------------------------- | ------------ |
| 2026-01-10 | Initial draft                                                             | SemaJSX Team |
| 2026-01-10 | Added Tailwind CSS integration                                            | SemaJSX Team |
| 2026-01-10 | Refined style() API: per-property with JSDoc                              | SemaJSX Team |
| 2026-01-10 | Added batch inject() and multiple rules support                           | SemaJSX Team |
| 2026-01-10 | Renamed style→rule, added rules() for combining                           | SemaJSX Team |
| 2026-01-10 | Added tagged template syntax for complex selectors                        | SemaJSX Team |
| 2026-01-10 | Added React/Vue integrations with Provider + useStyle() hook              | SemaJSX Team |
| 2026-01-10 | Added memory management, performance, error handling, Shadow DOM sections | SemaJSX Team |
| 2026-01-10 | Unified to single tagged template syntax: rule\`selector { css }\`        | SemaJSX Team |
| 2026-01-10 | Changed preload() to explicit only (no automatic batching)                | SemaJSX Team |
| 2026-01-10 | Added reactive values with signals (CSS variables for dynamic updates)    | SemaJSX Team |
| 2026-01-10 | Introduced dynamic rules (functions) + useSignal hook for React/Vue       | SemaJSX Team |
| 2026-01-10 | Changed dynamic rule to use props object pattern (like Component)         | SemaJSX Team |
| 2026-01-10 | Added dev mode warning for non-preloaded style injections                 | SemaJSX Team |
| 2026-01-10 | Added SSR support (style collection, hydration, streaming)                | SemaJSX Team |
| 2026-01-10 | Type system cleanup with discriminated union pattern                      | SemaJSX Team |
| 2026-01-10 | Added toolchain planning (Vite plugin, VSCode extension, ESLint)          | SemaJSX Team |
| 2026-01-10 | Fixed ArbitraryStyleToken to use \_\_kind discriminant                    | SemaJSX Team |
| 2026-01-10 | Added globalTokenRegistry and rules() return type documentation           | SemaJSX Team |
| 2026-01-10 | Fixed Next.js SSR example with proper StyleRegistry implementation        | SemaJSX Team |
| 2026-01-10 | Fixed section numbering (removed gap at section 11)                       | SemaJSX Team |
| 2026-01-10 | Clarified streaming SSR uses same Provider, added flushStyles API         | SemaJSX Team |
| 2026-01-10 | Added hydration timing explanation with lazy fallback                     | SemaJSX Team |
| 2026-01-10 | Added honest tree-shaking analysis (module vs property level)             | SemaJSX Team |
| 2026-01-10 | Changed to named exports as default pattern for tree-shaking              | SemaJSX Team |
| 2026-01-10 | Added Tailwind tree-shaking trade-off explanation                         | SemaJSX Team |
| 2026-01-10 | Added dynamic rules registry behavior (hash by signal identity)           | SemaJSX Team |
| 2026-01-10 | Changed hydration to hash-based matching (minification-safe)              | SemaJSX Team |
| 2026-01-10 | Redesigned reactive: signals in template, auto-binding via \_\_bindings   | SemaJSX Team |
| 2026-01-10 | Clarified inject() only handles CSS, signal binding handled by framework  | SemaJSX Team |
| 2026-01-10 | Fixed signal identity: use WeakMap since Signal has no id property        | SemaJSX Team |
| 2026-01-10 | Clarified hashKey vs hash relationship in token caching                   | SemaJSX Team |
| 2026-01-10 | Redesigned cx() to always return string, use anchor for signal bindings   | SemaJSX Team |
| 2026-01-10 | Unified StyleProvider and SignalStyleAnchor into single StyleAnchor       | SemaJSX Team |

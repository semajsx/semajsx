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
- **Critical CSS extraction**: Not handling SSR critical path optimization
- **Atomic CSS generation**: Not auto-generating utility classes like Tailwind
- **CSS-in-JS object syntax**: We explicitly prefer native CSS strings
- **Hot Module Replacement**: HMR is a build tool concern, not runtime

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

The key insight is treating **each `rule()` call as a tree-shakeable unit**. If a `rule()` export isn't imported, its CSS is eliminated entirely.

---

## 7. High-Level Proposal

### 7.1 Core Concept: Style as Module

```ts
// button.style.ts
import { classes, rule, rules } from "@semajsx/style";

const c = classes(["root", "icon", "label"]);

export const button = {
  /** display: inline-flex; padding: 8px 16px */
  root: rule`${c.root} {
    display: inline-flex;
    padding: 8px 16px;
  }`,

  /** width: 18px; height: 18px */
  icon: rule`${c.icon} {
    width: 18px;
    height: 18px;
  }`,

  /** font-weight: 500 */
  label: rule`${c.label} {
    font-weight: 500;
  }`,

  /** margin-right: 8px (icon inside root) */
  rootIcon: rule`${c.root} > ${c.icon} {
    margin-right: 8px;
  }`,

  /** hover state */
  rootHover: rule`${c.root}:hover {
    background: var(--hover);
  }`,

  /** multiple rules for states */
  states: rules(
    rule`${c.root}:active { transform: scale(0.98); }`,
    rule`${c.root}:disabled { opacity: 0.5; cursor: not-allowed; }`,
  ),
};
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

When a Signal is interpolated in the template, it automatically converts to a CSS variable. The framework's reactivity updates the variable without re-injecting CSS.

```ts
import { signal } from "@semajsx/signal";

const height = signal(100);
const color = signal("#3b82f6");

// Signal interpolation → CSS variable
const box = rule`${c.box} {
  height: ${height}px;
  background: ${color};
}`;

// Internally generates:
// .box-x7f3a {
//   height: var(--box-h-abc);
//   background: var(--box-bg-def);
// }

// box.__vars = [
//   { id: "--box-h-abc", signal: height, suffix: "px" },
//   { id: "--box-bg-def", signal: color, suffix: "" },
// ]
```

Usage in component:

```tsx
function Box() {
  const height = signal(100);

  const boxStyle = rule`${c.box} {
    height: ${height}px;
    transition: height 0.3s;
  }`;

  return (
    <div class={boxStyle} onClick={() => (height.value += 10)}>
      Click to grow
    </div>
  );
}

// Rendered:
// <div class="box-x7f3a" style="--box-h-abc: 100">
//
// After click:
// <div class="box-x7f3a" style="--box-h-abc: 110">
// (CSS transition animates the change!)
```

The render system detects `__vars` and:

1. Injects the static CSS rule once
2. Binds signal subscriptions to update CSS variables on the element's `style`
3. No re-injection needed - just variable updates

```ts
// StyleToken with reactive vars
interface StyleToken {
  readonly _?: string;
  readonly __css: string;
  readonly __vars?: ReactiveVar[];
  readonly __injected: WeakSet<Element | ShadowRoot>;
}

interface ReactiveVar {
  id: string; // "--box-h-abc"
  signal: Signal<any>; // The signal reference
  suffix: string; // "px", "%", "", etc.
}
```

Benefits:

- CSS rule injected once, never changes
- Only CSS variable values update (cheap DOM operation)
- CSS transitions/animations work naturally
- No style string rebuilding or re-parsing

#### `inject(tokens, options?): () => void`

Manually injects styles into DOM. Supports single token, array, or object. Returns cleanup function.

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

// Style token (returned by style())
interface StyleToken {
  readonly _?: string; // className (only for class selectors)
  readonly __css: string; // full CSS rule(s)
  readonly __injected: Set<Element | ShadowRoot>;
  toString(): string; // returns _ or empty string
}

// Registry options
interface RegistryOptions {
  target?: Element | ShadowRoot;
  dedupe?: boolean;
}

// rule`` tagged template - creates StyleToken from selector + CSS block
function rule(strings: TemplateStringsArray, ...values: (ClassRef | string)[]): StyleToken;

// rules() - combines multiple StyleTokens
function rules(...tokens: StyleToken[]): StyleToken;
```

### 8.3 SemaJSX Integration (`@semajsx/dom`)

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

export const button = {
  /** Base button styles */
  root: rule`${c.root} {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }`,

  /** Button states */
  states: rules(
    rule`${c.root}:hover { transform: translateY(-1px); }`,
    rule`${c.root}:disabled { opacity: 0.5; cursor: not-allowed; }`,
  ),

  /** Icon styling */
  icon: rule`${c.icon} { width: 18px; height: 18px; }`,
  iconInRoot: rule`${c.root} > ${c.icon}:first-child { margin-right: 8px; }`,

  /** Label styling */
  label: rule`${c.label} { font-weight: 500; }`,

  /** Size variants */
  large: rule`${c.large} { padding: 12px 24px; }`,

  /** Color variants */
  primary: rule`${c.primary} { background: var(--primary); color: white; }`,
};
```

```tsx
// Button.tsx
import { button } from "./button.style";

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
import { button } from "./button.style";

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

Provider + hook pattern for seamless React usage:

```tsx
// App.tsx
import { StyleProvider } from "@semajsx/style/react";

function App() {
  return (
    <StyleProvider>
      <MyApp />
    </StyleProvider>
  );
}

// For Shadow DOM
function WebComponent() {
  const shadowRef = useRef<ShadowRoot>(null);

  return (
    <StyleProvider target={shadowRef.current}>
      <Content />
    </StyleProvider>
  );
}
```

```tsx
// Button.tsx
import { useStyle } from "@semajsx/style/react";
import { button } from "./button.style";

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
import { createContext, useContext, useCallback, useMemo } from "react";
import { inject, isStyleToken, type StyleToken } from "@semajsx/style";

const StyleContext = createContext<Element | ShadowRoot | null>(null);

export function StyleProvider({ target, children }: {
  target?: Element | ShadowRoot;
  children: React.ReactNode;
}) {
  return (
    <StyleContext.Provider value={target ?? null}>
      {children}
    </StyleContext.Provider>
  );
}

type CxArg = StyleToken | string | false | null | undefined;

export function useStyle() {
  const target = useContext(StyleContext);

  const cx = useCallback((...args: CxArg[]): string => {
    const classes: string[] = [];

    for (const arg of args) {
      if (!arg) continue;

      if (isStyleToken(arg)) {
        // Inject if not already injected to this target
        inject(arg, { target: target ?? undefined });
        if (arg._) classes.push(arg._);
      } else {
        classes.push(arg);
      }
    }

    return classes.join(" ");
  }, [target]);

  return cx;
}
```

#### Vue Integration (`@semajsx/style/vue`)

```vue
<script setup lang="ts">
import { useStyle } from "@semajsx/style/vue";
import { button } from "./button.style";

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
import { button } from "./button.style";

// Option 1: Pre-inject all styles
inject(button);

const btn = document.createElement("button");
btn.className = String(button.root);

// Option 2: Use cx() helper (auto-injects)
const btn2 = document.createElement("button");
btn2.className = cx(button.root, button.primary, "custom");
```

#### Reactive Values in React/Vue

For frameworks without native signals, use `vars()` to bind dynamic values. The `cx()` returns an object with both `className` and `style`:

```tsx
// React - Reactive values with vars()
import { useState } from "react";
import { useStyle, vars } from "@semajsx/style/react";
import { classes, rule } from "@semajsx/style";

const c = classes(["box"]);

// Define style with placeholder variables
const boxStyle = rule`${c.box} {
  height: var(--h);
  background: var(--bg);
  transition: all 0.3s;
}`;

function Box() {
  const [height, setHeight] = useState(100);
  const [color, setColor] = useState("#3b82f6");
  const cx = useStyle();

  // vars() creates CSS variable bindings
  const { className, style } = cx(boxStyle, vars({ "--h": `${height}px`, "--bg": color }));

  return (
    <div className={className} style={style} onClick={() => setHeight((h) => h + 10)}>
      Click to grow
    </div>
  );
}

// Rendered:
// <div class="box-x7f3a" style="--h: 100px; --bg: #3b82f6">
```

`vars()` helper:

```ts
interface VarsToken {
  __vars: Record<string, string>;
  __isVars: true;
}

function vars(values: Record<string, string>): VarsToken {
  return { __vars: values, __isVars: true };
}

// Updated cx() to handle vars
function cx(...args): { className: string; style?: Record<string, string> } {
  const classes: string[] = [];
  let styleVars: Record<string, string> | undefined;

  for (const arg of args) {
    if (!arg) continue;

    if (isVarsToken(arg)) {
      styleVars = { ...styleVars, ...arg.__vars };
    } else if (isStyleToken(arg)) {
      inject(arg);
      if (arg._) classes.push(arg._);
    } else if (typeof arg === "string") {
      classes.push(arg);
    }
  }

  return {
    className: classes.join(" "),
    ...(styleVars && { style: styleVars }),
  };
}
```

Vue with reactive refs:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useStyle, vars } from "@semajsx/style/vue";

const height = ref(100);
const cx = useStyle();

const { className, style } = cx(boxStyle, vars({ "--h": `${height.value}px` }));
</script>

<template>
  <div :class="className" :style="style" @click="height += 10">Click to grow</div>
</template>
```

**SemaJSX vs React/Vue for reactive styles:**

| Aspect           | SemaJSX (Signal)                    | React/Vue (vars())                |
| ---------------- | ----------------------------------- | --------------------------------- |
| Definition       | `rule\`..${signal}px..\``           | `rule\`..var(--h)..\``+`vars()`   |
| Auto-binding     | Yes - signal subscription automatic | No - manual `vars()` call         |
| Re-render needed | No - direct DOM update              | Yes - React/Vue re-render         |
| Syntax           | `<div class={boxStyle}>`            | `<div className={cn} style={st}>` |

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

export const button = {
  root: rule`${c.button} { ... }`,
  icon: rule`${c.button} > ${c.icon} { ... }`,
};

// card.style.ts
import { rule } from "@semajsx/style";
import { c } from "./tokens";

export const card = {
  root: rule`${c.card} { ... }`,
  button: rule`${c.card} ${c.button} { width: 100%; }`,
};
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

Predefined Tailwind scale values are exported as direct properties with JSDoc comments for IDE hover hints. JSDoc is placed directly on the object properties:

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
  _: string; // "p-v"
  __var: string; // "--p"
  __value: string; // "4px"
  __isArbitrary: true;
}

export function p(strings: TemplateStringsArray, ...values: unknown[]): ArbitraryStyleToken {
  const value = String.raw(strings, ...values);
  return {
    _: "p-v",
    __var: "--p",
    __value: value,
    __isArbitrary: true,
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

## 12. Alternatives Considered

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

## 13. Risks and Mitigation

| Risk                               | Impact | Probability | Mitigation                                                     |
| ---------------------------------- | ------ | ----------- | -------------------------------------------------------------- |
| CSS string parsing overhead        | Medium | Low         | Parsing happens once at definition time, not render time       |
| Hash collisions                    | High   | Very Low    | Use crypto-grade hash + namespace prefix + collision detection |
| Memory leaks from injected styles  | Medium | Medium      | Use WeakSet for tracking, provide explicit cleanup API         |
| Breaking existing class prop usage | High   | Low         | StyleToken stringifies to class name, backward compatible      |
| Layout thrashing on first inject   | Medium | Medium      | Batch injections, provide preload API                          |
| Invalid CSS strings                | Low    | Medium      | Validate at definition time in dev mode, skip invalid rules    |
| Target element removed from DOM    | Medium | Low         | WeakRef for targets, auto-cleanup on GC                        |

### 13.1 Memory Management Strategy

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

### 13.2 Performance: Explicit Preload

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

### 13.3 Error Handling

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

## 14. Shadow DOM Considerations

### 14.1 Nested Shadow DOM

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

### 14.2 Anchor Target Removal

```ts
// When anchor target is removed from DOM
const registry = createRegistry({ target: shadowRoot });

// Later, shadowRoot is removed
shadowRoot.host.remove();

// Next injection attempt detects removed target
registry.inject(button); // No-op, logs warning in dev mode
```

### 14.3 Multiple Shadow Roots Performance

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

- [ ] Create design document: `docs/designs/style-system-design.md`
- [ ] Implement `@semajsx/style` package
- [ ] Integrate with `@semajsx/dom` class property handling
- [ ] Add StyleAnchor components
- [ ] Implement `preload()` and automatic batching
- [ ] Write documentation and examples
- [ ] Create Vite plugin for `.css` transformation (optional)

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
- **VarsToken**: A token containing CSS variable bindings for React/Vue reactive values
- **ReactiveVar**: Signal binding info for SemaJSX reactive CSS variables
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
| 2026-01-10 | Added vars() helper for React/Vue reactive CSS variables                  | SemaJSX Team |

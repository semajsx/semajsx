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

The key insight is treating **each `style()` call as a tree-shakeable unit**. If a `style()` export isn't imported, its CSS is eliminated entirely.

---

## 7. High-Level Proposal

### 7.1 Core Concept: Style as Module

```ts
// button.style.ts
import { classes, style } from "@semajsx/style";

const c = classes(["root", "icon", "label"]);

export const button = style(
  c,
  `
  .${c.root} {
    padding: 8px 16px;
  }
  .${c.root}:hover {
    background: var(--hover);
  }
  .${c.icon} {
    width: 18px;
  }
  .${c.root} > .${c.icon} {
    margin-right: 8px;
  }
`,
);
```

### 7.2 Key Components

1. **ClassRef**: A reference to a class name that stringifies to a hashed value
2. **StyleBundle**: Contains StyleTokens for each class + the CSS string
3. **StyleToken**: A class name reference that carries its CSS for injection
4. **StyleAnchor**: Controls where styles are injected in the DOM

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

#### `style(refs: ClassRefs, css: string): StyleBundle`

Binds CSS to class references, returns a bundle.

```ts
const button = style(
  c,
  `
  .${c.root} { padding: 8px; }
  .${c.root}:hover { background: blue; }
`,
);

// button.root is a StyleToken
// button.icon is a StyleToken
// button.__css is the full CSS string
// button.__injected is a Set of injection targets
```

#### `inject(bundle: StyleBundle, options?): () => void`

Manually injects styles into DOM. Returns cleanup function.

```ts
// Inject to document.head (default)
const cleanup = inject(button);

// Inject to specific target
inject(button, { target: shadowRoot });

// Cleanup removes the <style> element
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

// Style token (used in class prop)
interface StyleToken {
  readonly _: string; // hashed class name
  readonly __bundle: StyleBundle;
  toString(): string;
}

// Style bundle (returned by style())
interface StyleBundle<T extends readonly string[]> {
  readonly [K in T[number]]: StyleToken;
  readonly __css: string;
  readonly __injected: Set<Element | ShadowRoot>;
}

// Registry options
interface RegistryOptions {
  target?: Element | ShadowRoot;
  dedupe?: boolean;
}
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
import { classes, style } from "@semajsx/style";

const c = classes(["root", "icon", "label", "large", "primary"]);

export const button = style(
  c,
  `
  .${c.root} {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .${c.root}:hover {
    transform: translateY(-1px);
  }

  .${c.root}:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .${c.icon} {
    width: 18px;
    height: 18px;
  }

  .${c.root} > .${c.icon}:first-child {
    margin-right: 8px;
  }

  .${c.label} {
    font-weight: 500;
  }

  .${c.large} {
    padding: 12px 24px;
  }

  .${c.primary} {
    background: var(--primary);
    color: white;
  }
`,
);
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

### 9.3 Standalone (React/Vue/Vanilla)

```tsx
// React
import { button, inject } from "./button.style";
import { useEffect } from "react";

function Button({ children }) {
  useEffect(() => inject(button), []);

  return <button className={String(button.root)}>{children}</button>;
}
```

```ts
// Vanilla JS
import { button, inject } from "./button.style";

inject(button);

const btn = document.createElement("button");
btn.className = String(button.root);
```

### 9.4 Global Styles

```ts
const c = classes(["reset"]);

export const globals = style(
  c,
  `
  /* Global styles - use regular selectors */
  :root {
    --primary: #3b82f6;
    --hover: #2563eb;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: system-ui, sans-serif;
  }

  /* Scoped class still works */
  .${c.reset} {
    all: unset;
  }
`,
);

// Inject globals at app start
inject(globals);
```

### 9.5 Shared Class Names Across Files

```ts
// tokens.ts
export const c = classes(["button", "card", "input", "icon"]);

// button.style.ts
import { c } from "./tokens";

export const button = style(
  c,
  `
  .${c.button} { ... }
  .${c.button} > .${c.icon} { ... }
`,
);

// card.style.ts
import { c } from "./tokens";

export const card = style(
  c,
  `
  .${c.card} { ... }
  .${c.card} .${c.button} { width: 100%; }
`,
);
```

---

## 10. Alternatives Considered

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

## 11. Risks and Mitigation

| Risk                               | Impact | Probability | Mitigation                                                |
| ---------------------------------- | ------ | ----------- | --------------------------------------------------------- |
| CSS string parsing overhead        | Medium | Low         | Parsing happens once at definition time, not render time  |
| Hash collisions                    | High   | Very Low    | Use crypto-grade hash + namespace prefix                  |
| Memory leaks from injected styles  | Medium | Medium      | Track injection targets, provide cleanup API              |
| Breaking existing class prop usage | High   | Low         | StyleToken stringifies to class name, backward compatible |

---

## 12. Dependencies

### 12.1 Technical Dependencies

- None for core `@semajsx/style` package
- `@semajsx/dom` for SemaJSX integration (optional)

### 12.2 Optional Build Tools

- Vite plugin for `.css` → `.css.ts` transformation
- CSS minification in production builds

---

## 13. Open Questions

- [ ] **Q1**: Should CSS be auto-split per class for finer tree-shaking?
  - **Context**: Currently, entire `style()` block is one unit
  - **Options**: A) Keep as-is (simpler), B) Compile-time splitting
  - **Leaning**: A - per-component granularity is sufficient

- [ ] **Q2**: How to handle CSS custom properties (variables)?
  - **Context**: Variables don't need hashing but should be type-safe
  - **Options**: A) Separate API, B) Convention (--prefix), C) Just use strings

- [ ] **Q3**: Should we provide a CSS-to-TS transformation tool?
  - **Context**: Users may prefer writing `.css` files
  - **Options**: A) Vite plugin, B) CLI tool, C) Both, D) None (manual)

---

## 14. Success Criteria

- [ ] `@semajsx/style` works standalone with any framework
- [ ] Tree-shaking eliminates unused style bundles
- [ ] Native CSS syntax with full IDE support
- [ ] Type-safe class name references
- [ ] Shadow DOM injection works correctly
- [ ] Zero runtime CSS parsing (parse once at definition)
- [ ] Backward compatible with existing string class names

---

## 15. Next Steps

If accepted:

- [ ] Create design document: `docs/designs/style-system-design.md`
- [ ] Implement `@semajsx/style` package
- [ ] Integrate with `@semajsx/dom` class property handling
- [ ] Add StyleAnchor components
- [ ] Write documentation and examples
- [ ] Create Vite plugin for `.css` transformation (optional)

---

## 16. Appendix

### References

- [CSS Modules](https://github.com/css-modules/css-modules)
- [Vanilla Extract](https://vanilla-extract.style/)
- [StyleX](https://stylexjs.com/)
- [Panda CSS](https://panda-css.com/)
- [Shadow DOM Styling](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)

### Glossary

- **ClassRef**: A reference object that stringifies to a hashed class name
- **StyleToken**: A ClassRef bound to its CSS, used in class props
- **StyleBundle**: Collection of StyleTokens + full CSS string
- **App Anchor**: Global style injection target (default: document.head)
- **Component Anchor**: Per-component injection target (doesn't affect children)

### Change Log

| Date       | Change        | Author       |
| ---------- | ------------- | ------------ |
| 2026-01-10 | Initial draft | SemaJSX Team |

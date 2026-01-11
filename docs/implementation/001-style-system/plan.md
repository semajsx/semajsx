# Implementation Plan: Style System

**Priority**: P0 (Blocks all subsequent work)
**Status**: 📝 Planned
**Estimated Complexity**: High (multiple interdependent modules)

---

## 🎯 Goal

Implement the complete style system as defined in RFC 006, including:

- Core API (`classes()`, `rule()`, `rules()`)
- Style injection to DOM and Shadow DOM
- Signal-reactive styles with CSS variables
- Memory-safe cleanup mechanisms

---

## 📊 Task Dependency Graph

```
Project Setup (Foundation)
    ↓
    ├─→ classes() Implementation
    │       ↓
    ├─→ rule() Implementation ──→ rules() Combinator
    │       ↓                           ↓
    │   Signal Detection ───────────────┘
    │       ↓
    └─→ StyleRegistry ──→ CSS Injection ──→ Memory Management
            ↓
        Signal-Reactive Styles
            ↓
        Integration Testing
```

---

## 📋 Task Groups

### Task Group 1: Foundation Setup

**Priority**: P0 (Must complete first)
**Complexity**: Low
**Dependencies**: None
**Estimated Effort**: Quick setup task

#### Tasks

- [ ] Create `packages/style/` directory structure

  ```
  packages/style/
  ├── src/
  │   ├── classes.ts
  │   ├── rule.ts
  │   ├── rules.ts
  │   ├── registry.ts
  │   ├── inject.ts
  │   ├── types.ts
  │   └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── README.md
  ```

- [ ] Configure `package.json`
  - Name: `@semajsx/style`
  - Dependencies: `@semajsx/signal`, `nanoid`
  - Exports: Main, React, Server subpaths

- [ ] Configure `tsconfig.json` (extend `@semajsx/configs`)
- [ ] Setup Vitest test environment
- [ ] Write basic README.md

#### Validation Criteria

```bash
# All must pass before proceeding
bun run build          # ✅ Builds without errors
bun run test           # ✅ Test runner works
bun run typecheck      # ✅ TypeScript strict mode passes
```

#### Blocking Next Steps

- ❌ Cannot implement `classes()` without package structure
- ❌ Cannot write tests without Vitest setup

---

### Task Group 2: Core API - `classes()`

**Priority**: P0
**Complexity**: Low-Medium
**Dependencies**: Task Group 1 (Foundation Setup)
**Estimated Effort**: Straightforward implementation with type inference

#### API Signature

```typescript
export function classes<T extends readonly string[]>(names: T): ClassRefs<T>;

export interface ClassRef {
  _: string; // Generated class name
  toString(): string; // For template interpolation
}

type ClassRefs<T> = {
  [K in T[number]]: ClassRef;
};
```

#### Implementation Tasks

- [ ] Define `ClassRef` class
  - `_` property: stores hashed class name
  - `toString()` method: returns hashed name

- [ ] Implement hash generation using `nanoid`
  - Length: 8 characters
  - Format: `{originalName}-{hash}` (e.g., `root-abc12345`)

- [ ] Implement `classes()` function
  - Create ClassRef for each name
  - Return typed object with proper inference

- [ ] Write unit tests (Target: ≥90% coverage)
  - Hash generation uniqueness
  - toString() behavior
  - Type inference validation

#### Reference Implementation

```typescript
import { nanoid } from "nanoid";

export class ClassRef {
  constructor(public readonly _: string) {}

  toString(): string {
    return this._;
  }
}

export function classes<T extends readonly string[]>(names: T): ClassRefs<T> {
  const result = {} as ClassRefs<T>;

  for (const name of names) {
    const hash = nanoid(8);
    const className = `${name}-${hash}`;
    result[name as T[number]] = new ClassRef(className);
  }

  return result;
}
```

#### Validation Criteria

**Functional Tests**:

```typescript
const c = classes(["root", "icon"]);
assert(c.root._ !== c.icon._); // ✅ Unique hashes
assert(typeof c.root.toString() === "string"); // ✅ toString works
```

**Type Safety Tests**:

```typescript
const c = classes(["root", "icon"]);
c.root; // ✅ Type-safe access
c.invalid; // ❌ TypeScript error (expected)
```

**Coverage**:

```bash
bun run test:coverage
# ✅ Coverage ≥90% for classes.ts
```

#### Blocking Next Steps

- ❌ Cannot implement `rule()` without ClassRef
- ❌ Cannot test style injection without class names

---

### Task Group 3: Core API - `rule()` Tagged Template

**Priority**: P0
**Complexity**: Medium-High (Template parsing + Signal detection)
**Dependencies**: Task Group 2 (classes() complete)
**Estimated Effort**: Complex due to multiple interpolation types

#### API Signature

```typescript
export function rule(
  strings: TemplateStringsArray,
  ...values: Array<ClassRef | Signal<any> | string | number>
): StyleToken;

export interface StyleToken {
  _: string; // Primary class name
  __cssTemplate: string; // CSS string
  __signalBindings?: SignalBindingDef[]; // If contains signals
}

export interface SignalBindingDef {
  index: number; // Position in template
  signal: Signal<any>; // The signal
  placeholder: string; // e.g., "{{0}}"
}
```

#### Implementation Tasks

- [ ] Template string parsing
  - Join strings with interpolated values
  - Track positions of each interpolation

- [ ] ClassRef interpolation
  - Detect ClassRef objects
  - Replace with `.{className}` selector
  - Extract primary class name for `_` property

- [ ] Signal detection (from `@semajsx/signal`)
  - Use `isSignal()` helper
  - Generate placeholder: `{{index}}`
  - Record SignalBindingDef metadata

- [ ] Plain value interpolation
  - Convert to string
  - Insert directly into CSS

- [ ] Write unit tests (Target: ≥90% coverage)
  - ClassRef interpolation
  - Signal detection and placeholder generation
  - Plain values (strings, numbers)
  - Complex CSS syntax (nested rules, pseudo-classes)
  - Edge cases (empty template, no interpolations)

#### Reference Implementation

```typescript
import { isSignal, type Signal } from "@semajsx/signal";

export function rule(strings: TemplateStringsArray, ...values: unknown[]): StyleToken {
  let css = "";
  let primaryClassName = "";
  const signalBindings: SignalBindingDef[] = [];

  for (let i = 0; i < strings.length; i++) {
    css += strings[i];

    if (i < values.length) {
      const value = values[i];

      if (value instanceof ClassRef) {
        css += `.${value._}`;
        if (!primaryClassName) {
          primaryClassName = value._;
        }
      } else if (isSignal(value)) {
        const placeholder = `{{${signalBindings.length}}}`;
        css += placeholder;
        signalBindings.push({
          index: signalBindings.length,
          signal: value as Signal<any>,
          placeholder,
        });
      } else {
        css += String(value);
      }
    }
  }

  return {
    _: primaryClassName,
    __cssTemplate: css,
    __signalBindings: signalBindings.length > 0 ? signalBindings : undefined,
  };
}
```

#### Validation Criteria

**ClassRef Interpolation**:

```typescript
const c = classes(["box"]);
const token = rule`${c.box} { padding: 8px; }`;
assert(token._ === c.box._); // ✅ Primary class extracted
assert(token.__cssTemplate.includes(c.box._)); // ✅ Selector inserted
```

**Signal Detection**:

```typescript
const height = signal(100);
const token = rule`height: ${height}px;`;
assert(token.__signalBindings?.length === 1); // ✅ Signal detected
assert(token.__cssTemplate.includes("{{0}}")); // ✅ Placeholder generated
```

**Plain Values**:

```typescript
const token = rule`color: ${"red"}; font-size: ${16}px;`;
assert(token.__cssTemplate.includes("red")); // ✅ String inserted
assert(token.__cssTemplate.includes("16")); // ✅ Number converted
```

**Coverage**:

```bash
bun run test:coverage
# ✅ Coverage ≥90% for rule.ts
```

#### Blocking Next Steps

- ❌ Cannot implement `rules()` combinator without StyleToken
- ❌ Cannot implement signal-reactive styles without signal bindings

---

### Task Group 4: Core API - `rules()` Combinator

**Priority**: P0
**Complexity**: Low-Medium (Token merging logic)
**Dependencies**: Task Group 3 (rule() complete)
**Estimated Effort**: Straightforward merging with placeholder renumbering

#### API Signature

```typescript
export function rules(...tokens: StyleToken[]): StyleToken;
```

#### Implementation Tasks

- [ ] Merge multiple StyleTokens
  - Concatenate CSS templates
  - Combine signal bindings (renumber placeholders)
  - Use first token's class name as primary

- [ ] Handle edge cases
  - Empty array (throw error)
  - Single token (pass through)
  - Duplicate signal bindings

- [ ] Write unit tests (Target: ≥90% coverage)
  - Multiple token merging
  - Signal placeholder renumbering
  - Edge case handling

#### Reference Implementation

```typescript
export function rules(...tokens: StyleToken[]): StyleToken {
  if (tokens.length === 0) {
    throw new Error("rules() requires at least one token");
  }

  if (tokens.length === 1) {
    return tokens[0];
  }

  let combinedCSS = "";
  const combinedBindings: SignalBindingDef[] = [];
  let primaryClassName = tokens[0]._;

  for (const token of tokens) {
    combinedCSS += token.__cssTemplate + "\n";

    if (token.__signalBindings) {
      for (const binding of token.__signalBindings) {
        const newIndex = combinedBindings.length;
        const newPlaceholder = `{{${newIndex}}}`;
        combinedCSS = combinedCSS.replace(binding.placeholder, newPlaceholder);

        combinedBindings.push({
          ...binding,
          index: newIndex,
          placeholder: newPlaceholder,
        });
      }
    }
  }

  return {
    _: primaryClassName,
    __cssTemplate: combinedCSS,
    __signalBindings: combinedBindings.length > 0 ? combinedBindings : undefined,
  };
}
```

#### Validation Criteria

**Multiple Tokens**:

```typescript
const t1 = rule`color: red;`;
const t2 = rule`background: blue;`;
const combined = rules(t1, t2);
assert(combined.__cssTemplate.includes("red")); // ✅ First token included
assert(combined.__cssTemplate.includes("blue")); // ✅ Second token included
```

**Signal Placeholder Renumbering**:

```typescript
const sig1 = signal(10);
const sig2 = signal(20);
const t1 = rule`padding: ${sig1}px;`; // Placeholder: {{0}}
const t2 = rule`margin: ${sig2}px;`; // Placeholder: {{0}}
const combined = rules(t1, t2);
assert(combined.__signalBindings?.length === 2); // ✅ Both signals preserved
// Placeholders renumbered to {{0}}, {{1}}
```

**Coverage**:

```bash
bun run test:coverage
# ✅ Coverage ≥90% for rules.ts
```

---

### Task Group 5: Style Injection - StyleRegistry

**Priority**: P0
**Complexity**: Medium (State management + DOM manipulation)
**Dependencies**: Task Group 3 (rule() complete)
**Estimated Effort**: Registry pattern with deduplication logic

#### API Signature

```typescript
export class StyleRegistry {
  constructor(options?: RegistryOptions);

  setAnchorElement(element: HTMLElement | ShadowRoot): void;
  processToken(token: StyleToken): string;
  dispose(): void;

  private injectedClasses: Set<string>;
  private subscriptions: Array<() => void>;
  private anchorElement?: HTMLElement | ShadowRoot;
}

export interface RegistryOptions {
  target?: HTMLElement | ShadowRoot;
}
```

#### Implementation Tasks

- [ ] Registry constructor
  - Initialize `injectedClasses` Set (for deduplication)
  - Initialize `subscriptions` array (for cleanup)
  - Set anchor element if provided

- [ ] `setAnchorElement()` method
  - Store reference to anchor element (HTMLElement or ShadowRoot)
  - Validate element type

- [ ] `processToken()` method (without signals initially)
  - Check if class already injected (Set lookup)
  - If not, inject CSS to target
  - Add class to `injectedClasses` Set
  - Return class name

- [ ] `dispose()` method
  - Unsubscribe all signal subscriptions
  - Clear injected classes Set
  - Clear anchor reference

- [ ] Write unit tests (Target: ≥90% coverage)
  - Deduplication (same token twice)
  - Multiple registries (isolation)
  - Disposal (cleanup verification)

#### Validation Criteria

**Deduplication**:

```typescript
const registry = new StyleRegistry();
const token = rule`color: red;`;

const class1 = registry.processToken(token);
const class2 = registry.processToken(token);
assert(class1 === class2); // ✅ Same class returned
// ✅ CSS only injected once (verify DOM)
```

**Multiple Registries**:

```typescript
const reg1 = new StyleRegistry();
const reg2 = new StyleRegistry();
const token = rule`color: red;`;

reg1.processToken(token);
reg2.processToken(token);
// ✅ Both registries track independently
```

**Disposal**:

```typescript
const registry = new StyleRegistry();
registry.processToken(token);
registry.dispose();
assert(registry.injectedClasses.size === 0); // ✅ Cleared
```

**Coverage**:

```bash
bun run test:coverage
# ✅ Coverage ≥90% for registry.ts
```

#### Blocking Next Steps

- ❌ Cannot inject CSS without registry
- ❌ Cannot implement signal-reactive styles without registry infrastructure

---

### Task Group 6: Style Injection - CSS Injection

**Priority**: P0
**Complexity**: Low-Medium (DOM manipulation + cleanup)
**Dependencies**: Task Group 5 (StyleRegistry complete)
**Estimated Effort**: DOM API usage with target flexibility

#### API Signature

```typescript
export function inject(tokens: StyleToken | StyleToken[], options?: InjectOptions): () => void;

export interface InjectOptions {
  target?: HTMLElement | ShadowRoot;
}
```

#### Implementation Tasks

- [ ] Create `<style>` element
  - Set `data-semajsx-style` attribute (for debugging)
  - Set `textContent` to CSS

- [ ] Insert into target
  - document.head (default)
  - ShadowRoot (if specified in options)

- [ ] Return cleanup function
  - Remove `<style>` element
  - Called when component unmounts

- [ ] Handle arrays of tokens
  - Process each token
  - Return combined cleanup function

- [ ] Write unit tests (Browser mode required)
  - Injection to document.head
  - Injection to Shadow DOM
  - Cleanup function removes elements
  - Multiple tokens

#### Reference Implementation

```typescript
export function inject(tokens: StyleToken | StyleToken[], options?: InjectOptions): () => void {
  const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
  const target = options?.target || document.head;
  const styleElements: HTMLStyleElement[] = [];

  for (const token of tokenArray) {
    const style = document.createElement("style");
    style.setAttribute("data-semajsx-style", token._);
    style.textContent = token.__cssTemplate;
    target.appendChild(style);
    styleElements.push(style);
  }

  return () => {
    for (const style of styleElements) {
      style.remove();
    }
  };
}
```

#### Validation Criteria

**Injection to document.head**:

```typescript
const token = rule`color: red;`;
const cleanup = inject(token);

const style = document.querySelector("[data-semajsx-style]");
assert(style !== null); // ✅ Style element created
assert(style.textContent.includes("red")); // ✅ CSS inserted
```

**Shadow DOM injection**:

```typescript
const shadow = element.attachShadow({ mode: "open" });
const token = rule`color: blue;`;
const cleanup = inject(token, { target: shadow });

assert(shadow.querySelector("style") !== null); // ✅ Injected to shadow
```

**Cleanup**:

```typescript
const cleanup = inject(token);
cleanup();
assert(document.querySelector("[data-semajsx-style]") === null); // ✅ Removed
```

**Coverage**:

```bash
bun run test:coverage
# ✅ Coverage ≥90% for inject.ts
```

---

### Task Group 7: Memory Management

**Priority**: P0
**Complexity**: Medium-High (Memory leak prevention)
**Dependencies**: Task Group 6 (CSS Injection complete)
**Estimated Effort**: Requires stress testing and profiling

#### Implementation Tasks

- [ ] Use WeakMap for injection state tracking
  - Map StyleToken → injection metadata
  - Automatic garbage collection when tokens unreferenced

- [ ] Stress test for memory leaks
  - Mount/unmount 1000+ times
  - Monitor memory usage (if `performance.memory` available)
  - Verify no retained references

- [ ] Add safeguards
  - Clear subscriptions on dispose
  - Remove event listeners
  - Null out references

#### Validation Criteria

**Memory Leak Test**:

```typescript
test("no memory leak after 1000 mount/unmount cycles", () => {
  const initialMemory = performance.memory?.usedJSHeapSize;

  for (let i = 0; i < 1000; i++) {
    const registry = new StyleRegistry();
    registry.setAnchorElement(document.body);
    const className = registry.processToken(testToken);
    registry.dispose();
  }

  // Force GC if available
  if (global.gc) global.gc();

  const finalMemory = performance.memory?.usedJSHeapSize;
  const growth = finalMemory - initialMemory;

  // Memory growth should be minimal (<1MB)
  expect(growth).toBeLessThan(1024 * 1024); // ✅ No leak
});
```

**WeakMap Usage**:

```typescript
// Verify WeakMap allows garbage collection
let token = rule`color: red;`;
const registry = new StyleRegistry();
registry.processToken(token);

token = null; // Unreference token
// ✅ Token should be garbage-collectable (WeakMap doesn't prevent GC)
```

#### Blocking Next Steps

- ❌ Cannot implement signal-reactive styles without memory-safe foundation

---

### Task Group 8: Signal-Reactive Styles

**Priority**: P0
**Complexity**: High (Signal integration + CSS variables)
**Dependencies**:

- Task Group 3 (rule() with signal detection)
- Task Group 5 (StyleRegistry)
- Task Group 7 (Memory management)
  **Estimated Effort**: Complex integration requiring coordination

#### Implementation Tasks

- [ ] Enhance `StyleRegistry.processToken()` for signals
  - Check if token has signal bindings
  - For each signal:
    - Generate CSS variable name: `--sig-{nanoid()}`
    - Replace placeholder `{{index}}` with `var(--sig-xxx)`
    - Set initial value on anchor element
    - Subscribe to signal changes

- [ ] Signal subscription management

  ```typescript
  const unsubscribe = signal.subscribe((value) => {
    anchorElement.style.setProperty("--sig-xxx", String(value));
  });
  ```

  - Store unsubscribe function in `subscriptions` array
  - Call on `dispose()`

- [ ] CSS template transformation
  - Replace all placeholders with CSS variables
  - Inject modified CSS (not original template)

- [ ] Write integration tests (Browser mode required)
  - Basic signal style (single signal)
  - Multiple signals (independent updates)
  - Computed signals
  - Performance test (<2ms update latency)

#### Reference Implementation

```typescript
processToken(token: StyleToken): string {
  const className = token._;

  if (this.injectedClasses.has(className)) {
    return className;
  }

  let css = token.__cssTemplate;

  if (token.__signalBindings && this.anchorElement) {
    for (const binding of token.__signalBindings) {
      // Generate CSS variable name
      const varName = `--sig-${nanoid(8)}`;

      // Replace placeholder with var()
      css = css.replace(binding.placeholder, `var(${varName})`);

      // Set initial value
      const anchorEl = this.anchorElement as HTMLElement;
      anchorEl.style.setProperty(varName, String(binding.signal.value));

      // Subscribe to updates
      const unsubscribe = binding.signal.subscribe((value) => {
        anchorEl.style.setProperty(varName, String(value));
      });

      this.subscriptions.push(unsubscribe);
    }
  }

  // Inject CSS
  const style = document.createElement("style");
  style.textContent = css;
  const target = this.anchorElement || document.head;
  target.appendChild(style);

  this.injectedClasses.add(className);
  return className;
}
```

#### Validation Criteria

**Basic Signal Style**:

```typescript
const height = signal(100);
const c = classes(["box"]);
const boxStyle = rule`${c.box} { height: ${height}px; }`;

const registry = new StyleRegistry();
const container = document.createElement("div");
registry.setAnchorElement(container);
const className = registry.processToken(boxStyle);

// ✅ Initial value set
const varValue = container.style.getPropertyValue("--sig-xxx");
assert(varValue === "100px");

// Update signal
height.value = 200;

// ✅ Updated value reflected
const newValue = container.style.getPropertyValue("--sig-xxx");
assert(newValue === "200px");
```

**Multiple Signals**:

```typescript
const width = signal(100);
const height = signal(200);
const boxStyle = rule`${c.box} {
  width: ${width}px;
  height: ${height}px;
}`;

registry.processToken(boxStyle);

width.value = 150;
height.value = 250;

// ✅ Both variables updated independently
```

**Computed Signals**:

```typescript
const base = signal(10);
const doubled = computed([base], () => base.value * 2);
const style = rule`padding: ${doubled}px;`;

registry.processToken(style);

base.value = 20;
// ✅ Computed signal updates (doubled = 40)
```

**Performance Test**:

```typescript
test("signal update latency < 2ms", async () => {
  const sig = signal(0);
  const style = rule`width: ${sig}px;`;

  registry.processToken(style);

  const start = performance.now();
  sig.value = 100;
  await new Promise((r) => queueMicrotask(r));
  const end = performance.now();

  expect(end - start).toBeLessThan(2); // ✅ < 2ms
});
```

**Coverage**:

```bash
bun run test:coverage
# ✅ All signal integration tests pass
# ✅ Performance < 2ms per update
# ✅ No memory leaks with signals
```

---

## 📦 Deliverables

All tasks must be complete before marking this implementation as done:

### Code

- ✅ `@semajsx/style` package fully implemented
  - `classes()`, `rule()`, `rules()` APIs
  - StyleRegistry with deduplication
  - CSS injection (document.head + Shadow DOM)
  - Signal-reactive styles

### Tests

- ✅ Unit tests: ≥80% coverage across all modules
- ✅ Integration tests: All scenarios passing
- ✅ Performance tests: Meet benchmarks (<2ms signal updates)
- ✅ Memory leak tests: Pass (1000+ cycles)

### Documentation

- ✅ API reference (all public functions documented)
- ✅ Usage examples (≥5 scenarios)
- ✅ README.md complete

### Metrics

- ✅ Bundle size: ≤15KB (gzipped)

  ```bash
  bun run build
  du -h dist/index.js | grep -o '^[0-9]*K'  # Should be ≤15
  ```

- ✅ Signal update latency: <2ms

  ```bash
  bun run test:perf
  # All performance tests pass
  ```

- ✅ Memory: No leaks in 1000+ cycles
  ```bash
  bun run test:memory
  # Memory growth <1MB
  ```

---

## ⚠️ Risk Assessment

### High-Risk Areas

**1. Shadow DOM Complexity**

- **Risk**: Shadow DOM has different scoping rules
- **Mitigation**:
  - Study Shadow DOM specs before implementing injection
  - Create prototype early
  - Add extensive browser tests

**2. Signal Integration**

- **Risk**: Signal subscription lifecycle management
- **Mitigation**:
  - `@semajsx/signal` is production-ready (low risk)
  - Clear API: `isSignal()`, `.value`, `.subscribe()`
  - Test with existing signal examples from other packages

**3. Performance Targets**

- **Risk**: May not achieve <2ms signal update latency
- **Mitigation**:
  - Benchmark continuously during implementation
  - Profile critical paths
  - Consider batching updates if needed

---

## 🔗 Dependencies

### Upstream (Required before starting)

- ✅ RFC 006 accepted and finalized
- ✅ `@semajsx/signal` package available and stable

### Downstream (Blocked by this implementation)

- ⏳ React adapter (needs style system APIs)
- ⏳ Component library (needs style system for styling)

---

## 📚 Reference Materials

- **RFC 006**: `/docs/rfcs/006-style-system.md` (Complete design specification)
- **Signal Package**: `packages/signal/` (API reference and examples)
- **Nanoid Docs**: https://github.com/ai/nanoid (Hash generation library)
- **Shadow DOM Spec**: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM

---

**Last Updated**: 2026-01-11
**Agent Instructions**: Execute task groups in dependency order. Mark each validation criterion as complete before proceeding to dependent tasks. Report blockers immediately.

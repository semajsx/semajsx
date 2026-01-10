# Implementation Plan: Style System

**Timeline**: Phase 1, Weeks 1-6 (6 weeks)
**Priority**: P0 (Blocks all subsequent work)
**Status**: 📝 Planned

---

## 🎯 Goal

Implement the complete style system as defined in RFC 006, including:

- Core API (`classes()`, `rule()`, `rules()`)
- Style injection to DOM and Shadow DOM
- Signal-reactive styles with CSS variables
- Memory-safe cleanup mechanisms

---

## 📋 Week-by-Week Breakdown

### Week 1-2: Style System Core API

**Objective**: Implement foundational API for defining styles

#### Day 1-3: Project Setup

**Tasks**:

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

**Acceptance Criteria**:

- ✅ Package builds without errors
- ✅ Tests run (even if empty)
- ✅ TypeScript strict mode passes

---

#### Day 4-7: Implement `classes()`

**API Signature**:

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

**Implementation Tasks**:

- [ ] Define `ClassRef` interface
  - `_` property: stores hashed class name
  - `toString()` method: returns hashed name
- [ ] Implement hash generation using nanoid
  - Length: 8 characters
  - Format: `{originalName}-{hash}` (e.g., `root-abc12345`)
- [ ] Implement `classes()` function
  - Create ClassRef for each name
  - Return typed object
- [ ] Type inference tests
  ```typescript
  const c = classes(["root", "icon"]);
  c.root; // ✅ Type-safe
  c.invalid; // ❌ TypeScript error
  ```
- [ ] Unit tests (≥90% coverage)
  - Test hash generation uniqueness
  - Test toString() behavior
  - Test type safety

**Code Snippet**:

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

**Acceptance Criteria**:

- ✅ `classes()` returns type-safe object
- ✅ Each ClassRef has unique hashed name
- ✅ `toString()` works in template literals
- ✅ Unit tests pass with ≥90% coverage

---

#### Day 8-14: Implement `rule()` Tagged Template

**API Signature**:

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

**Implementation Tasks**:

- [ ] Template string parsing
  - Join strings with interpolated values
  - Track positions of each interpolation
- [ ] ClassRef interpolation
  - Detect ClassRef objects
  - Replace with `.{className}`
  - Extract primary class name for `_` property
- [ ] Signal detection
  - Use `isSignal()` from `@semajsx/signal`
  - Generate placeholder: `{{index}}`
  - Record SignalBindingDef
- [ ] Plain value interpolation
  - Convert to string
  - Insert directly
- [ ] CSS generation
  - Replace ClassRefs with actual selectors
  - Keep Signal placeholders for later
- [ ] StyleToken creation
  - Set `_` to primary class name
  - Set `__cssTemplate` to generated CSS
  - Set `__signalBindings` if signals present
- [ ] Unit tests
  - Test ClassRef interpolation
  - Test Signal detection
  - Test plain values
  - Test complex CSS (nested rules, pseudo-classes)
  - Test edge cases (empty template, no interpolations)

**Code Snippet**:

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

**Acceptance Criteria**:

- ✅ ClassRef interpolation works
- ✅ Signal detection creates placeholders
- ✅ Plain values convert correctly
- ✅ Complex CSS syntax supported
- ✅ Unit tests pass with ≥90% coverage

---

#### Day 8-14: Implement `rules()` Combinator

**API Signature**:

```typescript
export function rules(...tokens: StyleToken[]): StyleToken;
```

**Implementation Tasks**:

- [ ] Merge multiple StyleTokens
  - Concatenate CSS templates
  - Combine signal bindings (renumber placeholders)
  - Use first token's class name as primary
- [ ] Handle edge cases
  - Empty array
  - Single token (pass through)
  - Duplicate signal bindings
- [ ] Unit tests

**Code Snippet**:

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
        // Renumber placeholder
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

**Acceptance Criteria**:

- ✅ Multiple tokens merge correctly
- ✅ Signal placeholders renumbered
- ✅ Primary class name preserved
- ✅ Unit tests pass

---

### Week 3-4: Style Injection System

**Objective**: Inject CSS into DOM and Shadow DOM with deduplication

#### Day 1-3: Implement StyleRegistry

**API Signature**:

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

**Implementation Tasks**:

- [ ] Registry constructor
  - Initialize `injectedClasses` Set
  - Initialize `subscriptions` array
  - Set anchor element if provided
- [ ] `setAnchorElement()` method
  - Store reference to anchor element
  - Validate element type
- [ ] `processToken()` method (without signals first)
  - Check if class already injected
  - If not, inject CSS
  - Add class to `injectedClasses`
  - Return class name
- [ ] `dispose()` method
  - Unsubscribe all signal subscriptions
  - Clear injected classes Set
  - Clear anchor reference
- [ ] Unit tests
  - Test deduplication
  - Test multiple registries
  - Test disposal

**Acceptance Criteria**:

- ✅ Registry tracks injected classes
- ✅ Deduplication works
- ✅ Disposal cleans up properly

---

#### Day 4-7: Implement CSS Injection

**API Signature**:

```typescript
export function inject(tokens: StyleToken | StyleToken[], options?: InjectOptions): () => void;

export interface InjectOptions {
  target?: HTMLElement | ShadowRoot;
}
```

**Implementation Tasks**:

- [ ] Create `<style>` element
  - Set `data-semajsx-style` attribute
  - Set `textContent` to CSS
- [ ] Insert into target
  - document.head (default)
  - ShadowRoot (if specified)
- [ ] Return cleanup function
  - Remove `<style>` element
  - Called when component unmounts
- [ ] Handle arrays of tokens
  - Process each token
  - Return combined cleanup function
- [ ] Unit tests (browser mode)
  - Test injection to document.head
  - Test injection to Shadow DOM
  - Test cleanup function

**Code Snippet**:

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

**Acceptance Criteria**:

- ✅ CSS injected to correct target
- ✅ Multiple tokens supported
- ✅ Cleanup removes elements
- ✅ Shadow DOM works

---

#### Day 8-10: Memory Management

**Implementation Tasks**:

- [ ] Use WeakMap to track injection state
  - Map StyleToken → injection metadata
  - Automatic garbage collection
- [ ] Test memory leaks
  - Mount/unmount 1000+ times
  - Check memory usage
  - Verify no retained references
- [ ] Add safeguards
  - Clear subscriptions on dispose
  - Remove event listeners
  - Null out references

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
  expect(growth).toBeLessThan(1024 * 1024);
});
```

**Acceptance Criteria**:

- ✅ No memory leaks in stress test
- ✅ WeakMap used for auto cleanup
- ✅ All subscriptions cleared on dispose

---

### Week 5-6: Signal Reactive Styles

**Objective**: Support Signal values in styles with CSS variables

#### Day 1-3: Signal Detection in rule()

**Implementation Tasks**:

- [ ] Modify `rule()` to detect signals

  ```typescript
  import { isSignal } from "@semajsx/signal";

  if (isSignal(value)) {
    // Create placeholder
    // Record SignalBindingDef
  }
  ```

- [ ] Generate unique placeholders
  - Format: `{{index}}`
  - Sequential numbering
- [ ] Store SignalBindingDef array in StyleToken
- [ ] Unit tests
  - Test signal detection
  - Test placeholder generation
  - Test binding metadata

**Acceptance Criteria**:

- ✅ Signals detected correctly
- ✅ Placeholders generated
- ✅ Metadata stored in token

---

#### Day 4-7: CSS Variable Binding

**Implementation Tasks**:

- [ ] Enhance `StyleRegistry.processToken()`
  - Check if token has signal bindings
  - For each signal:
    - Generate CSS variable name: `--sig-{nanoid()}`
    - Replace placeholder `{{index}}` with `var(--sig-xxx)`
    - Set initial value on anchor element
    - Subscribe to signal changes
- [ ] Signal subscription
  ```typescript
  const unsubscribe = signal.subscribe((value) => {
    anchorElement.style.setProperty("--sig-xxx", String(value));
  });
  ```

  - Store unsubscribe function in `subscriptions` array
- [ ] Update CSS template
  - Replace all placeholders with CSS variables
  - Inject modified CSS
- [ ] Unit tests (browser mode)
  - Test variable generation
  - Test initial value setting
  - Test signal updates

**Code Snippet**:

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
  const style = document.createElement('style');
  style.textContent = css;
  const target = this.anchorElement || document.head;
  target.appendChild(style);

  this.injectedClasses.add(className);
  return className;
}
```

**Acceptance Criteria**:

- ✅ CSS variables generated
- ✅ Initial values set
- ✅ Signal subscriptions work
- ✅ Updates reflected in DOM

---

#### Day 8-10: Integration Testing

**Test Scenarios**:

1. **Basic Signal Style**:

```typescript
const height = signal(100);
const c = classes(["box"]);
const boxStyle = rule`${c.box} {
  height: ${height}px;
  transition: height 0.3s;
}`;

const registry = new StyleRegistry();
registry.setAnchorElement(containerEl);
const className = registry.processToken(boxStyle);

// Verify initial state
expect(containerEl.style.getPropertyValue("--sig-xxx")).toBe("100px");

// Update signal
height.value = 200;

// Verify updated
expect(containerEl.style.getPropertyValue("--sig-xxx")).toBe("200px");
```

2. **Multiple Signals**:

```typescript
const width = signal(100);
const height = signal(200);

const boxStyle = rule`${c.box} {
  width: ${width}px;
  height: ${height}px;
}`;

// Both variables should update independently
```

3. **Computed Signals**:

```typescript
const base = signal(10);
const doubled = computed([base], () => base.value * 2);

const style = rule`${c.box} {
  padding: ${doubled}px;
}`;

// Should react to computed changes
```

4. **Performance Test**:

```typescript
test("signal update latency < 2ms", async () => {
  const sig = signal(0);
  const style = rule`${c.box} { width: ${sig}px; }`;

  registry.processToken(style);

  const start = performance.now();
  sig.value = 100;
  await new Promise((r) => queueMicrotask(r));
  const end = performance.now();

  expect(end - start).toBeLessThan(2);
});
```

**Acceptance Criteria**:

- ✅ All integration tests pass
- ✅ Performance < 2ms per update
- ✅ No memory leaks
- ✅ Multiple signals work correctly

---

## 📦 Deliverables

By the end of Week 6, the following should be complete:

### Code

- ✅ `@semajsx/style` package fully implemented
- ✅ All APIs from RFC 006 working
- ✅ Signal reactivity complete

### Tests

- ✅ Unit tests: ≥80% coverage
- ✅ Integration tests: All scenarios pass
- ✅ Performance tests: Meet benchmarks
- ✅ Memory leak tests: Pass

### Documentation

- ✅ API reference (all public functions)
- ✅ Usage examples (5+ scenarios)
- ✅ README.md complete

### Metrics

- ✅ Bundle size: ≤15KB (gzipped)
- ✅ Signal update latency: <2ms
- ✅ Memory: No leaks in 1000+ cycles

---

## ⚠️ Risks & Mitigation

### Risk 1: Shadow DOM Complexity

**Likelihood**: Medium
**Impact**: High
**Mitigation**:

- Study Shadow DOM specs early
- Create prototype in Week 2
- Add extra 2 days buffer in Week 3-4

### Risk 2: Signal Integration Issues

**Likelihood**: Low
**Impact**: Medium
**Mitigation**:

- `@semajsx/signal` is production-ready
- Clear API (`isSignal()`, `.value`, `.subscribe()`)
- Test with existing signal examples

### Risk 3: Performance Not Meeting Targets

**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:

- Benchmark continuously during development
- Profile critical paths
- Consider batching if needed

---

## 🔗 Dependencies

**Upstream** (must be complete first):

- ✅ RFC 006 accepted
- ✅ `@semajsx/signal` package available

**Downstream** (blocked by this):

- ⏳ React adapter (Week 7-9)
- ⏳ Component library (Week 10-11)

---

## 📚 Reference Materials

- **RFC 006**: `/docs/rfcs/006-style-system.md`
- **Signal Package**: `packages/signal/`
- **Nanoid Docs**: https://github.com/ai/nanoid

---

**Last Updated**: 2026-01-10
**Status**: Ready to start

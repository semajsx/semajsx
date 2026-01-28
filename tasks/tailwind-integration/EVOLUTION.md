# Tailwind Integration Evolution

This document tracks the evolution of the Tailwind integration implementation.

---

## Requirement (2026-01-28)

### Problem Statement

The `@semajsx/style` system provides a powerful way to write tree-shakeable styles with native CSS syntax. However, for rapid UI development, Tailwind-style utility classes are highly productive. We need to bridge these two approaches.

### User Scenarios

1. **As a developer**, I want to use familiar Tailwind utility classes with type safety and IDE autocomplete
2. **As a team lead**, I want consistent styling without needing the full Tailwind build setup
3. **As a performance-focused developer**, I want only the utilities I use to be included in my bundle

### Success Criteria

- Type-safe utility classes with IDE autocomplete
- Tree-shakeable at the module level
- Arbitrary value support for custom values
- Deterministic class names for deduplication
- No runtime CSS parsing overhead

---

## Research (2026-01-28)

### RFC Analysis

The RFC (006-style-system.md Section 10) provides a detailed specification:

#### Key Design Decisions from RFC

1. **Template-First Approach** (10.2)
   - Define property + prefix once via `createUtility`
   - Generate all predefined values from the template
   - Ensures consistency between predefined and arbitrary values

2. **Arbitrary Values** (10.3)
   - Use same template as predefined values
   - Tagged template syntax: `p\`4px\``
   - Deterministic className via `valueToSuffix`

3. **Tree-Shaking Trade-off** (10.2)
   - Object exports for ergonomics (unlike component styles which use named exports)
   - Acceptable because utilities are small and used together
   - Module-level tree-shaking still works

4. **Deduplication Strategy** (10.3)
   - Deduplicate by className (not CSS hash)
   - Simpler and more efficient
   - Enabled by deterministic className generation

### Current Implementation Status

The `@semajsx/style` package provides:

- `classes()` - Generate hashed class name references
- `rule()` - Create StyleToken from tagged template
- `inject()` - Inject CSS into DOM
- `StyleRegistry` - Manage style injection

These primitives are sufficient to build Tailwind utilities on top.

### Design Considerations

1. **Package Structure**: Separate package vs. subpath export
   - Decision: New package `@semajsx/tailwind` for cleaner dependencies

2. **Value Generation**: Runtime vs. build-time
   - Decision: Hardcode Tailwind default scale values for zero runtime cost

3. **Naming Convention**: Match Tailwind exactly vs. optimize for JS
   - Decision: Camel case for JS (e.g., `bgBlue500` not `bg-blue-500`)

### Critical Issue: Non-Deterministic Class Names

**Discovery**: The current `classes()` in `@semajsx/style` uses `Date.now()`:

```ts
// packages/style/src/classes.ts line 28
const hash = hashString(name + Date.now().toString(36));
```

**Impact**:

- SSR hydration mismatch (server/client generate different names)
- Cannot cache CSS across builds
- Unpredictable class names for debugging

**Decision**: Tailwind package will NOT use `classes()`. Instead, use deterministic naming.

### Proposal: Improve `classes()` API in @semajsx/style

The discovery of `Date.now()` in `classes()` suggests a broader API redesign is needed. Here's a proposal:

#### Current Problem

```ts
// Current: always hashes with Date.now() (non-deterministic)
const c = classes(["root", "icon"]);
// c.root.toString() -> "root-x7f3a" (different each time!)
```

#### Proposed Solution: Flexible Options

```ts
interface ClassesOptions {
  /** Add prefix to all class names */
  prefix?: string;
  /** Hash strategy: false (default), "deterministic", or "unique" */
  hash?: false | "deterministic" | "unique";
  /** Namespace for deterministic hash (e.g., component name) */
  namespace?: string;
}
```

#### Usage Examples

```ts
// 1. Default: no hash (new behavior, breaking change)
const c = classes(["root", "icon"]);
// c.root.toString() -> "root"
// c.icon.toString() -> "icon"

// 2. With prefix (common for component libraries)
const c = classes(["root", "icon"], { prefix: "btn-" });
// c.root.toString() -> "btn-root"
// c.icon.toString() -> "btn-icon"

// 3. Deterministic hash (for guaranteed uniqueness, SSR-safe)
const c = classes(["root", "icon"], { hash: "deterministic", namespace: "Button" });
// c.root.toString() -> "Button-root-a1b2c" (same every time)
// c.icon.toString() -> "Button-icon-d3e4f" (same every time)

// 4. Unique hash (for runtime isolation, NOT SSR-safe)
const c = classes(["root", "icon"], { hash: "unique" });
// c.root.toString() -> "root-x7f3a" (different each time)
// Used for: dynamically created components that need isolation
```

#### Alternative: Separate Functions

```ts
// Option B: Different functions for different use cases
classes(["root", "icon"]); // "root", "icon"
prefixedClasses("btn-", ["root"]); // "btn-root"
hashedClasses(["root"], "Button"); // "Button-root-a1b2c" (deterministic)
uniqueClasses(["root"]); // "root-x7f3a" (unique each time)
```

#### Recommendation

**Option C (Factory function pattern)** is now preferred:

```ts
// Default classes() - deterministic hash (has value)
const c = classes(["root", "icon"]);
// c.root.toString() -> "root-a1b2c" (deterministic, NOT Date.now())

// Factory function - custom config
const myClasses = createClasses({
  hash: false, // no hash
  prefix: "btn-", // add prefix
});
const c = myClasses(["root"]);
// c.root.toString() -> "btn-root"

// Or with deterministic namespace
const buttonClasses = createClasses({
  hash: "deterministic",
  namespace: "Button",
});
const c = buttonClasses(["root"]);
// c.root.toString() -> "Button-root-a1b2c"
```

**Why factory function is better than single function + options:**

1. **Default has value**: `classes()` with hash justifies its existence (otherwise just use string)
2. **Configure once**: No need to pass options every call
3. **Consistent pattern**: Same as `createTailwind({ prefix: "s-" })`
4. **Simpler types**: No complex overloads or union types
5. **Scoped configs**: Different parts of app can have different configs

**Comparison:**

| Aspect          | Single fn + Options        | Factory Function          |
| --------------- | -------------------------- | ------------------------- |
| Default useful? | ❌ No hash = why use it?   | ✅ Hash = valuable        |
| Repetitive?     | ❌ Pass options every call | ✅ Configure once         |
| Pattern         | Unique                     | ✅ Same as createTailwind |
| Types           | Complex overloads          | Simple                    |

#### Migration Path

```ts
// Before (current behavior)
classes(["root"]); // "root-x7f3a" (random hash)

// After (new default)
classes(["root"]); // "root" (no hash)

// To get old behavior (if needed)
classes(["root"], { hash: "unique" }); // "root-x7f3a" (random)

// Better alternative (deterministic)
classes(["root"], { hash: "deterministic", namespace: "MyComponent" });
```

#### Implementation Note

This is a **breaking change** for `@semajsx/style`. Options:

1. Major version bump (v1.0.0 → v2.0.0)
2. New function name (`classNames()`) and deprecate `classes()`
3. Feature flag for migration period

**Scope**: This proposal is for `@semajsx/style`. The `@semajsx/tailwind` package will NOT use `classes()` at all - it generates class names directly (like `p-4`).

### Class Name Prefix Strategy (Deep Analysis)

**Why consider a prefix at all?**

1. **Collision avoidance**: User might have existing `.p-4` class
2. **Coexistence**: Might use alongside native Tailwind
3. **Debugging**: Know where a class comes from

**Why NOT use a prefix?**

1. **Familiarity**: `p-4` is what Tailwind users expect
2. **Size**: Every byte counts (especially with many utilities)
3. **Migration**: Easier to migrate from/to native Tailwind

**Analyzed Options**:

| Option       | Example     | Pros            | Cons           |
| ------------ | ----------- | --------------- | -------------- |
| No prefix    | `p-4`       | Familiar, short | Collision risk |
| Fixed `tw-`  | `tw-p-4`    | Safe, readable  | +3 chars       |
| Hash prefix  | `p-x7f3a-4` | Unique          | Ugly, +6 chars |
| Configurable | User choice | Flexible        | Complex API    |

**Final Decision**: **Configurable with no prefix as default**

```ts
// Default: native Tailwind compatibility
// No configuration needed
// Result: p-4, bg-blue-500

// For namespace isolation (e.g., library authors)
configureTailwind({ prefix: "s-" });
// Result: s-p-4, s-bg-blue-500
```

**Rationale**:

1. **Familiar**: No prefix matches native Tailwind class names
2. **Minimal**: No extra bytes in class names
3. **Migration-friendly**: Seamless switch from/to native Tailwind
4. **Opt-in isolation**: Use `s-` (SemaJSX) or custom prefix when needed
5. Avoid `tw-` as it implies Tailwind branding

### Hash Strategy for Arbitrary Values

**Problem**: Arbitrary values like `p\`calc(100% - 40px)\`` need short, unique class names.

**Requirements**:

1. Deterministic (SSR compatible)
2. Fast (runtime performance)
3. Short output (class name length)

**Options analyzed**:

| Method   | Deterministic | SSR Safe | Performance  |
| -------- | ------------- | -------- | ------------ |
| Date.now | ❌            | ❌       | ✅ Fast      |
| nanoid   | ❌            | ❌       | ⚠️ Random    |
| SHA/MD5  | ✅            | ✅       | ❌ Slow      |
| **djb2** | ✅            | ✅       | ✅✅ Fastest |

**Decision**: Use **djb2** (bit shifts + XOR only, ~0.001ms per hash).

**Performance strategy**:

1. **Avoid hash for simple values** (90% of cases): `4px` → `4px` directly
2. **Use djb2 for complex values** (10% of cases): `calc(...)` → `a1b2c`
3. **Optional cache** for heavy arbitrary value usage

**Real impact**: Hash is ~100x faster than DOM injection, not a bottleneck.

---

## Design (2026-01-28)

### Core API

```ts
// Predefined values via object export
import { spacing, colors } from "@semajsx/tailwind";

<div class={[spacing.p4, colors.bgBlue500]}>

// Arbitrary values via tagged template
import { p, bg } from "@semajsx/tailwind";

<div class={[p`10px`, bg`#ff5500`]}>
```

### Implementation Strategy

See README.md for detailed implementation phases:

1. Core Infrastructure
2. Spacing Utilities
3. Sizing Utilities
4. Color Utilities
5. Flexbox Utilities
6. Typography Utilities
7. Additional Utilities
8. Integration & Index

### File Structure

```
packages/tailwind/
├── src/
│   ├── index.ts           # Re-exports
│   ├── core.ts            # createUtility, valueToSuffix
│   ├── spacing.ts         # p, m, gap
│   ├── sizing.ts          # w, h
│   ├── colors.ts          # bg, text, border colors
│   ├── flex.ts            # flexbox utilities
│   ├── typography.ts      # font utilities
│   ├── display.ts         # display utilities
│   ├── position.ts        # position utilities
│   ├── border.ts          # border utilities
│   └── effects.ts         # opacity, shadow
├── package.json
└── tsconfig.json
```

---

## Implementation Log

### 2026-01-28: Planning Complete

- Created task workspace
- Documented implementation plan in README.md
- Identified 8 implementation phases
- Ready for Phase 1: Core Infrastructure

---

## Learnings

(To be filled after implementation)

---

## References

- [RFC 006-style-system.md](../../docs/rfcs/006-style-system.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Default Configuration](https://github.com/tailwindlabs/tailwindcss/blob/main/stubs/config.full.js)

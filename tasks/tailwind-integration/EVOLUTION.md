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

**Final Decision**: **Configurable with `tw-` default**

```ts
// Default: safe and readable
configureTailwind({ prefix: "tw-" });
// Result: tw-p-4, tw-bg-blue-500

// For Tailwind compatibility
configureTailwind({ prefix: "" });
// Result: p-4, bg-blue-500

// Custom namespace
configureTailwind({ prefix: "app-" });
// Result: app-p-4, app-bg-blue-500
```

**Rationale**:

1. Default is safe (won't conflict with native Tailwind)
2. Power users can opt for no prefix
3. Library authors can use custom prefix
4. All options are deterministic (no runtime variance)

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

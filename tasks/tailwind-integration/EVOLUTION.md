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

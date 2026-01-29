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

### Critical Discovery: Non-Deterministic Class Names

**Problem**: The `classes()` in `@semajsx/style` uses `Date.now()`:

```ts
// packages/style/src/classes.ts line 28
const hash = hashString(name + Date.now().toString(36));
```

**Impact**:

- SSR hydration mismatch (server/client generate different names)
- Cannot cache CSS across builds
- Unpredictable class names for debugging

**Decision**: Tailwind package will NOT use `classes()`. Instead, use deterministic naming.

---

## Design Evolution

### Phase 1: Initial Proxy-Based Design (Abandoned)

The original design mimicked Tailwind's string-based API:

```ts
// Original design - using Proxy for dynamic access
spacing.p["4"]; // → "p-4"
sizing.w["1/2"]; // → "w-1/2"
layout.zIndex["50"]; // → "z-50"
```

**Problems discovered**:

1. Awkward bracket notation (`["4"]`, `["1/2"]`)
2. String literals lose type safety benefits
3. Proxy overhead for simple value access
4. Not tree-shakeable (entire proxy object imported)

### Phase 2: Merged Naming Design (Final)

Key insight: **"Think in JS, not CSS"** (学我者生，似我者死)

Don't mechanically convert CSS patterns to JavaScript. Design for JavaScript's strengths:

```ts
// Final design - flat exports with merged naming
p4; // not p["4"]
wFull; // not w["full"] or w["100%"]
wHalf; // not w["1/2"]
z50; // not zIndex["50"]
```

**Why this works better**:

1. Natural JavaScript identifiers
2. Full tree-shaking support
3. IDE autocomplete shows all options
4. No runtime Proxy overhead
5. Semantic names for fractions (`wHalf` not `w["1/2"]`)

---

## Implementation Log

### 2026-01-28: Initial Planning

- Created task workspace
- Documented implementation plan
- Identified 8 implementation phases

### 2026-01-28: Core & Spacing (Phases 1-2)

- Implemented `createUtility` and `createTaggedUtility`
- Implemented spacing module with Proxy-based API
- First test suite passing

### 2026-01-28: Sizing & Colors (Phases 3-4)

- Implemented sizing with fractions
- Implemented color utilities
- Discovered issues with bracket notation

### 2026-01-28: Typography & Flexbox (Phases 5-6)

- Implemented typography utilities
- Implemented flexbox utilities
- Growing dissatisfaction with Proxy API

### 2026-01-28: API Redesign Decision

**Trigger**: User feedback on API ergonomics

**Key insight**: The Proxy-based API was mimicking CSS too closely:

- `p["4"]` looks like array access, not styling
- `w["1/2"]` requires string literals everywhere
- `zIndex["50"]` is verbose and awkward

**Decision**: Complete API redesign with merged naming

### 2026-01-28: Merged Naming Implementation

Redesigned all modules:

| Module     | Old API                       | New API         |
| ---------- | ----------------------------- | --------------- |
| Spacing    | `spacing.p["4"]`              | `p4`            |
| Sizing     | `sizing.w["1/2"]`             | `wHalf`         |
| Typography | `typography.fontSize["base"]` | `textBase`      |
| Layout     | `layout.zIndex["50"]`         | `z50`           |
| Effects    | `effects.opacity["50"]`       | `opacity50`     |
| Flexbox    | `flex.justify.center`         | `justifyCenter` |

### 2026-01-28: cx() Helper Added

Essential for composing utilities:

```ts
import { cx, p4, wFull, roundedLg } from "@semajsx/tailwind";
<div class={cx(p4, wFull, roundedLg)}>
```

### 2026-01-28: Final Testing

- All 287 tests passing
- All modules redesigned
- Documentation updated

---

## Learnings

### 1. Don't Mechanically Convert Patterns

**学我者生，似我者死** (Those who learn from me live; those who copy me die)

Tailwind's string-based API works for HTML templates. JavaScript has different strengths:

- Static analysis (tree-shaking)
- Type inference (autocomplete)
- First-class values (composition)

The right approach: **Design for JavaScript, not CSS-in-JS**.

### 2. Flat Exports Beat Proxies

Proxy-based APIs seem elegant but have hidden costs:

- No tree-shaking (entire object imported)
- Runtime overhead
- Debugging difficulty
- TypeScript complexity

Flat exports are simpler and more efficient:

```ts
// Import only what you use
import { p4, wFull } from "@semajsx/tailwind";
```

### 3. Semantic Names for Non-Numeric Values

Fractions and percentages need semantic names:

| CSS Value | Bad JS Name   | Good JS Name |
| --------- | ------------- | ------------ |
| `50%`     | `w["50%"]`    | `wHalf`      |
| `33.333%` | `w["1/3"]`    | `wThird`     |
| `100%`    | `w["full"]`   | `wFull`      |
| `100vh`   | `h["screen"]` | `hScreen`    |

### 4. cx() is Essential

Without `cx()`, composing utilities is awkward:

```ts
// Without cx() - array join or template
<div class={[p4._, wFull._, roundedLg._].join(" ")}>

// With cx() - clean and type-safe
<div class={cx(p4, wFull, roundedLg)}>
```

The helper also handles:

- Conditional classes (`isActive && bgBlue500`)
- Nested arrays (`[base, colors]`)
- Falsy values (filtered out)

### 5. Namespace vs Flat: Both Have Value

**Flat exports** for common usage:

```ts
import { p4, wFull, textBase } from "@semajsx/tailwind";
```

**Namespaces** for organization:

```ts
import { spacing, sizing, typography } from "@semajsx/tailwind";
spacing.p4;
sizing.wFull;
```

Both patterns supported - user chooses based on preference.

### 6. Decimals via Tagged Templates

Decimal scale values (0.5, 1.5, 2.5, 3.5) are rarely used and look awkward as flat exports (`p0_5`). Better approach:

```ts
// Use tagged template for decimal values
p`0.5`; // → padding: 0.5
m`1.5`; // → margin: 1.5

// Clean and readable - no awkward underscore naming
```

### 7. Test Everything

287 tests catch:

- Class name generation
- CSS template correctness
- Namespace completeness
- Edge cases (arbitrary values, escaping)

---

## Technical Decisions

### Why djb2 Hash?

For arbitrary values with complex expressions:

| Method   | Deterministic | SSR Safe | Performance  |
| -------- | ------------- | -------- | ------------ |
| Date.now | ❌            | ❌       | ✅ Fast      |
| nanoid   | ❌            | ❌       | ⚠️ Random    |
| SHA/MD5  | ✅            | ✅       | ❌ Slow      |
| **djb2** | ✅            | ✅       | ✅✅ Fastest |

djb2: Only bit shifts and XOR, ~0.001ms per hash.

### Why No Prefix by Default?

Class names match native Tailwind for:

- Familiarity (`p-4` is expected)
- Migration (drop-in replacement)
- Debugging (DevTools shows familiar names)

Optional prefix (`s-`) for namespace isolation.

### Why Tagged Templates for Arbitrary Values?

```ts
p`10px`; // vs p("10px") or p.arb("10px")
```

Tagged templates are:

- Visually distinct (arbitrary vs predefined)
- Concise (no parentheses or method calls)
- Type-safe (returns StyleToken)

---

## Future Considerations

1. **Responsive variants**: `md:`, `lg:` support
2. **State variants**: `hover:`, `focus:` support
3. **Custom themes**: User-defined scales
4. **Build-time extraction**: Static CSS generation

---

## References

- [RFC 006-style-system.md](../../docs/rfcs/006-style-system.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Default Configuration](https://github.com/tailwindlabs/tailwindcss/blob/main/stubs/config.full.js)

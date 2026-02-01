# Tailwind Integration Implementation

**Task**: Implement `@semajsx/tailwind` package
**RFC Reference**: [RFC 006-style-system.md](../../docs/rfcs/006-style-system.md) Section 10
**Status**: Implemented

---

## Overview

`@semajsx/tailwind` provides type-safe Tailwind-style utility classes with:

1. **Flat exports** for optimal tree-shaking
2. **Merged naming** pattern (e.g., `p4`, `wFull`, `textBase`)
3. **Tagged templates** for arbitrary values
4. **Namespace grouping** for organization
5. **`cx()` helper** for composing class names

---

## Design Philosophy: "Think in JS, Not CSS"

The key insight driving this API design is: **Don't mechanically convert CSS patterns to JavaScript**.

Tailwind's string-based API (`class="p-4 w-full"`) works well for templates, but JavaScript has different strengths:

- **Static analysis** - Unused exports can be tree-shaken
- **Type safety** - IDE autocomplete and error checking
- **Composition** - Functions and objects for organization

Instead of mimicking Tailwind's string syntax with bracket notation (`p["4"]`, `w["1/2"]`), we use **merged naming** that feels natural in JavaScript.

---

## API Design

### Core Pattern: Flat Exports with Merged Naming

```ts
// Spacing: prefix + value
import { p4, m2, gap4 } from "@semajsx/tailwind";

// Sizing: prefix + semantic name
import { w4, wFull, wHalf, hScreen } from "@semajsx/tailwind";

// Typography: prefix + size/weight
import { textBase, text5xl, fontBold } from "@semajsx/tailwind";

// Layout: prefix + value/semantic
import { top4, topHalf, z50, absolute } from "@semajsx/tailwind";

// Effects: prefix + variant
import { roundedLg, opacity50, shadowLg } from "@semajsx/tailwind";

// Flexbox: combined names
import { flex, flexCol, justifyCenter, itemsCenter } from "@semajsx/tailwind";
```

### The `cx()` Helper

Essential for composing multiple utilities:

```tsx
import { cx, p4, wFull, roundedLg, bgBlue500 } from "@semajsx/tailwind";

<div class={cx(p4, wFull, roundedLg, bgBlue500)}>
// Output: "p-4 w-full rounded-lg bg-blue-500"

// Conditional classes
<div class={cx(p4, isActive && bgBlue500, isLarge && text5xl)}>

// Nested arrays work too
const base = [p4, m4];
const colors = [bgBlue500, textWhite];
<div class={cx(base, colors)}>
```

### Arbitrary Values via Tagged Templates

For values not in the predefined scale:

```ts
import { p, w, rounded, opacity } from "@semajsx/tailwind";

// Custom padding
p`10px`; // → "p-10px"
p`2.5rem`; // → "p-2_5rem"

// Custom width
w`300px`; // → "w-300px"
w`calc(100% - 40px)`; // → "w-[hash]"

// Custom border radius
rounded`10px`; // → "rounded-10px"

// Custom opacity
opacity`0.33`; // → "opacity-0_33"
```

### Namespace Grouping (Optional)

For organized imports:

```ts
import { spacing, sizing, typography, layout, effects, flexbox } from "@semajsx/tailwind";

// Access via namespace
spacing.p4;
sizing.wFull;
typography.textBase;
layout.z50;
effects.roundedLg;
flexbox.justifyCenter;
```

---

## Naming Convention

See [NAMING_CONVENTION.md](./NAMING_CONVENTION.md) for complete details.

### Summary

| Category   | Pattern              | Examples                             |
| ---------- | -------------------- | ------------------------------------ |
| Spacing    | `{prefix}{scale}`    | `p4`, `m2`, `gap8`, `px4`, `my2`     |
| Sizing     | `{prefix}{semantic}` | `w4`, `wFull`, `wHalf`, `hScreen`    |
| Typography | `{prefix}{variant}`  | `textBase`, `text5xl`, `fontBold`    |
| Layout     | `{prefix}{value}`    | `top4`, `topHalf`, `z50`, `absolute` |
| Effects    | `{prefix}{variant}`  | `roundedLg`, `opacity50`, `shadowLg` |
| Flexbox    | `{combined}`         | `flex`, `flexCol`, `justifyCenter`   |

### Key Rules

1. **Numbers as suffix**: `p4`, `m2`, `w64` (not `p["4"]`)
2. **Semantic names**: `wFull`, `hScreen`, `topHalf` (not `w["100%"]`)
3. **Capitalize variants**: `textLg`, `fontBold`, `roundedFull`
4. **Decimals via tagged template**: `p`0.5``, `m`1.5`` (not flat exports)
5. **Combined tokens**: `justifyCenter`, `itemsStart` (not `justify.center`)

---

## Package Structure

```
packages/tailwind/
├── src/
│   ├── index.ts           # Re-exports all utilities
│   ├── core.ts            # createUtility, createTaggedUtility
│   ├── config.ts          # Configuration (prefix support)
│   ├── types.ts           # StyleToken, TaggedUtilityFn
│   ├── helpers.ts         # cx(), extractCss()
│   ├── spacing.ts         # p, m, gap utilities
│   ├── sizing.ts          # w, h, minW, maxW, minH, maxH
│   ├── colors.ts          # bg, text, border colors
│   ├── typography.ts      # text size, font weight, etc.
│   ├── layout.ts          # position, inset, z-index, overflow
│   ├── effects.ts         # border, rounded, shadow, opacity, cursor
│   └── flexbox.ts         # display, flex, justify, items, etc.
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Implementation Details

### StyleToken Interface

Every utility generates a `StyleToken`:

```ts
interface StyleToken {
  __kind: "style";
  _: string; // Class name (e.g., "p-4")
  __cssTemplate: string; // CSS rule (e.g., ".p-4 { padding: 1rem; }")
  toString(): string; // Returns class name
}
```

### Token Generation Pattern

```ts
// Token generator function
function generatePaddingTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(spacingScale)) {
    const tokenName = `p${key.replace(".", "_")}`;  // p4, p0_5
    const className = `p-${key}`;                    // p-4, p-0.5

    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${escapeClassName(className)} { padding: ${value}; }`,
      toString() { return this._; },
    };
  }

  return tokens;
}

// Export flat tokens
export const { p0, p0_5, p1, p2, p4, ... } = generatePaddingTokens();
```

### Tagged Template for Arbitrary Values

```ts
export const p: TaggedUtilityFn = createTaggedUtility(paddingFn);

// Usage: p`10px` → StyleToken with class "p-10px"
```

---

## Test Coverage

287 tests across 9 test files:

- `core.test.ts` - Core utility functions
- `spacing.test.ts` - Padding, margin, gap
- `sizing.test.ts` - Width, height, min/max
- `typography.test.ts` - Font size, weight, line height
- `layout.test.ts` - Position, inset, z-index
- `effects.test.ts` - Border, rounded, shadow, opacity
- `flexbox.test.ts` - Display, flex, justify, align
- `colors.test.ts` - Background, text, border colors
- `helpers.test.ts` - cx(), extractCss()

---

## Configuration

### Custom Prefix

```ts
import { configureTailwind } from "@semajsx/tailwind";

// Add prefix to all class names
configureTailwind({ prefix: "s-" });

// Now: p4._ → "s-p-4" instead of "p-4"
```

### Deterministic Class Names

All class names are deterministic:

- Same input always produces same output
- SSR hydration works correctly
- Can cache CSS across builds

---

## Migration from Native Tailwind

Since class names match native Tailwind (no prefix by default):

```tsx
// Native Tailwind (before)
<div className="p-4 bg-blue-500 rounded-lg">

// @semajsx/tailwind (after)
import { cx, p4, bgBlue500, roundedLg } from "@semajsx/tailwind";
<div class={cx(p4, bgBlue500, roundedLg)}>
// Generates: class="p-4 bg-blue-500 rounded-lg" (identical!)
```

---

## Why This Design?

### vs. Bracket Notation (`p["4"]`)

```ts
// ❌ Bracket notation
p["4"]; // Awkward, looks like array access
w["1/2"]; // String literals everywhere
zIndex["50"]; // Verbose

// ✅ Merged naming
p4; // Clean, familiar
wHalf; // Semantic, readable
z50; // Concise
```

### vs. Proxy-Based API (`spacing.p.4`)

```ts
// ❌ Proxy chains
spacing.p.4              // Non-standard property access
sizing.w.full            // Looks like property, is actually method
layout.zIndex["50"]      // Mixed patterns

// ✅ Flat exports
p4          // Just a value
wFull       // Just a value
z50         // Just a value
```

### Benefits

1. **Tree-shaking**: Only imported tokens are bundled
2. **Type safety**: IDE autocomplete shows all options
3. **Familiar**: `p4` is natural in JavaScript
4. **Composable**: Works with `cx()` and spread
5. **Debuggable**: Class names match what's in DevTools

---

## Success Criteria (All Met)

- [x] All utility modules implemented with predefined values
- [x] Arbitrary value support via tagged templates
- [x] Type-safe with IDE autocomplete
- [x] Deterministic class names for deduplication
- [x] Tree-shakeable at module level
- [x] Comprehensive test coverage (287 tests)
- [x] cx() helper for composition
- [x] Namespace grouping option

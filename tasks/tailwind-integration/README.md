# Tailwind Integration Implementation Plan

**Task**: Implement `@semajsx/tailwind` package
**RFC Reference**: [RFC 006-style-system.md](../../docs/rfcs/006-style-system.md) Section 10
**Status**: Planning

---

## Overview

This document outlines the implementation plan for Tailwind CSS integration with `@semajsx/style`. The goal is to provide type-safe utility classes that:

1. Are tree-shakeable at the module level
2. Support predefined Tailwind scale values
3. Support arbitrary values with tagged template syntax
4. Generate deterministic class names for deduplication

---

## Critical Design Decision: Class Name Strategy

### Problem Statement

The current `classes()` implementation uses `Date.now()` for hashing:

```ts
// packages/style/src/classes.ts line 28
const hash = hashString(name + Date.now().toString(36));
```

This creates **non-deterministic** class names, which is problematic for:

1. **SSR Hydration**: Server and client generate different class names → hydration mismatch
2. **Caching**: Each build produces different CSS → cannot cache effectively
3. **Debugging**: Class names are unpredictable across sessions

### Design Options Analysis

#### Option A: No Prefix (Native Tailwind Style)

```ts
// Generated class names match Tailwind exactly
p - 4; // padding: 1rem
bg - blue - 500; // background: #3b82f6
```

**Pros**:

- Familiar to Tailwind users
- Minimal class name length
- Easy to debug (recognizable names)
- Can potentially share CSS with native Tailwind projects

**Cons**:

- Risk of collision with user-defined `.p-4` class
- Risk of collision if user also uses real Tailwind
- No namespace isolation

**Use case**: Projects that want drop-in Tailwind replacement

#### Option B: Fixed Short Prefix (e.g., `tw-`)

```ts
// All classes have tw- prefix
tw - p - 4; // padding: 1rem
tw - bg - blue - 500; // background: #3b82f6
```

**Pros**:

- Clear namespace isolation
- Predictable, deterministic
- Still readable and debuggable
- Can coexist with native Tailwind

**Cons**:

- Slightly longer class names (+3 chars)
- Different from native Tailwind syntax

**Use case**: Projects that want isolation but readable names

#### Option C: Hash Prefix (Current RFC Approach)

```ts
// Classes have hashed prefix
p - x7f3a - 4; // padding: 1rem
bg - x7f3a - blue - 500; // background: #3b82f6
```

**Pros**:

- Guaranteed unique (if hash is deterministic)
- Follows existing `@semajsx/style` pattern

**Cons**:

- Longer class names (+6 chars)
- Harder to debug (hash is meaningless)
- Looks ugly in DevTools
- Hash must be deterministic (current impl is NOT)

**Use case**: Projects prioritizing uniqueness over readability

#### Option D: Configurable Prefix

```ts
// User chooses prefix (or none)
const { spacing } = createTailwind({ prefix: "" }); // p-4
const { spacing } = createTailwind({ prefix: "tw-" }); // tw-p-4
const { spacing } = createTailwind({ prefix: "my-" }); // my-p-4
```

**Pros**:

- Maximum flexibility
- User decides based on their needs
- Can match any existing convention

**Cons**:

- More complex API
- Need to pass config everywhere or use context
- Potential for inconsistency if misconfigured

**Use case**: Library authors, design systems

### Recommendation

**Primary**: Option B (Fixed Short Prefix `tw-`) as default
**Secondary**: Option D (Configurable) for advanced users

**Rationale**:

1. **Deterministic by default**: No hashing, no runtime variance
2. **Safe by default**: Prefix prevents accidental collisions
3. **Readable**: `tw-p-4` is clear and debuggable
4. **Opt-out available**: Advanced users can configure `prefix: ""`

### Implementation Approach

```ts
// packages/tailwind/src/config.ts
export interface TailwindConfig {
  /** Class name prefix. Default: "tw-". Use "" for no prefix. */
  prefix?: string;
}

const defaultConfig: TailwindConfig = {
  prefix: "tw-",
};

// Global config (set once at app init)
let globalConfig = defaultConfig;

export function configureTailwind(config: Partial<TailwindConfig>) {
  globalConfig = { ...defaultConfig, ...config };
}

export function getConfig(): TailwindConfig {
  return globalConfig;
}

// Alternative: Factory pattern for isolation
export function createTailwind(config: Partial<TailwindConfig> = {}) {
  const mergedConfig = { ...defaultConfig, ...config };
  // Return utilities bound to this config
  return {
    spacing: createSpacing(mergedConfig),
    colors: createColors(mergedConfig),
    // ...
  };
}
```

### Class Name Generation (Deterministic)

```ts
// packages/tailwind/src/core.ts
export function createUtility(
  property: string,
  utilityName: string, // e.g., "p", "bg"
  config: TailwindConfig,
) {
  const prefix = config.prefix ?? "tw-";

  return (value: string, valueName?: string): StyleToken => {
    // Use valueName if provided (for predefined), otherwise derive from value
    const suffix = valueName ?? valueToSuffix(value);
    const className = `${prefix}${utilityName}-${suffix}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { ${property}: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };
}

// Deterministic suffix generation
function valueToSuffix(value: string): string {
  // For simple values, use as-is (sanitized)
  if (/^[\w.-]+$/.test(value)) {
    return value.replace(/\./g, "_").replace(/-/g, "_");
  }
  // For complex values (calc, rgb, etc.), use deterministic hash
  return hashString(value).slice(0, 6);
}
```

### Generated Class Names (Examples)

| Config          | Utility      | Generated Class | CSS                             |
| --------------- | ------------ | --------------- | ------------------------------- |
| `prefix: "tw-"` | `spacing.p4` | `tw-p-4`        | `.tw-p-4 { padding: 1rem; }`    |
| `prefix: "tw-"` | `p\`10px\``  | `tw-p-10px`     | `.tw-p-10px { padding: 10px; }` |
| `prefix: ""`    | `spacing.p4` | `p-4`           | `.p-4 { padding: 1rem; }`       |
| `prefix: "my-"` | `spacing.p4` | `my-p-4`        | `.my-p-4 { padding: 1rem; }`    |

### SSR Compatibility

With deterministic class names:

```tsx
// Server renders:
<div class="tw-p-4 tw-bg-blue-500">

// Client hydrates with exact same classes:
<div class="tw-p-4 tw-bg-blue-500">  // ✅ No mismatch
```

### Migration Path from Native Tailwind

For users migrating from native Tailwind:

```ts
// Step 1: Use no prefix to match existing classes
configureTailwind({ prefix: "" });

// Step 2: Gradually migrate, CSS works the same
<div class={[spacing.p4, "existing-tailwind-class"]}>

// Step 3: Optionally add prefix later for isolation
configureTailwind({ prefix: "tw-" });
```

---

## Architecture

### Package Structure

```
packages/tailwind/
├── src/
│   ├── index.ts           # Re-export all utilities
│   ├── core.ts            # Core utility creation functions
│   ├── spacing.ts         # p, m, gap utilities
│   ├── sizing.ts          # w, h, min-w, max-w, min-h, max-h
│   ├── colors.ts          # bg, text, border color utilities
│   ├── flex.ts            # flex, justify, items, gap
│   ├── typography.ts      # font, text-size, leading, tracking
│   ├── display.ts         # display, visibility
│   ├── position.ts        # position, top, right, bottom, left
│   ├── border.ts          # border, rounded
│   └── effects.ts         # opacity, shadow
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Core Design: Template-First Approach

The key insight from the RFC is the **template-first approach**: define the utility template once, then generate all values from it.

```ts
// core.ts
export function createUtility(property: string, classPrefix: string) {
  return (value: string): StyleToken => ({
    __kind: "style",
    _: `${classPrefix}-${valueToSuffix(value)}`,
    __cssTemplate: `.${classPrefix}-${valueToSuffix(value)} { ${property}: ${value}; }`,
    toString() {
      return this._;
    },
  });
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure

**Goal**: Set up package structure and core utility creation functions

**Tasks**:

1. Create `packages/tailwind/` directory structure
2. Set up `package.json` with workspace dependencies
3. Implement `core.ts` with:
   - `createUtility(property, classPrefix)` - single property utility
   - `valueToSuffix(value)` - deterministic suffix generation
   - `hashString(value)` - for complex values

**Deliverables**:

- `packages/tailwind/src/core.ts`
- `packages/tailwind/src/core.test.ts`
- `packages/tailwind/package.json`
- `packages/tailwind/tsconfig.json`

**Estimated Complexity**: Low

---

### Phase 2: Spacing Utilities

**Goal**: Implement padding and margin utilities as the first complete module

**Tasks**:

1. Define class names: `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl`, `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml`
2. Create utility templates using `createUtility`
3. Generate predefined values from Tailwind spacing scale:
   - 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96
4. Export tagged template functions for arbitrary values (`p`, `m`, etc.)

**API Design**:

```ts
// Predefined values
import { spacing } from "@semajsx/tailwind";
spacing.p4; // padding: 1rem
spacing.mx2; // margin-left: 0.5rem; margin-right: 0.5rem

// Arbitrary values
import { p, m } from "@semajsx/tailwind";
p`4px`; // padding: 4px
m`calc(100% - 40px)`; // margin: calc(100% - 40px)
```

**Deliverables**:

- `packages/tailwind/src/spacing.ts`
- `packages/tailwind/src/spacing.test.ts`

**Estimated Complexity**: Medium

---

### Phase 3: Sizing Utilities

**Goal**: Implement width and height utilities

**Tasks**:

1. Define class names: `w`, `min-w`, `max-w`, `h`, `min-h`, `max-h`
2. Create utility templates
3. Generate predefined values:
   - Numeric scale: 0-96 (same as spacing)
   - Fractional: 1/2, 1/3, 2/3, 1/4, 3/4, 1/5, 2/5, etc.
   - Keywords: full, screen, min, max, fit, auto

**API Design**:

```ts
import { sizing, w, h } from "@semajsx/tailwind";
sizing.w64; // width: 16rem
sizing.hFull; // height: 100%
w`calc(50% - 20px)`;
h`100vh`;
```

**Deliverables**:

- `packages/tailwind/src/sizing.ts`
- `packages/tailwind/src/sizing.test.ts`

**Estimated Complexity**: Medium

---

### Phase 4: Color Utilities

**Goal**: Implement background, text, and border color utilities

**Tasks**:

1. Define class names: `bg`, `text`, `border`
2. Create utility templates
3. Generate predefined values from Tailwind color palette:
   - slate, gray, zinc, neutral, stone
   - red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
   - Each with shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
4. Add special colors: transparent, current, inherit, black, white

**API Design**:

```ts
import { colors, bg, text } from "@semajsx/tailwind";
colors.bgBlue500; // background: #3b82f6
colors.textWhite; // color: white
bg`#ff5500`;
text`rgb(100, 200, 50)`;
```

**Deliverables**:

- `packages/tailwind/src/colors.ts`
- `packages/tailwind/src/colors.test.ts`

**Estimated Complexity**: High (many color values)

---

### Phase 5: Flexbox Utilities

**Goal**: Implement flex layout utilities

**Tasks**:

1. Define class names: `flex`, `flex-row`, `flex-col`, `justify`, `items`, `gap`, `grow`, `shrink`
2. Create utility templates
3. Generate predefined values:
   - Direction: row, row-reverse, col, col-reverse
   - Wrap: wrap, wrap-reverse, nowrap
   - Justify: start, end, center, between, around, evenly
   - Items: start, end, center, baseline, stretch

**API Design**:

```ts
import { flex } from "@semajsx/tailwind";
flex.row; // flex-direction: row
flex.col; // flex-direction: column
flex.justifyCenter; // justify-content: center
flex.itemsCenter; // align-items: center
flex.gap4; // gap: 1rem
```

**Deliverables**:

- `packages/tailwind/src/flex.ts`
- `packages/tailwind/src/flex.test.ts`

**Estimated Complexity**: Medium

---

### Phase 6: Typography Utilities

**Goal**: Implement font and text utilities

**Tasks**:

1. Define class names: `font`, `text`, `leading`, `tracking`
2. Create utility templates
3. Generate predefined values:
   - Font weight: thin, extralight, light, normal, medium, semibold, bold, extrabold, black
   - Font size: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl
   - Line height: none, tight, snug, normal, relaxed, loose
   - Letter spacing: tighter, tight, normal, wide, wider, widest

**API Design**:

```ts
import { typography } from "@semajsx/tailwind";
typography.fontBold; // font-weight: 700
typography.textLg; // font-size: 1.125rem; line-height: 1.75rem
typography.leadingNone; // line-height: 1
```

**Deliverables**:

- `packages/tailwind/src/typography.ts`
- `packages/tailwind/src/typography.test.ts`

**Estimated Complexity**: Medium

---

### Phase 7: Additional Utilities

**Goal**: Implement remaining utility categories

**Tasks**:

1. **Display**: block, inline, inline-block, flex, grid, hidden
2. **Position**: static, relative, absolute, fixed, sticky, top, right, bottom, left, inset
3. **Border**: border widths, rounded corners
4. **Effects**: opacity, shadow

**Deliverables**:

- `packages/tailwind/src/display.ts`
- `packages/tailwind/src/position.ts`
- `packages/tailwind/src/border.ts`
- `packages/tailwind/src/effects.ts`

**Estimated Complexity**: Medium

---

### Phase 8: Integration & Index

**Goal**: Create unified exports and ensure everything works together

**Tasks**:

1. Create `index.ts` with all exports
2. Add comprehensive tests for integration
3. Update documentation

**API Design**:

```ts
// Named imports by category
import { spacing, sizing, colors, flex, typography } from "@semajsx/tailwind";

// Direct arbitrary value imports
import { p, m, w, h, bg, text } from "@semajsx/tailwind";

// Or use namespace
import * as tw from "@semajsx/tailwind";
tw.spacing.p4;
tw.p`10px`;
```

**Deliverables**:

- `packages/tailwind/src/index.ts`
- `packages/tailwind/README.md`
- Integration tests

**Estimated Complexity**: Low

---

## Technical Details

### valueToSuffix Implementation

```ts
/**
 * Convert value to deterministic suffix for className
 */
function valueToSuffix(value: string): string {
  // Simple values: sanitize and use directly
  // "0.25rem" -> "0_25rem"
  // "1rem" -> "1rem"
  if (/^[\w.]+$/.test(value)) {
    return value.replace(/\./g, "_");
  }
  // Complex values (calc, etc.): use short hash
  // "calc(100% - 40px)" -> "a1b2c3"
  return hashString(value).slice(0, 6);
}
```

### Tree-Shaking Notes

Per RFC Section 10.2, Tailwind utilities use **object exports** for ergonomics. This is acceptable because:

1. Module-level tree-shaking still works (unused category files eliminated)
2. Utilities are small (~50 bytes each)
3. Users typically use many values from each category
4. DOM injection is selective (only used rules injected)

### Class Name Conflicts

To avoid conflicts with user-defined classes, Tailwind utilities use hashed prefixes from `classes()`:

```ts
const c = classes(["p", "m", "w", "h", ...]);
// c.p.toString() -> "p-x7f3a"
// Final className: "p-x7f3a-1rem"
```

---

## Testing Strategy

1. **Unit tests** for each utility module
2. **Integration tests** for combined usage
3. **Snapshot tests** for generated CSS
4. **Type tests** for TypeScript inference

```ts
// Example test
it("generates correct padding class", () => {
  expect(spacing.p4._).toBe("p-x7f3a-1rem");
  expect(spacing.p4.__cssTemplate).toBe(".p-x7f3a-1rem { padding: 1rem; }");
});

it("arbitrary values work", () => {
  const token = p`4px`;
  expect(token._).toBe("p-x7f3a-4px");
  expect(token.__cssTemplate).toBe(".p-x7f3a-4px { padding: 4px; }");
});
```

---

## Open Questions

1. **Responsive variants**: Should we support `md:`, `lg:` prefixes?
   - Deferred to future phase

2. **State variants**: Should we support `hover:`, `focus:` prefixes?
   - Deferred to future phase

3. **Custom theme values**: How to allow users to extend/customize the scale?
   - Can use code generation from tailwind.config.js

4. **Negative values**: Support for `-m-4` etc.?
   - Include in implementation

---

## Dependencies

- `@semajsx/style` - Core style system
- No external Tailwind dependencies (values are generated/hardcoded)

---

## Timeline Estimate

| Phase | Description          | Complexity |
| ----- | -------------------- | ---------- |
| 1     | Core Infrastructure  | Low        |
| 2     | Spacing Utilities    | Medium     |
| 3     | Sizing Utilities     | Medium     |
| 4     | Color Utilities      | High       |
| 5     | Flexbox Utilities    | Medium     |
| 6     | Typography Utilities | Medium     |
| 7     | Additional Utilities | Medium     |
| 8     | Integration & Index  | Low        |

---

## Success Criteria

- [ ] All utility modules implemented with predefined values
- [ ] Arbitrary value support via tagged templates
- [ ] Type-safe with IDE autocomplete
- [ ] JSDoc comments showing CSS values
- [ ] Deterministic class names for deduplication
- [ ] Tree-shakeable at module level
- [ ] Comprehensive test coverage
- [ ] Documentation and examples

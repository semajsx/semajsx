# @semajsx/tailwind Naming Convention

This document defines the naming rules for utility tokens in `@semajsx/tailwind`.

---

## Core Principle

**"Think in JavaScript, not CSS"**

Token names should be natural JavaScript identifiers, not mechanical conversions of Tailwind class names.

```ts
// ❌ Mechanical conversion (avoid)
p["4"]; // Array-like access
w["1/2"]; // String literal
zIndex["50"]; // Verbose

// ✅ Natural JavaScript (preferred)
p4; // Simple identifier
wHalf; // Semantic name
z50; // Concise
```

---

## General Rules

### 1. Merge Prefix and Value

Combine the utility prefix with its value into a single identifier:

```ts
// Pattern: {prefix}{value}
p4; // padding: 1rem (p + 4)
m8; // margin: 2rem (m + 8)
w64; // width: 16rem (w + 64)
z50; // z-index: 50 (z + 50)
```

### 2. Use Underscore for Decimals

Replace decimal points with underscores in token names:

```ts
// Pattern: {prefix}{integer}_{decimal}
p0_5; // padding: 0.125rem (0.5 scale)
m1_5; // margin: 0.375rem (1.5 scale)
gap2_5; // gap: 0.625rem (2.5 scale)

// Class name keeps the decimal
p0_5._; // → "p-0.5"
```

### 3. Capitalize Semantic Values

For non-numeric values, use camelCase with capitalized words:

```ts
// Pattern: {prefix}{Capitalized}
wFull; // width: 100%
hScreen; // height: 100vh
topAuto; // top: auto
zAuto; // z-index: auto
```

### 4. Use Semantic Fraction Names

Replace fraction syntax with readable English:

| Fraction | Token Name      | Meaning |
| -------- | --------------- | ------- |
| `1/2`    | `Half`          | 50%     |
| `1/3`    | `Third`         | 33.333% |
| `2/3`    | `TwoThirds`     | 66.667% |
| `1/4`    | `Quarter`       | 25%     |
| `3/4`    | `ThreeQuarters` | 75%     |
| `1/5`    | `Fifth`         | 20%     |
| `2/5`    | `TwoFifths`     | 40%     |
| `1/6`    | `Sixth`         | 16.667% |

```ts
// Examples
wHalf; // width: 50%
wThird; // width: 33.333%
wTwoThirds; // width: 66.667%
topHalf; // top: 50%
basisQuarter; // flex-basis: 25%
```

### 5. Keep Short Prefixes

Use the shortest meaningful prefix:

| Tailwind Class | Token Prefix | Example     |
| -------------- | ------------ | ----------- |
| `p-*`          | `p`          | `p4`        |
| `px-*`         | `px`         | `px4`       |
| `m-*`          | `m`          | `m4`        |
| `w-*`          | `w`          | `w64`       |
| `h-*`          | `h`          | `h32`       |
| `text-*`       | `text`       | `textBase`  |
| `font-*`       | `font`       | `fontBold`  |
| `rounded-*`    | `rounded`    | `roundedLg` |
| `z-*`          | `z`          | `z50`       |

### 6. Combined Names for Multi-Word Utilities

For utilities with multiple parts, combine them:

```ts
// Pattern: {utility}{Variant}
justifyCenter; // justify-content: center
justifyBetween; // justify-content: space-between
itemsCenter; // align-items: center
itemsStart; // align-items: flex-start
flexCol; // flex-direction: column
flexWrap; // flex-wrap: wrap
```

---

## Category-Specific Rules

### Spacing (p, m, gap)

```ts
// Numeric scale
p0, p0_5, p1, p1_5, p2, p2_5, p3, p3_5, p4, p5, p6, p8, p10, p12, ...

// Directional variants
px4, py4, pt4, pr4, pb4, pl4    // padding
mx4, my4, mt4, mr4, mb4, ml4    // margin
gapX4, gapY4                     // gap

// Special
ppx    // padding: 1px (px scale value)
mpx    // margin: 1px
```

### Sizing (w, h, size)

```ts
// Numeric scale
(w0, w0_5, w1, w2, w4, w8, w12, w16, w24, w32, w48, w64, w96);

// Fractions
(wHalf, wThird, wTwoThirds, wQuarter, wThreeQuarters);

// Semantic
(wAuto, wFull, wScreen, wMin, wMax, wFit);

// Height follows same pattern
(h0, h4, h8, hHalf, hFull, hScreen);

// Size (width + height)
(size4, sizeHalf, sizeFull);

// Min/Max
(minW0, minWFull, minWMin, minWMax, minWFit);
(maxW0, maxWXs, maxWSm, maxWMd, maxWLg, maxWXl, maxW2xl, maxWProse);
```

### Typography

```ts
// Font size - use "text" prefix for size
(textXs, textSm, textBase, textLg, textXl, text2xl, text3xl, text4xl, text5xl);

// Font weight - use "font" prefix
(fontThin, fontLight, fontNormal, fontMedium, fontSemibold, fontBold, fontBlack);

// Font family
(fontSans, fontSerif, fontMono);

// Font style
(italic, notItalic);

// Line height - use "leading" prefix
(leadingNone, leadingTight, leadingSnug, leadingNormal, leadingRelaxed, leadingLoose);
(leading3, leading4, leading5, leading6, leading7, leading8, leading9, leading10);

// Letter spacing - use "tracking" prefix
(trackingTighter, trackingTight, trackingNormal, trackingWide, trackingWider, trackingWidest);

// Text align - use "text" prefix
(textLeft, textCenter, textRight, textJustify);

// Text decoration
(underline, overline, lineThrough, noUnderline);

// Text transform
(uppercase, lowercase, capitalize, normalCase);

// Whitespace
(whitespaceNormal, whitespaceNowrap, whitespacePre, whitespacePreLine, whitespacePreWrap);

// Word break
(breakNormal, breakWords, breakAll, breakKeep);

// Truncate
truncate;
```

### Layout

```ts
// Position - no prefix needed
(positionStatic, fixed, absolute, relative, sticky);

// Inset - use property name as prefix
(top0, top4, topAuto, topFull, topHalf, topThird, topQuarter);
(right0, right4, rightAuto, rightHalf);
(bottom0, bottom4, bottomAuto, bottomHalf);
(left0, left4, leftAuto, leftHalf);

// Inset (all sides)
(inset0, inset4, insetAuto, insetFull, insetHalf);

// Inset X/Y
(insetX0, insetX4, insetXAuto);
(insetY0, insetY4, insetYAuto);

// Z-index - short "z" prefix
(z0, z10, z20, z30, z40, z50, zAuto);

// Overflow
(overflowAuto, overflowHidden, overflowClip, overflowVisible, overflowScroll);
(overflowXAuto, overflowXHidden, overflowXScroll);
(overflowYAuto, overflowYHidden, overflowYScroll);

// Visibility
(visible, invisible, collapse);
```

### Effects

```ts
// Border width - use "border" prefix
(border, border0, border2, border4, border8);

// Border radius - use "rounded" prefix
(roundedBase, roundedNone, roundedSm, roundedMd, roundedLg, roundedXl, rounded2xl, roundedFull);

// Border style
(borderSolid, borderDashed, borderDotted, borderDouble, borderNone);

// Box shadow - use "shadow" prefix
(shadowBase, shadowSm, shadowMd, shadowLg, shadowXl, shadow2xl, shadowInner, shadowNone);

// Opacity - use "opacity" prefix
(opacity0, opacity5, opacity10, opacity20, opacity25, opacity50, opacity75, opacity100);

// Cursor - use "cursor" prefix
(cursorAuto, cursorPointer, cursorWait, cursorText, cursorMove, cursorNotAllowed, cursorGrab);

// Pointer events
(pointerEventsNone, pointerEventsAuto);

// User select
(selectNone, selectText, selectAll, selectAuto);
```

### Flexbox

```ts
// Display - no prefix needed
(block, inlineBlock, inline, flex, inlineFlex, grid, inlineGrid, hidden, contents);

// Flex direction - use "flex" prefix
(flexRow, flexRowReverse, flexCol, flexColReverse);

// Flex wrap - use "flex" prefix
(flexWrap, flexWrapReverse, flexNowrap);

// Flex shorthand
(flex1, flexAuto, flexInitial, flexNone);

// Grow/Shrink - no prefix
(grow, grow0, shrink, shrink0);

// Basis - use "basis" prefix
(basis0, basis4, basis8, basisAuto, basisFull, basisHalf, basisThird, basisQuarter);

// Justify content - use "justify" prefix
(justifyNormal,
  justifyStart,
  justifyEnd,
  justifyCenter,
  justifyBetween,
  justifyAround,
  justifyEvenly);

// Justify items
(justifyItemsStart, justifyItemsEnd, justifyItemsCenter, justifyItemsStretch);

// Justify self
(justifySelfAuto, justifySelfStart, justifySelfEnd, justifySelfCenter);

// Align content - use "content" prefix
(contentNormal,
  contentStart,
  contentEnd,
  contentCenter,
  contentBetween,
  contentAround,
  contentEvenly);

// Align items - use "items" prefix
(itemsStart, itemsEnd, itemsCenter, itemsBaseline, itemsStretch);

// Align self - use "self" prefix
(selfAuto, selfStart, selfEnd, selfCenter, selfBaseline, selfStretch);

// Place content
(placeContentStart, placeContentCenter, placeContentBetween, placeContentAround);

// Place items
(placeItemsStart, placeItemsCenter, placeItemsStretch);

// Place self
(placeSelfAuto, placeSelfStart, placeSelfCenter);

// Order - use "order" prefix
(order1, order2, order3, order4, order5, order6, order7, order8, order9, order10, order11, order12);
(orderFirst, orderLast, orderNone);
```

### Colors

```ts
// Background - use "bg" prefix
bgWhite, bgBlack, bgTransparent
bgSlate50, bgSlate100, ..., bgSlate900, bgSlate950
bgRed500, bgBlue500, bgGreen500, ...

// Text color - use "text" prefix (conflicts with typography, so use full name)
textWhite, textBlack
textSlate500, textRed500, textBlue500, ...

// Border color - use "borderColor" prefix (avoid conflict with border width)
borderColorWhite, borderColorBlack
borderColorSlate500, borderColorRed500, ...
```

---

## Tagged Templates for Arbitrary Values

For values not in the predefined scale, use tagged templates:

```ts
// Same name as predefined, but as function
p`10px`; // padding: 10px
w`300px`; // width: 300px
w`calc(100% - 40px)`; // width: calc(100% - 40px)
rounded`10px`; // border-radius: 10px
opacity`0.33`; // opacity: 0.33
top`50%`; // top: 50%
z`999`; // z-index: 999
```

---

## Naming Decision Tree

When creating a new token:

```
1. Is it a numeric scale value?
   YES → {prefix}{number} (e.g., p4, w64, z50)

2. Is it a decimal value?
   YES → {prefix}{int}_{decimal} (e.g., p0_5, m1_5)

3. Is it a fraction?
   YES → {prefix}{SemanticFraction} (e.g., wHalf, topThird)

4. Is it a keyword (auto, full, none)?
   YES → {prefix}{Capitalized} (e.g., wAuto, wFull, roundedNone)

5. Is it a multi-word utility?
   YES → {combined}{Variant} (e.g., justifyCenter, itemsStart)

6. Is it a variant of a base utility?
   YES → {base}{Variant} (e.g., roundedLg, shadowInner)
```

---

## Anti-Patterns (Avoid)

```ts
// ❌ Bracket notation
p["4"]; // Use p4 instead

// ❌ String literals for fractions
w["1/2"]; // Use wHalf instead

// ❌ Verbose property names
zIndex50; // Use z50 instead
borderRadius; // Use rounded instead

// ❌ Mechanical CSS conversion
flexDirectionColumn; // Use flexCol instead
alignItemsCenter; // Use itemsCenter instead

// ❌ Inconsistent casing
(wFULL, WFULL); // Use wFull
(Pfour, PFOUR); // Use p4
```

---

## Summary Table

| Category   | Token Pattern | Examples |
| ---------- | ------------- | -------- | ------------------ | ---------------------------------------- | ------------------------------- | --- | --- | ------ | -------------------- |
| Spacing    | `{p           | m        | gap}{X             | Y                                        | T                               | R   | B   | L}{n}` | `p4`, `mx2`, `gapY8` |
| Sizing     | `{w           | h        | size}{n            | Semantic}`                               | `w64`, `wHalf`, `hScreen`       |
| Typography | `{text        | font     | leading}{Var}`     | `textBase`, `fontBold`, `leadingTight`   |
| Layout     | `{top         | z        | overflow}{n        | Var}`                                    | `top4`, `z50`, `overflowHidden` |
| Effects    | `{rounded     | shadow   | opacity}`          | `roundedLg`, `shadowMd`, `opacity50`     |
| Flexbox    | `{justify     | items    | self}{Var}`        | `justifyCenter`, `itemsStart`, `selfEnd` |
| Colors     | `{bg          | text     | borderColor}{Clr}` | `bgBlue500`, `textWhite`                 |

---

## Changelog

- **2026-01-28**: Initial version
- **2026-01-28**: Added anti-patterns section
- **2026-01-28**: Added decision tree

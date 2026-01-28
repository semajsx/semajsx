/**
 * Sizing utilities: width, height, min/max width/height
 *
 * Usage:
 * ```ts
 * // Merged naming (recommended)
 * import { w4, wFull, wHalf, h4, hScreen, maxWLg } from "@semajsx/tailwind";
 * <div class={[w4, hFull]}>
 *
 * // Namespace access
 * import { sizing } from "@semajsx/tailwind";
 * <div class={[sizing.w4, sizing.hScreen]}>
 *
 * // Arbitrary values (tagged template)
 * import { w, h, maxW } from "@semajsx/tailwind";
 * <div class={[w`300px`, h`calc(100vh - 64px)`, maxW`800px`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";

// ============================================
// Scale definitions
// ============================================

// Spacing-based scale (numbers)
const spacingScale: Record<string, string> = {
  "0": "0px",
  px: "1px",
  "0.5": "0.125rem",
  "1": "0.25rem",
  "1.5": "0.375rem",
  "2": "0.5rem",
  "2.5": "0.625rem",
  "3": "0.75rem",
  "3.5": "0.875rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "11": "2.75rem",
  "12": "3rem",
  "14": "3.5rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "28": "7rem",
  "32": "8rem",
  "36": "9rem",
  "40": "10rem",
  "44": "11rem",
  "48": "12rem",
  "52": "13rem",
  "56": "14rem",
  "60": "15rem",
  "64": "16rem",
  "72": "18rem",
  "80": "20rem",
  "96": "24rem",
};

// Fraction values with semantic names
const fractionScale: Record<string, string> = {
  half: "50%",
  third: "33.333333%",
  twoThirds: "66.666667%",
  quarter: "25%",
  threeQuarters: "75%",
  fifth: "20%",
  twoFifths: "40%",
  threeFifths: "60%",
  fourFifths: "80%",
  sixth: "16.666667%",
  fiveSixths: "83.333333%",
};

// Semantic values
const semanticScale: Record<string, string> = {
  auto: "auto",
  full: "100%",
  screen: "100vw",
  svw: "100svw",
  lvw: "100lvw",
  dvw: "100dvw",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
};

// Height-specific semantic values
const heightSemanticScale: Record<string, string> = {
  auto: "auto",
  full: "100%",
  screen: "100vh",
  svh: "100svh",
  lvh: "100lvh",
  dvh: "100dvh",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
};

// Max-width named sizes
const maxWidthNamedScale: Record<string, string> = {
  xs: "20rem",
  sm: "24rem",
  md: "28rem",
  lg: "32rem",
  xl: "36rem",
  "2xl": "42rem",
  "3xl": "48rem",
  "4xl": "56rem",
  "5xl": "64rem",
  "6xl": "72rem",
  "7xl": "80rem",
  prose: "65ch",
};

// ============================================
// Utility function creators
// ============================================

const widthFn = createUtility("width", "w");
const minWidthFn = createUtility("min-width", "min-w");
const maxWidthFn = createUtility("max-width", "max-w");
const heightFn = createUtility("height", "h");
const minHeightFn = createUtility("min-height", "min-h");
const maxHeightFn = createUtility("max-height", "max-h");
const sizeFnBase = createUtility("width", "size");

// Size utility (sets both width and height)
const sizeUtilityFn = (value: string, valueName?: string): StyleToken => {
  const token = sizeFnBase(value, valueName);
  return {
    ...token,
    __cssTemplate: `.${token._} { width: ${value}; height: ${value}; }`,
  };
};

// ============================================
// Token generators
// ============================================

type UtilityFn = (value: string, valueName?: string) => StyleToken;

function generateSpacingTokens(prefix: string, utilityFn: UtilityFn): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(spacingScale)) {
    // Convert "0.5" to "0_5", "1.5" to "1_5"
    const propKey = key.replace(".", "_");
    const tokenName = `${prefix}${propKey}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  return tokens;
}

function generateFractionTokens(prefix: string, utilityFn: UtilityFn): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(fractionScale)) {
    // Capitalize first letter: half -> Half
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `${prefix}${capKey}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  return tokens;
}

function generateSemanticTokens(
  prefix: string,
  utilityFn: UtilityFn,
  scale: Record<string, string>,
): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(scale)) {
    // Capitalize first letter: full -> Full
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `${prefix}${capKey}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  return tokens;
}

function generateMaxWidthNamedTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(maxWidthNamedScale)) {
    // Capitalize: sm -> Sm, 2xl -> 2xl (keep as is for numbers)
    const capKey = key.match(/^\d/) ? key : key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `maxW${capKey}`;
    tokens[tokenName] = maxWidthFn(value, key);
  }

  // Also add basic semantic values
  tokens.maxW0 = maxWidthFn("0px", "0");
  tokens.maxWFull = maxWidthFn("100%", "full");
  tokens.maxWMin = maxWidthFn("min-content", "min");
  tokens.maxWMax = maxWidthFn("max-content", "max");
  tokens.maxWFit = maxWidthFn("fit-content", "fit");

  return tokens;
}

function generateMinWidthTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  tokens.minW0 = minWidthFn("0px", "0");
  tokens.minWFull = minWidthFn("100%", "full");
  tokens.minWMin = minWidthFn("min-content", "min");
  tokens.minWMax = minWidthFn("max-content", "max");
  tokens.minWFit = minWidthFn("fit-content", "fit");

  return tokens;
}

function generateMinHeightTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  tokens.minH0 = minHeightFn("0px", "0");
  tokens.minHFull = minHeightFn("100%", "full");
  tokens.minHScreen = minHeightFn("100vh", "screen");
  tokens.minHSvh = minHeightFn("100svh", "svh");
  tokens.minHLvh = minHeightFn("100lvh", "lvh");
  tokens.minHDvh = minHeightFn("100dvh", "dvh");
  tokens.minHMin = minHeightFn("min-content", "min");
  tokens.minHMax = minHeightFn("max-content", "max");
  tokens.minHFit = minHeightFn("fit-content", "fit");

  return tokens;
}

function generateMaxHeightTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  tokens.maxH0 = maxHeightFn("0px", "0");
  tokens.maxHFull = maxHeightFn("100%", "full");
  tokens.maxHScreen = maxHeightFn("100vh", "screen");
  tokens.maxHSvh = maxHeightFn("100svh", "svh");
  tokens.maxHLvh = maxHeightFn("100lvh", "lvh");
  tokens.maxHDvh = maxHeightFn("100dvh", "dvh");
  tokens.maxHMin = maxHeightFn("min-content", "min");
  tokens.maxHMax = maxHeightFn("max-content", "max");
  tokens.maxHFit = maxHeightFn("fit-content", "fit");

  return tokens;
}

// ============================================
// Generate all tokens
// ============================================

// Width tokens: w0, w1, w2, w4, ..., wFull, wHalf, ...
const widthTokens: Record<string, StyleToken> = {
  ...generateSpacingTokens("w", widthFn),
  ...generateFractionTokens("w", widthFn),
  ...generateSemanticTokens("w", widthFn, semanticScale),
};

// Height tokens: h0, h1, h2, h4, ..., hFull, hScreen, ...
const heightTokens: Record<string, StyleToken> = {
  ...generateSpacingTokens("h", heightFn),
  ...generateFractionTokens("h", heightFn),
  ...generateSemanticTokens("h", heightFn, heightSemanticScale),
};

// Size tokens: size0, size4, sizeFull, ...
const sizeTokens: Record<string, StyleToken> = {
  ...generateSpacingTokens("size", sizeUtilityFn),
  ...generateFractionTokens("size", sizeUtilityFn),
  ...generateSemanticTokens("size", sizeUtilityFn, semanticScale),
};

// Min/max width tokens
const minWidthTokens = generateMinWidthTokens();
const maxWidthTokens = generateMaxWidthNamedTokens();

// Min/max height tokens
const minHeightTokens = generateMinHeightTokens();
const maxHeightTokens = generateMaxHeightTokens();

// ============================================
// Tagged template functions for arbitrary values
// ============================================

/** Width - arbitrary value: w`300px` */
export const w: TaggedUtilityFn = createTaggedUtility(widthFn);

/** Height - arbitrary value: h`100vh` */
export const h: TaggedUtilityFn = createTaggedUtility(heightFn);

/** Min-width - arbitrary value: minW`200px` */
export const minW: TaggedUtilityFn = createTaggedUtility(minWidthFn);

/** Max-width - arbitrary value: maxW`800px` */
export const maxW: TaggedUtilityFn = createTaggedUtility(maxWidthFn);

/** Min-height - arbitrary value: minH`100px` */
export const minH: TaggedUtilityFn = createTaggedUtility(minHeightFn);

/** Max-height - arbitrary value: maxH`500px` */
export const maxH: TaggedUtilityFn = createTaggedUtility(maxHeightFn);

/** Size - arbitrary value: size`48px` (sets both width and height) */
export const size: TaggedUtilityFn = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
): StyleToken => {
  let result = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + (strings[i + 1] ?? "");
  }
  return sizeUtilityFn(result);
}) as TaggedUtilityFn;

// ============================================
// Individual token exports (flat)
// ============================================

// Width
export const {
  w0,
  wpx,
  w0_5,
  w1,
  w1_5,
  w2,
  w2_5,
  w3,
  w3_5,
  w4,
  w5,
  w6,
  w7,
  w8,
  w9,
  w10,
  w11,
  w12,
  w14,
  w16,
  w20,
  w24,
  w28,
  w32,
  w36,
  w40,
  w44,
  w48,
  w52,
  w56,
  w60,
  w64,
  w72,
  w80,
  w96,
  wHalf,
  wThird,
  wTwoThirds,
  wQuarter,
  wThreeQuarters,
  wFifth,
  wTwoFifths,
  wThreeFifths,
  wFourFifths,
  wSixth,
  wFiveSixths,
  wAuto,
  wFull,
  wScreen,
  wSvw,
  wLvw,
  wDvw,
  wMin,
  wMax,
  wFit,
} = widthTokens;

// Height
export const {
  h0,
  hpx,
  h0_5,
  h1,
  h1_5,
  h2,
  h2_5,
  h3,
  h3_5,
  h4,
  h5,
  h6,
  h7,
  h8,
  h9,
  h10,
  h11,
  h12,
  h14,
  h16,
  h20,
  h24,
  h28,
  h32,
  h36,
  h40,
  h44,
  h48,
  h52,
  h56,
  h60,
  h64,
  h72,
  h80,
  h96,
  hHalf,
  hThird,
  hTwoThirds,
  hQuarter,
  hThreeQuarters,
  hFifth,
  hTwoFifths,
  hThreeFifths,
  hFourFifths,
  hSixth,
  hFiveSixths,
  hAuto,
  hFull,
  hScreen,
  hSvh,
  hLvh,
  hDvh,
  hMin,
  hMax,
  hFit,
} = heightTokens;

// Size
export const {
  size0,
  sizepx,
  size0_5,
  size1,
  size1_5,
  size2,
  size2_5,
  size3,
  size3_5,
  size4,
  size5,
  size6,
  size7,
  size8,
  size9,
  size10,
  size11,
  size12,
  size14,
  size16,
  size20,
  size24,
  size28,
  size32,
  size36,
  size40,
  size44,
  size48,
  size52,
  size56,
  size60,
  size64,
  size72,
  size80,
  size96,
  sizeHalf,
  sizeThird,
  sizeTwoThirds,
  sizeQuarter,
  sizeThreeQuarters,
  sizeFifth,
  sizeTwoFifths,
  sizeThreeFifths,
  sizeFourFifths,
  sizeSixth,
  sizeFiveSixths,
  sizeAuto,
  sizeFull,
  sizeScreen,
  sizeSvw,
  sizeLvw,
  sizeDvw,
  sizeMin,
  sizeMax,
  sizeFit,
} = sizeTokens;

// Min-width
export const { minW0, minWFull, minWMin, minWMax, minWFit } = minWidthTokens;

// Max-width
export const {
  maxW0,
  maxWFull,
  maxWMin,
  maxWMax,
  maxWFit,
  maxWXs,
  maxWSm,
  maxWMd,
  maxWLg,
  maxWXl,
  maxW2xl,
  maxW3xl,
  maxW4xl,
  maxW5xl,
  maxW6xl,
  maxW7xl,
  maxWProse,
} = maxWidthTokens;

// Min-height
export const { minH0, minHFull, minHScreen, minHSvh, minHLvh, minHDvh, minHMin, minHMax, minHFit } =
  minHeightTokens;

// Max-height
export const { maxH0, maxHFull, maxHScreen, maxHSvh, maxHLvh, maxHDvh, maxHMin, maxHMax, maxHFit } =
  maxHeightTokens;

// ============================================
// Namespace export (grouped)
// ============================================

/** All sizing tokens in a namespace */
export const sizing = {
  // Width
  ...widthTokens,
  // Height
  ...heightTokens,
  // Size
  ...sizeTokens,
  // Min-width
  ...minWidthTokens,
  // Max-width
  ...maxWidthTokens,
  // Min-height
  ...minHeightTokens,
  // Max-height
  ...maxHeightTokens,
  // Arbitrary (tagged templates)
  w,
  h,
  minW,
  maxW,
  minH,
  maxH,
  size,
};

// Type for the sizing namespace
export type SizingNamespace = typeof sizing;

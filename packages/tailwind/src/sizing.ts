/**
 * Sizing utilities: width, height, min/max width/height
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";

/** Type for sizing value records */
export type SizingValues = Record<string, StyleToken>;

// Tailwind sizing scale - combines spacing scale with additional values
const sizingScale: Record<string, string> = {
  // Spacing-based values
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
  // Fractional values
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "2/4": "50%",
  "3/4": "75%",
  "1/5": "20%",
  "2/5": "40%",
  "3/5": "60%",
  "4/5": "80%",
  "1/6": "16.666667%",
  "2/6": "33.333333%",
  "3/6": "50%",
  "4/6": "66.666667%",
  "5/6": "83.333333%",
  "1/12": "8.333333%",
  "2/12": "16.666667%",
  "3/12": "25%",
  "4/12": "33.333333%",
  "5/12": "41.666667%",
  "6/12": "50%",
  "7/12": "58.333333%",
  "8/12": "66.666667%",
  "9/12": "75%",
  "10/12": "83.333333%",
  "11/12": "91.666667%",
  // Special values
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

// Height-specific scale (different screen units)
const heightScale: Record<string, string> = {
  ...sizingScale,
  screen: "100vh",
  svh: "100svh",
  lvh: "100lvh",
  dvh: "100dvh",
};

// Min/max width scale (subset of sizing scale)
const minMaxWidthScale: Record<string, string> = {
  "0": "0px",
  full: "100%",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
  // Additional max-width values
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
  "screen-sm": "640px",
  "screen-md": "768px",
  "screen-lg": "1024px",
  "screen-xl": "1280px",
  "screen-2xl": "1536px",
};

// Min/max height scale
const minMaxHeightScale: Record<string, string> = {
  "0": "0px",
  full: "100%",
  screen: "100vh",
  svh: "100svh",
  lvh: "100lvh",
  dvh: "100dvh",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
};

// Create utility functions
const widthFn = createUtility("width", "w");
const minWidthFn = createUtility("min-width", "min-w");
const maxWidthFn = createUtility("max-width", "max-w");

const heightFn = createUtility("height", "h");
const minHeightFn = createUtility("min-height", "min-h");
const maxHeightFn = createUtility("max-height", "max-h");

const sizeFn = createUtility("width", "size");

// Helper to generate predefined values for a utility
function generateSizingValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): SizingValues {
  const result: SizingValues = {};
  for (const [name, value] of Object.entries(scale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Predefined sizing values
export const w: SizingValues = generateSizingValues(widthFn, sizingScale);
export const minW: SizingValues = generateSizingValues(minWidthFn, minMaxWidthScale);
export const maxW: SizingValues = generateSizingValues(maxWidthFn, minMaxWidthScale);

export const h: SizingValues = generateSizingValues(heightFn, heightScale);
export const minH: SizingValues = generateSizingValues(minHeightFn, minMaxHeightScale);
export const maxH: SizingValues = generateSizingValues(maxHeightFn, minMaxHeightScale);

// Size utility (sets both width and height)
// Note: We need to create a custom utility for this
const sizeUtilityFn = (value: string, valueName?: string): StyleToken => {
  const token = sizeFn(value, valueName);
  return {
    ...token,
    __cssTemplate: `.${token._} { width: ${value}; height: ${value}; }`,
  };
};
export const size: SizingValues = generateSizingValues(sizeUtilityFn, sizingScale);

// Tagged template functions for arbitrary values
export const wArb: TaggedUtilityFn = createTaggedUtility(widthFn);
export const minWArb: TaggedUtilityFn = createTaggedUtility(minWidthFn);
export const maxWArb: TaggedUtilityFn = createTaggedUtility(maxWidthFn);

export const hArb: TaggedUtilityFn = createTaggedUtility(heightFn);
export const minHArb: TaggedUtilityFn = createTaggedUtility(minHeightFn);
export const maxHArb: TaggedUtilityFn = createTaggedUtility(maxHeightFn);

export const sizeArb: TaggedUtilityFn = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): StyleToken => {
  let result = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + (strings[i + 1] ?? "");
  }
  return sizeUtilityFn(result);
};

/** Grouped sizing predefined values */
export interface SizingGroup {
  w: SizingValues;
  minW: SizingValues;
  maxW: SizingValues;
  h: SizingValues;
  minH: SizingValues;
  maxH: SizingValues;
  size: SizingValues;
}

/** Grouped sizing arbitrary functions */
export interface SizingArbGroup {
  w: TaggedUtilityFn;
  minW: TaggedUtilityFn;
  maxW: TaggedUtilityFn;
  h: TaggedUtilityFn;
  minH: TaggedUtilityFn;
  maxH: TaggedUtilityFn;
  size: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const sizing: SizingGroup = {
  w: w,
  minW: minW,
  maxW: maxW,
  h: h,
  minH: minH,
  maxH: maxH,
  size: size,
};

export const sizingArb: SizingArbGroup = {
  w: wArb,
  minW: minWArb,
  maxW: maxWArb,
  h: hArb,
  minH: minHArb,
  maxH: maxHArb,
  size: sizeArb,
};

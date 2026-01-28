/**
 * Spacing utilities: padding, margin, gap
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createMultiUtility, createTaggedUtility } from "./core";

/** Type for spacing value records */
export type SpacingValues = Record<string, StyleToken>;

// Tailwind spacing scale (in rem, where 1 = 0.25rem)
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

// Create utility functions
const paddingFn = createUtility("padding", "p");
const paddingXFn = createMultiUtility(["padding-left", "padding-right"], "px");
const paddingYFn = createMultiUtility(["padding-top", "padding-bottom"], "py");
const paddingTopFn = createUtility("padding-top", "pt");
const paddingRightFn = createUtility("padding-right", "pr");
const paddingBottomFn = createUtility("padding-bottom", "pb");
const paddingLeftFn = createUtility("padding-left", "pl");

const marginFn = createUtility("margin", "m");
const marginXFn = createMultiUtility(["margin-left", "margin-right"], "mx");
const marginYFn = createMultiUtility(["margin-top", "margin-bottom"], "my");
const marginTopFn = createUtility("margin-top", "mt");
const marginRightFn = createUtility("margin-right", "mr");
const marginBottomFn = createUtility("margin-bottom", "mb");
const marginLeftFn = createUtility("margin-left", "ml");

const gapFn = createUtility("gap", "gap");
const gapXFn = createUtility("column-gap", "gap-x");
const gapYFn = createUtility("row-gap", "gap-y");

// Helper to generate predefined values for a utility
function generateSpacingValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
): SpacingValues {
  const result: SpacingValues = {};
  for (const [name, value] of Object.entries(spacingScale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Predefined spacing values
export const p: SpacingValues = generateSpacingValues(paddingFn);
export const px: SpacingValues = generateSpacingValues(paddingXFn);
export const py: SpacingValues = generateSpacingValues(paddingYFn);
export const pt: SpacingValues = generateSpacingValues(paddingTopFn);
export const pr: SpacingValues = generateSpacingValues(paddingRightFn);
export const pb: SpacingValues = generateSpacingValues(paddingBottomFn);
export const pl: SpacingValues = generateSpacingValues(paddingLeftFn);

export const m: SpacingValues = generateSpacingValues(marginFn);
export const mx: SpacingValues = generateSpacingValues(marginXFn);
export const my: SpacingValues = generateSpacingValues(marginYFn);
export const mt: SpacingValues = generateSpacingValues(marginTopFn);
export const mr: SpacingValues = generateSpacingValues(marginRightFn);
export const mb: SpacingValues = generateSpacingValues(marginBottomFn);
export const ml: SpacingValues = generateSpacingValues(marginLeftFn);

export const gap: SpacingValues = generateSpacingValues(gapFn);
export const gapX: SpacingValues = generateSpacingValues(gapXFn);
export const gapY: SpacingValues = generateSpacingValues(gapYFn);

// Tagged template functions for arbitrary values
export const pArb: TaggedUtilityFn = createTaggedUtility(paddingFn);
export const pxArb: TaggedUtilityFn = createTaggedUtility(paddingXFn);
export const pyArb: TaggedUtilityFn = createTaggedUtility(paddingYFn);
export const ptArb: TaggedUtilityFn = createTaggedUtility(paddingTopFn);
export const prArb: TaggedUtilityFn = createTaggedUtility(paddingRightFn);
export const pbArb: TaggedUtilityFn = createTaggedUtility(paddingBottomFn);
export const plArb: TaggedUtilityFn = createTaggedUtility(paddingLeftFn);

export const mArb: TaggedUtilityFn = createTaggedUtility(marginFn);
export const mxArb: TaggedUtilityFn = createTaggedUtility(marginXFn);
export const myArb: TaggedUtilityFn = createTaggedUtility(marginYFn);
export const mtArb: TaggedUtilityFn = createTaggedUtility(marginTopFn);
export const mrArb: TaggedUtilityFn = createTaggedUtility(marginRightFn);
export const mbArb: TaggedUtilityFn = createTaggedUtility(marginBottomFn);
export const mlArb: TaggedUtilityFn = createTaggedUtility(marginLeftFn);

export const gapArb: TaggedUtilityFn = createTaggedUtility(gapFn);
export const gapXArb: TaggedUtilityFn = createTaggedUtility(gapXFn);
export const gapYArb: TaggedUtilityFn = createTaggedUtility(gapYFn);

/** Grouped spacing predefined values */
export interface SpacingGroup {
  p: SpacingValues;
  px: SpacingValues;
  py: SpacingValues;
  pt: SpacingValues;
  pr: SpacingValues;
  pb: SpacingValues;
  pl: SpacingValues;
  m: SpacingValues;
  mx: SpacingValues;
  my: SpacingValues;
  mt: SpacingValues;
  mr: SpacingValues;
  mb: SpacingValues;
  ml: SpacingValues;
  gap: SpacingValues;
  gapX: SpacingValues;
  gapY: SpacingValues;
}

/** Grouped spacing arbitrary functions */
export interface SpacingArbGroup {
  p: TaggedUtilityFn;
  px: TaggedUtilityFn;
  py: TaggedUtilityFn;
  pt: TaggedUtilityFn;
  pr: TaggedUtilityFn;
  pb: TaggedUtilityFn;
  pl: TaggedUtilityFn;
  m: TaggedUtilityFn;
  mx: TaggedUtilityFn;
  my: TaggedUtilityFn;
  mt: TaggedUtilityFn;
  mr: TaggedUtilityFn;
  mb: TaggedUtilityFn;
  ml: TaggedUtilityFn;
  gap: TaggedUtilityFn;
  gapX: TaggedUtilityFn;
  gapY: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const spacing: SpacingGroup = {
  // Padding
  p: p,
  px: px,
  py: py,
  pt: pt,
  pr: pr,
  pb: pb,
  pl: pl,
  // Margin
  m: m,
  mx: mx,
  my: my,
  mt: mt,
  mr: mr,
  mb: mb,
  ml: ml,
  // Gap
  gap: gap,
  gapX: gapX,
  gapY: gapY,
};

export const spacingArb: SpacingArbGroup = {
  // Padding
  p: pArb,
  px: pxArb,
  py: pyArb,
  pt: ptArb,
  pr: prArb,
  pb: pbArb,
  pl: plArb,
  // Margin
  m: mArb,
  mx: mxArb,
  my: myArb,
  mt: mtArb,
  mr: mrArb,
  mb: mbArb,
  ml: mlArb,
  // Gap
  gap: gapArb,
  gapX: gapXArb,
  gapY: gapYArb,
};

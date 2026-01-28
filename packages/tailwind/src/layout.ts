/**
 * Layout utilities: position, overflow, z-index, etc.
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for layout value records */
export type LayoutValues = Record<string, StyleToken>;

// Position values
const positionValues: Record<string, string> = {
  static: "static",
  fixed: "fixed",
  absolute: "absolute",
  relative: "relative",
  sticky: "sticky",
};

// Top/Right/Bottom/Left scale
const insetScale: Record<string, string> = {
  "0": "0px",
  px: "1px",
  "0.5": "0.125rem",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "8": "2rem",
  "10": "2.5rem",
  "12": "3rem",
  "16": "4rem",
  "20": "5rem",
  "24": "6rem",
  "32": "8rem",
  "40": "10rem",
  "48": "12rem",
  "56": "14rem",
  "64": "16rem",
  auto: "auto",
  "1/2": "50%",
  "1/3": "33.333333%",
  "2/3": "66.666667%",
  "1/4": "25%",
  "3/4": "75%",
  full: "100%",
};

// Z-index scale
const zIndexScale: Record<string, string> = {
  "0": "0",
  "10": "10",
  "20": "20",
  "30": "30",
  "40": "40",
  "50": "50",
  auto: "auto",
};

// Overflow values
const overflowValues: Record<string, string> = {
  auto: "auto",
  hidden: "hidden",
  clip: "clip",
  visible: "visible",
  scroll: "scroll",
};

// Visibility values
const visibilityValues: Record<string, string> = {
  visible: "visible",
  invisible: "hidden",
  collapse: "collapse",
};

// Create utility functions
const topFn = createUtility("top", "top");
const rightFn = createUtility("right", "right");
const bottomFn = createUtility("bottom", "bottom");
const leftFn = createUtility("left", "left");
const zIndexFn = createUtility("z-index", "z");
const overflowFn = createUtility("overflow", "overflow");
const overflowXFn = createUtility("overflow-x", "overflow-x");
const overflowYFn = createUtility("overflow-y", "overflow-y");

// Helper to generate values for a utility
function generateLayoutValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): LayoutValues {
  const result: LayoutValues = {};
  for (const [name, value] of Object.entries(scale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Special handler for position (no prefix in class name)
function generatePositionValues(): LayoutValues {
  const result: LayoutValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(positionValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { position: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for inset (combines top, right, bottom, left)
function generateInsetValues(): LayoutValues {
  const result: LayoutValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(insetScale)) {
    const className = `${prefix}inset-${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { inset: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for inset-x (combines left and right)
function generateInsetXValues(): LayoutValues {
  const result: LayoutValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(insetScale)) {
    const className = `${prefix}inset-x-${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { left: ${value}; right: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for inset-y (combines top and bottom)
function generateInsetYValues(): LayoutValues {
  const result: LayoutValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(insetScale)) {
    const className = `${prefix}inset-y-${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { top: ${value}; bottom: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for visibility
function generateVisibilityValues(): LayoutValues {
  const result: LayoutValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(visibilityValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { visibility: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Predefined layout values
export const position: LayoutValues = generatePositionValues();
export const inset: LayoutValues = generateInsetValues();
export const insetX: LayoutValues = generateInsetXValues();
export const insetY: LayoutValues = generateInsetYValues();
export const top: LayoutValues = generateLayoutValues(topFn, insetScale);
export const right: LayoutValues = generateLayoutValues(rightFn, insetScale);
export const bottom: LayoutValues = generateLayoutValues(bottomFn, insetScale);
export const left: LayoutValues = generateLayoutValues(leftFn, insetScale);
export const zIndex: LayoutValues = generateLayoutValues(zIndexFn, zIndexScale);
export const overflow: LayoutValues = generateLayoutValues(overflowFn, overflowValues);
export const overflowX: LayoutValues = generateLayoutValues(overflowXFn, overflowValues);
export const overflowY: LayoutValues = generateLayoutValues(overflowYFn, overflowValues);
export const visibility: LayoutValues = generateVisibilityValues();

// Tagged template functions for arbitrary values
export const topArb: TaggedUtilityFn = createTaggedUtility(topFn);
export const rightArb: TaggedUtilityFn = createTaggedUtility(rightFn);
export const bottomArb: TaggedUtilityFn = createTaggedUtility(bottomFn);
export const leftArb: TaggedUtilityFn = createTaggedUtility(leftFn);
export const zIndexArb: TaggedUtilityFn = createTaggedUtility(zIndexFn);

/** Grouped layout predefined values */
export interface LayoutGroup {
  position: LayoutValues;
  inset: LayoutValues;
  insetX: LayoutValues;
  insetY: LayoutValues;
  top: LayoutValues;
  right: LayoutValues;
  bottom: LayoutValues;
  left: LayoutValues;
  zIndex: LayoutValues;
  overflow: LayoutValues;
  overflowX: LayoutValues;
  overflowY: LayoutValues;
  visibility: LayoutValues;
}

/** Grouped layout arbitrary functions */
export interface LayoutArbGroup {
  top: TaggedUtilityFn;
  right: TaggedUtilityFn;
  bottom: TaggedUtilityFn;
  left: TaggedUtilityFn;
  zIndex: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const layout: LayoutGroup = {
  position: position,
  inset: inset,
  insetX: insetX,
  insetY: insetY,
  top: top,
  right: right,
  bottom: bottom,
  left: left,
  zIndex: zIndex,
  overflow: overflow,
  overflowX: overflowX,
  overflowY: overflowY,
  visibility: visibility,
};

export const layoutArb: LayoutArbGroup = {
  top: topArb,
  right: rightArb,
  bottom: bottomArb,
  left: leftArb,
  zIndex: zIndexArb,
};

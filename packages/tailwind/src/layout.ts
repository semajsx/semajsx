/**
 * Layout utilities: position, overflow, z-index, inset, etc.
 *
 * Usage:
 * ```ts
 * // Flat exports (recommended)
 * import { absolute, relative, top4, z10, overflowHidden } from "@semajsx/tailwind";
 * <div class={cx(absolute, top4, z10, overflowHidden)}>
 *
 * // Namespace access
 * import { layout } from "@semajsx/tailwind";
 * <div class={cx(layout.absolute, layout.top4, layout.z10)}>
 *
 * // Arbitrary values (tagged template)
 * import { top, left, z } from "@semajsx/tailwind";
 * <div class={cx(top`100px`, left`50%`, z`999`)}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility, createMultiUtility } from "./core";
import { getConfig } from "./config";

// ============================================
// Scale definitions
// ============================================

// Position values
const positionValues = ["static", "fixed", "absolute", "relative", "sticky"] as const;

// Inset scale (top/right/bottom/left/inset)
const insetScale: Record<string, string> = {
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

// Semantic inset values
const insetSemanticValues: Record<string, string> = {
  auto: "auto",
  full: "100%",
  half: "50%",
  third: "33.333333%",
  twoThirds: "66.666667%",
  quarter: "25%",
  threeQuarters: "75%",
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
const overflowValues = ["auto", "hidden", "clip", "visible", "scroll"] as const;

// Visibility values
const visibilityMap: Record<string, string> = {
  visible: "visible",
  invisible: "hidden",
  collapse: "collapse",
};

// ============================================
// Utility function creators
// ============================================

const topFn = createUtility("top", "top");
const rightFn = createUtility("right", "right");
const bottomFn = createUtility("bottom", "bottom");
const leftFn = createUtility("left", "left");
const zIndexFn = createUtility("z-index", "z");
const insetFn = createUtility("inset", "inset");
const insetXFn = createMultiUtility(["left", "right"], "inset-x");
const insetYFn = createMultiUtility(["top", "bottom"], "inset-y");

// ============================================
// Token generators
// ============================================

function generatePositionTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const value of positionValues) {
    const className = `${prefix}${value}`;
    tokens[value] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { position: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateInsetTokens(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  prefix: string,
): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  // Number tokens: inset0, inset4, etc.
  for (const [key, value] of Object.entries(insetScale)) {
    const tokenKey = key.replace(".", "_");
    const tokenName = `${prefix}${tokenKey}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  // px token
  tokens[`${prefix}px`] = utilityFn("1px", "px");

  // Semantic tokens: insetAuto, insetFull, insetHalf
  for (const [key, value] of Object.entries(insetSemanticValues)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `${prefix}${capKey}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  return tokens;
}

function generateZIndexTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(zIndexScale)) {
    if (key === "auto") {
      tokens.zAuto = zIndexFn(value, "auto");
    } else {
      tokens[`z${key}`] = zIndexFn(value, key);
    }
  }

  return tokens;
}

function generateOverflowTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  // Main overflow
  for (const value of overflowValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const className = `${prefix}overflow-${value}`;
    tokens[`overflow${capValue}`] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { overflow: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  // Overflow-x
  for (const value of overflowValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const className = `${prefix}overflow-x-${value}`;
    tokens[`overflowX${capValue}`] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { overflow-x: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  // Overflow-y
  for (const value of overflowValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const className = `${prefix}overflow-y-${value}`;
    tokens[`overflowY${capValue}`] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { overflow-y: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateVisibilityTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, value] of Object.entries(visibilityMap)) {
    const className = `${prefix}${key}`;
    tokens[key] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { visibility: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

// ============================================
// Generate all tokens
// ============================================

const positionTokens = generatePositionTokens();
const topTokens = generateInsetTokens(topFn, "top");
const rightTokens = generateInsetTokens(rightFn, "right");
const bottomTokens = generateInsetTokens(bottomFn, "bottom");
const leftTokens = generateInsetTokens(leftFn, "left");
const insetTokens = generateInsetTokens(insetFn, "inset");
const insetXTokens = generateInsetTokens(insetXFn, "insetX");
const insetYTokens = generateInsetTokens(insetYFn, "insetY");
const zIndexTokens = generateZIndexTokens();
const overflowTokens = generateOverflowTokens();
const visibilityTokens = generateVisibilityTokens();

// ============================================
// Tagged template functions for arbitrary values
// ============================================

/** Top - arbitrary value: top`100px` */
export const top: TaggedUtilityFn = createTaggedUtility(topFn);

/** Right - arbitrary value: right`100px` */
export const right: TaggedUtilityFn = createTaggedUtility(rightFn);

/** Bottom - arbitrary value: bottom`100px` */
export const bottom: TaggedUtilityFn = createTaggedUtility(bottomFn);

/** Left - arbitrary value: left`100px` */
export const left: TaggedUtilityFn = createTaggedUtility(leftFn);

/** Inset - arbitrary value: inset`100px` */
export const inset: TaggedUtilityFn = createTaggedUtility(insetFn);

/** Inset X - arbitrary value: insetX`100px` */
export const insetX: TaggedUtilityFn = createTaggedUtility(insetXFn);

/** Inset Y - arbitrary value: insetY`100px` */
export const insetY: TaggedUtilityFn = createTaggedUtility(insetYFn);

/** Z-index - arbitrary value: z`999` */
export const z: TaggedUtilityFn = createTaggedUtility(zIndexFn);

// ============================================
// Individual token exports (flat) - Position
// ============================================

export const { static: positionStatic, fixed, absolute, relative, sticky } = positionTokens;

// ============================================
// Individual token exports (flat) - Top
// ============================================

export const {
  top0,
  toppx,
  top0_5,
  top1,
  top1_5,
  top2,
  top2_5,
  top3,
  top3_5,
  top4,
  top5,
  top6,
  top7,
  top8,
  top9,
  top10,
  top11,
  top12,
  top14,
  top16,
  top20,
  top24,
  top28,
  top32,
  top36,
  top40,
  top44,
  top48,
  top52,
  top56,
  top60,
  top64,
  top72,
  top80,
  top96,
  topAuto,
  topFull,
  topHalf,
  topThird,
  topTwoThirds,
  topQuarter,
  topThreeQuarters,
} = topTokens;

// ============================================
// Individual token exports (flat) - Right
// ============================================

export const {
  right0,
  rightpx,
  right0_5,
  right1,
  right1_5,
  right2,
  right2_5,
  right3,
  right3_5,
  right4,
  right5,
  right6,
  right7,
  right8,
  right9,
  right10,
  right11,
  right12,
  right14,
  right16,
  right20,
  right24,
  right28,
  right32,
  right36,
  right40,
  right44,
  right48,
  right52,
  right56,
  right60,
  right64,
  right72,
  right80,
  right96,
  rightAuto,
  rightFull,
  rightHalf,
  rightThird,
  rightTwoThirds,
  rightQuarter,
  rightThreeQuarters,
} = rightTokens;

// ============================================
// Individual token exports (flat) - Bottom
// ============================================

export const {
  bottom0,
  bottompx,
  bottom0_5,
  bottom1,
  bottom1_5,
  bottom2,
  bottom2_5,
  bottom3,
  bottom3_5,
  bottom4,
  bottom5,
  bottom6,
  bottom7,
  bottom8,
  bottom9,
  bottom10,
  bottom11,
  bottom12,
  bottom14,
  bottom16,
  bottom20,
  bottom24,
  bottom28,
  bottom32,
  bottom36,
  bottom40,
  bottom44,
  bottom48,
  bottom52,
  bottom56,
  bottom60,
  bottom64,
  bottom72,
  bottom80,
  bottom96,
  bottomAuto,
  bottomFull,
  bottomHalf,
  bottomThird,
  bottomTwoThirds,
  bottomQuarter,
  bottomThreeQuarters,
} = bottomTokens;

// ============================================
// Individual token exports (flat) - Left
// ============================================

export const {
  left0,
  leftpx,
  left0_5,
  left1,
  left1_5,
  left2,
  left2_5,
  left3,
  left3_5,
  left4,
  left5,
  left6,
  left7,
  left8,
  left9,
  left10,
  left11,
  left12,
  left14,
  left16,
  left20,
  left24,
  left28,
  left32,
  left36,
  left40,
  left44,
  left48,
  left52,
  left56,
  left60,
  left64,
  left72,
  left80,
  left96,
  leftAuto,
  leftFull,
  leftHalf,
  leftThird,
  leftTwoThirds,
  leftQuarter,
  leftThreeQuarters,
} = leftTokens;

// ============================================
// Individual token exports (flat) - Inset
// ============================================

export const {
  inset0,
  insetpx,
  inset0_5,
  inset1,
  inset1_5,
  inset2,
  inset2_5,
  inset3,
  inset3_5,
  inset4,
  inset5,
  inset6,
  inset7,
  inset8,
  inset9,
  inset10,
  inset11,
  inset12,
  inset14,
  inset16,
  inset20,
  inset24,
  inset28,
  inset32,
  inset36,
  inset40,
  inset44,
  inset48,
  inset52,
  inset56,
  inset60,
  inset64,
  inset72,
  inset80,
  inset96,
  insetAuto,
  insetFull,
  insetHalf,
  insetThird,
  insetTwoThirds,
  insetQuarter,
  insetThreeQuarters,
} = insetTokens;

// ============================================
// Individual token exports (flat) - Inset X
// ============================================

export const {
  insetX0,
  insetXpx,
  insetX0_5,
  insetX1,
  insetX1_5,
  insetX2,
  insetX2_5,
  insetX3,
  insetX3_5,
  insetX4,
  insetX5,
  insetX6,
  insetX7,
  insetX8,
  insetX9,
  insetX10,
  insetX11,
  insetX12,
  insetX14,
  insetX16,
  insetX20,
  insetX24,
  insetX28,
  insetX32,
  insetX36,
  insetX40,
  insetX44,
  insetX48,
  insetX52,
  insetX56,
  insetX60,
  insetX64,
  insetX72,
  insetX80,
  insetX96,
  insetXAuto,
  insetXFull,
  insetXHalf,
  insetXThird,
  insetXTwoThirds,
  insetXQuarter,
  insetXThreeQuarters,
} = insetXTokens;

// ============================================
// Individual token exports (flat) - Inset Y
// ============================================

export const {
  insetY0,
  insetYpx,
  insetY0_5,
  insetY1,
  insetY1_5,
  insetY2,
  insetY2_5,
  insetY3,
  insetY3_5,
  insetY4,
  insetY5,
  insetY6,
  insetY7,
  insetY8,
  insetY9,
  insetY10,
  insetY11,
  insetY12,
  insetY14,
  insetY16,
  insetY20,
  insetY24,
  insetY28,
  insetY32,
  insetY36,
  insetY40,
  insetY44,
  insetY48,
  insetY52,
  insetY56,
  insetY60,
  insetY64,
  insetY72,
  insetY80,
  insetY96,
  insetYAuto,
  insetYFull,
  insetYHalf,
  insetYThird,
  insetYTwoThirds,
  insetYQuarter,
  insetYThreeQuarters,
} = insetYTokens;

// ============================================
// Individual token exports (flat) - Z-index
// ============================================

export const { z0, z10, z20, z30, z40, z50, zAuto } = zIndexTokens;

// ============================================
// Individual token exports (flat) - Overflow
// ============================================

export const {
  overflowAuto,
  overflowHidden,
  overflowClip,
  overflowVisible,
  overflowScroll,
  overflowXAuto,
  overflowXHidden,
  overflowXClip,
  overflowXVisible,
  overflowXScroll,
  overflowYAuto,
  overflowYHidden,
  overflowYClip,
  overflowYVisible,
  overflowYScroll,
} = overflowTokens;

// ============================================
// Individual token exports (flat) - Visibility
// ============================================

export const { visible, invisible, collapse } = visibilityTokens;

// ============================================
// Namespace export (grouped)
// ============================================

/** All layout tokens in a namespace */
export const layout = {
  // Position
  ...positionTokens,
  // Top
  ...topTokens,
  // Right
  ...rightTokens,
  // Bottom
  ...bottomTokens,
  // Left
  ...leftTokens,
  // Inset
  ...insetTokens,
  // Inset X
  ...insetXTokens,
  // Inset Y
  ...insetYTokens,
  // Z-index
  ...zIndexTokens,
  // Overflow
  ...overflowTokens,
  // Visibility
  ...visibilityTokens,
  // Arbitrary (tagged templates)
  top,
  right,
  bottom,
  left,
  inset,
  insetX,
  insetY,
  z,
};

// Type for the layout namespace
export type LayoutNamespace = typeof layout;

// Legacy type exports for backwards compatibility
export type LayoutValues = Record<string, StyleToken>;
export type LayoutGroup = LayoutNamespace;

// Legacy exports for backwards compatibility
export const layoutArb = {
  top,
  right,
  bottom,
  left,
  inset,
  insetX,
  insetY,
  z,
};

// Legacy proxies (for backwards compatibility only)
export const position = positionTokens;
export const overflow = overflowTokens;
export const overflowX = overflowTokens;
export const overflowY = overflowTokens;
export const visibility = visibilityTokens;
export const zIndex = zIndexTokens;

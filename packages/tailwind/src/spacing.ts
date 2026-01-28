/**
 * Spacing utilities: padding, margin, gap
 *
 * Usage:
 * ```ts
 * // Predefined values (camelCase via Proxy)
 * import { spacing } from "@semajsx/tailwind";
 * <div class={[spacing.p4, spacing.mx2]}>
 *
 * // Destructuring works
 * const { p4, mx2, gap4 } = spacing;
 *
 * // Arbitrary values (tagged template)
 * import { p, m } from "@semajsx/tailwind";
 * <div class={[p`10px`, m`calc(100% - 40px)`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createMultiUtility, createTaggedUtility } from "./core";

// Tailwind spacing scale (in rem, where 4 = 1rem)
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

// Utility function creators
const utilityCreators: Record<string, (value: string, valueName?: string) => StyleToken> = {
  p: createUtility("padding", "p"),
  px: createMultiUtility(["padding-left", "padding-right"], "px"),
  py: createMultiUtility(["padding-top", "padding-bottom"], "py"),
  pt: createUtility("padding-top", "pt"),
  pr: createUtility("padding-right", "pr"),
  pb: createUtility("padding-bottom", "pb"),
  pl: createUtility("padding-left", "pl"),
  m: createUtility("margin", "m"),
  mx: createMultiUtility(["margin-left", "margin-right"], "mx"),
  my: createMultiUtility(["margin-top", "margin-bottom"], "my"),
  mt: createUtility("margin-top", "mt"),
  mr: createUtility("margin-right", "mr"),
  mb: createUtility("margin-bottom", "mb"),
  ml: createUtility("margin-left", "ml"),
  gap: createUtility("gap", "gap"),
  gapX: createUtility("column-gap", "gap-x"),
  gapY: createUtility("row-gap", "gap-y"),
};

// Parse property name like "p4", "mx2", "gap0_5" -> { prefix: "p", scale: "4" }
function parseSpacingProp(prop: string): { prefix: string; scaleKey: string } | null {
  // Try each prefix from longest to shortest
  const prefixes = [
    "gapX",
    "gapY",
    "gap",
    "px",
    "py",
    "pt",
    "pr",
    "pb",
    "pl",
    "mx",
    "my",
    "mt",
    "mr",
    "mb",
    "ml",
    "p",
    "m",
  ];

  for (const prefix of prefixes) {
    if (prop.startsWith(prefix)) {
      const scaleKey = prop.slice(prefix.length);
      // Convert "0_5" back to "0.5", handle "px" special case
      const normalizedKey = scaleKey === "px" ? "px" : scaleKey.replace(/_/g, ".");
      if (normalizedKey in spacingScale || scaleKey === "px") {
        return { prefix, scaleKey: normalizedKey };
      }
    }
  }
  return null;
}

// Cache for generated tokens
const tokenCache = new Map<string, StyleToken>();

/** Spacing namespace type */
export interface SpacingNamespace {
  [key: string]: StyleToken;
}

/**
 * Spacing namespace with all predefined values (via Proxy)
 *
 * @example
 * ```ts
 * import { spacing } from "@semajsx/tailwind";
 *
 * // Direct access
 * spacing.p4   // padding: 1rem
 * spacing.mx2  // margin-left/right: 0.5rem
 * spacing.gap4 // gap: 1rem
 *
 * // Destructuring works
 * const { p4, mx2, gap4 } = spacing;
 * ```
 */
export const spacing: SpacingNamespace = new Proxy({} as SpacingNamespace, {
  get(_target, prop: string): StyleToken | undefined {
    // Check cache first
    if (tokenCache.has(prop)) {
      return tokenCache.get(prop);
    }

    // Parse the property name
    const parsed = parseSpacingProp(prop);
    if (!parsed) {
      return undefined;
    }

    const { prefix, scaleKey } = parsed;
    const utilityFn = utilityCreators[prefix];
    const cssValue = spacingScale[scaleKey];

    if (!utilityFn || !cssValue) {
      return undefined;
    }

    // Generate and cache the token
    const token = utilityFn(cssValue, scaleKey);
    tokenCache.set(prop, token);
    return token;
  },

  has(_target, prop: string): boolean {
    return parseSpacingProp(prop) !== null;
  },

  ownKeys(): string[] {
    // Generate all possible keys for enumeration (needed for Object.keys, spreading)
    const keys: string[] = [];
    const prefixes = Object.keys(utilityCreators);

    for (const prefix of prefixes) {
      for (const scaleKey of Object.keys(spacingScale)) {
        // Convert "0.5" to "0_5" for property name
        const propKey = scaleKey.replace(/\./g, "_");
        keys.push(`${prefix}${propKey}`);
      }
    }
    return keys;
  },

  getOwnPropertyDescriptor(_target, prop: string) {
    if (parseSpacingProp(prop)) {
      return {
        enumerable: true,
        configurable: true,
        value: this.get!(_target, prop, _target),
      };
    }
    return undefined;
  },
});

// ============================================
// Tagged Template Functions (Arbitrary Values)
// ============================================

/** Padding - arbitrary value: p\`10px\` */
export const p: TaggedUtilityFn = createTaggedUtility(utilityCreators.p);
/** Padding X - arbitrary value: pX\`10px\` */
export const pX: TaggedUtilityFn = createTaggedUtility(utilityCreators.px);
/** Padding Y - arbitrary value: pY\`10px\` */
export const pY: TaggedUtilityFn = createTaggedUtility(utilityCreators.py);
/** Padding Top - arbitrary value: pT\`10px\` */
export const pT: TaggedUtilityFn = createTaggedUtility(utilityCreators.pt);
/** Padding Right - arbitrary value: pR\`10px\` */
export const pR: TaggedUtilityFn = createTaggedUtility(utilityCreators.pr);
/** Padding Bottom - arbitrary value: pB\`10px\` */
export const pB: TaggedUtilityFn = createTaggedUtility(utilityCreators.pb);
/** Padding Left - arbitrary value: pL\`10px\` */
export const pL: TaggedUtilityFn = createTaggedUtility(utilityCreators.pl);

/** Margin - arbitrary value: m\`10px\` */
export const m: TaggedUtilityFn = createTaggedUtility(utilityCreators.m);
/** Margin X - arbitrary value: mX\`10px\` */
export const mX: TaggedUtilityFn = createTaggedUtility(utilityCreators.mx);
/** Margin Y - arbitrary value: mY\`10px\` */
export const mY: TaggedUtilityFn = createTaggedUtility(utilityCreators.my);
/** Margin Top - arbitrary value: mT\`10px\` */
export const mT: TaggedUtilityFn = createTaggedUtility(utilityCreators.mt);
/** Margin Right - arbitrary value: mR\`10px\` */
export const mR: TaggedUtilityFn = createTaggedUtility(utilityCreators.mr);
/** Margin Bottom - arbitrary value: mB\`10px\` */
export const mB: TaggedUtilityFn = createTaggedUtility(utilityCreators.mb);
/** Margin Left - arbitrary value: mL\`10px\` */
export const mL: TaggedUtilityFn = createTaggedUtility(utilityCreators.ml);

/** Gap - arbitrary value: gapArb\`10px\` */
export const gapArb: TaggedUtilityFn = createTaggedUtility(utilityCreators.gap);
/** Gap X - arbitrary value: gapXArb\`10px\` */
export const gapXArb: TaggedUtilityFn = createTaggedUtility(utilityCreators.gapX);
/** Gap Y - arbitrary value: gapYArb\`10px\` */
export const gapYArb: TaggedUtilityFn = createTaggedUtility(utilityCreators.gapY);

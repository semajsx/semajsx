/**
 * Sizing utilities: width, height, min/max width/height
 *
 * Usage:
 * ```ts
 * // Predefined values (camelCase via Proxy)
 * import { sizing } from "@semajsx/tailwind";
 * <div class={[sizing.w4, sizing.hFull, sizing.maxWLg]}>
 *
 * // Destructuring works
 * const { w4, hFull, maxWLg } = sizing;
 *
 * // Arbitrary values (tagged template)
 * import { w, h, maxW } from "@semajsx/tailwind";
 * <div class={[w`300px`, h`calc(100vh - 64px)`]}>
 * ```
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

const sizeFnBase = createUtility("width", "size");

// Size utility (sets both width and height)
const sizeUtilityFn = (value: string, valueName?: string): StyleToken => {
  const token = sizeFnBase(value, valueName);
  return {
    ...token,
    __cssTemplate: `.${token._} { width: ${value}; height: ${value}; }`,
  };
};

// Utility definitions for the namespace
interface SizingUtility {
  fn: (value: string, valueName?: string) => StyleToken;
  scale: Record<string, string>;
  classPrefix: string;
}

const utilityDefs: Record<string, SizingUtility> = {
  w: { fn: widthFn, scale: sizingScale, classPrefix: "w" },
  h: { fn: heightFn, scale: heightScale, classPrefix: "h" },
  minW: { fn: minWidthFn, scale: minMaxWidthScale, classPrefix: "minW" },
  maxW: { fn: maxWidthFn, scale: minMaxWidthScale, classPrefix: "maxW" },
  minH: { fn: minHeightFn, scale: minMaxHeightScale, classPrefix: "minH" },
  maxH: { fn: maxHeightFn, scale: minMaxHeightScale, classPrefix: "maxH" },
  size: { fn: sizeUtilityFn, scale: sizingScale, classPrefix: "size" },
};

// Convert scale key to valid JS property name
// "1/2" -> "1_2", "0.5" -> "0_5", "screen-sm" -> "screenSm"
function scaleKeyToPropertyKey(scaleKey: string): string {
  return scaleKey
    .replace(/\//g, "_") // 1/2 -> 1_2
    .replace(/\./g, "_") // 0.5 -> 0_5
    .replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()); // screen-sm -> screenSm
}

// Convert property key back to scale key
// "1_2" -> "1/2" (for fractions), "0_5" -> "0.5", "screenSm" -> "screen-sm"
function propertyKeyToScaleKey(propKey: string): string {
  // Check if it's a fraction pattern (number_number)
  if (/^\d+_\d+$/.test(propKey)) {
    return propKey.replace(/_/g, "/");
  }
  // Check if it's a decimal pattern (number_number)
  if (/^\d+_\d+$/.test(propKey)) {
    return propKey.replace(/_/g, ".");
  }
  // Handle decimal like "0_5" -> "0.5"
  if (/^0_\d+$/.test(propKey) || /^\d+_5$/.test(propKey)) {
    return propKey.replace(/_/g, ".");
  }
  // Handle camelCase -> kebab-case (screenSm -> screen-sm)
  return propKey.replace(/([A-Z])/g, (_, c) => `-${c.toLowerCase()}`);
}

// Parse property name to extract utility prefix and scale key
// "w4" -> { prefix: "w", scaleKey: "4" }
// "wFull" -> { prefix: "w", scaleKey: "full" }
// "maxWLg" -> { prefix: "maxW", scaleKey: "lg" }
// "w1_2" -> { prefix: "w", scaleKey: "1/2" }
function parseSizingProp(prop: string): { prefix: string; scaleKey: string } | null {
  // Try each prefix from longest to shortest
  const prefixes = ["minW", "maxW", "minH", "maxH", "size", "w", "h"];

  for (const prefix of prefixes) {
    if (prop.startsWith(prefix)) {
      const rest = prop.slice(prefix.length);
      if (!rest) continue;

      const def = utilityDefs[prefix];
      if (!def) continue;

      // Convert first char to lowercase for matching
      const normalizedRest = rest[0]!.toLowerCase() + rest.slice(1);
      const scaleKey = propertyKeyToScaleKey(normalizedRest);

      // Check if the scale key exists
      if (scaleKey in def.scale) {
        return { prefix, scaleKey };
      }

      // Also try the original rest (for numeric keys like "4")
      if (normalizedRest in def.scale) {
        return { prefix, scaleKey: normalizedRest };
      }
    }
  }
  return null;
}

// Cache for generated tokens
const tokenCache = new Map<string, StyleToken>();

/** Sizing namespace type */
export interface SizingNamespace {
  [key: string]: StyleToken;
}

/**
 * Sizing namespace with all predefined values (via Proxy)
 *
 * @example
 * ```ts
 * import { sizing } from "@semajsx/tailwind";
 *
 * // Direct access
 * sizing.w4     // width: 1rem
 * sizing.hFull  // height: 100%
 * sizing.maxWLg // max-width: 32rem
 * sizing.w1_2   // width: 50% (fraction 1/2)
 *
 * // Destructuring works
 * const { w4, hFull, maxWLg } = sizing;
 * ```
 */
export const sizing: SizingNamespace = new Proxy({} as SizingNamespace, {
  get(_target, prop: string): StyleToken | undefined {
    // Check cache first
    if (tokenCache.has(prop)) {
      return tokenCache.get(prop);
    }

    // Parse the property name
    const parsed = parseSizingProp(prop);
    if (!parsed) {
      return undefined;
    }

    const { prefix, scaleKey } = parsed;
    const def = utilityDefs[prefix];
    if (!def) return undefined;

    const cssValue = def.scale[scaleKey];
    if (!cssValue) {
      return undefined;
    }

    // Generate and cache the token
    const token = def.fn(cssValue, scaleKey);
    tokenCache.set(prop, token);
    return token;
  },

  has(_target, prop: string): boolean {
    return parseSizingProp(prop) !== null;
  },

  ownKeys(): string[] {
    // Generate all possible keys for enumeration (needed for Object.keys, spreading)
    const keys: string[] = [];

    for (const [prefix, def] of Object.entries(utilityDefs)) {
      for (const scaleKey of Object.keys(def.scale)) {
        const propKey = scaleKeyToPropertyKey(scaleKey);
        // Capitalize first letter of propKey if prefix ends with lowercase
        const capitalizedPropKey = propKey[0]!.toUpperCase() + propKey.slice(1);
        keys.push(`${prefix}${capitalizedPropKey}`);
      }
    }
    return keys;
  },

  getOwnPropertyDescriptor(_target, prop: string) {
    if (parseSizingProp(prop)) {
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

/** Width - arbitrary value: w\`300px\` */
export const w: TaggedUtilityFn = createTaggedUtility(widthFn);
/** Min Width - arbitrary value: minW\`300px\` */
export const minW: TaggedUtilityFn = createTaggedUtility(minWidthFn);
/** Max Width - arbitrary value: maxW\`800px\` */
export const maxW: TaggedUtilityFn = createTaggedUtility(maxWidthFn);

/** Height - arbitrary value: h\`100vh\` */
export const h: TaggedUtilityFn = createTaggedUtility(heightFn);
/** Min Height - arbitrary value: minH\`100px\` */
export const minH: TaggedUtilityFn = createTaggedUtility(minHeightFn);
/** Max Height - arbitrary value: maxH\`500px\` */
export const maxH: TaggedUtilityFn = createTaggedUtility(maxHeightFn);

/** Size (width & height) - arbitrary value: size\`48px\` */
export const size: TaggedUtilityFn = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): StyleToken => {
  let result = strings[0] ?? "";
  for (let i = 0; i < values.length; i++) {
    result += String(values[i]) + (strings[i + 1] ?? "");
  }
  return sizeUtilityFn(result);
};

// Legacy exports for backwards compatibility (grouped objects)
// These are deprecated - use `sizing` namespace instead

/** @deprecated Use `sizing` namespace instead */
export interface SizingGroup {
  w: SizingValues;
  minW: SizingValues;
  maxW: SizingValues;
  h: SizingValues;
  minH: SizingValues;
  maxH: SizingValues;
  size: SizingValues;
}

/** @deprecated Use tagged template functions instead */
export interface SizingArbGroup {
  w: TaggedUtilityFn;
  minW: TaggedUtilityFn;
  maxW: TaggedUtilityFn;
  h: TaggedUtilityFn;
  minH: TaggedUtilityFn;
  maxH: TaggedUtilityFn;
  size: TaggedUtilityFn;
}

// Helper to generate predefined values for a utility (for legacy support)
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

// Legacy grouped exports (for backwards compatibility only)
const legacyW: SizingValues = generateSizingValues(widthFn, sizingScale);
const legacyMinW: SizingValues = generateSizingValues(minWidthFn, minMaxWidthScale);
const legacyMaxW: SizingValues = generateSizingValues(maxWidthFn, minMaxWidthScale);
const legacyH: SizingValues = generateSizingValues(heightFn, heightScale);
const legacyMinH: SizingValues = generateSizingValues(minHeightFn, minMaxHeightScale);
const legacyMaxH: SizingValues = generateSizingValues(maxHeightFn, minMaxHeightScale);
const legacySize: SizingValues = generateSizingValues(sizeUtilityFn, sizingScale);

/** @deprecated Use `sizing` namespace instead */
export const sizingGroup: SizingGroup = {
  w: legacyW,
  minW: legacyMinW,
  maxW: legacyMaxW,
  h: legacyH,
  minH: legacyMinH,
  maxH: legacyMaxH,
  size: legacySize,
};

export const sizingArb: SizingArbGroup = {
  w: w,
  minW: minW,
  maxW: maxW,
  h: h,
  minH: minH,
  maxH: maxH,
  size: size,
};

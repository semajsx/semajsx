/**
 * Sizing utilities: width, height, min/max width/height
 *
 * Usage:
 * ```ts
 * // Predefined values (via Proxy)
 * import { w, h, maxW } from "@semajsx/tailwind";
 * <div class={[w.full, w["4"], h.screen, maxW.lg]}>
 *
 * // Destructuring works
 * const { full, screen, auto } = w;
 *
 * // Arbitrary values (tagged template - same function!)
 * <div class={[w`300px`, h`calc(100vh - 64px)`, maxW`800px`]}>
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

// Min/max width scale
const minMaxWidthScale: Record<string, string> = {
  "0": "0px",
  full: "100%",
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
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
  screenSm: "640px",
  screenMd: "768px",
  screenLg: "1024px",
  screenXl: "1280px",
  screen2xl: "1536px",
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

/**
 * Create a sizing utility that works as both:
 * - Proxy namespace for predefined values: w.full, w["4"]
 * - Tagged template function for arbitrary values: w`300px`
 */
function createSizingUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TaggedUtilityFn & SizingValues {
  const tokenCache = new Map<string, StyleToken>();
  const taggedFn = createTaggedUtility(utilityFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      // Check if prop exists in scale
      if (prop in scale) {
        const token = utilityFn(scale[prop]!, prop);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in scale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(scale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in scale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & SizingValues;
}

// Special size utility that sets both width and height
function createSizeUtility(scale: Record<string, string>): TaggedUtilityFn & SizingValues {
  const tokenCache = new Map<string, StyleToken>();

  const taggedFn: TaggedUtilityFn = (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): StyleToken => {
    let result = strings[0] ?? "";
    for (let i = 0; i < values.length; i++) {
      result += String(values[i]) + (strings[i + 1] ?? "");
    }
    return sizeUtilityFn(result);
  };

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in scale) {
        const token = sizeUtilityFn(scale[prop]!, prop);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in scale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(scale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in scale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & SizingValues;
}

// ============================================
// Sizing Utilities (both namespace and tagged template)
// ============================================

/**
 * Width utility
 * @example
 * w.full, w["4"], w["1/2"] // predefined
 * w`300px` // arbitrary
 */
export const w: TaggedUtilityFn & SizingValues = createSizingUtility(widthFn, sizingScale);

/**
 * Min-width utility
 * @example
 * minW.full, minW["0"] // predefined
 * minW`200px` // arbitrary
 */
export const minW: TaggedUtilityFn & SizingValues = createSizingUtility(
  minWidthFn,
  minMaxWidthScale,
);

/**
 * Max-width utility
 * @example
 * maxW.lg, maxW.prose, maxW.screenSm // predefined
 * maxW`800px` // arbitrary
 */
export const maxW: TaggedUtilityFn & SizingValues = createSizingUtility(
  maxWidthFn,
  minMaxWidthScale,
);

/**
 * Height utility
 * @example
 * h.full, h.screen, h["4"] // predefined
 * h`100vh` // arbitrary
 */
export const h: TaggedUtilityFn & SizingValues = createSizingUtility(heightFn, heightScale);

/**
 * Min-height utility
 * @example
 * minH.full, minH.screen // predefined
 * minH`100px` // arbitrary
 */
export const minH: TaggedUtilityFn & SizingValues = createSizingUtility(
  minHeightFn,
  minMaxHeightScale,
);

/**
 * Max-height utility
 * @example
 * maxH.full, maxH.screen // predefined
 * maxH`500px` // arbitrary
 */
export const maxH: TaggedUtilityFn & SizingValues = createSizingUtility(
  maxHeightFn,
  minMaxHeightScale,
);

/**
 * Size utility (sets both width and height)
 * @example
 * size.full, size["4"] // predefined
 * size`48px` // arbitrary
 */
export const size: TaggedUtilityFn & SizingValues = createSizeUtility(sizingScale);

// ============================================
// Grouped exports
// ============================================

/** Grouped sizing utilities */
export interface SizingGroup {
  w: TaggedUtilityFn & SizingValues;
  minW: TaggedUtilityFn & SizingValues;
  maxW: TaggedUtilityFn & SizingValues;
  h: TaggedUtilityFn & SizingValues;
  minH: TaggedUtilityFn & SizingValues;
  maxH: TaggedUtilityFn & SizingValues;
  size: TaggedUtilityFn & SizingValues;
}

export const sizing: SizingGroup = {
  w,
  minW,
  maxW,
  h,
  minH,
  maxH,
  size,
};

// Legacy type exports for backwards compatibility
export type { SizingGroup as SizingArbGroup };
export type SizingNamespace = SizingGroup;
export const sizingArb: SizingGroup = sizing;

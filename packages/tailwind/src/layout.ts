/**
 * Layout utilities: position, overflow, z-index, etc.
 *
 * Usage:
 * ```ts
 * // Predefined values (via Proxy)
 * import { position, top, zIndex, overflow } from "@semajsx/tailwind";
 * <div class={[position.absolute, top["4"], zIndex["10"], overflow.hidden]}>
 *
 * // Arbitrary values (tagged template - same function!)
 * <div class={[top`100px`, zIndex`999`]}>
 * ```
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

/**
 * Create a layout utility that works as both namespace and tagged template
 */
function createLayoutUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TaggedUtilityFn & LayoutValues {
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

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & LayoutValues;
}

/**
 * Create a simple utility that only has predefined values (no arbitrary)
 */
function createSimpleLayoutUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as LayoutValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

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
  });
}

/**
 * Create position utility (special class names without prefix)
 */
function createPositionUtility(): LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as LayoutValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in positionValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}${prop}`;
        const value = positionValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { position: ${value}; }`,
          toString() {
            return this._;
          },
        };
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in positionValues;
    },

    ownKeys(): string[] {
      return Object.keys(positionValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in positionValues) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  });
}

/**
 * Create inset utility (combines top, right, bottom, left)
 */
function createInsetUtility(): TaggedUtilityFn & LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = `${prefix}inset-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { inset: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const insetFn = (value: string, valueName?: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const name = valueName ?? value.replace(/[^a-z0-9]/gi, "_");
    const className = `${prefix}inset-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { inset: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(insetFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in insetScale) {
        const token = createToken(prop, insetScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in insetScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(insetScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in insetScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & LayoutValues;
}

/**
 * Create insetX utility (combines left and right)
 */
function createInsetXUtility(): TaggedUtilityFn & LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = `${prefix}inset-x-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { left: ${value}; right: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const insetXFn = (value: string, valueName?: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const name = valueName ?? value.replace(/[^a-z0-9]/gi, "_");
    const className = `${prefix}inset-x-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { left: ${value}; right: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(insetXFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in insetScale) {
        const token = createToken(prop, insetScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in insetScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(insetScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in insetScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & LayoutValues;
}

/**
 * Create insetY utility (combines top and bottom)
 */
function createInsetYUtility(): TaggedUtilityFn & LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = `${prefix}inset-y-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { top: ${value}; bottom: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const insetYFn = (value: string, valueName?: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const name = valueName ?? value.replace(/[^a-z0-9]/gi, "_");
    const className = `${prefix}inset-y-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { top: ${value}; bottom: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(insetYFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in insetScale) {
        const token = createToken(prop, insetScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in insetScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(insetScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in insetScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & LayoutValues;
}

/**
 * Create visibility utility (special class names)
 */
function createVisibilityUtility(): LayoutValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as LayoutValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in visibilityValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}${prop}`;
        const value = visibilityValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { visibility: ${value}; }`,
          toString() {
            return this._;
          },
        };
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in visibilityValues;
    },

    ownKeys(): string[] {
      return Object.keys(visibilityValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in visibilityValues) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  });
}

// ============================================
// Layout Utilities
// ============================================

/**
 * Position utility
 * @example
 * position.absolute, position.relative, position.fixed // predefined
 */
export const position: LayoutValues = createPositionUtility();

/**
 * Inset utility (all directions)
 * @example
 * inset["0"], inset["4"], inset.auto // predefined
 * inset`100px` // arbitrary
 */
export const inset: TaggedUtilityFn & LayoutValues = createInsetUtility();

/**
 * Inset X utility (left and right)
 * @example
 * insetX["0"], insetX["4"] // predefined
 * insetX`100px` // arbitrary
 */
export const insetX: TaggedUtilityFn & LayoutValues = createInsetXUtility();

/**
 * Inset Y utility (top and bottom)
 * @example
 * insetY["0"], insetY["4"] // predefined
 * insetY`100px` // arbitrary
 */
export const insetY: TaggedUtilityFn & LayoutValues = createInsetYUtility();

/**
 * Top utility
 * @example
 * top["0"], top["4"], top.auto // predefined
 * top`100px` // arbitrary
 */
export const top: TaggedUtilityFn & LayoutValues = createLayoutUtility(topFn, insetScale);

/**
 * Right utility
 * @example
 * right["0"], right["4"], right.auto // predefined
 * right`100px` // arbitrary
 */
export const right: TaggedUtilityFn & LayoutValues = createLayoutUtility(rightFn, insetScale);

/**
 * Bottom utility
 * @example
 * bottom["0"], bottom["4"], bottom.auto // predefined
 * bottom`100px` // arbitrary
 */
export const bottom: TaggedUtilityFn & LayoutValues = createLayoutUtility(bottomFn, insetScale);

/**
 * Left utility
 * @example
 * left["0"], left["4"], left.auto // predefined
 * left`100px` // arbitrary
 */
export const left: TaggedUtilityFn & LayoutValues = createLayoutUtility(leftFn, insetScale);

/**
 * Z-index utility
 * @example
 * zIndex["10"], zIndex["50"], zIndex.auto // predefined
 * zIndex`999` // arbitrary
 */
export const zIndex: TaggedUtilityFn & LayoutValues = createLayoutUtility(zIndexFn, zIndexScale);

/**
 * Overflow utility
 * @example
 * overflow.hidden, overflow.auto, overflow.scroll // predefined
 */
export const overflow: LayoutValues = createSimpleLayoutUtility(overflowFn, overflowValues);

/**
 * Overflow X utility
 * @example
 * overflowX.hidden, overflowX.auto // predefined
 */
export const overflowX: LayoutValues = createSimpleLayoutUtility(overflowXFn, overflowValues);

/**
 * Overflow Y utility
 * @example
 * overflowY.hidden, overflowY.auto // predefined
 */
export const overflowY: LayoutValues = createSimpleLayoutUtility(overflowYFn, overflowValues);

/**
 * Visibility utility
 * @example
 * visibility.visible, visibility.invisible // predefined
 */
export const visibility: LayoutValues = createVisibilityUtility();

// ============================================
// Grouped exports
// ============================================

/** Grouped layout utilities */
export interface LayoutGroup {
  position: LayoutValues;
  inset: TaggedUtilityFn & LayoutValues;
  insetX: TaggedUtilityFn & LayoutValues;
  insetY: TaggedUtilityFn & LayoutValues;
  top: TaggedUtilityFn & LayoutValues;
  right: TaggedUtilityFn & LayoutValues;
  bottom: TaggedUtilityFn & LayoutValues;
  left: TaggedUtilityFn & LayoutValues;
  zIndex: TaggedUtilityFn & LayoutValues;
  overflow: LayoutValues;
  overflowX: LayoutValues;
  overflowY: LayoutValues;
  visibility: LayoutValues;
}

export const layout: LayoutGroup = {
  position,
  inset,
  insetX,
  insetY,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  overflowX,
  overflowY,
  visibility,
};

// Legacy exports for backwards compatibility
export const layoutArb = {
  top,
  right,
  bottom,
  left,
  zIndex,
  inset,
  insetX,
  insetY,
};

/**
 * Effects utilities: border, rounded, shadow, opacity
 *
 * Usage:
 * ```ts
 * // Predefined values (via Proxy)
 * import { borderWidth, borderRadius, boxShadow, opacity } from "@semajsx/tailwind";
 * <div class={[borderWidth["2"], borderRadius.lg, boxShadow.md, opacity["50"]]}>
 *
 * // Arbitrary values (tagged template - same function!)
 * <div class={[borderWidth`3px`, borderRadius`10px`, opacity`0.75`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for effects value records */
export type EffectsValues = Record<string, StyleToken>;

// Border width scale
const borderWidthScale: Record<string, string> = {
  "0": "0px",
  DEFAULT: "1px",
  "2": "2px",
  "4": "4px",
  "8": "8px",
};

// Border radius scale
const borderRadiusScale: Record<string, string> = {
  none: "0px",
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px",
};

// Box shadow scale
const boxShadowScale: Record<string, string> = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "0 0 #0000",
};

// Opacity scale
const opacityScale: Record<string, string> = {
  "0": "0",
  "5": "0.05",
  "10": "0.1",
  "15": "0.15",
  "20": "0.2",
  "25": "0.25",
  "30": "0.3",
  "35": "0.35",
  "40": "0.4",
  "45": "0.45",
  "50": "0.5",
  "55": "0.55",
  "60": "0.6",
  "65": "0.65",
  "70": "0.7",
  "75": "0.75",
  "80": "0.8",
  "85": "0.85",
  "90": "0.9",
  "95": "0.95",
  "100": "1",
};

// Border style values
const borderStyleValues: Record<string, string> = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
  double: "double",
  hidden: "hidden",
  none: "none",
};

// Cursor values (camelCase for readability)
const cursorValues: Record<string, string> = {
  auto: "auto",
  default: "default",
  pointer: "pointer",
  wait: "wait",
  text: "text",
  move: "move",
  help: "help",
  notAllowed: "not-allowed",
  none: "none",
  contextMenu: "context-menu",
  progress: "progress",
  cell: "cell",
  crosshair: "crosshair",
  verticalText: "vertical-text",
  alias: "alias",
  copy: "copy",
  noDrop: "no-drop",
  grab: "grab",
  grabbing: "grabbing",
  allScroll: "all-scroll",
  colResize: "col-resize",
  rowResize: "row-resize",
  nResize: "n-resize",
  eResize: "e-resize",
  sResize: "s-resize",
  wResize: "w-resize",
  neResize: "ne-resize",
  nwResize: "nw-resize",
  seResize: "se-resize",
  swResize: "sw-resize",
  ewResize: "ew-resize",
  nsResize: "ns-resize",
  neswResize: "nesw-resize",
  nwseResize: "nwse-resize",
  zoomIn: "zoom-in",
  zoomOut: "zoom-out",
};

// Cursor class name mapping
const cursorClassMap: Record<string, string> = {
  notAllowed: "not-allowed",
  contextMenu: "context-menu",
  verticalText: "vertical-text",
  noDrop: "no-drop",
  allScroll: "all-scroll",
  colResize: "col-resize",
  rowResize: "row-resize",
  nResize: "n-resize",
  eResize: "e-resize",
  sResize: "s-resize",
  wResize: "w-resize",
  neResize: "ne-resize",
  nwResize: "nw-resize",
  seResize: "se-resize",
  swResize: "sw-resize",
  ewResize: "ew-resize",
  nsResize: "ns-resize",
  neswResize: "nesw-resize",
  nwseResize: "nwse-resize",
  zoomIn: "zoom-in",
  zoomOut: "zoom-out",
};

// Pointer events values
const pointerEventsValues: Record<string, string> = {
  none: "none",
  auto: "auto",
};

// User select values
const userSelectValues: Record<string, string> = {
  none: "none",
  text: "text",
  all: "all",
  auto: "auto",
};

// Create utility functions
const borderWidthFn = createUtility("border-width", "border");
const borderRadiusFn = createUtility("border-radius", "rounded");
const boxShadowFn = createUtility("box-shadow", "shadow");
const opacityFn = createUtility("opacity", "opacity");
const pointerEventsFn = createUtility("pointer-events", "pointer-events");
const userSelectFn = createUtility("user-select", "select");

/**
 * Create an effects utility that works as both namespace and tagged template
 */
function createEffectsUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TaggedUtilityFn & EffectsValues {
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

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & EffectsValues;
}

/**
 * Create a simple utility that only has predefined values (no arbitrary)
 */
function createSimpleEffectsUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as EffectsValues, {
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
 * Create border width utility (special: DEFAULT maps to base class)
 */
function createBorderWidthUtility(): TaggedUtilityFn & EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = name === "DEFAULT" ? `${prefix}border` : `${prefix}border-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-width: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(borderWidthFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in borderWidthScale) {
        const token = createToken(prop, borderWidthScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in borderWidthScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(borderWidthScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in borderWidthScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & EffectsValues;
}

/**
 * Create border radius utility (special: DEFAULT maps to base class)
 */
function createBorderRadiusUtility(): TaggedUtilityFn & EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = name === "DEFAULT" ? `${prefix}rounded` : `${prefix}rounded-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-radius: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(borderRadiusFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in borderRadiusScale) {
        const token = createToken(prop, borderRadiusScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in borderRadiusScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(borderRadiusScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in borderRadiusScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & EffectsValues;
}

/**
 * Create box shadow utility (special: DEFAULT maps to base class)
 */
function createBoxShadowUtility(): TaggedUtilityFn & EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string, value: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const className = name === "DEFAULT" ? `${prefix}shadow` : `${prefix}shadow-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { box-shadow: ${value}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(boxShadowFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in boxShadowScale) {
        const token = createToken(prop, boxShadowScale[prop]!);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in boxShadowScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(boxShadowScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in boxShadowScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & EffectsValues;
}

/**
 * Create border style utility (special class names)
 */
function createBorderStyleUtility(): EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as EffectsValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in borderStyleValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}border-${prop}`;
        const value = borderStyleValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { border-style: ${value}; }`,
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
      return prop in borderStyleValues;
    },

    ownKeys(): string[] {
      return Object.keys(borderStyleValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in borderStyleValues) {
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
 * Create cursor utility (with camelCase to kebab-case mapping)
 */
function createCursorUtility(): EffectsValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as EffectsValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in cursorValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const cssClassName = cursorClassMap[prop] ?? prop;
        const className = `${prefix}cursor-${cssClassName}`;
        const value = cursorValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { cursor: ${value}; }`,
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
      return prop in cursorValues;
    },

    ownKeys(): string[] {
      return Object.keys(cursorValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in cursorValues) {
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
// Effects Utilities
// ============================================

/**
 * Border width utility
 * @example
 * borderWidth["0"], borderWidth["2"], borderWidth.DEFAULT // predefined
 * borderWidth`3px` // arbitrary
 */
export const borderWidth: TaggedUtilityFn & EffectsValues = createBorderWidthUtility();

/**
 * Border radius utility
 * @example
 * borderRadius.none, borderRadius.lg, borderRadius.full // predefined
 * borderRadius`10px` // arbitrary
 */
export const borderRadius: TaggedUtilityFn & EffectsValues = createBorderRadiusUtility();

/**
 * Border style utility
 * @example
 * borderStyle.solid, borderStyle.dashed // predefined
 */
export const borderStyle: EffectsValues = createBorderStyleUtility();

/**
 * Box shadow utility
 * @example
 * boxShadow.sm, boxShadow.lg, boxShadow.none // predefined
 * boxShadow`0 0 10px rgba(0,0,0,0.5)` // arbitrary
 */
export const boxShadow: TaggedUtilityFn & EffectsValues = createBoxShadowUtility();

/**
 * Opacity utility
 * @example
 * opacity["50"], opacity["100"] // predefined
 * opacity`0.75` // arbitrary
 */
export const opacity: TaggedUtilityFn & EffectsValues = createEffectsUtility(
  opacityFn,
  opacityScale,
);

/**
 * Cursor utility (use camelCase for readability)
 * @example
 * cursor.pointer, cursor.notAllowed, cursor.grab // predefined
 */
export const cursor: EffectsValues = createCursorUtility();

/**
 * Pointer events utility
 * @example
 * pointerEvents.none, pointerEvents.auto // predefined
 */
export const pointerEvents: EffectsValues = createSimpleEffectsUtility(
  pointerEventsFn,
  pointerEventsValues,
);

/**
 * User select utility
 * @example
 * userSelect.none, userSelect.text, userSelect.all // predefined
 */
export const userSelect: EffectsValues = createSimpleEffectsUtility(userSelectFn, userSelectValues);

// ============================================
// Grouped exports
// ============================================

/** Grouped effects utilities */
export interface EffectsGroup {
  borderWidth: TaggedUtilityFn & EffectsValues;
  borderRadius: TaggedUtilityFn & EffectsValues;
  borderStyle: EffectsValues;
  boxShadow: TaggedUtilityFn & EffectsValues;
  opacity: TaggedUtilityFn & EffectsValues;
  cursor: EffectsValues;
  pointerEvents: EffectsValues;
  userSelect: EffectsValues;
}

export const effects: EffectsGroup = {
  borderWidth,
  borderRadius,
  borderStyle,
  boxShadow,
  opacity,
  cursor,
  pointerEvents,
  userSelect,
};

// Legacy exports for backwards compatibility
export const effectsArb = {
  borderWidth,
  borderRadius,
  boxShadow,
  opacity,
};

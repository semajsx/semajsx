/**
 * Flexbox utilities: flex, grid, justify, align, etc.
 *
 * Usage:
 * ```ts
 * // Predefined values (via Proxy)
 * import { display, flex, justify, items } from "@semajsx/tailwind";
 * <div class={[display.flex, justify.center, items.center]}>
 *
 * // Arbitrary values (tagged template - same function!)
 * <div class={[flex`2 1 50%`, basis`200px`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for flexbox value records */
export type FlexValues = Record<string, StyleToken>;

// Display values (camelCase for readability)
const displayValues: Record<string, string> = {
  block: "block",
  inlineBlock: "inline-block",
  inline: "inline",
  flex: "flex",
  inlineFlex: "inline-flex",
  grid: "grid",
  inlineGrid: "inline-grid",
  contents: "contents",
  hidden: "none",
};

// Display class name mapping
const displayClassMap: Record<string, string> = {
  inlineBlock: "inline-block",
  inlineFlex: "inline-flex",
  inlineGrid: "inline-grid",
};

// Flex direction values (camelCase for readability)
const flexDirectionValues: Record<string, string> = {
  row: "row",
  rowReverse: "row-reverse",
  col: "column",
  colReverse: "column-reverse",
};

// Flex direction class name mapping
const flexDirectionClassMap: Record<string, string> = {
  rowReverse: "row-reverse",
  colReverse: "col-reverse",
};

// Flex wrap values (camelCase for readability)
const flexWrapValues: Record<string, string> = {
  wrap: "wrap",
  wrapReverse: "wrap-reverse",
  nowrap: "nowrap",
};

// Flex wrap class name mapping
const flexWrapClassMap: Record<string, string> = {
  wrapReverse: "wrap-reverse",
};

// Flex values (shorthand)
const flexValues: Record<string, string> = {
  "1": "1 1 0%",
  auto: "1 1 auto",
  initial: "0 1 auto",
  none: "none",
};

// Flex grow values
const flexGrowValues: Record<string, string> = {
  "0": "0",
  DEFAULT: "1",
};

// Flex shrink values
const flexShrinkValues: Record<string, string> = {
  "0": "0",
  DEFAULT: "1",
};

// Justify content values
const justifyContentValues: Record<string, string> = {
  normal: "normal",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  stretch: "stretch",
};

// Justify items values
const justifyItemsValues: Record<string, string> = {
  start: "start",
  end: "end",
  center: "center",
  stretch: "stretch",
};

// Justify self values
const justifySelfValues: Record<string, string> = {
  auto: "auto",
  start: "start",
  end: "end",
  center: "center",
  stretch: "stretch",
};

// Align content values
const alignContentValues: Record<string, string> = {
  normal: "normal",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  baseline: "baseline",
  stretch: "stretch",
};

// Align items values
const alignItemsValues: Record<string, string> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

// Align self values
const alignSelfValues: Record<string, string> = {
  auto: "auto",
  start: "flex-start",
  end: "flex-end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

// Place content values
const placeContentValues: Record<string, string> = {
  start: "start",
  end: "end",
  center: "center",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
  baseline: "baseline",
  stretch: "stretch",
};

// Place items values
const placeItemsValues: Record<string, string> = {
  start: "start",
  end: "end",
  center: "center",
  baseline: "baseline",
  stretch: "stretch",
};

// Place self values
const placeSelfValues: Record<string, string> = {
  auto: "auto",
  start: "start",
  end: "end",
  center: "center",
  stretch: "stretch",
};

// Order values
const orderValues: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  "11": "11",
  "12": "12",
  first: "-9999",
  last: "9999",
  none: "0",
};

// Flex basis scale
const basisScale: Record<string, string> = {
  "0": "0px",
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
  "2/4": "50%",
  "3/4": "75%",
  full: "100%",
};

// Create utility functions
const flexDirectionFn = createUtility("flex-direction", "flex");
const flexWrapFn = createUtility("flex-wrap", "flex");
const flexFn = createUtility("flex", "flex");
const flexGrowFn = createUtility("flex-grow", "grow");
const flexShrinkFn = createUtility("flex-shrink", "shrink");
const justifyContentFn = createUtility("justify-content", "justify");
const justifyItemsFn = createUtility("justify-items", "justify-items");
const justifySelfFn = createUtility("justify-self", "justify-self");
const alignContentFn = createUtility("align-content", "content");
const alignItemsFn = createUtility("align-items", "items");
const alignSelfFn = createUtility("align-self", "self");
const placeContentFn = createUtility("place-content", "place-content");
const placeItemsFn = createUtility("place-items", "place-items");
const placeSelfFn = createUtility("place-self", "place-self");
const orderFn = createUtility("order", "order");
const flexBasisFn = createUtility("flex-basis", "basis");

/**
 * Create a flexbox utility that works as both namespace and tagged template
 */
function createFlexUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TaggedUtilityFn & FlexValues {
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

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & FlexValues;
}

/**
 * Create a simple utility that only has predefined values (no arbitrary)
 */
function createSimpleFlexUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
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
 * Create display utility (special class names, camelCase to kebab-case)
 */
function createDisplayUtility(): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in displayValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const cssClassName = displayClassMap[prop] ?? prop;
        const className = `${prefix}${cssClassName}`;
        const value = displayValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { display: ${value}; }`,
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
      return prop in displayValues;
    },

    ownKeys(): string[] {
      return Object.keys(displayValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in displayValues) {
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
 * Create flex direction utility (camelCase to kebab-case)
 */
function createFlexDirectionUtility(): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in flexDirectionValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const cssClassName = flexDirectionClassMap[prop] ?? prop;
        const className = `${prefix}flex-${cssClassName}`;
        const value = flexDirectionValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { flex-direction: ${value}; }`,
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
      return prop in flexDirectionValues;
    },

    ownKeys(): string[] {
      return Object.keys(flexDirectionValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in flexDirectionValues) {
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
 * Create flex wrap utility (camelCase to kebab-case)
 */
function createFlexWrapUtility(): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in flexWrapValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const cssClassName = flexWrapClassMap[prop] ?? prop;
        const className = `${prefix}flex-${cssClassName}`;
        const value = flexWrapValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { flex-wrap: ${value}; }`,
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
      return prop in flexWrapValues;
    },

    ownKeys(): string[] {
      return Object.keys(flexWrapValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in flexWrapValues) {
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
 * Create grow utility (special: DEFAULT maps to base class)
 */
function createGrowUtility(): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in flexGrowValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = prop === "DEFAULT" ? `${prefix}grow` : `${prefix}grow-${prop}`;
        const value = flexGrowValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { flex-grow: ${value}; }`,
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
      return prop in flexGrowValues;
    },

    ownKeys(): string[] {
      return Object.keys(flexGrowValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in flexGrowValues) {
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
 * Create shrink utility (special: DEFAULT maps to base class)
 */
function createShrinkUtility(): FlexValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as FlexValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in flexShrinkValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = prop === "DEFAULT" ? `${prefix}shrink` : `${prefix}shrink-${prop}`;
        const value = flexShrinkValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { flex-shrink: ${value}; }`,
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
      return prop in flexShrinkValues;
    },

    ownKeys(): string[] {
      return Object.keys(flexShrinkValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in flexShrinkValues) {
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
// Flexbox Utilities
// ============================================

/**
 * Display utility (use camelCase for readability)
 * @example
 * display.flex, display.grid, display.inlineFlex, display.hidden // predefined
 */
export const display: FlexValues = createDisplayUtility();

/**
 * Flex direction utility (use camelCase for readability)
 * @example
 * flexDirection.row, flexDirection.col, flexDirection.rowReverse // predefined
 */
export const flexDirection: FlexValues = createFlexDirectionUtility();

/**
 * Flex wrap utility (use camelCase for readability)
 * @example
 * flexWrap.wrap, flexWrap.nowrap, flexWrap.wrapReverse // predefined
 */
export const flexWrap: FlexValues = createFlexWrapUtility();

/**
 * Flex utility
 * @example
 * flex["1"], flex.auto, flex.none // predefined
 * flex`2 1 50%` // arbitrary
 */
export const flex: TaggedUtilityFn & FlexValues = createFlexUtility(flexFn, flexValues);

/**
 * Flex grow utility
 * @example
 * grow.DEFAULT, grow["0"] // predefined
 */
export const grow: FlexValues = createGrowUtility();

/**
 * Flex shrink utility
 * @example
 * shrink.DEFAULT, shrink["0"] // predefined
 */
export const shrink: FlexValues = createShrinkUtility();

/**
 * Flex basis utility
 * @example
 * basis["4"], basis.auto, basis.full // predefined
 * basis`200px` // arbitrary
 */
export const basis: TaggedUtilityFn & FlexValues = createFlexUtility(flexBasisFn, basisScale);

/**
 * Justify content utility
 * @example
 * justify.center, justify.between, justify.start // predefined
 */
export const justify: FlexValues = createSimpleFlexUtility(justifyContentFn, justifyContentValues);

/**
 * Justify items utility
 * @example
 * justifyItems.start, justifyItems.center // predefined
 */
export const justifyItems: FlexValues = createSimpleFlexUtility(justifyItemsFn, justifyItemsValues);

/**
 * Justify self utility
 * @example
 * justifySelf.auto, justifySelf.start // predefined
 */
export const justifySelf: FlexValues = createSimpleFlexUtility(justifySelfFn, justifySelfValues);

/**
 * Align content utility
 * @example
 * content.center, content.start // predefined
 */
export const content: FlexValues = createSimpleFlexUtility(alignContentFn, alignContentValues);

/**
 * Align items utility
 * @example
 * items.center, items.start, items.baseline // predefined
 */
export const items: FlexValues = createSimpleFlexUtility(alignItemsFn, alignItemsValues);

/**
 * Align self utility
 * @example
 * self.auto, self.start, self.center // predefined
 */
export const self: FlexValues = createSimpleFlexUtility(alignSelfFn, alignSelfValues);

/**
 * Place content utility
 * @example
 * placeContent.center, placeContent.start // predefined
 */
export const placeContent: FlexValues = createSimpleFlexUtility(placeContentFn, placeContentValues);

/**
 * Place items utility
 * @example
 * placeItems.center, placeItems.start // predefined
 */
export const placeItems: FlexValues = createSimpleFlexUtility(placeItemsFn, placeItemsValues);

/**
 * Place self utility
 * @example
 * placeSelf.auto, placeSelf.center // predefined
 */
export const placeSelf: FlexValues = createSimpleFlexUtility(placeSelfFn, placeSelfValues);

/**
 * Order utility
 * @example
 * order["1"], order.first, order.last // predefined
 * order`99` // arbitrary
 */
export const order: TaggedUtilityFn & FlexValues = createFlexUtility(orderFn, orderValues);

// ============================================
// Grouped exports
// ============================================

/** Grouped flexbox utilities */
export interface FlexboxGroup {
  display: FlexValues;
  flexDirection: FlexValues;
  flexWrap: FlexValues;
  flex: TaggedUtilityFn & FlexValues;
  grow: FlexValues;
  shrink: FlexValues;
  basis: TaggedUtilityFn & FlexValues;
  justify: FlexValues;
  justifyItems: FlexValues;
  justifySelf: FlexValues;
  content: FlexValues;
  items: FlexValues;
  self: FlexValues;
  placeContent: FlexValues;
  placeItems: FlexValues;
  placeSelf: FlexValues;
  order: TaggedUtilityFn & FlexValues;
}

export const flexbox: FlexboxGroup = {
  display,
  flexDirection,
  flexWrap,
  flex,
  grow,
  shrink,
  basis,
  justify,
  justifyItems,
  justifySelf,
  content,
  items,
  self,
  placeContent,
  placeItems,
  placeSelf,
  order,
};

// Legacy exports for backwards compatibility
export const flexboxArb = {
  flex,
  basis,
  order,
};

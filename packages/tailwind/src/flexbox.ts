/**
 * Flexbox utilities: flex, grid, justify, align, etc.
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for flexbox value records */
export type FlexValues = Record<string, StyleToken>;

// Display values
const displayValues: Record<string, string> = {
  block: "block",
  "inline-block": "inline-block",
  inline: "inline",
  flex: "flex",
  "inline-flex": "inline-flex",
  grid: "grid",
  "inline-grid": "inline-grid",
  contents: "contents",
  hidden: "none",
};

// Flex direction values
const flexDirectionValues: Record<string, string> = {
  row: "row",
  "row-reverse": "row-reverse",
  col: "column",
  "col-reverse": "column-reverse",
};

// Flex wrap values
const flexWrapValues: Record<string, string> = {
  wrap: "wrap",
  "wrap-reverse": "wrap-reverse",
  nowrap: "nowrap",
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

// Helper to generate values for a utility
function generateFlexValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): FlexValues {
  const result: FlexValues = {};
  for (const [name, value] of Object.entries(scale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Special handler for display values (no prefix)
function generateDisplayValues(): FlexValues {
  const result: FlexValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(displayValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { display: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Predefined flexbox values
export const display: FlexValues = generateDisplayValues();
export const flexDirection: FlexValues = generateFlexValues(flexDirectionFn, flexDirectionValues);
export const flexWrap: FlexValues = generateFlexValues(flexWrapFn, flexWrapValues);
export const flex: FlexValues = generateFlexValues(flexFn, flexValues);
export const grow: FlexValues = generateFlexValues(flexGrowFn, flexGrowValues);
export const shrink: FlexValues = generateFlexValues(flexShrinkFn, flexShrinkValues);
export const justify: FlexValues = generateFlexValues(justifyContentFn, justifyContentValues);
export const justifyItems: FlexValues = generateFlexValues(justifyItemsFn, justifyItemsValues);
export const justifySelf: FlexValues = generateFlexValues(justifySelfFn, justifySelfValues);
export const content: FlexValues = generateFlexValues(alignContentFn, alignContentValues);
export const items: FlexValues = generateFlexValues(alignItemsFn, alignItemsValues);
export const self: FlexValues = generateFlexValues(alignSelfFn, alignSelfValues);
export const placeContent: FlexValues = generateFlexValues(placeContentFn, placeContentValues);
export const placeItems: FlexValues = generateFlexValues(placeItemsFn, placeItemsValues);
export const placeSelf: FlexValues = generateFlexValues(placeSelfFn, placeSelfValues);
export const order: FlexValues = generateFlexValues(orderFn, orderValues);

// Flex basis utility (uses sizing scale)
const flexBasisFn = createUtility("flex-basis", "basis");
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
export const basis: FlexValues = generateFlexValues(flexBasisFn, basisScale);

// Tagged template functions for arbitrary values
export const flexArb: TaggedUtilityFn = createTaggedUtility(flexFn);
export const basisArb: TaggedUtilityFn = createTaggedUtility(flexBasisFn);
export const orderArb: TaggedUtilityFn = createTaggedUtility(orderFn);

/** Grouped flexbox predefined values */
export interface FlexboxGroup {
  display: FlexValues;
  flexDirection: FlexValues;
  flexWrap: FlexValues;
  flex: FlexValues;
  grow: FlexValues;
  shrink: FlexValues;
  basis: FlexValues;
  justify: FlexValues;
  justifyItems: FlexValues;
  justifySelf: FlexValues;
  content: FlexValues;
  items: FlexValues;
  self: FlexValues;
  placeContent: FlexValues;
  placeItems: FlexValues;
  placeSelf: FlexValues;
  order: FlexValues;
}

/** Grouped flexbox arbitrary functions */
export interface FlexboxArbGroup {
  flex: TaggedUtilityFn;
  basis: TaggedUtilityFn;
  order: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const flexbox: FlexboxGroup = {
  display: display,
  flexDirection: flexDirection,
  flexWrap: flexWrap,
  flex: flex,
  grow: grow,
  shrink: shrink,
  basis: basis,
  justify: justify,
  justifyItems: justifyItems,
  justifySelf: justifySelf,
  content: content,
  items: items,
  self: self,
  placeContent: placeContent,
  placeItems: placeItems,
  placeSelf: placeSelf,
  order: order,
};

export const flexboxArb: FlexboxArbGroup = {
  flex: flexArb,
  basis: basisArb,
  order: orderArb,
};

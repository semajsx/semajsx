/**
 * Effects utilities: border, rounded, shadow, opacity
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for effects value records */
export type EffectsValues = Record<string, StyleToken>;

// Border width scale
const borderWidthScale: Record<string, string> = {
  "0": "0px",
  "": "1px",
  "2": "2px",
  "4": "4px",
  "8": "8px",
};

// Border radius scale
const borderRadiusScale: Record<string, string> = {
  none: "0px",
  sm: "0.125rem",
  "": "0.25rem",
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
  "": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
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

// Cursor values
const cursorValues: Record<string, string> = {
  auto: "auto",
  default: "default",
  pointer: "pointer",
  wait: "wait",
  text: "text",
  move: "move",
  help: "help",
  "not-allowed": "not-allowed",
  none: "none",
  "context-menu": "context-menu",
  progress: "progress",
  cell: "cell",
  crosshair: "crosshair",
  "vertical-text": "vertical-text",
  alias: "alias",
  copy: "copy",
  "no-drop": "no-drop",
  grab: "grab",
  grabbing: "grabbing",
  "all-scroll": "all-scroll",
  "col-resize": "col-resize",
  "row-resize": "row-resize",
  "n-resize": "n-resize",
  "e-resize": "e-resize",
  "s-resize": "s-resize",
  "w-resize": "w-resize",
  "ne-resize": "ne-resize",
  "nw-resize": "nw-resize",
  "se-resize": "se-resize",
  "sw-resize": "sw-resize",
  "ew-resize": "ew-resize",
  "ns-resize": "ns-resize",
  "nesw-resize": "nesw-resize",
  "nwse-resize": "nwse-resize",
  "zoom-in": "zoom-in",
  "zoom-out": "zoom-out",
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
const opacityFn = createUtility("opacity", "opacity");
const cursorFn = createUtility("cursor", "cursor");
const pointerEventsFn = createUtility("pointer-events", "pointer-events");
const userSelectFn = createUtility("user-select", "select");

// Helper to generate values for a utility
function generateEffectsValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): EffectsValues {
  const result: EffectsValues = {};
  for (const [name, value] of Object.entries(scale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Special handler for border width
function generateBorderWidthValues(): EffectsValues {
  const result: EffectsValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(borderWidthScale)) {
    const className = name === "" ? `${prefix}border` : `${prefix}border-${name}`;
    result[name === "" ? "DEFAULT" : name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-width: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for border radius
function generateBorderRadiusValues(): EffectsValues {
  const result: EffectsValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(borderRadiusScale)) {
    const className = name === "" ? `${prefix}rounded` : `${prefix}rounded-${name}`;
    result[name === "" ? "DEFAULT" : name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-radius: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for box shadow
function generateBoxShadowValues(): EffectsValues {
  const result: EffectsValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(boxShadowScale)) {
    const className = name === "" ? `${prefix}shadow` : `${prefix}shadow-${name}`;
    result[name === "" ? "DEFAULT" : name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { box-shadow: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for border style
function generateBorderStyleValues(): EffectsValues {
  const result: EffectsValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(borderStyleValues)) {
    const className = `${prefix}border-${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-style: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Predefined effects values
export const borderWidth: EffectsValues = generateBorderWidthValues();
export const borderRadius: EffectsValues = generateBorderRadiusValues();
export const borderStyle: EffectsValues = generateBorderStyleValues();
export const boxShadow: EffectsValues = generateBoxShadowValues();
export const opacity: EffectsValues = generateEffectsValues(opacityFn, opacityScale);
export const cursor: EffectsValues = generateEffectsValues(cursorFn, cursorValues);
export const pointerEvents: EffectsValues = generateEffectsValues(
  pointerEventsFn,
  pointerEventsValues,
);
export const userSelect: EffectsValues = generateEffectsValues(userSelectFn, userSelectValues);

// Tagged template functions for arbitrary values
const borderWidthFn = createUtility("border-width", "border");
const borderRadiusFn = createUtility("border-radius", "rounded");
const boxShadowFn = createUtility("box-shadow", "shadow");
export const borderWidthArb: TaggedUtilityFn = createTaggedUtility(borderWidthFn);
export const borderRadiusArb: TaggedUtilityFn = createTaggedUtility(borderRadiusFn);
export const boxShadowArb: TaggedUtilityFn = createTaggedUtility(boxShadowFn);
export const opacityArb: TaggedUtilityFn = createTaggedUtility(opacityFn);

/** Grouped effects predefined values */
export interface EffectsGroup {
  borderWidth: EffectsValues;
  borderRadius: EffectsValues;
  borderStyle: EffectsValues;
  boxShadow: EffectsValues;
  opacity: EffectsValues;
  cursor: EffectsValues;
  pointerEvents: EffectsValues;
  userSelect: EffectsValues;
}

/** Grouped effects arbitrary functions */
export interface EffectsArbGroup {
  borderWidth: TaggedUtilityFn;
  borderRadius: TaggedUtilityFn;
  boxShadow: TaggedUtilityFn;
  opacity: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const effects: EffectsGroup = {
  borderWidth: borderWidth,
  borderRadius: borderRadius,
  borderStyle: borderStyle,
  boxShadow: boxShadow,
  opacity: opacity,
  cursor: cursor,
  pointerEvents: pointerEvents,
  userSelect: userSelect,
};

export const effectsArb: EffectsArbGroup = {
  borderWidth: borderWidthArb,
  borderRadius: borderRadiusArb,
  boxShadow: boxShadowArb,
  opacity: opacityArb,
};

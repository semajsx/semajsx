/**
 * Effects utilities: border, rounded, shadow, opacity, cursor
 *
 * Usage:
 * ```ts
 * // Flat exports (recommended)
 * import { rounded, roundedLg, roundedFull, shadow, shadowLg, opacity50 } from "@semajsx/tailwind";
 * <div class={cx(roundedLg, shadowLg, opacity50)}>
 *
 * // Namespace access
 * import { effects } from "@semajsx/tailwind";
 * <div class={cx(effects.roundedLg, effects.shadowLg, effects.opacity50)}>
 *
 * // Arbitrary values (tagged template)
 * import { rounded, shadow, opacity } from "@semajsx/tailwind";
 * <div class={cx(rounded`10px`, shadow`0 0 10px black`, opacity`0.33`)}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

// ============================================
// Scale definitions
// ============================================

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
const borderStyleValues = ["solid", "dashed", "dotted", "double", "hidden", "none"] as const;

// Cursor values
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

// Cursor class name mapping (camelCase to kebab-case)
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
const pointerEventsValues = ["none", "auto"] as const;

// User select values
const userSelectValues = ["none", "text", "all", "auto"] as const;

// ============================================
// Utility function creators
// ============================================

const borderWidthFn = createUtility("border-width", "border");
const borderRadiusFn = createUtility("border-radius", "rounded");
const boxShadowFn = createUtility("box-shadow", "shadow");
const opacityFn = createUtility("opacity", "opacity");

// ============================================
// Token generators
// ============================================

function generateBorderWidthTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, value] of Object.entries(borderWidthScale)) {
    if (key === "DEFAULT") {
      // border (default 1px)
      tokens.border = {
        __kind: "style",
        _: `${prefix}border`,
        __cssTemplate: `.${prefix}border { border-width: ${value}; }`,
        toString() {
          return this._;
        },
      };
    } else {
      // border0, border2, border4, border8
      const tokenName = `border${key}`;
      const className = `${prefix}border-${key}`;
      tokens[tokenName] = {
        __kind: "style",
        _: className,
        __cssTemplate: `.${className} { border-width: ${value}; }`,
        toString() {
          return this._;
        },
      };
    }
  }

  return tokens;
}

function generateBorderRadiusTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, value] of Object.entries(borderRadiusScale)) {
    if (key === "DEFAULT") {
      // rounded (default 0.25rem)
      tokens.rounded = {
        __kind: "style",
        _: `${prefix}rounded`,
        __cssTemplate: `.${prefix}rounded { border-radius: ${value}; }`,
        toString() {
          return this._;
        },
      };
    } else {
      // roundedNone, roundedSm, roundedLg, rounded2xl, roundedFull
      const capKey = key.match(/^\d/) ? key : key.charAt(0).toUpperCase() + key.slice(1);
      const tokenName = `rounded${capKey}`;
      const className = `${prefix}rounded-${key}`;
      tokens[tokenName] = {
        __kind: "style",
        _: className,
        __cssTemplate: `.${className} { border-radius: ${value}; }`,
        toString() {
          return this._;
        },
      };
    }
  }

  return tokens;
}

function generateBoxShadowTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, value] of Object.entries(boxShadowScale)) {
    if (key === "DEFAULT") {
      // shadow (default)
      tokens.shadow = {
        __kind: "style",
        _: `${prefix}shadow`,
        __cssTemplate: `.${prefix}shadow { box-shadow: ${value}; }`,
        toString() {
          return this._;
        },
      };
    } else {
      // shadowSm, shadowMd, shadowLg, shadow2xl, shadowInner, shadowNone
      const capKey = key.match(/^\d/) ? key : key.charAt(0).toUpperCase() + key.slice(1);
      const tokenName = `shadow${capKey}`;
      const className = `${prefix}shadow-${key}`;
      tokens[tokenName] = {
        __kind: "style",
        _: className,
        __cssTemplate: `.${className} { box-shadow: ${value}; }`,
        toString() {
          return this._;
        },
      };
    }
  }

  return tokens;
}

function generateOpacityTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(opacityScale)) {
    const tokenName = `opacity${key}`;
    tokens[tokenName] = opacityFn(value, key);
  }

  return tokens;
}

function generateBorderStyleTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const value of borderStyleValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const tokenName = `border${capValue}`;
    const className = `${prefix}border-${value}`;
    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { border-style: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateCursorTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, value] of Object.entries(cursorValues)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `cursor${capKey}`;
    const cssClassName = cursorClassMap[key] ?? key;
    const className = `${prefix}cursor-${cssClassName}`;
    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { cursor: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generatePointerEventsTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const value of pointerEventsValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const tokenName = `pointerEvents${capValue}`;
    const className = `${prefix}pointer-events-${value}`;
    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { pointer-events: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateUserSelectTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const value of userSelectValues) {
    const capValue = value.charAt(0).toUpperCase() + value.slice(1);
    const tokenName = `select${capValue}`;
    const className = `${prefix}select-${value}`;
    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { user-select: ${value}; }`,
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

const borderWidthTokens = generateBorderWidthTokens();
const borderRadiusTokens = generateBorderRadiusTokens();
const boxShadowTokens = generateBoxShadowTokens();
const opacityTokens = generateOpacityTokens();
const borderStyleTokens = generateBorderStyleTokens();
const cursorTokens = generateCursorTokens();
const pointerEventsTokens = generatePointerEventsTokens();
const userSelectTokens = generateUserSelectTokens();

// ============================================
// Tagged template functions for arbitrary values
// ============================================

/** Border width - arbitrary value: borderW`3px` */
export const borderW: TaggedUtilityFn = createTaggedUtility(borderWidthFn);

/** Border radius - arbitrary value: rounded`10px` */
export const rounded: TaggedUtilityFn = createTaggedUtility(borderRadiusFn);

/** Box shadow - arbitrary value: shadow`0 0 10px black` */
export const shadow: TaggedUtilityFn = createTaggedUtility(boxShadowFn);

/** Opacity - arbitrary value: opacity`0.33` */
export const opacity: TaggedUtilityFn = createTaggedUtility(opacityFn);

// ============================================
// Individual token exports (flat) - Border Width
// ============================================

export const { border, border0, border2, border4, border8 } = borderWidthTokens;

// ============================================
// Individual token exports (flat) - Border Radius
// ============================================

export const {
  rounded: roundedBase, // Alias for the token (rounded is reserved for tagged template)
  roundedNone,
  roundedSm,
  roundedMd,
  roundedLg,
  roundedXl,
  rounded2xl,
  rounded3xl,
  roundedFull,
} = borderRadiusTokens;

// ============================================
// Individual token exports (flat) - Box Shadow
// ============================================

export const {
  shadow: shadowBase, // Alias for the token (shadow is reserved for tagged template)
  shadowSm,
  shadowMd,
  shadowLg,
  shadowXl,
  shadow2xl,
  shadowInner,
  shadowNone,
} = boxShadowTokens;

// ============================================
// Individual token exports (flat) - Opacity
// ============================================

export const {
  opacity0,
  opacity5,
  opacity10,
  opacity15,
  opacity20,
  opacity25,
  opacity30,
  opacity35,
  opacity40,
  opacity45,
  opacity50,
  opacity55,
  opacity60,
  opacity65,
  opacity70,
  opacity75,
  opacity80,
  opacity85,
  opacity90,
  opacity95,
  opacity100,
} = opacityTokens;

// ============================================
// Individual token exports (flat) - Border Style
// ============================================

export const { borderSolid, borderDashed, borderDotted, borderDouble, borderHidden, borderNone } =
  borderStyleTokens;

// ============================================
// Individual token exports (flat) - Cursor
// ============================================

export const {
  cursorAuto,
  cursorDefault,
  cursorPointer,
  cursorWait,
  cursorText,
  cursorMove,
  cursorHelp,
  cursorNotAllowed,
  cursorNone,
  cursorContextMenu,
  cursorProgress,
  cursorCell,
  cursorCrosshair,
  cursorVerticalText,
  cursorAlias,
  cursorCopy,
  cursorNoDrop,
  cursorGrab,
  cursorGrabbing,
  cursorAllScroll,
  cursorColResize,
  cursorRowResize,
  cursorNResize,
  cursorEResize,
  cursorSResize,
  cursorWResize,
  cursorNeResize,
  cursorNwResize,
  cursorSeResize,
  cursorSwResize,
  cursorEwResize,
  cursorNsResize,
  cursorNeswResize,
  cursorNwseResize,
  cursorZoomIn,
  cursorZoomOut,
} = cursorTokens;

// ============================================
// Individual token exports (flat) - Pointer Events
// ============================================

export const { pointerEventsNone, pointerEventsAuto } = pointerEventsTokens;

// ============================================
// Individual token exports (flat) - User Select
// ============================================

export const { selectNone, selectText, selectAll, selectAuto } = userSelectTokens;

// ============================================
// Namespace export (grouped)
// ============================================

/** All effects tokens in a namespace */
export const effects = {
  // Border width
  ...borderWidthTokens,
  // Border radius
  ...borderRadiusTokens,
  // Box shadow
  ...boxShadowTokens,
  // Opacity
  ...opacityTokens,
  // Border style
  ...borderStyleTokens,
  // Cursor
  ...cursorTokens,
  // Pointer events
  ...pointerEventsTokens,
  // User select
  ...userSelectTokens,
  // Arbitrary (tagged templates)
  borderW,
  rounded,
  shadow,
  opacity,
};

// Type for the effects namespace
export type EffectsNamespace = typeof effects;

// Legacy type exports for backwards compatibility
export type EffectsValues = Record<string, StyleToken>;
export type EffectsGroup = EffectsNamespace;

// Legacy exports for backwards compatibility
export const effectsArb = {
  borderW,
  rounded,
  shadow,
  opacity,
};

// Legacy proxies (for backwards compatibility only)
export const borderWidth = borderWidthTokens;
export const borderRadius = borderRadiusTokens;
export const borderStyle = borderStyleTokens;
export const boxShadow = boxShadowTokens;
export const cursor = cursorTokens;
export const pointerEvents = pointerEventsTokens;
export const userSelect = userSelectTokens;

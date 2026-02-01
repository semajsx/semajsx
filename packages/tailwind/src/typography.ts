/**
 * Typography utilities: font-size, font-weight, line-height, etc.
 *
 * Usage:
 * ```ts
 * // Merged naming - flat exports (recommended)
 * import { textBase, textXl, fontBold, leadingNormal } from "@semajsx/tailwind";
 * <div class={[textBase, fontBold, leadingNormal]}>
 *
 * // Namespace access
 * import { typography } from "@semajsx/tailwind";
 * <div class={[typography.textBase, typography.fontBold]}>
 *
 * // Arbitrary values (tagged template)
 * import { text, leading } from "@semajsx/tailwind";
 * <div class={[text`18px`, leading`1.8`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

type UtilityFn = (value: string, valueName?: string) => StyleToken;

// ============================================
// Scale definitions
// ============================================

// Font size scale (with line-height)
const fontSizeScale: Record<string, [string, string]> = {
  xs: ["0.75rem", "1rem"],
  sm: ["0.875rem", "1.25rem"],
  base: ["1rem", "1.5rem"],
  lg: ["1.125rem", "1.75rem"],
  xl: ["1.25rem", "1.75rem"],
  "2xl": ["1.5rem", "2rem"],
  "3xl": ["1.875rem", "2.25rem"],
  "4xl": ["2.25rem", "2.5rem"],
  "5xl": ["3rem", "1"],
  "6xl": ["3.75rem", "1"],
  "7xl": ["4.5rem", "1"],
  "8xl": ["6rem", "1"],
  "9xl": ["8rem", "1"],
};

// Font weight scale
const fontWeightScale: Record<string, string> = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
};

// Line height scale
const lineHeightScale: Record<string, string> = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
  "3": ".75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
};

// Letter spacing scale
const letterSpacingScale: Record<string, string> = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
};

// Text align values
const textAlignValues: Record<string, string> = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
  start: "start",
  end: "end",
};

// Font family (common stacks)
const fontFamilyValues: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
};

// ============================================
// Utility function creators
// ============================================

const fontWeightFn = createUtility("font-weight", "font");
const lineHeightFn = createUtility("line-height", "leading");
const letterSpacingFn = createUtility("letter-spacing", "tracking");
const textAlignFn = createUtility("text-align", "text");
const whitespaceFn = createUtility("white-space", "whitespace");
const wordBreakFn = createUtility("overflow-wrap", "break");
const fontFamilyFn = createUtility("font-family", "font");
const fontSizeFn = createUtility("font-size", "text");

// ============================================
// Token generators
// ============================================

function generateFontSizeTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [key, [size, lh]] of Object.entries(fontSizeScale)) {
    // Convert keys: base -> Base, 2xl -> 2xl (keep number prefix)
    const capKey = key.match(/^\d/) ? key : key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `text${capKey}`;
    const className = `${prefix}text-${key}`;

    tokens[tokenName] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { font-size: ${size}; line-height: ${lh}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateFontWeightTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(fontWeightScale)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `font${capKey}`;
    tokens[tokenName] = fontWeightFn(value, key);
  }

  return tokens;
}

function generateLineHeightTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(lineHeightScale)) {
    // Convert keys: none -> None, 3 -> 3
    const capKey = key.match(/^\d/) ? key : key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `leading${capKey}`;
    tokens[tokenName] = lineHeightFn(value, key);
  }

  return tokens;
}

function generateLetterSpacingTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(letterSpacingScale)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `tracking${capKey}`;
    tokens[tokenName] = letterSpacingFn(value, key);
  }

  return tokens;
}

function generateTextAlignTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(textAlignValues)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `text${capKey}`;
    tokens[tokenName] = textAlignFn(value, key);
  }

  return tokens;
}

function generateFontFamilyTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(fontFamilyValues)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `font${capKey}`;
    tokens[tokenName] = fontFamilyFn(value, key);
  }

  return tokens;
}

function generateFontStyleTokens(): Record<string, StyleToken> {
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  return {
    italic: {
      __kind: "style",
      _: `${prefix}italic`,
      __cssTemplate: `.${prefix}italic { font-style: italic; }`,
      toString() {
        return this._;
      },
    },
    notItalic: {
      __kind: "style",
      _: `${prefix}not-italic`,
      __cssTemplate: `.${prefix}not-italic { font-style: normal; }`,
      toString() {
        return this._;
      },
    },
  };
}

function generateTextDecorationTokens(): Record<string, StyleToken> {
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  return {
    underline: {
      __kind: "style",
      _: `${prefix}underline`,
      __cssTemplate: `.${prefix}underline { text-decoration-line: underline; }`,
      toString() {
        return this._;
      },
    },
    overline: {
      __kind: "style",
      _: `${prefix}overline`,
      __cssTemplate: `.${prefix}overline { text-decoration-line: overline; }`,
      toString() {
        return this._;
      },
    },
    lineThrough: {
      __kind: "style",
      _: `${prefix}line-through`,
      __cssTemplate: `.${prefix}line-through { text-decoration-line: line-through; }`,
      toString() {
        return this._;
      },
    },
    noUnderline: {
      __kind: "style",
      _: `${prefix}no-underline`,
      __cssTemplate: `.${prefix}no-underline { text-decoration-line: none; }`,
      toString() {
        return this._;
      },
    },
  };
}

function generateTextTransformTokens(): Record<string, StyleToken> {
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  return {
    uppercase: {
      __kind: "style",
      _: `${prefix}uppercase`,
      __cssTemplate: `.${prefix}uppercase { text-transform: uppercase; }`,
      toString() {
        return this._;
      },
    },
    lowercase: {
      __kind: "style",
      _: `${prefix}lowercase`,
      __cssTemplate: `.${prefix}lowercase { text-transform: lowercase; }`,
      toString() {
        return this._;
      },
    },
    capitalize: {
      __kind: "style",
      _: `${prefix}capitalize`,
      __cssTemplate: `.${prefix}capitalize { text-transform: capitalize; }`,
      toString() {
        return this._;
      },
    },
    normalCase: {
      __kind: "style",
      _: `${prefix}normal-case`,
      __cssTemplate: `.${prefix}normal-case { text-transform: none; }`,
      toString() {
        return this._;
      },
    },
  };
}

function generateWhitespaceTokens(): Record<string, StyleToken> {
  const values: Record<string, string> = {
    normal: "normal",
    nowrap: "nowrap",
    pre: "pre",
    preLine: "pre-line",
    preWrap: "pre-wrap",
    breakSpaces: "break-spaces",
  };

  const classMap: Record<string, string> = {
    normal: "normal",
    nowrap: "nowrap",
    pre: "pre",
    preLine: "pre-line",
    preWrap: "pre-wrap",
    breakSpaces: "break-spaces",
  };

  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(values)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `whitespace${capKey}`;
    tokens[tokenName] = whitespaceFn(value, classMap[key]);
  }

  return tokens;
}

function generateWordBreakTokens(): Record<string, StyleToken> {
  const values: Record<string, string> = {
    normal: "normal",
    words: "break-word",
    all: "break-all",
    keep: "keep-all",
  };

  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(values)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `break${capKey}`;
    tokens[tokenName] = wordBreakFn(value, key);
  }

  return tokens;
}

function generateTruncateToken(): StyleToken {
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";
  const className = `${prefix}truncate`;

  return {
    __kind: "style",
    _: className,
    __cssTemplate: `.${className} { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`,
    toString() {
      return this._;
    },
  };
}

// ============================================
// Generate all tokens
// ============================================

const fontSizeTokens = generateFontSizeTokens();
const fontWeightTokens = generateFontWeightTokens();
const lineHeightTokens = generateLineHeightTokens();
const letterSpacingTokens = generateLetterSpacingTokens();
const textAlignTokens = generateTextAlignTokens();
const fontFamilyTokens = generateFontFamilyTokens();
const fontStyleTokens = generateFontStyleTokens();
const textDecorationTokens = generateTextDecorationTokens();
const textTransformTokens = generateTextTransformTokens();
const whitespaceTokens = generateWhitespaceTokens();
const wordBreakTokens = generateWordBreakTokens();

// ============================================
// Tagged template functions for arbitrary values
// ============================================

/** Font size - arbitrary value: text`18px` */
export const text: TaggedUtilityFn = createTaggedUtility(fontSizeFn);

/** Line height - arbitrary value: leading`1.8` */
export const leading: TaggedUtilityFn = createTaggedUtility(lineHeightFn);

/** Letter spacing - arbitrary value: tracking`0.1em` */
export const tracking: TaggedUtilityFn = createTaggedUtility(letterSpacingFn);

// ============================================
// Individual token exports (flat) - Font Size
// ============================================

export const {
  textXs,
  textSm,
  textBase,
  textLg,
  textXl,
  text2xl,
  text3xl,
  text4xl,
  text5xl,
  text6xl,
  text7xl,
  text8xl,
  text9xl,
} = fontSizeTokens;

// ============================================
// Individual token exports (flat) - Font Weight
// ============================================

export const {
  fontThin,
  fontExtralight,
  fontLight,
  fontNormal,
  fontMedium,
  fontSemibold,
  fontBold,
  fontExtrabold,
  fontBlack,
} = fontWeightTokens;

// ============================================
// Individual token exports (flat) - Line Height
// ============================================

export const {
  leadingNone,
  leadingTight,
  leadingSnug,
  leadingNormal,
  leadingRelaxed,
  leadingLoose,
  leading3,
  leading4,
  leading5,
  leading6,
  leading7,
  leading8,
  leading9,
  leading10,
} = lineHeightTokens;

// ============================================
// Individual token exports (flat) - Letter Spacing
// ============================================

export const {
  trackingTighter,
  trackingTight,
  trackingNormal,
  trackingWide,
  trackingWider,
  trackingWidest,
} = letterSpacingTokens;

// ============================================
// Individual token exports (flat) - Text Align
// ============================================

export const { textLeft, textCenter, textRight, textJustify, textStart, textEnd } = textAlignTokens;

// ============================================
// Individual token exports (flat) - Font Family
// ============================================

export const { fontSans, fontSerif, fontMono } = fontFamilyTokens;

// ============================================
// Individual token exports (flat) - Font Style
// ============================================

export const { italic, notItalic } = fontStyleTokens;

// ============================================
// Individual token exports (flat) - Text Decoration
// ============================================

export const { underline, overline, lineThrough, noUnderline } = textDecorationTokens;

// ============================================
// Individual token exports (flat) - Text Transform
// ============================================

export const { uppercase, lowercase, capitalize, normalCase } = textTransformTokens;

// ============================================
// Individual token exports (flat) - Whitespace
// ============================================

export const {
  whitespaceNormal,
  whitespaceNowrap,
  whitespacePre,
  whitespacePreLine,
  whitespacePreWrap,
  whitespaceBreakSpaces,
} = whitespaceTokens;

// ============================================
// Individual token exports (flat) - Word Break
// ============================================

export const { breakNormal, breakWords, breakAll, breakKeep } = wordBreakTokens;

// ============================================
// Individual token exports (flat) - Truncate
// ============================================

export const truncate: StyleToken = generateTruncateToken();

// ============================================
// Namespace export (grouped)
// ============================================

/** All typography tokens in a namespace */
export const typography = {
  // Font size
  ...fontSizeTokens,
  // Font weight
  ...fontWeightTokens,
  // Line height
  ...lineHeightTokens,
  // Letter spacing
  ...letterSpacingTokens,
  // Text align
  ...textAlignTokens,
  // Font family
  ...fontFamilyTokens,
  // Font style
  ...fontStyleTokens,
  // Text decoration
  ...textDecorationTokens,
  // Text transform
  ...textTransformTokens,
  // Whitespace
  ...whitespaceTokens,
  // Word break
  ...wordBreakTokens,
  // Truncate
  truncate,
  // Arbitrary (tagged templates)
  text,
  leading,
  tracking,
};

// Type for the typography namespace
export type TypographyNamespace = typeof typography;

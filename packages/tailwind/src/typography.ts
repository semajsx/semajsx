/**
 * Typography utilities: font-size, font-weight, line-height, etc.
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

/** Type for typography value records */
export type TypographyValues = Record<string, StyleToken>;

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

// Text decoration values
const textDecorationValues: Record<string, string> = {
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
  "no-underline": "none",
};

// Text transform values
const textTransformValues: Record<string, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  "normal-case": "none",
};

// Whitespace values
const whitespaceValues: Record<string, string> = {
  normal: "normal",
  nowrap: "nowrap",
  pre: "pre",
  "pre-line": "pre-line",
  "pre-wrap": "pre-wrap",
  "break-spaces": "break-spaces",
};

// Word break values
const wordBreakValues: Record<string, string> = {
  normal: "normal",
  words: "break-word",
  all: "break-all",
  keep: "keep-all",
};

// Font style values
const fontStyleValues: Record<string, string> = {
  italic: "italic",
  "not-italic": "normal",
};

// Font family (common stacks)
const fontFamilyValues: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
};

// Create utility functions
const fontWeightFn = createUtility("font-weight", "font");
const lineHeightFn = createUtility("line-height", "leading");
const letterSpacingFn = createUtility("letter-spacing", "tracking");
const textAlignFn = createUtility("text-align", "text");
const whitespaceNoWrapFn = createUtility("white-space", "whitespace");
const wordBreakFn = createUtility("overflow-wrap", "break");
const fontFamilyFn = createUtility("font-family", "font");

// Helper to generate values for a utility
function generateTypographyValues(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TypographyValues {
  const result: TypographyValues = {};
  for (const [name, value] of Object.entries(scale)) {
    result[name] = utilityFn(value, name);
  }
  return result;
}

// Special handler for font size (includes line-height)
function generateFontSizeValues(): TypographyValues {
  const result: TypographyValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, [fontSize, lineHeight]] of Object.entries(fontSizeScale)) {
    const className = `${prefix}text-${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { font-size: ${fontSize}; line-height: ${lineHeight}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for text decoration (no prefix in class name)
function generateTextDecorationValues(): TypographyValues {
  const result: TypographyValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(textDecorationValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { text-decoration-line: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for text transform (no prefix in class name)
function generateTextTransformValues(): TypographyValues {
  const result: TypographyValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(textTransformValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { text-transform: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for font style (no prefix in class name)
function generateFontStyleValues(): TypographyValues {
  const result: TypographyValues = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  for (const [name, value] of Object.entries(fontStyleValues)) {
    const className = `${prefix}${name}`;
    result[name] = {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { font-style: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }
  return result;
}

// Special handler for truncate (multiple properties)
function generateTruncateUtility(): StyleToken {
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

// Predefined typography values
export const fontSize: TypographyValues = generateFontSizeValues();
export const fontWeight: TypographyValues = generateTypographyValues(fontWeightFn, fontWeightScale);
export const fontFamily: TypographyValues = generateTypographyValues(
  fontFamilyFn,
  fontFamilyValues,
);
export const fontStyle: TypographyValues = generateFontStyleValues();
export const lineHeight: TypographyValues = generateTypographyValues(lineHeightFn, lineHeightScale);
export const letterSpacing: TypographyValues = generateTypographyValues(
  letterSpacingFn,
  letterSpacingScale,
);
export const textAlign: TypographyValues = generateTypographyValues(textAlignFn, textAlignValues);
export const textDecoration: TypographyValues = generateTextDecorationValues();
export const textTransform: TypographyValues = generateTextTransformValues();
export const whitespace: TypographyValues = generateTypographyValues(
  whitespaceNoWrapFn,
  whitespaceValues,
);
export const wordBreak: TypographyValues = generateTypographyValues(wordBreakFn, wordBreakValues);

// Truncate is special (combines multiple properties)
export const truncate: StyleToken = generateTruncateUtility();

// Tagged template functions for arbitrary values
const fontSizeFn = createUtility("font-size", "text");
export const fontSizeArb: TaggedUtilityFn = createTaggedUtility(fontSizeFn);
export const lineHeightArb: TaggedUtilityFn = createTaggedUtility(lineHeightFn);
export const letterSpacingArb: TaggedUtilityFn = createTaggedUtility(letterSpacingFn);

/** Grouped typography predefined values */
export interface TypographyGroup {
  fontSize: TypographyValues;
  fontWeight: TypographyValues;
  fontFamily: TypographyValues;
  fontStyle: TypographyValues;
  lineHeight: TypographyValues;
  letterSpacing: TypographyValues;
  textAlign: TypographyValues;
  textDecoration: TypographyValues;
  textTransform: TypographyValues;
  whitespace: TypographyValues;
  wordBreak: TypographyValues;
  truncate: StyleToken;
}

/** Grouped typography arbitrary functions */
export interface TypographyArbGroup {
  fontSize: TaggedUtilityFn;
  lineHeight: TaggedUtilityFn;
  letterSpacing: TaggedUtilityFn;
}

// Grouped exports for convenient destructuring
export const typography: TypographyGroup = {
  fontSize: fontSize,
  fontWeight: fontWeight,
  fontFamily: fontFamily,
  fontStyle: fontStyle,
  lineHeight: lineHeight,
  letterSpacing: letterSpacing,
  textAlign: textAlign,
  textDecoration: textDecoration,
  textTransform: textTransform,
  whitespace: whitespace,
  wordBreak: wordBreak,
  truncate: truncate,
};

export const typographyArb: TypographyArbGroup = {
  fontSize: fontSizeArb,
  lineHeight: lineHeightArb,
  letterSpacing: letterSpacingArb,
};

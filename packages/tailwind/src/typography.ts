/**
 * Typography utilities: font-size, font-weight, line-height, etc.
 *
 * Usage:
 * ```ts
 * // Predefined values (via Proxy)
 * import { fontSize, fontWeight, lineHeight } from "@semajsx/tailwind";
 * <div class={[fontSize.base, fontWeight.bold, lineHeight.normal]}>
 *
 * // Arbitrary values (tagged template - same function!)
 * <div class={[fontSize`18px`, lineHeight`1.8`]}>
 * ```
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
  lineThrough: "line-through",
  noUnderline: "none",
};

// Text transform values
const textTransformValues: Record<string, string> = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  normalCase: "none",
};

// Whitespace values
const whitespaceValues: Record<string, string> = {
  normal: "normal",
  nowrap: "nowrap",
  pre: "pre",
  preLine: "pre-line",
  preWrap: "pre-wrap",
  breakSpaces: "break-spaces",
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
  notItalic: "normal",
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
const whitespaceFn = createUtility("white-space", "whitespace");
const wordBreakFn = createUtility("overflow-wrap", "break");
const fontFamilyFn = createUtility("font-family", "font");
const fontSizeFn = createUtility("font-size", "text");

/**
 * Create a typography utility that works as both namespace and tagged template
 */
function createTypographyUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TaggedUtilityFn & TypographyValues {
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

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & TypographyValues;
}

/**
 * Create a simple utility that only has predefined values (no arbitrary)
 */
function createSimpleUtility(
  utilityFn: (value: string, valueName?: string) => StyleToken,
  scale: Record<string, string>,
): TypographyValues {
  const tokenCache = new Map<string, StyleToken>();

  return new Proxy({} as TypographyValues, {
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
 * Create font size utility (special: includes line-height)
 */
function createFontSizeUtility(): TaggedUtilityFn & TypographyValues {
  const tokenCache = new Map<string, StyleToken>();

  const createToken = (name: string): StyleToken => {
    const cfg = getConfig();
    const prefix = cfg.prefix ?? "";
    const [size, lh] = fontSizeScale[name]!;
    const className = `${prefix}text-${name}`;

    return {
      __kind: "style",
      _: className,
      __cssTemplate: `.${className} { font-size: ${size}; line-height: ${lh}; }`,
      toString() {
        return this._;
      },
    };
  };

  const taggedFn = createTaggedUtility(fontSizeFn);

  const handler: ProxyHandler<TaggedUtilityFn> = {
    get(target, prop: string): StyleToken | undefined {
      if (prop === "length" || prop === "name" || prop === "prototype") {
        return (target as unknown as Record<string, unknown>)[prop] as StyleToken | undefined;
      }

      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in fontSizeScale) {
        const token = createToken(prop);
        tokenCache.set(prop, token);
        return token;
      }

      return undefined;
    },

    has(_target, prop: string): boolean {
      return prop in fontSizeScale;
    },

    apply(target, thisArg, args) {
      return Reflect.apply(target, thisArg, args);
    },

    ownKeys(): string[] {
      return Object.keys(fontSizeScale);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in fontSizeScale) {
        return {
          enumerable: true,
          configurable: true,
          get: () => this.get!(_target, prop, _target),
        };
      }
      return undefined;
    },
  };

  return new Proxy(taggedFn, handler) as TaggedUtilityFn & TypographyValues;
}

/**
 * Create text decoration utility (special class names)
 */
function createTextDecorationUtility(): TypographyValues {
  const tokenCache = new Map<string, StyleToken>();

  // Map property names to Tailwind class names
  const classNameMap: Record<string, string> = {
    underline: "underline",
    overline: "overline",
    lineThrough: "line-through",
    noUnderline: "no-underline",
  };

  return new Proxy({} as TypographyValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in textDecorationValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}${classNameMap[prop] ?? prop}`;
        const value = textDecorationValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { text-decoration-line: ${value}; }`,
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
      return prop in textDecorationValues;
    },

    ownKeys(): string[] {
      return Object.keys(textDecorationValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in textDecorationValues) {
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
 * Create text transform utility (special class names)
 */
function createTextTransformUtility(): TypographyValues {
  const tokenCache = new Map<string, StyleToken>();

  const classNameMap: Record<string, string> = {
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "capitalize",
    normalCase: "normal-case",
  };

  return new Proxy({} as TypographyValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in textTransformValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}${classNameMap[prop] ?? prop}`;
        const value = textTransformValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { text-transform: ${value}; }`,
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
      return prop in textTransformValues;
    },

    ownKeys(): string[] {
      return Object.keys(textTransformValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in textTransformValues) {
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
 * Create font style utility (special class names)
 */
function createFontStyleUtility(): TypographyValues {
  const tokenCache = new Map<string, StyleToken>();

  const classNameMap: Record<string, string> = {
    italic: "italic",
    notItalic: "not-italic",
  };

  return new Proxy({} as TypographyValues, {
    get(_target, prop: string): StyleToken | undefined {
      if (tokenCache.has(prop)) {
        return tokenCache.get(prop);
      }

      if (prop in fontStyleValues) {
        const cfg = getConfig();
        const prefix = cfg.prefix ?? "";
        const className = `${prefix}${classNameMap[prop] ?? prop}`;
        const value = fontStyleValues[prop]!;

        const token: StyleToken = {
          __kind: "style",
          _: className,
          __cssTemplate: `.${className} { font-style: ${value}; }`,
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
      return prop in fontStyleValues;
    },

    ownKeys(): string[] {
      return Object.keys(fontStyleValues);
    },

    getOwnPropertyDescriptor(_target, prop: string) {
      if (prop in fontStyleValues) {
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
 * Create truncate utility (combines multiple properties)
 */
function createTruncateUtility(): StyleToken {
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

// Use a Proxy to make truncate lazy-loaded with current config
const truncateProxy = new Proxy({} as StyleToken, {
  get(_target, prop: string) {
    const token = createTruncateUtility();
    return (token as unknown as Record<string, unknown>)[prop];
  },
}) as StyleToken;

// ============================================
// Typography Utilities
// ============================================

/**
 * Font size utility
 * @example
 * fontSize.base, fontSize.xl, fontSize["2xl"] // predefined
 * fontSize`18px` // arbitrary
 */
export const fontSize: TaggedUtilityFn & TypographyValues = createFontSizeUtility();

/**
 * Font weight utility
 * @example
 * fontWeight.bold, fontWeight.semibold // predefined
 */
export const fontWeight: TypographyValues = createSimpleUtility(fontWeightFn, fontWeightScale);

/**
 * Font family utility
 * @example
 * fontFamily.sans, fontFamily.mono // predefined
 */
export const fontFamily: TypographyValues = createSimpleUtility(fontFamilyFn, fontFamilyValues);

/**
 * Font style utility
 * @example
 * fontStyle.italic, fontStyle.notItalic // predefined
 */
export const fontStyle: TypographyValues = createFontStyleUtility();

/**
 * Line height utility
 * @example
 * lineHeight.normal, lineHeight.tight // predefined
 * lineHeight`1.8` // arbitrary
 */
export const lineHeight: TaggedUtilityFn & TypographyValues = createTypographyUtility(
  lineHeightFn,
  lineHeightScale,
);

/**
 * Letter spacing utility
 * @example
 * letterSpacing.wide, letterSpacing.tight // predefined
 * letterSpacing`0.1em` // arbitrary
 */
export const letterSpacing: TaggedUtilityFn & TypographyValues = createTypographyUtility(
  letterSpacingFn,
  letterSpacingScale,
);

/**
 * Text align utility
 * @example
 * textAlign.center, textAlign.left // predefined
 */
export const textAlign: TypographyValues = createSimpleUtility(textAlignFn, textAlignValues);

/**
 * Text decoration utility
 * @example
 * textDecoration.underline, textDecoration.lineThrough // predefined
 */
export const textDecoration: TypographyValues = createTextDecorationUtility();

/**
 * Text transform utility
 * @example
 * textTransform.uppercase, textTransform.capitalize // predefined
 */
export const textTransform: TypographyValues = createTextTransformUtility();

/**
 * Whitespace utility
 * @example
 * whitespace.nowrap, whitespace.pre // predefined
 */
export const whitespace: TypographyValues = createSimpleUtility(whitespaceFn, whitespaceValues);

/**
 * Word break utility
 * @example
 * wordBreak.normal, wordBreak.all // predefined
 */
export const wordBreak: TypographyValues = createSimpleUtility(wordBreakFn, wordBreakValues);

/**
 * Truncate utility (combines overflow, text-overflow, white-space)
 * @example
 * truncate // single utility
 */
export const truncate: StyleToken = truncateProxy;

// ============================================
// Grouped exports
// ============================================

/** Grouped typography utilities */
export interface TypographyGroup {
  fontSize: TaggedUtilityFn & TypographyValues;
  fontWeight: TypographyValues;
  fontFamily: TypographyValues;
  fontStyle: TypographyValues;
  lineHeight: TaggedUtilityFn & TypographyValues;
  letterSpacing: TaggedUtilityFn & TypographyValues;
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

export const typography: TypographyGroup = {
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  lineHeight,
  letterSpacing,
  textAlign,
  textDecoration,
  textTransform,
  whitespace,
  wordBreak,
  truncate,
};

export const typographyArb: TypographyArbGroup = {
  fontSize,
  lineHeight,
  letterSpacing,
};

/**
 * Flexbox utilities: display, flex, justify, align, etc.
 *
 * Usage:
 * ```ts
 * // Flat exports (recommended)
 * import { flex, flexCol, justifyCenter, itemsCenter, gap4 } from "@semajsx/tailwind";
 * <div class={cx(flex, flexCol, justifyCenter, itemsCenter, gap4)}>
 *
 * // Namespace access
 * import { flexbox } from "@semajsx/tailwind";
 * <div class={cx(flexbox.flex, flexbox.flexCol, flexbox.justifyCenter)}>
 *
 * // Arbitrary values (tagged template)
 * import { basis, order } from "@semajsx/tailwind";
 * <div class={cx(basis`200px`, order`99`)}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createTaggedUtility } from "./core";
import { getConfig } from "./config";

// ============================================
// Scale definitions
// ============================================

// Flex basis scale
const basisScale: Record<string, string> = {
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
};

// Basis semantic values
const basisSemanticValues: Record<string, string> = {
  auto: "auto",
  full: "100%",
  half: "50%",
  third: "33.333333%",
  twoThirds: "66.666667%",
  quarter: "25%",
  threeQuarters: "75%",
};

// Order scale
const orderScale: Record<string, string> = {
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
};

// ============================================
// Utility function creators
// ============================================

const flexBasisFn = createUtility("flex-basis", "basis");
const orderFn = createUtility("order", "order");
const flexShorthandFn = createUtility("flex", "flex");

// ============================================
// Token generators
// ============================================

function generateDisplayTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    block: ["block", "block"],
    inlineBlock: ["inline-block", "inline-block"],
    inline: ["inline", "inline"],
    flex: ["flex", "flex"],
    inlineFlex: ["inline-flex", "inline-flex"],
    grid: ["grid", "grid"],
    inlineGrid: ["inline-grid", "inline-grid"],
    contents: ["contents", "contents"],
    hidden: ["hidden", "none"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { display: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateFlexDirectionTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    flexRow: ["flex-row", "row"],
    flexRowReverse: ["flex-row-reverse", "row-reverse"],
    flexCol: ["flex-col", "column"],
    flexColReverse: ["flex-col-reverse", "column-reverse"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { flex-direction: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateFlexWrapTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    flexWrap: ["flex-wrap", "wrap"],
    flexWrapReverse: ["flex-wrap-reverse", "wrap-reverse"],
    flexNowrap: ["flex-nowrap", "nowrap"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { flex-wrap: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateFlexShorthandTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    flex1: ["flex-1", "1 1 0%"],
    flexAuto: ["flex-auto", "1 1 auto"],
    flexInitial: ["flex-initial", "0 1 auto"],
    flexNone: ["flex-none", "none"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { flex: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateGrowShrinkTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  // Grow
  tokens.grow = {
    __kind: "style",
    _: `${prefix}grow`,
    __cssTemplate: `.${prefix}grow { flex-grow: 1; }`,
    toString() {
      return this._;
    },
  };
  tokens.grow0 = {
    __kind: "style",
    _: `${prefix}grow-0`,
    __cssTemplate: `.${prefix}grow-0 { flex-grow: 0; }`,
    toString() {
      return this._;
    },
  };

  // Shrink
  tokens.shrink = {
    __kind: "style",
    _: `${prefix}shrink`,
    __cssTemplate: `.${prefix}shrink { flex-shrink: 1; }`,
    toString() {
      return this._;
    },
  };
  tokens.shrink0 = {
    __kind: "style",
    _: `${prefix}shrink-0`,
    __cssTemplate: `.${prefix}shrink-0 { flex-shrink: 0; }`,
    toString() {
      return this._;
    },
  };

  return tokens;
}

function generateBasisTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  // Number tokens: basis0, basis4, etc.
  // Decimal tokens use underscore: basis0_5, basis1_5, etc.
  for (const [key, value] of Object.entries(basisScale)) {
    const tokenName = `basis${key.replace(".", "_")}`;
    tokens[tokenName] = flexBasisFn(value, key);
  }

  // px token
  tokens.basispx = flexBasisFn("1px", "px");

  // Semantic tokens: basisAuto, basisFull, basisHalf
  for (const [key, value] of Object.entries(basisSemanticValues)) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const tokenName = `basis${capKey}`;
    tokens[tokenName] = flexBasisFn(value, key);
  }

  return tokens;
}

function generateJustifyContentTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    justifyNormal: ["justify-normal", "normal"],
    justifyStart: ["justify-start", "flex-start"],
    justifyEnd: ["justify-end", "flex-end"],
    justifyCenter: ["justify-center", "center"],
    justifyBetween: ["justify-between", "space-between"],
    justifyAround: ["justify-around", "space-around"],
    justifyEvenly: ["justify-evenly", "space-evenly"],
    justifyStretch: ["justify-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { justify-content: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateJustifyItemsTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    justifyItemsStart: ["justify-items-start", "start"],
    justifyItemsEnd: ["justify-items-end", "end"],
    justifyItemsCenter: ["justify-items-center", "center"],
    justifyItemsStretch: ["justify-items-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { justify-items: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateJustifySelfTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    justifySelfAuto: ["justify-self-auto", "auto"],
    justifySelfStart: ["justify-self-start", "start"],
    justifySelfEnd: ["justify-self-end", "end"],
    justifySelfCenter: ["justify-self-center", "center"],
    justifySelfStretch: ["justify-self-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { justify-self: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateAlignContentTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    contentNormal: ["content-normal", "normal"],
    contentStart: ["content-start", "flex-start"],
    contentEnd: ["content-end", "flex-end"],
    contentCenter: ["content-center", "center"],
    contentBetween: ["content-between", "space-between"],
    contentAround: ["content-around", "space-around"],
    contentEvenly: ["content-evenly", "space-evenly"],
    contentBaseline: ["content-baseline", "baseline"],
    contentStretch: ["content-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { align-content: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateAlignItemsTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    itemsStart: ["items-start", "flex-start"],
    itemsEnd: ["items-end", "flex-end"],
    itemsCenter: ["items-center", "center"],
    itemsBaseline: ["items-baseline", "baseline"],
    itemsStretch: ["items-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { align-items: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateAlignSelfTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    selfAuto: ["self-auto", "auto"],
    selfStart: ["self-start", "flex-start"],
    selfEnd: ["self-end", "flex-end"],
    selfCenter: ["self-center", "center"],
    selfBaseline: ["self-baseline", "baseline"],
    selfStretch: ["self-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { align-self: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generatePlaceContentTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    placeContentStart: ["place-content-start", "start"],
    placeContentEnd: ["place-content-end", "end"],
    placeContentCenter: ["place-content-center", "center"],
    placeContentBetween: ["place-content-between", "space-between"],
    placeContentAround: ["place-content-around", "space-around"],
    placeContentEvenly: ["place-content-evenly", "space-evenly"],
    placeContentBaseline: ["place-content-baseline", "baseline"],
    placeContentStretch: ["place-content-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { place-content: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generatePlaceItemsTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    placeItemsStart: ["place-items-start", "start"],
    placeItemsEnd: ["place-items-end", "end"],
    placeItemsCenter: ["place-items-center", "center"],
    placeItemsBaseline: ["place-items-baseline", "baseline"],
    placeItemsStretch: ["place-items-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { place-items: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generatePlaceSelfTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};
  const cfg = getConfig();
  const prefix = cfg.prefix ?? "";

  const values: Record<string, [string, string]> = {
    placeSelfAuto: ["place-self-auto", "auto"],
    placeSelfStart: ["place-self-start", "start"],
    placeSelfEnd: ["place-self-end", "end"],
    placeSelfCenter: ["place-self-center", "center"],
    placeSelfStretch: ["place-self-stretch", "stretch"],
  };

  for (const [key, [className, value]] of Object.entries(values)) {
    tokens[key] = {
      __kind: "style",
      _: `${prefix}${className}`,
      __cssTemplate: `.${prefix}${className} { place-self: ${value}; }`,
      toString() {
        return this._;
      },
    };
  }

  return tokens;
}

function generateOrderTokens(): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  // Number tokens: order1, order2, etc.
  for (const [key, value] of Object.entries(orderScale)) {
    const tokenName = `order${key}`;
    tokens[tokenName] = orderFn(value, key);
  }

  // Semantic tokens
  tokens.orderFirst = orderFn("-9999", "first");
  tokens.orderLast = orderFn("9999", "last");
  tokens.orderNone = orderFn("0", "none");

  return tokens;
}

// ============================================
// Generate all tokens
// ============================================

const displayTokens = generateDisplayTokens();
const flexDirectionTokens = generateFlexDirectionTokens();
const flexWrapTokens = generateFlexWrapTokens();
const flexShorthandTokens = generateFlexShorthandTokens();
const growShrinkTokens = generateGrowShrinkTokens();
const basisTokens = generateBasisTokens();
const justifyContentTokens = generateJustifyContentTokens();
const justifyItemsTokens = generateJustifyItemsTokens();
const justifySelfTokens = generateJustifySelfTokens();
const alignContentTokens = generateAlignContentTokens();
const alignItemsTokens = generateAlignItemsTokens();
const alignSelfTokens = generateAlignSelfTokens();
const placeContentTokens = generatePlaceContentTokens();
const placeItemsTokens = generatePlaceItemsTokens();
const placeSelfTokens = generatePlaceSelfTokens();
const orderTokens = generateOrderTokens();

// ============================================
// Tagged template functions for arbitrary values
// ============================================

/** Flex basis - arbitrary value: basis`200px` */
export const basis: TaggedUtilityFn = createTaggedUtility(flexBasisFn);

/** Order - arbitrary value: order`99` */
export const order: TaggedUtilityFn = createTaggedUtility(orderFn);

/** Flex shorthand - arbitrary value: flexArb`2 2 0%` */
export const flexArb: TaggedUtilityFn = createTaggedUtility(flexShorthandFn);

// ============================================
// Individual token exports (flat) - Display
// ============================================

export const { block, inlineBlock, inline, flex, inlineFlex, grid, inlineGrid, contents, hidden } =
  displayTokens;

// ============================================
// Individual token exports (flat) - Flex Direction
// ============================================

export const { flexRow, flexRowReverse, flexCol, flexColReverse } = flexDirectionTokens;

// ============================================
// Individual token exports (flat) - Flex Wrap
// ============================================

export const { flexWrap, flexWrapReverse, flexNowrap } = flexWrapTokens;

// ============================================
// Individual token exports (flat) - Flex Shorthand
// ============================================

export const { flex1, flexAuto, flexInitial, flexNone } = flexShorthandTokens;

// ============================================
// Individual token exports (flat) - Grow/Shrink
// ============================================

export const { grow, grow0, shrink, shrink0 } = growShrinkTokens;

// ============================================
// Individual token exports (flat) - Basis
// ============================================

export const {
  basis0,
  basis0_5,
  basispx,
  basis1,
  basis1_5,
  basis2,
  basis2_5,
  basis3,
  basis3_5,
  basis4,
  basis5,
  basis6,
  basis7,
  basis8,
  basis9,
  basis10,
  basis11,
  basis12,
  basis14,
  basis16,
  basis20,
  basis24,
  basis28,
  basis32,
  basis36,
  basis40,
  basis44,
  basis48,
  basis52,
  basis56,
  basis60,
  basis64,
  basis72,
  basis80,
  basis96,
  basisAuto,
  basisFull,
  basisHalf,
  basisThird,
  basisTwoThirds,
  basisQuarter,
  basisThreeQuarters,
} = basisTokens;

// ============================================
// Individual token exports (flat) - Justify Content
// ============================================

export const {
  justifyNormal,
  justifyStart,
  justifyEnd,
  justifyCenter,
  justifyBetween,
  justifyAround,
  justifyEvenly,
  justifyStretch,
} = justifyContentTokens;

// ============================================
// Individual token exports (flat) - Justify Items
// ============================================

export const { justifyItemsStart, justifyItemsEnd, justifyItemsCenter, justifyItemsStretch } =
  justifyItemsTokens;

// ============================================
// Individual token exports (flat) - Justify Self
// ============================================

export const {
  justifySelfAuto,
  justifySelfStart,
  justifySelfEnd,
  justifySelfCenter,
  justifySelfStretch,
} = justifySelfTokens;

// ============================================
// Individual token exports (flat) - Align Content
// ============================================

export const {
  contentNormal,
  contentStart,
  contentEnd,
  contentCenter,
  contentBetween,
  contentAround,
  contentEvenly,
  contentBaseline,
  contentStretch,
} = alignContentTokens;

// ============================================
// Individual token exports (flat) - Align Items
// ============================================

export const { itemsStart, itemsEnd, itemsCenter, itemsBaseline, itemsStretch } = alignItemsTokens;

// ============================================
// Individual token exports (flat) - Align Self
// ============================================

export const { selfAuto, selfStart, selfEnd, selfCenter, selfBaseline, selfStretch } =
  alignSelfTokens;

// ============================================
// Individual token exports (flat) - Place Content
// ============================================

export const {
  placeContentStart,
  placeContentEnd,
  placeContentCenter,
  placeContentBetween,
  placeContentAround,
  placeContentEvenly,
  placeContentBaseline,
  placeContentStretch,
} = placeContentTokens;

// ============================================
// Individual token exports (flat) - Place Items
// ============================================

export const {
  placeItemsStart,
  placeItemsEnd,
  placeItemsCenter,
  placeItemsBaseline,
  placeItemsStretch,
} = placeItemsTokens;

// ============================================
// Individual token exports (flat) - Place Self
// ============================================

export const { placeSelfAuto, placeSelfStart, placeSelfEnd, placeSelfCenter, placeSelfStretch } =
  placeSelfTokens;

// ============================================
// Individual token exports (flat) - Order
// ============================================

export const {
  order1,
  order2,
  order3,
  order4,
  order5,
  order6,
  order7,
  order8,
  order9,
  order10,
  order11,
  order12,
  orderFirst,
  orderLast,
  orderNone,
} = orderTokens;

// ============================================
// Namespace export (grouped)
// ============================================

/** All flexbox tokens in a namespace */
export const flexbox = {
  // Display
  ...displayTokens,
  // Flex direction
  ...flexDirectionTokens,
  // Flex wrap
  ...flexWrapTokens,
  // Flex shorthand
  ...flexShorthandTokens,
  // Grow/Shrink
  ...growShrinkTokens,
  // Basis
  ...basisTokens,
  // Justify content
  ...justifyContentTokens,
  // Justify items
  ...justifyItemsTokens,
  // Justify self
  ...justifySelfTokens,
  // Align content
  ...alignContentTokens,
  // Align items
  ...alignItemsTokens,
  // Align self
  ...alignSelfTokens,
  // Place content
  ...placeContentTokens,
  // Place items
  ...placeItemsTokens,
  // Place self
  ...placeSelfTokens,
  // Order
  ...orderTokens,
  // Arbitrary (tagged templates)
  basis,
  order,
  flexArb,
};

// Type for the flexbox namespace
export type FlexboxNamespace = typeof flexbox;

// Legacy type exports for backwards compatibility
export type FlexValues = Record<string, StyleToken>;
export type FlexboxGroup = FlexboxNamespace;

// Legacy exports for backwards compatibility
export const flexboxArb = {
  basis,
  order,
  flex: flexArb,
};

// Legacy proxy exports (for backwards compatibility)
export const display = displayTokens;
export const flexDirection = flexDirectionTokens;
export const flexWrapProxy = flexWrapTokens;
export const justify = justifyContentTokens;
export const justifyItems = justifyItemsTokens;
export const justifySelf = justifySelfTokens;
export const content = alignContentTokens;
export const items = alignItemsTokens;
export const self = alignSelfTokens;
export const placeContent = placeContentTokens;
export const placeItems = placeItemsTokens;
export const placeSelf = placeSelfTokens;

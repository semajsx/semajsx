/**
 * Spacing utilities: padding, margin, gap
 *
 * Usage:
 * ```ts
 * // Merged naming - flat exports (recommended)
 * import { p4, px2, m4, mx2, gap4 } from "@semajsx/tailwind";
 * <div class={[p4, mx2, gap4]}>
 *
 * // Namespace access
 * import { spacing } from "@semajsx/tailwind";
 * <div class={[spacing.p4, spacing.mx2]}>
 *
 * // Arbitrary values (tagged template)
 * import { p, px, m, mx } from "@semajsx/tailwind";
 * <div class={[p`10px`, px`20px`, m`calc(100% - 40px)`]}>
 * ```
 */

import type { StyleToken, TaggedUtilityFn } from "./types";
import { createUtility, createMultiUtility, createTaggedUtility } from "./core";

// Tailwind spacing scale (in rem, where 4 = 1rem)
const spacingScale: Record<string, string> = {
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

// Utility function creators
const utilityCreators = {
  p: createUtility("padding", "p"),
  px: createMultiUtility(["padding-left", "padding-right"], "px"),
  py: createMultiUtility(["padding-top", "padding-bottom"], "py"),
  pt: createUtility("padding-top", "pt"),
  pr: createUtility("padding-right", "pr"),
  pb: createUtility("padding-bottom", "pb"),
  pl: createUtility("padding-left", "pl"),
  m: createUtility("margin", "m"),
  mx: createMultiUtility(["margin-left", "margin-right"], "mx"),
  my: createMultiUtility(["margin-top", "margin-bottom"], "my"),
  mt: createUtility("margin-top", "mt"),
  mr: createUtility("margin-right", "mr"),
  mb: createUtility("margin-bottom", "mb"),
  ml: createUtility("margin-left", "ml"),
  gap: createUtility("gap", "gap"),
  gapX: createUtility("column-gap", "gap-x"),
  gapY: createUtility("row-gap", "gap-y"),
};

type UtilityFn = (value: string, valueName?: string) => StyleToken;

// ============================================
// Token generators
// ============================================

function generateSpacingTokens(prefix: string, utilityFn: UtilityFn): Record<string, StyleToken> {
  const tokens: Record<string, StyleToken> = {};

  for (const [key, value] of Object.entries(spacingScale)) {
    // Skip decimal values - use tagged template for these: p`0.5`
    if (key.includes(".")) continue;

    const tokenName = `${prefix}${key}`;
    tokens[tokenName] = utilityFn(value, key);
  }

  return tokens;
}

// ============================================
// Generate all tokens
// ============================================

// Padding tokens
const pTokens = generateSpacingTokens("p", utilityCreators.p);
const pxTokens = generateSpacingTokens("px", utilityCreators.px);
const pyTokens = generateSpacingTokens("py", utilityCreators.py);
const ptTokens = generateSpacingTokens("pt", utilityCreators.pt);
const prTokens = generateSpacingTokens("pr", utilityCreators.pr);
const pbTokens = generateSpacingTokens("pb", utilityCreators.pb);
const plTokens = generateSpacingTokens("pl", utilityCreators.pl);

// Margin tokens
const mTokens = generateSpacingTokens("m", utilityCreators.m);
const mxTokens = generateSpacingTokens("mx", utilityCreators.mx);
const myTokens = generateSpacingTokens("my", utilityCreators.my);
const mtTokens = generateSpacingTokens("mt", utilityCreators.mt);
const mrTokens = generateSpacingTokens("mr", utilityCreators.mr);
const mbTokens = generateSpacingTokens("mb", utilityCreators.mb);
const mlTokens = generateSpacingTokens("ml", utilityCreators.ml);

// Gap tokens
const gapTokens = generateSpacingTokens("gap", utilityCreators.gap);
const gapXTokens = generateSpacingTokens("gapX", utilityCreators.gapX);
const gapYTokens = generateSpacingTokens("gapY", utilityCreators.gapY);

// ============================================
// Tagged Template Functions (Arbitrary Values)
// ============================================

/** Padding - arbitrary value: p`10px` */
export const p: TaggedUtilityFn = createTaggedUtility(utilityCreators.p);
/** Padding X - arbitrary value: px`10px` */
export const px: TaggedUtilityFn = createTaggedUtility(utilityCreators.px);
/** Padding Y - arbitrary value: py`10px` */
export const py: TaggedUtilityFn = createTaggedUtility(utilityCreators.py);
/** Padding Top - arbitrary value: pt`10px` */
export const pt: TaggedUtilityFn = createTaggedUtility(utilityCreators.pt);
/** Padding Right - arbitrary value: pr`10px` */
export const pr: TaggedUtilityFn = createTaggedUtility(utilityCreators.pr);
/** Padding Bottom - arbitrary value: pb`10px` */
export const pb: TaggedUtilityFn = createTaggedUtility(utilityCreators.pb);
/** Padding Left - arbitrary value: pl`10px` */
export const pl: TaggedUtilityFn = createTaggedUtility(utilityCreators.pl);

/** Margin - arbitrary value: m`10px` */
export const m: TaggedUtilityFn = createTaggedUtility(utilityCreators.m);
/** Margin X - arbitrary value: mx`10px` */
export const mx: TaggedUtilityFn = createTaggedUtility(utilityCreators.mx);
/** Margin Y - arbitrary value: my`10px` */
export const my: TaggedUtilityFn = createTaggedUtility(utilityCreators.my);
/** Margin Top - arbitrary value: mt`10px` */
export const mt: TaggedUtilityFn = createTaggedUtility(utilityCreators.mt);
/** Margin Right - arbitrary value: mr`10px` */
export const mr: TaggedUtilityFn = createTaggedUtility(utilityCreators.mr);
/** Margin Bottom - arbitrary value: mb`10px` */
export const mb: TaggedUtilityFn = createTaggedUtility(utilityCreators.mb);
/** Margin Left - arbitrary value: ml`10px` */
export const ml: TaggedUtilityFn = createTaggedUtility(utilityCreators.ml);

/** Gap - arbitrary value: gap`10px` */
export const gap: TaggedUtilityFn = createTaggedUtility(utilityCreators.gap);
/** Gap X - arbitrary value: gapX`10px` */
export const gapX: TaggedUtilityFn = createTaggedUtility(utilityCreators.gapX);
/** Gap Y - arbitrary value: gapY`10px` */
export const gapY: TaggedUtilityFn = createTaggedUtility(utilityCreators.gapY);

// ============================================
// Individual token exports (flat) - Padding
// ============================================

export const {
  p0,
  ppx,
  p1,
  p2,
  p3,
  p4,
  p5,
  p6,
  p7,
  p8,
  p9,
  p10,
  p11,
  p12,
  p14,
  p16,
  p20,
  p24,
  p28,
  p32,
  p36,
  p40,
  p44,
  p48,
  p52,
  p56,
  p60,
  p64,
  p72,
  p80,
  p96,
} = pTokens;

export const {
  px0,
  pxpx,
  px1,
  px2,
  px3,
  px4,
  px5,
  px6,
  px7,
  px8,
  px9,
  px10,
  px11,
  px12,
  px14,
  px16,
  px20,
  px24,
  px28,
  px32,
  px36,
  px40,
  px44,
  px48,
  px52,
  px56,
  px60,
  px64,
  px72,
  px80,
  px96,
} = pxTokens;

export const {
  py0,
  pypx,
  py1,
  py2,
  py3,
  py4,
  py5,
  py6,
  py7,
  py8,
  py9,
  py10,
  py11,
  py12,
  py14,
  py16,
  py20,
  py24,
  py28,
  py32,
  py36,
  py40,
  py44,
  py48,
  py52,
  py56,
  py60,
  py64,
  py72,
  py80,
  py96,
} = pyTokens;

export const {
  pt0,
  ptpx,
  pt1,
  pt2,
  pt3,
  pt4,
  pt5,
  pt6,
  pt7,
  pt8,
  pt9,
  pt10,
  pt11,
  pt12,
  pt14,
  pt16,
  pt20,
  pt24,
  pt28,
  pt32,
  pt36,
  pt40,
  pt44,
  pt48,
  pt52,
  pt56,
  pt60,
  pt64,
  pt72,
  pt80,
  pt96,
} = ptTokens;

export const {
  pr0,
  prpx,
  pr1,
  pr2,
  pr3,
  pr4,
  pr5,
  pr6,
  pr7,
  pr8,
  pr9,
  pr10,
  pr11,
  pr12,
  pr14,
  pr16,
  pr20,
  pr24,
  pr28,
  pr32,
  pr36,
  pr40,
  pr44,
  pr48,
  pr52,
  pr56,
  pr60,
  pr64,
  pr72,
  pr80,
  pr96,
} = prTokens;

export const {
  pb0,
  pbpx,
  pb1,
  pb2,
  pb3,
  pb4,
  pb5,
  pb6,
  pb7,
  pb8,
  pb9,
  pb10,
  pb11,
  pb12,
  pb14,
  pb16,
  pb20,
  pb24,
  pb28,
  pb32,
  pb36,
  pb40,
  pb44,
  pb48,
  pb52,
  pb56,
  pb60,
  pb64,
  pb72,
  pb80,
  pb96,
} = pbTokens;

export const {
  pl0,
  plpx,
  pl1,
  pl2,
  pl3,
  pl4,
  pl5,
  pl6,
  pl7,
  pl8,
  pl9,
  pl10,
  pl11,
  pl12,
  pl14,
  pl16,
  pl20,
  pl24,
  pl28,
  pl32,
  pl36,
  pl40,
  pl44,
  pl48,
  pl52,
  pl56,
  pl60,
  pl64,
  pl72,
  pl80,
  pl96,
} = plTokens;

// ============================================
// Individual token exports (flat) - Margin
// ============================================

export const {
  m0,
  mpx,
  m1,
  m2,
  m3,
  m4,
  m5,
  m6,
  m7,
  m8,
  m9,
  m10,
  m11,
  m12,
  m14,
  m16,
  m20,
  m24,
  m28,
  m32,
  m36,
  m40,
  m44,
  m48,
  m52,
  m56,
  m60,
  m64,
  m72,
  m80,
  m96,
} = mTokens;

export const {
  mx0,
  mxpx,
  mx1,
  mx2,
  mx3,
  mx4,
  mx5,
  mx6,
  mx7,
  mx8,
  mx9,
  mx10,
  mx11,
  mx12,
  mx14,
  mx16,
  mx20,
  mx24,
  mx28,
  mx32,
  mx36,
  mx40,
  mx44,
  mx48,
  mx52,
  mx56,
  mx60,
  mx64,
  mx72,
  mx80,
  mx96,
} = mxTokens;

export const {
  my0,
  mypx,
  my1,
  my2,
  my3,
  my4,
  my5,
  my6,
  my7,
  my8,
  my9,
  my10,
  my11,
  my12,
  my14,
  my16,
  my20,
  my24,
  my28,
  my32,
  my36,
  my40,
  my44,
  my48,
  my52,
  my56,
  my60,
  my64,
  my72,
  my80,
  my96,
} = myTokens;

export const {
  mt0,
  mtpx,
  mt1,
  mt2,
  mt3,
  mt4,
  mt5,
  mt6,
  mt7,
  mt8,
  mt9,
  mt10,
  mt11,
  mt12,
  mt14,
  mt16,
  mt20,
  mt24,
  mt28,
  mt32,
  mt36,
  mt40,
  mt44,
  mt48,
  mt52,
  mt56,
  mt60,
  mt64,
  mt72,
  mt80,
  mt96,
} = mtTokens;

export const {
  mr0,
  mrpx,
  mr1,
  mr2,
  mr3,
  mr4,
  mr5,
  mr6,
  mr7,
  mr8,
  mr9,
  mr10,
  mr11,
  mr12,
  mr14,
  mr16,
  mr20,
  mr24,
  mr28,
  mr32,
  mr36,
  mr40,
  mr44,
  mr48,
  mr52,
  mr56,
  mr60,
  mr64,
  mr72,
  mr80,
  mr96,
} = mrTokens;

export const {
  mb0,
  mbpx,
  mb1,
  mb2,
  mb3,
  mb4,
  mb5,
  mb6,
  mb7,
  mb8,
  mb9,
  mb10,
  mb11,
  mb12,
  mb14,
  mb16,
  mb20,
  mb24,
  mb28,
  mb32,
  mb36,
  mb40,
  mb44,
  mb48,
  mb52,
  mb56,
  mb60,
  mb64,
  mb72,
  mb80,
  mb96,
} = mbTokens;

export const {
  ml0,
  mlpx,
  ml1,
  ml2,
  ml3,
  ml4,
  ml5,
  ml6,
  ml7,
  ml8,
  ml9,
  ml10,
  ml11,
  ml12,
  ml14,
  ml16,
  ml20,
  ml24,
  ml28,
  ml32,
  ml36,
  ml40,
  ml44,
  ml48,
  ml52,
  ml56,
  ml60,
  ml64,
  ml72,
  ml80,
  ml96,
} = mlTokens;

// ============================================
// Individual token exports (flat) - Gap
// ============================================

export const {
  gap0,
  gappx,
  gap1,
  gap2,
  gap3,
  gap4,
  gap5,
  gap6,
  gap7,
  gap8,
  gap9,
  gap10,
  gap11,
  gap12,
  gap14,
  gap16,
  gap20,
  gap24,
  gap28,
  gap32,
  gap36,
  gap40,
  gap44,
  gap48,
  gap52,
  gap56,
  gap60,
  gap64,
  gap72,
  gap80,
  gap96,
} = gapTokens;

export const {
  gapX0,
  gapXpx,
  gapX1,
  gapX2,
  gapX3,
  gapX4,
  gapX5,
  gapX6,
  gapX7,
  gapX8,
  gapX9,
  gapX10,
  gapX11,
  gapX12,
  gapX14,
  gapX16,
  gapX20,
  gapX24,
  gapX28,
  gapX32,
  gapX36,
  gapX40,
  gapX44,
  gapX48,
  gapX52,
  gapX56,
  gapX60,
  gapX64,
  gapX72,
  gapX80,
  gapX96,
} = gapXTokens;

export const {
  gapY0,
  gapYpx,
  gapY1,
  gapY2,
  gapY3,
  gapY4,
  gapY5,
  gapY6,
  gapY7,
  gapY8,
  gapY9,
  gapY10,
  gapY11,
  gapY12,
  gapY14,
  gapY16,
  gapY20,
  gapY24,
  gapY28,
  gapY32,
  gapY36,
  gapY40,
  gapY44,
  gapY48,
  gapY52,
  gapY56,
  gapY60,
  gapY64,
  gapY72,
  gapY80,
  gapY96,
} = gapYTokens;

// ============================================
// Namespace export (grouped)
// ============================================

/** All spacing tokens in a namespace */
export const spacing = {
  // Padding
  ...pTokens,
  ...pxTokens,
  ...pyTokens,
  ...ptTokens,
  ...prTokens,
  ...pbTokens,
  ...plTokens,
  // Margin
  ...mTokens,
  ...mxTokens,
  ...myTokens,
  ...mtTokens,
  ...mrTokens,
  ...mbTokens,
  ...mlTokens,
  // Gap
  ...gapTokens,
  ...gapXTokens,
  ...gapYTokens,
  // Arbitrary (tagged templates)
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  gap,
  gapX,
  gapY,
};

// Type for the spacing namespace
export type SpacingNamespace = typeof spacing;

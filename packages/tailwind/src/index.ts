/**
 * @semajsx/tailwind - Tailwind-style utility classes for SemaJSX
 *
 * Type-safe, tree-shakeable utility classes with native Tailwind class names.
 *
 * @example
 * ```ts
 * // Predefined values
 * import { spacing, colors } from "@semajsx/tailwind";
 * <div class={[spacing.p4, colors.bgBlue500]}>
 *
 * // Arbitrary values
 * import { p, bg } from "@semajsx/tailwind";
 * <div class={[p`10px`, bg`#ff5500`]}>
 * ```
 */

// Types
export type { StyleToken, TailwindConfig, UtilityFn, TaggedUtilityFn } from "./types";

// Configuration
export { configureTailwind, getConfig, resetConfig, getDefaultConfig } from "./config";

// Core utilities
export {
  hashString,
  valueToSuffix,
  createUtility,
  createTaggedUtility,
  createMultiUtility,
} from "./core";

// Spacing utilities
export type { SpacingValues, SpacingGroup, SpacingArbGroup } from "./spacing";
export {
  // Predefined values
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
  // Arbitrary value functions
  pArb,
  pxArb,
  pyArb,
  ptArb,
  prArb,
  pbArb,
  plArb,
  mArb,
  mxArb,
  myArb,
  mtArb,
  mrArb,
  mbArb,
  mlArb,
  gapArb,
  gapXArb,
  gapYArb,
  // Grouped exports
  spacing,
  spacingArb,
} from "./spacing";

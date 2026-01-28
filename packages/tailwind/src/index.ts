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

// Sizing utilities
export type { SizingValues, SizingGroup, SizingArbGroup } from "./sizing";
export {
  // Predefined values
  w,
  minW,
  maxW,
  h,
  minH,
  maxH,
  size,
  // Arbitrary value functions
  wArb,
  minWArb,
  maxWArb,
  hArb,
  minHArb,
  maxHArb,
  sizeArb,
  // Grouped exports
  sizing,
  sizingArb,
} from "./sizing";

// Color utilities
export type { ColorValues, ColorGroup, ColorArbGroup } from "./colors";
export {
  // Predefined values
  bg,
  text,
  border,
  // Arbitrary value functions
  bgArb,
  textArb,
  borderArb,
  // Grouped exports
  colors,
  colorsArb,
} from "./colors";

// Flexbox utilities
export type { FlexValues, FlexboxGroup, FlexboxArbGroup } from "./flexbox";
export {
  // Display
  display,
  // Flex direction & wrap
  flexDirection,
  flexWrap,
  // Flex shorthand
  flex,
  grow,
  shrink,
  basis,
  // Justify
  justify,
  justifyItems,
  justifySelf,
  // Align
  content,
  items,
  self,
  // Place
  placeContent,
  placeItems,
  placeSelf,
  // Order
  order,
  // Arbitrary value functions
  flexArb,
  basisArb,
  orderArb,
  // Grouped exports
  flexbox,
  flexboxArb,
} from "./flexbox";

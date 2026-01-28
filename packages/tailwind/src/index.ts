/**
 * @semajsx/tailwind - Tailwind-style utility classes for SemaJSX
 *
 * Type-safe, tree-shakeable utility classes with native Tailwind class names.
 *
 * @example
 * ```ts
 * // Predefined values via Proxy
 * import { spacing, bg, w, fontSize } from "@semajsx/tailwind";
 * <div class={[spacing.p4, bg.blue500, w.full, fontSize.lg]}>
 *
 * // Arbitrary values via tagged template (same utilities!)
 * import { p, bg, w, fontSize } from "@semajsx/tailwind";
 * <div class={[p`10px`, bg`#ff5500`, w`300px`, fontSize`18px`]}>
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
export type { SpacingNamespace } from "./spacing";
export {
  // Namespace with predefined values (spacing.p4, spacing.mx2, etc.)
  spacing,
  // Tagged templates for arbitrary values (also work as namespaces)
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
} from "./spacing";

// Sizing utilities
// Each utility works as both namespace and tagged template:
// - w.full, w["4"] for predefined values
// - w`300px` for arbitrary values
export type { SizingValues, SizingNamespace, SizingGroup } from "./sizing";
export {
  w,
  minW,
  maxW,
  h,
  minH,
  maxH,
  size,
  // Grouped exports
  sizing,
  sizingArb, // Legacy alias for sizing
} from "./sizing";

// Color utilities
// Each utility works as both namespace and tagged template:
// - bg.blue500 for predefined values
// - bg`#ff5500` for arbitrary values
export type { ColorValues, ColorsNamespace, ColorGroup } from "./colors";
export {
  bg,
  text,
  border,
  // Grouped exports
  colors,
  colorsArb, // Legacy alias for colors
} from "./colors";

// Flexbox utilities
// display, flexDirection, flexWrap use camelCase:
// - display.inlineFlex, flexDirection.rowReverse
// flex, basis, order work as both namespace and tagged template:
// - flex["1"], basis.auto, order.first
// - flex`2 1 50%`, basis`200px`, order`99`
export type { FlexValues, FlexboxGroup } from "./flexbox";
export {
  // Display (camelCase: inlineBlock, inlineFlex, inlineGrid)
  display,
  // Flex direction & wrap (camelCase: rowReverse, colReverse, wrapReverse)
  flexDirection,
  flexWrap,
  // Flex shorthand (namespace + tagged template)
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
  // Order (namespace + tagged template)
  order,
  // Grouped exports
  flexbox,
  flexboxArb, // Legacy alias
} from "./flexbox";

// Typography utilities
// fontSize, lineHeight, letterSpacing work as both namespace and tagged template:
// - fontSize.base, lineHeight.normal
// - fontSize`18px`, lineHeight`1.8`
// textDecoration, textTransform, fontStyle use camelCase:
// - textDecoration.lineThrough, textTransform.normalCase, fontStyle.notItalic
export type { TypographyValues, TypographyGroup, TypographyArbGroup } from "./typography";
export {
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
  // Grouped exports
  typography,
  typographyArb, // Legacy alias
} from "./typography";

// Layout utilities
// top, right, bottom, left, zIndex, inset, insetX, insetY work as both namespace and tagged template:
// - top["4"], zIndex["50"], inset.auto
// - top`100px`, zIndex`999`, inset`50px`
export type { LayoutValues, LayoutGroup } from "./layout";
export {
  position,
  inset,
  insetX,
  insetY,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  overflowX,
  overflowY,
  visibility,
  // Grouped exports
  layout,
  layoutArb, // Legacy alias
} from "./layout";

// Effects utilities
// borderWidth, borderRadius, boxShadow, opacity work as both namespace and tagged template:
// - borderRadius.lg, boxShadow.md, opacity["50"]
// - borderRadius`10px`, boxShadow`0 0 10px black`, opacity`0.75`
// cursor uses camelCase: cursor.notAllowed, cursor.zoomIn
export type { EffectsValues, EffectsGroup } from "./effects";
export {
  borderWidth,
  borderRadius,
  borderStyle,
  boxShadow,
  opacity,
  cursor,
  pointerEvents,
  userSelect,
  // Grouped exports
  effects,
  effectsArb, // Legacy alias
} from "./effects";

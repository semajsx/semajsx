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

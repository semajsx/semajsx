/**
 * @semajsx/style - Modular styling system for SemaJSX
 *
 * A tree-shakeable CSS system that treats styles as JavaScript modules,
 * enabling fine-grained dead code elimination while maintaining native CSS syntax.
 *
 * @example
 * ```ts
 * // button.style.ts
 * import { classes, rule, rules } from "@semajsx/style";
 *
 * const c = classes(["root", "icon", "label"]);
 *
 * export const root = rule`${c.root} {
 *   display: inline-flex;
 *   padding: 8px 16px;
 * }`;
 *
 * export const icon = rule`${c.icon} {
 *   width: 18px;
 *   height: 18px;
 * }`;
 *
 * export const states = rules(
 *   rule`${c.root}:hover { background: blue; }`,
 *   rule`${c.root}:disabled { opacity: 0.5; }`,
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Button.tsx
 * import * as button from "./button.style";
 *
 * <button class={[button.root, button.states]}>
 *   <span class={button.icon}>{icon}</span>
 *   Click me
 * </button>
 * ```
 */

// Core APIs
export { classes, isClassRef } from "./classes";
export { rule, rules, isStyleToken } from "./rule";
export { inject, injectStyles, preload } from "./inject";
export { StyleRegistry, createRegistry, createCx } from "./registry";
export { hashString, uniqueId } from "./hash";

// Types
export type {
  ClassRef,
  ClassRefs,
  SignalBindingDef,
  StyleToken,
  InjectOptions,
  RegistryOptions,
} from "./types";

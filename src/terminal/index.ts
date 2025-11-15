/**
 * Terminal rendering for SemaJSX
 *
 * This module provides terminal/CLI rendering capabilities similar to Ink.
 * It uses Yoga for flexbox layout and renders to stdout/stderr.
 */

export { TerminalRenderer } from "./renderer";
export { render } from "./render";
export type { RenderResult, RenderOptions } from "./render";
export type {
  TerminalNode,
  TerminalElement,
  TerminalText,
  TerminalStyle,
} from "./types";
export * from "./operations";
export * from "./properties";
export * from "./components";

// Re-export helpers for convenience
export { when, resource, stream } from "../runtime/helpers";

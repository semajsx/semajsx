/**
 * Terminal rendering for SemaJSX
 *
 * This module provides terminal/CLI rendering capabilities similar to Ink.
 * It uses Yoga for flexbox layout and renders to stdout/stderr.
 */

export { TerminalRenderer } from './renderer';
export { render } from './render';
export type { TerminalNode, TerminalElement, TerminalText, TerminalStyle } from './types';
export * from './operations';
export * from './properties';

// Re-export helpers for convenience
export { when } from '../runtime/helpers';

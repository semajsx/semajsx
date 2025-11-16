/**
 * Terminal components for rendering different element types
 *
 * This module provides specialized rendering functions for different
 * terminal elements like boxes, text, etc.
 */

export { renderBorder, renderBackground } from "./box";
export { renderTextNode, renderTextElement } from "./text";
export { ExitHint } from "./ExitHint";
export type { ExitHintProps } from "./ExitHint";

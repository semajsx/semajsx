import type { LayoutOptions, Size } from "../types";

/**
 * Estimate text dimensions using average character metrics.
 * Shared by all layout engines. Override via `options.measureText`
 * for real DOM/canvas measurement.
 */
export function estimateTextSize(text: string, fontSize: number): Size {
  const avgCharWidth = fontSize * 0.6;
  return {
    width: text.length * avgCharWidth,
    height: fontSize * 1.4,
  };
}

/** Measure a node label (default 14px). */
export function measureNode(label: string, opts: LayoutOptions): Size {
  const measure = opts.measureText ?? estimateTextSize;
  const textSize = measure(label, 14);
  return {
    width: Math.max(textSize.width + opts.nodePadding * 2, opts.nodeWidth),
    height: Math.max(textSize.height + opts.nodePadding * 2, opts.nodeHeight),
  };
}

/** Measure an edge / message label (default 12px). */
export function measureLabel(text: string, opts: LayoutOptions): Size {
  const measure = opts.measureText ?? estimateTextSize;
  return measure(text, 12);
}

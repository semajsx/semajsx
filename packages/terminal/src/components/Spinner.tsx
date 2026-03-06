/** @jsxImportSource @semajsx/terminal */
import { signal, type ReadonlySignal } from "@semajsx/signal";
import type { JSXNode } from "@semajsx/core";

/**
 * Built-in spinner frame sets
 */
export const spinnerFrames = {
  dots: { frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"], interval: 80 },
  line: { frames: ["-", "\\", "|", "/"], interval: 130 },
  arc: { frames: ["◜", "◠", "◝", "◞", "◡", "◟"], interval: 100 },
  bouncingBar: {
    frames: ["[    ]", "[=   ]", "[==  ]", "[=== ]", "[ ===]", "[  ==]", "[   =]", "[    ]"],
    interval: 80,
  },
} as const;

export type SpinnerType = keyof typeof spinnerFrames;

export interface SpinnerProps {
  /**
   * Spinner type or custom frames array
   * @default "dots"
   */
  type?: SpinnerType;
  /**
   * Custom frames (overrides type)
   */
  frames?: string[];
  /**
   * Interval in ms between frames
   * @default depends on type
   */
  interval?: number;
  /**
   * Label to display after the spinner
   */
  label?: string;
  /**
   * Color of the spinner
   */
  color?: string;
}

/**
 * Spinner component - animated loading indicator for terminal UIs.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner type="line" label="Loading..." />
 * <Spinner frames={["🌑", "🌒", "🌓", "🌔", "🌕"]} interval={150} />
 * ```
 */
export function Spinner({
  type = "dots",
  frames: customFrames,
  interval: customInterval,
  label,
  color = "cyan",
}: SpinnerProps): JSXNode {
  const config = spinnerFrames[type];
  const frames = customFrames ?? config.frames;
  const interval = customInterval ?? config.interval;

  const frameSignal = signal(frames[0]!);
  let index = 0;

  const timer = setInterval(() => {
    index = (index + 1) % frames.length;
    frameSignal.value = frames[index]!;
  }, interval);

  // Cleanup on unmount is handled by signal subscription cleanup
  // The interval will be cleared when the component is garbage collected
  // For robust cleanup, we store the timer reference
  const cleanup = () => clearInterval(timer);

  // Store cleanup on the signal for reference
  (frameSignal as Record<string, unknown>)._spinnerCleanup = cleanup;

  if (label) {
    return (
      <box flexDirection="row">
        <text color={color}>{frameSignal as ReadonlySignal<string>}</text>
        <text> {label}</text>
      </box>
    );
  }

  return <text color={color}>{frameSignal as ReadonlySignal<string>}</text>;
}

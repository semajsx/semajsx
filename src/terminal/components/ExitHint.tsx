/** @jsxImportSource semajsx */
import { signal, type WritableSignal } from "@/signal";

/**
 * Global exiting signal for terminal rendering
 * Set to true during unmount to hide exit hints in final render
 */
const globalExitingSignal = signal(false);

/**
 * Get the global exiting signal
 * Used internally by render() to coordinate with ExitHint component
 */
export function getExitingSignal(): WritableSignal<boolean> {
  return globalExitingSignal;
}

/**
 * Reset the exiting signal (useful for testing or multiple render cycles)
 */
export function resetExitingSignal(): void {
  globalExitingSignal.value = false;
}

export interface ExitHintProps {
  /**
   * Content to show during normal rendering, hidden during exit
   */
  children?: any;
}

/**
 * ExitHint component - hides its children during the final render before exit
 *
 * This is useful for hiding "Press Ctrl+C to exit" messages in the final
 * terminal output, keeping only the actual content visible.
 *
 * The component automatically detects when unmount() is called and returns
 * null for its children during the final render.
 *
 * @example
 * ```tsx
 * render(
 *   <box flexDirection="column" padding={1}>
 *     <text bold>Counter: {count}</text>
 *
 *     <ExitHint>
 *       <text dim marginTop={1} color="yellow">
 *         Press Ctrl+C or ESC to exit
 *       </text>
 *     </ExitHint>
 *   </box>
 * );
 * ```
 *
 * Result after exit:
 * - The counter remains visible
 * - The exit hint is hidden from final output
 */
export function ExitHint({ children }: ExitHintProps) {
  // During exit, hide the children
  if (globalExitingSignal.value) {
    return null;
  }

  // During normal rendering, return children directly (like React)
  // Now that children prop is normalized in renderComponent, we can return it directly
  return children;
}

/** @jsxImportSource semajsx */
import { signal, computed, type WritableSignal, type Signal } from "@/signal";
import { when } from "@/runtime/helpers";
import { Fragment } from "@/runtime/types";
import type { VNode } from "@/runtime/types";

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
   * After normalization: single VNode, array of VNodes, or undefined
   */
  children?: VNode | VNode[];
}

/**
 * ExitHint component - hides its children during the final render before exit
 *
 * This is useful for hiding "Press Ctrl+C to exit" messages in the final
 * terminal output, keeping only the actual content visible.
 *
 * The component automatically detects when unmount() is called and reactively
 * hides its children during the final render using signal-based reactivity.
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
export function ExitHint({ children }: ExitHintProps): Signal<VNode | null> {
  // Create inverted signal: show when NOT exiting
  const shouldShow = computed(globalExitingSignal, (isExiting) => !isExiting);

  // Wrap children as a single VNode
  const content: VNode = Array.isArray(children)
    ? { type: Fragment, props: null, children }
    : children || { type: Fragment, props: null, children: [] };

  // Return signal directly - renderComponent now handles Signal<VNode>
  return when(shouldShow, content);
}

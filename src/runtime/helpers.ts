import type { VNode } from './types';
import type { Signal } from '../signal';
import { computed } from '../signal';
import { isVNode } from './vnode';

/**
 * Conditional rendering helper
 *
 * Renders content when condition signal is true, nothing when false.
 *
 * @example
 * // With VNode
 * const hint = when(showHint, <text>Press Ctrl+C to exit</text>);
 *
 * @example
 * // With function (lazy evaluation)
 * const hint = when(showHint, () => <text>Press Ctrl+C to exit</text>);
 */
export function when(
  condition: Signal<boolean>,
  content: VNode | (() => VNode)
): Signal<VNode | null> {
  return computed([condition], show => {
    if (!show) return null;
    // Check if content is a VNode (not a function)
    // This handles the case where VNode.type is a function (component)
    return isVNode(content) ? content : content();
  });
}

import type { VNode } from "./types";
import type { Signal } from "../signal";
import { signal, computed } from "../signal";
import { isVNode } from "./vnode";

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
  content: VNode | (() => VNode),
): Signal<VNode | null> {
  return computed([condition], (show) => {
    if (!show) return null;
    // Check if content is a VNode (not a function)
    // This handles the case where VNode.type is a function (component)
    return isVNode(content) ? content : content();
  });
}

/**
 * Async resource helper for Promise<VNode>
 *
 * Renders pending content (or null) while the promise is pending, then renders
 * the resolved VNode. Handle errors in the promise itself using .catch().
 *
 * @example
 * // Handle everything in the promise
 * const content = resource(
 *   fetchData()
 *     .then(data => <text>{data}</text>)
 *     .catch(err => <text color="red">Error: {err.message}</text>)
 * );
 *
 * @example
 * // With optional pending content
 * const content = resource(
 *   fetchData().then(data => <text>{data}</text>),
 *   <text>Loading...</text>
 * );
 */
export function resource(
  promise: Promise<VNode>,
  pending?: VNode,
): Signal<VNode | null> {
  const content = signal<VNode | null>(pending || null);

  promise
    .then((result) => {
      content.value = result;
    })
    .catch((err) => {
      console.error("Unhandled promise rejection in resource():", err);
    });

  return content;
}

/**
 * Async stream helper for AsyncIterable<VNode>
 *
 * Renders each yielded VNode from the async iterator, replacing the previous
 * content with each new value.
 *
 * @example
 * async function* generateContent() {
 *   yield <text>Loading...</text>;
 *   const data = await fetchData();
 *   yield <text>Data: {data}</text>;
 * }
 *
 * const content = stream(generateContent());
 */
export function stream(
  iterator: AsyncIterable<VNode>,
  pending?: VNode,
): Signal<VNode | null> {
  const content = signal<VNode | null>(pending || null);

  (async () => {
    try {
      for await (const vnode of iterator) {
        content.value = vnode;
      }
    } catch (err) {
      console.error("Error in stream():", err);
    }
  })();

  return content;
}

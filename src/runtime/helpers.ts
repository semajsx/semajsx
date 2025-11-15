import type { VNode } from './types';
import type { Signal } from '../signal';
import { signal, computed } from '../signal';
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

/**
 * Async resource helper for Promise<VNode>
 *
 * Renders a fallback while the promise is pending, then renders the resolved
 * VNode. If the promise rejects, renders the error handler result.
 *
 * @example
 * const content = resource(
 *   fetchData(),
 *   <text>Loading...</text>,
 *   (err) => <text color="red">Error: {err.message}</text>
 * );
 */
export function resource<T extends VNode = VNode>(
  promise: Promise<T>,
  fallback: VNode,
  errorHandler?: (error: Error) => VNode
): Signal<VNode> {
  const content = signal<VNode>(fallback);

  promise
    .then(result => {
      content.value = result;
    })
    .catch(err => {
      if (errorHandler) {
        content.value = errorHandler(err);
      } else {
        console.error('Unhandled promise error in resource():', err);
      }
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
  fallback?: VNode
): Signal<VNode | null> {
  const content = signal<VNode | null>(fallback || null);

  (async () => {
    try {
      for await (const vnode of iterator) {
        content.value = vnode;
      }
    } catch (err) {
      console.error('Error in stream():', err);
    }
  })();

  return content;
}

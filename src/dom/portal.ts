import type { VNode, JSXNode } from "../runtime/types";
import { Portal } from "../runtime/types";
import { h } from "../runtime/vnode";

/**
 * Portal props interface
 */
export interface PortalProps {
  children: JSXNode;
  container: Element;
}

/**
 * Create a portal VNode that renders children into a different DOM container
 *
 * @param children - The children to render
 * @param container - The target DOM container element
 * @returns A portal VNode
 *
 * @example
 * ```tsx
 * const Modal = () => {
 *   return createPortal(
 *     <div class="modal">Modal content</div>,
 *     document.body
 *   );
 * };
 * ```
 */
export function createPortal(
  children: JSXNode,
  container: Element,
): VNode {
  // Use h() to create Portal VNode with proper normalization
  return h(Portal as any, { container }, children);
}

/**
 * Portal component (alternative to createPortal function)
 *
 * @example
 * ```tsx
 * <Portal container={document.body}>
 *   <div class="modal">Modal content</div>
 * </Portal>
 * ```
 */
export function PortalComponent(props: PortalProps): VNode {
  return createPortal(props.children, props.container);
}

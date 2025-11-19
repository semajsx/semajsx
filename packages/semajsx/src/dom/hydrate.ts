/**
 * DOM hydration - attach interactivity to server-rendered HTML
 * This preserves the existing DOM and only adds event listeners and reactivity
 */

import type { VNode } from "../runtime/types";
import { Fragment } from "../runtime/types";
import { setProperty } from "./properties";
import { isSignal } from "@semajsx/signal/utils";

/**
 * Hydrate a server-rendered DOM tree with client-side interactivity
 * Unlike render(), this preserves existing DOM and only attaches event listeners
 *
 * @param vnode - The VNode to hydrate
 * @param container - The DOM container with server-rendered content
 * @returns The hydrated root node
 *
 * @example
 * ```tsx
 * const vnode = <Counter initial={5} />
 * const container = document.querySelector('[data-island-id="island-0"]')
 * hydrate(vnode, container)
 * ```
 */
export function hydrate(vnode: VNode, container: Element): Node | null {
  // Get the first child of the container (the server-rendered content)
  const existingNode = container.firstChild;

  if (!existingNode) {
    console.warn("[Hydrate] No existing content to hydrate");
    return null;
  }

  // Hydrate the VNode tree onto the existing DOM
  try {
    hydrateNode(vnode, existingNode, container);
    return existingNode;
  } catch (error) {
    console.error("[Hydrate] Error during hydration:", error);
    // Fall back to client-side rendering if hydration fails
    console.warn("[Hydrate] Falling back to client-side rendering");
    container.innerHTML = "";
    return renderNode(vnode, container);
  }
}

/**
 * Hydrate a VNode onto an existing DOM node
 */
function hydrateNode(
  vnode: VNode | any,
  domNode: Node,
  parentElement: Element,
): void {
  // Handle null/undefined
  if (vnode == null) {
    return;
  }

  // Handle signals - unwrap and subscribe
  if (isSignal(vnode)) {
    // For signal VNodes, we need to hydrate the current value
    // and set up reactivity to update when signal changes
    hydrateSignalNode(vnode, domNode, parentElement);
    return;
  }

  // Handle primitives (text nodes)
  if (typeof vnode === "string" || typeof vnode === "number") {
    if (domNode.nodeType === Node.TEXT_NODE) {
      // Text node already exists, verify content matches
      const expectedText = String(vnode);
      if (domNode.textContent !== expectedText) {
        console.warn(
          "[Hydrate] Text mismatch, updating:",
          domNode.textContent,
          "->",
          expectedText,
        );
        domNode.textContent = expectedText;
      }
    }
    return;
  }

  // Handle arrays
  if (Array.isArray(vnode)) {
    let currentDomNode: Node | null = domNode;
    for (const child of vnode) {
      if (currentDomNode) {
        hydrateNode(child, currentDomNode, parentElement);
        currentDomNode = currentDomNode.nextSibling;
      }
    }
    return;
  }

  // Must be a VNode object
  if (typeof vnode !== "object" || !("type" in vnode)) {
    return;
  }

  const vnodeTyped = vnode as VNode;

  // Handle signal nodes - special reactive nodes
  if (vnodeTyped.type === "#signal") {
    const signal = vnodeTyped.props?.signal;
    if (signal && isSignal(signal)) {
      hydrateSignalNode(signal, domNode, parentElement);
    }
    return;
  }

  // Handle fragments
  if (vnodeTyped.type === Fragment) {
    let currentDomNode: Node | null = domNode;
    for (const child of vnodeTyped.children) {
      if (currentDomNode) {
        hydrateNode(child, currentDomNode, parentElement);
        currentDomNode = currentDomNode.nextSibling;
      }
    }
    return;
  }

  // Handle function components - render and hydrate result
  if (typeof vnodeTyped.type === "function") {
    const result = vnodeTyped.type(vnodeTyped.props || {});
    hydrateNode(result, domNode, parentElement);
    return;
  }

  // Handle DOM elements
  if (typeof vnodeTyped.type === "string") {
    // Skip validation for text nodes - they can legitimately be text in the DOM
    // This happens when signal values or other dynamic content renders as text
    if (domNode.nodeType === Node.TEXT_NODE) {
      // Text node in place of element - possible mismatch, but might be intentional
      // Skip hydration for this node
      return;
    }

    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      console.warn("[Hydrate] Expected element, got:", domNode.nodeType);
      return;
    }

    const element = domNode as Element;

    // Verify tag matches
    if (element.tagName.toLowerCase() !== vnodeTyped.type.toLowerCase()) {
      console.warn(
        "[Hydrate] Tag mismatch:",
        element.tagName,
        "vs",
        vnodeTyped.type,
      );
      return;
    }

    // Hydrate properties (especially event listeners and reactive props)
    hydrateProperties(element, vnodeTyped.props || {});

    // Hydrate children
    hydrateChildren(element, vnodeTyped.children);
    return;
  }
}

/**
 * Hydrate properties onto an element
 * This is where we attach event listeners and set up reactive properties
 */
function hydrateProperties(element: Element, props: Record<string, any>): void {
  for (const [key, value] of Object.entries(props)) {
    // Skip special props
    if (key === "children" || key === "key" || key === "ref") {
      continue;
    }

    // Handle event listeners - these need to be attached
    if (key.startsWith("on")) {
      const eventName = key.slice(2).toLowerCase();
      if (typeof value === "function") {
        element.addEventListener(eventName, value as EventListener);
      }
      continue;
    }

    // Handle reactive properties (signals)
    if (isSignal(value)) {
      // Set initial value
      setProperty(element, key, value.value);

      // Set up reactivity using subscribe
      value.subscribe((newValue: any) => {
        setProperty(element, key, newValue);
      });
      continue;
    }

    // For static properties, they should already be set by SSR
    // We can optionally verify them, but usually we trust SSR output
    // to avoid unnecessary DOM operations
  }

  // Handle refs
  if (props.ref) {
    if (typeof props.ref === "function") {
      props.ref(element);
    } else if (typeof props.ref === "object" && props.ref !== null) {
      props.ref.current = element;
    }
  }
}

/**
 * Hydrate children elements
 */
function hydrateChildren(element: Element, children: any[]): void {
  let currentDomNode = element.firstChild;

  for (const child of children) {
    if (!currentDomNode) {
      // Mismatch: VNode has more children than DOM
      // Fall back to appending new nodes
      console.warn("[Hydrate] Missing DOM node for child, appending");
      const newNode = renderNode(child, element);
      if (newNode) {
        element.appendChild(newNode);
      }
      continue;
    }

    hydrateNode(child, currentDomNode, element);
    currentDomNode = currentDomNode.nextSibling;
  }

  // If DOM has extra nodes, we could warn or remove them
  // For now, we leave them (progressive enhancement)
}

/**
 * Hydrate a signal VNode
 * Set up reactivity to replace content when signal changes
 */
function hydrateSignalNode(
  signal: any,
  domNode: Node,
  parentElement: Element,
): void {
  // Get current signal value
  const currentValue = signal.value;

  // Handle empty/null signal values - server renders as <!--signal-empty--> comment
  if (
    currentValue == null ||
    currentValue === false ||
    (Array.isArray(currentValue) && currentValue.length === 0)
  ) {
    // Expect a comment node marker
    if (domNode.nodeType === Node.COMMENT_NODE) {
      // Comment marker is correct, nothing to validate
    } else {
      console.warn(
        "[Hydrate] Expected comment marker for empty signal, got:",
        domNode.nodeType,
      );
    }
  } // For simple values (string, number), the server renders them as text nodes
  else if (
    typeof currentValue === "string" ||
    typeof currentValue === "number"
  ) {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const expectedText = String(currentValue);
      if (domNode.textContent !== expectedText) {
        console.warn(
          "[Hydrate] Signal text mismatch:",
          domNode.textContent,
          "->",
          expectedText,
        );
        domNode.textContent = expectedText;
      }
    }
  } else {
    // For complex values (VNodes, etc.), do full hydration
    hydrateNode(currentValue, domNode, parentElement);
  }

  // Set up reactivity to handle signal changes
  // Use an anchor comment node to track position in DOM
  // This is necessary because arrays render as DocumentFragments which can't be tracked
  let anchor: Comment;
  let currentNodes: Node[] = [];

  if (domNode.nodeType === Node.COMMENT_NODE) {
    // Already a comment (empty signal), use as anchor
    anchor = domNode as Comment;
  } else {
    // Create anchor and insert it before current node
    anchor = document.createComment("signal-anchor");
    if (domNode.parentNode) {
      domNode.parentNode.insertBefore(anchor, domNode);
    }
    currentNodes = [domNode];
  }

  signal.subscribe((newValue: any) => {
    const parent = anchor.parentNode;
    if (!parent) {
      return;
    }

    // Remove old nodes
    for (const node of currentNodes) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    currentNodes = [];

    // Render and insert new content after anchor
    const newNode = renderNode(newValue, parentElement);
    if (newNode) {
      if (newNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        // Fragment: insert all children after anchor in correct order
        const fragment = newNode as DocumentFragment;
        const children = Array.from(fragment.childNodes);

        // Insert in order by tracking the last inserted node
        let insertAfter: Node | null = anchor;
        for (const child of children) {
          parent.insertBefore(child, insertAfter.nextSibling);
          insertAfter = child;
          currentNodes.push(child);
        }
      } else {
        // Single node: insert after anchor
        parent.insertBefore(newNode, anchor.nextSibling);
        currentNodes = [newNode];
      }
    }
  });
}

/**
 * Render a VNode to a DOM node (fallback when hydration fails)
 * This is a simplified version of render() just for hydration fallback
 */
function renderNode(vnode: any, parentElement: Element): Node | null {
  if (vnode == null || vnode === false || vnode === true) {
    return document.createComment("empty");
  }

  if (isSignal(vnode)) {
    return renderNode(vnode.value, parentElement);
  }

  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }

  if (Array.isArray(vnode)) {
    // Empty array should render as a comment marker
    if (vnode.length === 0) {
      return document.createComment("empty");
    }

    const fragment = document.createDocumentFragment();
    for (const child of vnode) {
      const node = renderNode(child, parentElement);
      if (node) {
        fragment.appendChild(node);
      }
    }
    return fragment;
  }

  if (typeof vnode === "object" && "type" in vnode) {
    const vnodeTyped = vnode as VNode;

    // Handle special VNode types
    if (vnodeTyped.type === "#text") {
      return document.createTextNode(String(vnodeTyped.props?.nodeValue || ""));
    }

    if (vnodeTyped.type === "#signal") {
      const signal = vnodeTyped.props?.signal;
      if (signal && isSignal(signal)) {
        return renderNode(signal.value, parentElement);
      }
      return document.createTextNode("");
    }

    if (vnodeTyped.type === Fragment) {
      const fragment = document.createDocumentFragment();
      for (const child of vnodeTyped.children) {
        const node = renderNode(child, parentElement);
        if (node) {
          fragment.appendChild(node);
        }
      }
      return fragment;
    }

    if (typeof vnodeTyped.type === "function") {
      const result = vnodeTyped.type(vnodeTyped.props || {});
      return renderNode(result, parentElement);
    }

    if (typeof vnodeTyped.type === "string") {
      const element = document.createElement(vnodeTyped.type);

      // Set properties
      const props = vnodeTyped.props || {};
      for (const [key, value] of Object.entries(props)) {
        if (key === "children" || key === "key") continue;
        setProperty(element, key, value);
      }

      // Render children
      for (const child of vnodeTyped.children) {
        const childNode = renderNode(child, element);
        if (childNode) {
          element.appendChild(childNode);
        }
      }

      return element;
    }
  }

  return null;
}

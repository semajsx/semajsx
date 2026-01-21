/**
 * CSS injection utilities for @semajsx/style
 */

import { isStyleToken } from "./rule";
import type { InjectOptions, StyleToken } from "./types";

/**
 * Track injected styles per target to prevent duplicates
 */
const injectedStyles = new WeakMap<Element | ShadowRoot | Document, Set<string>>();

/**
 * Get or create the set of injected class names for a target
 */
function getInjectedSet(target: Element | ShadowRoot | Document): Set<string> {
  let set = injectedStyles.get(target);
  if (!set) {
    set = new Set();
    injectedStyles.set(target, set);
  }
  return set;
}

/**
 * Inject CSS into a target element
 *
 * @param css - The CSS string to inject
 * @param target - The target element (defaults to document.head)
 * @returns The created style element
 */
export function injectStyles(css: string, target?: Element | ShadowRoot): HTMLStyleElement {
  const styleElement = document.createElement("style");
  styleElement.textContent = css;

  const actualTarget = target ?? document.head;
  actualTarget.appendChild(styleElement);

  return styleElement;
}

/**
 * Inject a StyleToken into the DOM
 *
 * Handles deduplication - if the same className has been injected to the
 * same target, it won't be injected again.
 *
 * Note: This function only handles CSS injection. Signal bindings must be
 * set up separately by StyleAnchor or similar.
 *
 * @param token - StyleToken to inject
 * @param options - Injection options (target)
 */
function injectToken(token: StyleToken, target: Element | ShadowRoot | Document): void {
  const injected = getInjectedSet(target);

  // Deduplicate by className if available, otherwise by CSS content hash
  const key = token._ ?? token.__cssTemplate;

  if (!injected.has(key)) {
    // Replace signal placeholders with var() references for static injection
    let css = token.__cssTemplate;
    if (token.__bindingDefs) {
      for (const def of token.__bindingDefs) {
        // Use a default variable name for static injection
        css = css.replace(`{{${def.index}}}`, `var(--style-${def.index})`);
      }
    }

    injectStyles(css, target === document ? document.head : (target as Element | ShadowRoot));
    injected.add(key);
  }
}

/**
 * Manually inject CSS into the DOM
 *
 * Supports single token, array of tokens, or object containing tokens.
 * Returns a cleanup function to remove the injected styles.
 *
 * @example
 * ```ts
 * // Single token
 * inject(button.root);
 *
 * // Array of tokens
 * inject([button.root, button.icon, button.rootIcon]);
 *
 * // Object - extracts all StyleTokens
 * inject(button);
 *
 * // With target
 * inject(button, { target: shadowRoot });
 *
 * // Cleanup
 * const cleanup = inject(button);
 * cleanup();
 * ```
 */
export function inject(
  tokens: StyleToken | StyleToken[] | Record<string, StyleToken>,
  options?: InjectOptions,
): () => void {
  const target = options?.target ?? document.head;
  const styleElements: HTMLStyleElement[] = [];

  // Normalize input to array of tokens
  let tokenArray: StyleToken[];

  if (isStyleToken(tokens)) {
    tokenArray = [tokens];
  } else if (Array.isArray(tokens)) {
    tokenArray = tokens;
  } else {
    // Object: extract all StyleToken values
    tokenArray = Object.values(tokens).filter(isStyleToken);
  }

  // Inject each token
  for (const token of tokenArray) {
    injectToken(token, target);
  }

  // Return cleanup function
  return () => {
    for (const el of styleElements) {
      el.remove();
    }
  };
}

/**
 * Preload styles for better performance
 *
 * Use this at app startup or route entry to batch inject all styles
 * that will be needed, avoiding multiple DOM writes during rendering.
 *
 * @example
 * ```ts
 * // At app startup
 * preload(button, card, input);
 *
 * // At route entry
 * function ProductPage() {
 *   preload(productCard, pricing, gallery);
 *   return <div>...</div>;
 * }
 * ```
 */
export function preload(
  ...styles: (StyleToken | StyleToken[] | Record<string, StyleToken>)[]
): void {
  for (const style of styles) {
    inject(style);
  }
}

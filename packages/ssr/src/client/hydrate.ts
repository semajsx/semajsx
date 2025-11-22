/**
 * Client-side island hydration
 * This module runs in the browser and hydrates server-rendered island placeholders
 */

/**
 * Island info collected from the DOM
 */
interface IslandInfo {
  id: string;
  props: Record<string, any>;
  /** Element with data-island-id (single element islands) */
  element?: HTMLElement;
  /** Start comment node (fragment islands) */
  startComment?: Comment;
  /** End comment node (fragment islands) */
  endComment?: Comment;
}

/**
 * Find all islands on the page (both element and fragment types)
 */
function findAllIslands(): IslandInfo[] {
  const islands: IslandInfo[] = [];

  // Find element-based islands (single root element)
  const elements = document.querySelectorAll("[data-island-id]");
  for (const el of elements) {
    const id = el.getAttribute("data-island-id");
    const propsStr = el.getAttribute("data-island-props");
    if (id) {
      islands.push({
        id,
        props: propsStr ? JSON.parse(propsStr) : {},
        element: el as HTMLElement,
      });
    }
  }

  // Find fragment-based islands (comment markers + script)
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_COMMENT,
  );

  let comment: Comment | null;
  while ((comment = walker.nextNode() as Comment | null)) {
    const match = comment.textContent?.match(/^island:(.+)$/);
    if (match && match[1]) {
      const id = match[1];
      // Find end comment (matches /island:${id})
      let endComment: Comment | null = null;
      let sibling = comment.nextSibling;
      while (sibling) {
        if (
          sibling.nodeType === Node.COMMENT_NODE &&
          sibling.textContent === `/island:${id}`
        ) {
          endComment = sibling as Comment;
          break;
        }
        sibling = sibling.nextSibling;
      }

      // Find props from script tag
      const script = document.querySelector(
        `script[type="application/json"][data-island="${id}"]`,
      );
      const props = script ? JSON.parse(script.textContent || "{}") : {};

      islands.push({
        id,
        props,
        startComment: comment,
        endComment: endComment || undefined,
      });
    }
  }

  return islands;
}

/**
 * Hydrate all islands on the page
 * This function is typically called once after the page loads
 *
 * @example
 * ```tsx
 * // In your client entry point
 * import { hydrateIslands } from '@semajsx/dom'
 *
 * // Wait for DOM to be ready
 * if (document.readyState === 'loading') {
 *   document.addEventListener('DOMContentLoaded', hydrateIslands)
 * } else {
 *   hydrateIslands()
 * }
 * ```
 */
export async function hydrateIslands(): Promise<void> {
  const islands = findAllIslands();

  if (islands.length === 0) {
    return;
  }

  console.log(`[SemaJSX] Found ${islands.length} islands to hydrate`);

  // Hydrate islands in parallel for better performance
  const hydrations = islands.map((island) => waitForIslandScript(island));

  await Promise.all(hydrations);

  console.log(`[SemaJSX] All islands hydrated`);
}

/**
 * Wait for an island's script to load and hydrate it
 * The actual hydration is performed by the island's entry point script
 * This function just waits for it to complete
 */
async function waitForIslandScript(island: IslandInfo): Promise<void> {
  const { id: islandId, element, startComment } = island;

  // Check if island is already hydrated
  if (element?.hasAttribute("data-hydrated")) {
    return;
  }
  if (
    startComment?.parentElement?.querySelector(
      `[data-island-hydrated="${islandId}"]`,
    )
  ) {
    return;
  }

  // Wait for hydration to complete (set by island entry point)
  return new Promise((resolve) => {
    // Check every 50ms for up to 10 seconds
    const maxAttempts = 200;
    let attempts = 0;

    const checkInterval = setInterval(() => {
      const isHydrated = element
        ? element.hasAttribute("data-hydrated")
        : document.querySelector(`[data-island-hydrated="${islandId}"]`) !==
          null;

      if (isHydrated) {
        clearInterval(checkInterval);
        resolve();
      } else if (++attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn(`[SemaJSX] Island ${islandId} hydration timeout`);
        resolve();
      }
    }, 50);
  });
}

/**
 * Get island info by ID
 */
export function getIslandInfo(islandId: string): IslandInfo | null {
  // Try element-based first
  const element = document.querySelector(
    `[data-island-id="${islandId}"]`,
  ) as HTMLElement | null;

  if (element) {
    const propsStr = element.getAttribute("data-island-props");
    return {
      id: islandId,
      props: propsStr ? JSON.parse(propsStr) : {},
      element,
    };
  }

  // Try fragment-based
  const script = document.querySelector(
    `script[type="application/json"][data-island="${islandId}"]`,
  );

  if (script) {
    const props = JSON.parse(script.textContent || "{}");
    // Find start comment
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
    );
    let comment: Comment | null;
    while ((comment = walker.nextNode() as Comment | null)) {
      if (comment.textContent === `island:${islandId}`) {
        return {
          id: islandId,
          props,
          startComment: comment,
        };
      }
    }
  }

  return null;
}

/**
 * Manual hydration for a specific island
 * Useful for lazy-loading islands on interaction
 *
 * @param islandId - The island ID to hydrate
 *
 * @example
 * ```tsx
 * // Lazy load an island on click
 * button.addEventListener('click', () => {
 *   hydrateIslandById('island-0')
 * })
 * ```
 */
export async function hydrateIslandById(islandId: string): Promise<void> {
  const island = getIslandInfo(islandId);

  if (!island) {
    console.error(`[SemaJSX] Island not found: ${islandId}`);
    return;
  }

  await waitForIslandScript(island);
}

/**
 * Check if islands are present on the page
 */
export function hasIslands(): boolean {
  // Check for element-based islands
  if (document.querySelectorAll("[data-island-id]").length > 0) {
    return true;
  }
  // Check for fragment-based islands
  return (
    document.querySelectorAll('script[type="application/json"][data-island]')
      .length > 0
  );
}

/**
 * Get all island IDs on the page
 */
export function getIslandIds(): string[] {
  const ids: string[] = [];

  // Element-based islands
  const elements = document.querySelectorAll("[data-island-id]");
  for (const el of elements) {
    const id = el.getAttribute("data-island-id");
    if (id) ids.push(id);
  }

  // Fragment-based islands
  const scripts = document.querySelectorAll(
    'script[type="application/json"][data-island]',
  );
  for (const script of scripts) {
    const id = script.getAttribute("data-island");
    if (id) ids.push(id);
  }

  return ids;
}

/**
 * Mark an island as hydrated
 * This should be called by the island entry point after hydration completes
 */
export function markIslandHydrated(islandId: string): void {
  // Try element-based first
  const element = document.querySelector(`[data-island-id="${islandId}"]`);
  if (element) {
    element.setAttribute("data-hydrated", "true");
    return;
  }

  // For fragment-based, remove the script tag (no longer needed)
  const script = document.querySelector(
    `script[type="application/json"][data-island="${islandId}"]`,
  );
  if (script) {
    // Mark as hydrated before removal (for any watchers)
    script.setAttribute("data-island-hydrated", islandId);
    // Remove script - props already parsed, no longer needed
    script.remove();
  }
}

// Export types
export type { IslandInfo };

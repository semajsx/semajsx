/**
 * Client-side island hydration
 * This module runs in the browser and hydrates server-rendered island placeholders
 */

/**
 * Hydrate all islands on the page
 * This function is typically called once after the page loads
 *
 * @example
 * ```tsx
 * // In your client entry point
 * import { hydrateIslands } from 'semajsx/client'
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
  // Find all island placeholders
  const placeholders = document.querySelectorAll("[data-island-id]");

  if (placeholders.length === 0) {
    return;
  }

  console.log(`[SemaJSX] Hydrating ${placeholders.length} islands...`);

  // Hydrate islands in parallel
  const hydrations = Array.from(placeholders).map((placeholder) =>
    hydrateIsland(placeholder as HTMLElement),
  );

  await Promise.all(hydrations);

  console.log(`[SemaJSX] All islands hydrated`);
}

/**
 * Hydrate a single island
 */
async function hydrateIsland(placeholder: HTMLElement): Promise<void> {
  const islandId = placeholder.getAttribute("data-island-id");
  const islandPath = placeholder.getAttribute("data-island-path");

  if (!islandId) {
    console.error("[SemaJSX] Island placeholder missing data-island-id");
    return;
  }

  if (!islandPath) {
    console.error(
      `[SemaJSX] Island placeholder missing data-island-path: ${islandId}`,
    );
    return;
  }

  try {
    // The island code will be loaded via script tag
    // It will handle its own hydration
    // This function is just here for potential eager hydration

    console.log(
      `[SemaJSX] Island ${islandId} will be hydrated by its script`,
    );
  } catch (error) {
    console.error(`[SemaJSX] Error hydrating island ${islandId}:`, error);
  }
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
  const placeholder = document.querySelector(
    `[data-island-id="${islandId}"]`,
  ) as HTMLElement;

  if (!placeholder) {
    console.error(`[SemaJSX] Island not found: ${islandId}`);
    return;
  }

  await hydrateIsland(placeholder);
}

/**
 * Check if islands are present on the page
 */
export function hasIslands(): boolean {
  return document.querySelectorAll("[data-island-id]").length > 0;
}

/**
 * Get all island IDs on the page
 */
export function getIslandIds(): string[] {
  const placeholders = document.querySelectorAll("[data-island-id]");
  return Array.from(placeholders)
    .map((el) => el.getAttribute("data-island-id"))
    .filter((id): id is string => id !== null);
}

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

  console.log(`[SemaJSX] Found ${placeholders.length} islands to hydrate`);

  // Hydrate islands in parallel for better performance
  const hydrations = Array.from(placeholders).map((placeholder) =>
    waitForIslandScript(placeholder as HTMLElement),
  );

  await Promise.all(hydrations);

  console.log(`[SemaJSX] All islands hydrated`);
}

/**
 * Wait for an island's script to load and hydrate it
 * The actual hydration is performed by the island's entry point script
 * This function just waits for it to complete
 */
async function waitForIslandScript(placeholder: HTMLElement): Promise<void> {
  const islandId = placeholder.getAttribute("data-island-id");

  if (!islandId) {
    console.error("[SemaJSX] Island placeholder missing data-island-id");
    return;
  }

  // Check if island is already hydrated
  if (placeholder.hasAttribute("data-hydrated")) {
    return;
  }

  // Wait for hydration to complete (set by island entry point)
  return new Promise((resolve) => {
    // Check every 50ms for up to 10 seconds
    const maxAttempts = 200;
    let attempts = 0;

    const checkInterval = setInterval(() => {
      if (placeholder.hasAttribute("data-hydrated")) {
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

  await waitForIslandScript(placeholder);
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

/**
 * Mark an island as hydrated
 * This should be called by the island entry point after hydration completes
 */
export function markIslandHydrated(islandId: string): void {
  const placeholder = document.querySelector(
    `[data-island-id="${islandId}"]`,
  );
  if (placeholder) {
    placeholder.setAttribute("data-hydrated", "true");
  }
}

/** @jsxImportSource @semajsx/dom */

/**
 * Client-side tab enhancement island.
 *
 * Uses the SSG island system to include this script in the client bundle.
 * The actual tab interactivity is handled via a module side-effect that
 * runs when the bundle loads — the island component itself is just an
 * invisible marker that triggers inclusion.
 */

import type { JSXNode } from "@semajsx/core";
import { island } from "@semajsx/ssr/client";

/**
 * Initialize tab interactivity on all [data-tabs] elements.
 * Sets initial panel visibility and handles click events for switching.
 */
function initTabs(): void {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const active = root.getAttribute("data-tabs");
    root.querySelectorAll("[role=tab]").forEach((t) => {
      t.setAttribute("aria-selected", String(t.getAttribute("data-tab-value") === active));
    });
    root.querySelectorAll("[role=tabpanel]").forEach((p) => {
      if (p.getAttribute("data-tab-panel") !== active) {
        (p as HTMLElement).hidden = true;
      }
    });
  });

  document.addEventListener("click", (e) => {
    const tab = (e.target as HTMLElement).closest("[role=tab]");
    if (!tab) return;
    const root = tab.closest("[data-tabs]");
    if (!root) return;
    const value = tab.getAttribute("data-tab-value");
    if (!value) return;

    root.setAttribute("data-tabs", value);
    root.querySelectorAll("[role=tab]").forEach((t) => {
      t.setAttribute("aria-selected", String(t.getAttribute("data-tab-value") === value));
    });
    root.querySelectorAll("[role=tabpanel]").forEach((p) => {
      (p as HTMLElement).hidden = p.getAttribute("data-tab-panel") !== value;
    });
  });
}

// Module side-effect: initializes tabs when the script loads in the browser.
// type="module" scripts are deferred, so the DOM is parsed by this point.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTabs);
  } else {
    initTabs();
  }
}

/**
 * Island marker component.
 * Renders an invisible element that the SSG island system detects,
 * causing this module to be bundled and included as a client script.
 */
export const TabsEnhancer = island(
  function TabsEnhancer(): JSXNode {
    return <span data-tabs-enhancer style="display:none" />;
  },
  import.meta.url,
);

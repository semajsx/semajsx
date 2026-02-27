/**
 * Tabs island for docs theme.
 *
 * Wraps the reactive Tabs component from @semajsx/ui with island()
 * so the SSG build system bundles and hydrates it on the client.
 *
 * Child components (TabList, Tab, TabPanel) are re-exported so they
 * appear in the module registry, enabling the island hydration system
 * to reconstruct the full VNode tree on the client.
 */

import { Tabs, TabList, Tab, TabPanel } from "@semajsx/ui/components/tabs";
import { island } from "@semajsx/ssr/client";

export const TabsIsland: typeof Tabs = island(Tabs, import.meta.url);
export { TabList, Tab, TabPanel };

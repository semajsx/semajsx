/**
 * Tabs island for docs theme.
 *
 * Wraps the reactive Tabs component from @semajsx/ui with island()
 * so the SSG build system bundles and hydrates it on the client.
 */

import { Tabs } from "@semajsx/ui/components/tabs";
import { island } from "@semajsx/ssr/client";

export const TabsIsland = island(Tabs, import.meta.url);

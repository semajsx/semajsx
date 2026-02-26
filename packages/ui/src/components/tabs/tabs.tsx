/** @jsxImportSource @semajsx/dom */

/**
 * Tabs component
 *
 * A tabbed interface for switching between content panels.
 * Designed for SSG (static) usage - all panels are rendered,
 * visibility is controlled via inline styles.
 *
 * @example
 * ```tsx
 * import { Tabs, TabList, Tab, TabPanel } from "@semajsx/ui/tabs";
 *
 * <Tabs defaultValue="npm">
 *   <TabList>
 *     <Tab value="npm">npm</Tab>
 *     <Tab value="bun">Bun</Tab>
 *   </TabList>
 *   <TabPanel value="npm">npm install semajsx</TabPanel>
 *   <TabPanel value="bun">bun add semajsx</TabPanel>
 * </Tabs>
 * ```
 */

import type { JSXNode } from "@semajsx/core";
import type { StyleToken } from "@semajsx/style";
import * as styles from "./tabs.style";

type ClassValue = string | StyleToken | ClassValue[] | false | null | undefined;

export interface TabsProps {
  /** The initially active tab value */
  defaultValue: string;
  /** Additional CSS class(es) */
  class?: ClassValue;
  /** Content (TabList and TabPanels) */
  children?: JSXNode;
}

export interface TabListProps {
  /** Additional CSS class(es) */
  class?: ClassValue;
  /** Tab triggers */
  children?: JSXNode;
}

export interface TabProps {
  /** Value matching a TabPanel */
  value: string;
  /** Additional CSS class(es) */
  class?: ClassValue;
  /** Tab label */
  children?: JSXNode;
}

export interface TabPanelProps {
  /** Value matching a Tab */
  value: string;
  /** Additional CSS class(es) */
  class?: ClassValue;
  /** Panel content */
  children?: JSXNode;
}

export function Tabs(props: TabsProps): JSXNode {
  return (
    <div class={[styles.root, props.class]} data-tabs={props.defaultValue}>
      {props.children}
    </div>
  );
}

export function TabList(props: TabListProps): JSXNode {
  return (
    <div class={[styles.list, props.class]} role="tablist">
      {props.children}
    </div>
  );
}

export function Tab(props: TabProps): JSXNode {
  return (
    <button
      class={[styles.trigger, styles.triggerStates, props.class]}
      role="tab"
      data-tab-value={props.value}
    >
      {props.children}
    </button>
  );
}

export function TabPanel(props: TabPanelProps): JSXNode {
  return (
    <div class={[styles.panel, props.class]} role="tabpanel" data-tab-panel={props.value}>
      {props.children}
    </div>
  );
}

import type { VNode } from "@semajsx/core";
import type { z } from "zod";

// =============================================================================
// Collection Entry
// =============================================================================

export interface CollectionEntry<T = unknown> {
  /** Unique identifier within the collection */
  id: string;
  /** URL-friendly slug */
  slug: string;
  /** Validated frontmatter data */
  data: T;
  /** Raw content body (markdown/mdx) */
  body: string;
  /** Render the content to JSX */
  render: () => Promise<{ Content: () => VNode }>;
}

// =============================================================================
// Collection Source
// =============================================================================

export interface ChangeSet<T = unknown> {
  /** Cursor for next incremental fetch */
  cursor: string;
  /** Newly added entries */
  added: CollectionEntry<T>[];
  /** Updated entries */
  updated: CollectionEntry<T>[];
  /** Deleted entry IDs */
  deleted: string[];
}

export type WatchCallback<T = unknown> = (changes: ChangeSet<T>) => void;

export interface CollectionSource<T = unknown> {
  /** Unique identifier for this source */
  id: string;

  /** Get all entries from this source */
  getEntries(): Promise<CollectionEntry<T>[]>;

  /** Get a single entry by ID */
  getEntry(id: string): Promise<CollectionEntry<T> | null>;

  /** Watch for changes (optional) */
  watch?(callback: WatchCallback<T>): () => void;

  /** Get incremental changes since cursor (optional) */
  getChanges?(since: string): Promise<ChangeSet<T>>;
}

// =============================================================================
// Collection Definition
// =============================================================================

export interface CollectionConfig<T extends z.ZodType = z.ZodType> {
  /** Collection name */
  name: string;
  /** Data source */
  source: CollectionSource<z.infer<T>>;
  /** Zod schema for validation */
  schema: T;
}

export interface Collection<T = unknown> {
  name: string;
  source: CollectionSource<T>;
  schema: z.ZodType<T>;
}

// =============================================================================
// Route Configuration
// =============================================================================

export interface StaticPath<P = Record<string, string>> {
  params: P;
  props?: Record<string, unknown>;
}

export interface RouteConfig {
  /** Route path pattern (e.g., '/blog/:slug') */
  path: string;
  /** Component to render */
  component: (props: Record<string, unknown>) => VNode;
  /** Static props for the route */
  props?:
    | Record<string, unknown>
    | ((ssg: SSGInstance) => Promise<Record<string, unknown>>);
  /** Generate static paths for dynamic routes */
  getStaticPaths?: (ssg: SSGInstance) => Promise<StaticPath[]>;
}

// =============================================================================
// MDX Configuration
// =============================================================================

export interface MDXConfig {
  /** Remark plugins */
  remarkPlugins?: unknown[];
  /** Rehype plugins */
  rehypePlugins?: unknown[];
  /** Component mapping for MDX */
  components?: Record<string, (props: Record<string, unknown>) => VNode>;
}

// =============================================================================
// SSG Configuration
// =============================================================================

export interface SSGConfig {
  /** Output directory for built files */
  outDir: string;
  /** Base URL path */
  base?: string;
  /** Collections to include */
  collections?: Collection[];
  /** Route definitions */
  routes?: RouteConfig[];
  /** MDX configuration */
  mdx?: MDXConfig;
}

// =============================================================================
// Build State & Result
// =============================================================================

export interface BuildState {
  /** Cursor for each collection */
  cursors: Record<string, string>;
  /** Content hash for each page */
  pageHashes: Record<string, string>;
  /** Last build timestamp */
  timestamp: number;
}

export interface BuildResult {
  /** New build state for incremental builds */
  state: BuildState;
  /** Paths that were built */
  paths: string[];
  /** Build statistics */
  stats: {
    added: number;
    updated: number;
    deleted: number;
    unchanged: number;
  };
}

export interface BuildOptions {
  /** Enable incremental build */
  incremental?: boolean;
  /** Previous build state */
  state?: BuildState;
  /** Only build specific collections */
  collections?: string[];
}

// =============================================================================
// Watcher
// =============================================================================

export interface WatchOptions {
  /** Callback when rebuild completes */
  onRebuild?: (result: BuildResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface Watcher {
  /** Stop watching */
  close(): void;
}

// =============================================================================
// SSG Instance
// =============================================================================

export interface SSGInstance {
  /** Get all entries from a collection */
  getCollection<T = unknown>(name: string): Promise<CollectionEntry<T>[]>;

  /** Get a single entry from a collection */
  getEntry<T = unknown>(
    name: string,
    id: string,
  ): Promise<CollectionEntry<T> | null>;

  /** Build the static site */
  build(options?: BuildOptions): Promise<BuildResult>;

  /** Watch for changes and rebuild */
  watch(options?: WatchOptions): Watcher;
}

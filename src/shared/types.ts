import type { VNode } from "../runtime/types";

/**
 * Island metadata collected during SSR rendering
 */
export interface IslandMetadata {
  /** Unique identifier for this island instance */
  id: string;
  /** Module path to the island component */
  path: string;
  /** Serialized props for the island */
  props: Record<string, any>;
  /** Component name (for debugging) */
  componentName?: string;
}

/**
 * Result of SSR rendering with islands
 */
export interface SSRResult {
  /** Rendered HTML string */
  html: string;
  /** List of islands found during rendering */
  islands: IslandMetadata[];
  /** Script tags to load island code */
  scripts: string;
}

/**
 * Island component marker attached to VNode
 */
export interface IslandMarker {
  /** Module path to the island component */
  modulePath: string;
  /** Original component function */
  component: Function;
  /** Props passed to the component */
  props: any;
}

/**
 * Route handler function
 */
export type RouteHandler = (params?: Record<string, string>) => VNode;

/**
 * Router configuration
 */
export interface RouterConfig {
  /** Base path for island scripts */
  islandBasePath?: string;
  /** Enable code caching */
  enableCache?: boolean;
  /** Development mode (uses Vite for module transformation) */
  dev?: boolean;
  /** Project root directory (for Vite) */
  root?: string;
  /** Custom build options (for production bundling) */
  buildOptions?: {
    minify?: boolean;
    sourcemap?: boolean;
  };
}

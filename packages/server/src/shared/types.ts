import type { JSXNode, VNode } from "@semajsx/core/types";

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
  /** Rendered HTML string (page content only) */
  html: string;
  /** List of islands found during rendering */
  islands: IslandMetadata[];
  /** Script tags to load island code */
  scripts: string;
  /** Complete HTML document (if document template was provided) */
  document?: string;
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
 * Document template function for rendering complete HTML documents
 */
export type DocumentTemplate = (props: {
  /** Page content (JSX node - can be string, VNode, etc.) */
  children: JSXNode;
  /** Island script tags (JSX node - can be string, VNode, etc.) */
  scripts: JSXNode;
  /** Island metadata (for custom processing) */
  islands: IslandMetadata[];
  /** Current route path */
  path: string;
  /** Page title (optional, should be provided by user) */
  title?: string;
  /** Additional metadata (optional) */
  meta?: Record<string, any>;
}) => VNode;

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
  /** HTML document template (JSX) */
  document?: DocumentTemplate;
  /** Default page title (passed to document template) */
  title?: string;
  /** Additional metadata (passed to document template) */
  meta?: Record<string, any>;
}

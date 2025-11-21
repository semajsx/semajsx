import type { JSXNode, VNode } from "@semajsx/core/types";
import type { UserConfig as ViteUserConfig, ViteDevServer } from "vite";

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

// ========================
// New App API Types
// ========================

/**
 * App configuration
 */
export interface AppConfig {
  /** Route definitions */
  routes?: Record<string, RouteHandler>;

  /** Vite configuration (fully exposed) */
  vite?: ViteUserConfig;

  /** Island configuration */
  islands?: {
    /** Base path for island scripts (default: '/islands') */
    basePath?: string;
    /** Enable caching (default: true) */
    cache?: boolean;
    /** Maximum cache size (default: 1000) */
    cacheSize?: number;
  };

  /** HTML document template */
  document?: DocumentTemplate;

  /** Default page title */
  title?: string;

  /** Additional metadata */
  meta?: Record<string, any>;

  /** Project root directory */
  root?: string;
}

/**
 * Build options for production
 */
export interface BuildOptions {
  /** Output directory (default: 'dist') */
  outDir?: string;

  /** Build mode */
  mode?: "full" | "on-demand";

  /** Minify output (default: true) */
  minify?: boolean;

  /** Generate sourcemaps (default: false) */
  sourcemap?: boolean;

  /** Additional Vite build config */
  vite?: ViteUserConfig;

  /** Callback when an island is built */
  onIslandBuilt?: (island: IslandMetadata) => void;
}

/**
 * Development server options
 */
export interface DevOptions {
  /** Server port (default: 3000) */
  port?: number;

  /** Server host (default: 'localhost') */
  host?: string;

  /** Open browser on start */
  open?: boolean;
}

/**
 * Build result
 */
export interface BuildResult {
  /** Output directory path */
  outDir: string;

  /** Built islands */
  islands: Array<{
    id: string;
    path: string;
    outputPath: string;
  }>;

  /** Build manifest */
  manifest: {
    islands: Record<string, string>;
    routes: string[];
  };
}

/**
 * Render result (same as SSRResult)
 */
export type RenderResult = SSRResult;

/**
 * App interface
 */
export interface App {
  /** App configuration */
  readonly config: AppConfig;

  /** Register a route */
  route(path: string, handler: RouteHandler): this;

  /** Register multiple routes */
  routes(routes: Record<string, RouteHandler>): this;

  /** Initialize the app (Vite dev server) */
  prepare(): Promise<void>;

  /** Close and cleanup resources */
  close(): Promise<void>;

  /** Render a path to HTML */
  render(path: string): Promise<RenderResult>;

  /** Start development server */
  dev(
    options?: DevOptions,
  ): Promise<{ port: number; close: () => Promise<void> }>;

  /** Build for production */
  build(options?: BuildOptions): Promise<BuildResult>;

  /** Handle HTTP request (for custom server integration) */
  handleRequest(request: Request): Promise<Response>;

  /** Get Vite dev server instance */
  getViteServer(): ViteDevServer | null;

  /** Get island entry point code */
  getIslandEntryPoint(islandId: string): Promise<string>;

  /** Get island metadata */
  getIsland(islandId: string): IslandMetadata | undefined;
}

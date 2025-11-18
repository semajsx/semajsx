import type {
  RouteHandler,
  RouterConfig,
  SSRResult,
  IslandMetadata,
} from "../shared/types";
import { renderToString } from "./render";
import { createIslandBuilder, type IslandBuilder } from "./builder";

/**
 * Route matcher result
 */
interface RouteMatch {
  handler: RouteHandler;
  params: Record<string, string>;
}

/**
 * SSR Router with island support
 */
export class Router {
  private routeMap: Map<string, RouteHandler> = new Map();
  private dynamicRoutes: Array<{ pattern: RegExp; handler: RouteHandler }> = [];
  private builder: IslandBuilder;
  private config: Required<RouterConfig>;
  private islandsMap = new Map<string, IslandMetadata>();

  constructor(config: RouterConfig = {}) {
    this.config = {
      islandBasePath: config.islandBasePath ?? "/islands",
      enableCache: config.enableCache ?? true,
      buildOptions: config.buildOptions ?? { minify: true, sourcemap: false },
    };

    this.builder = createIslandBuilder(this.config.buildOptions);
  }

  /**
   * Register a static route
   */
  route(path: string, handler: RouteHandler): this {
    if (path.includes(":")) {
      // Dynamic route
      const pattern = this.pathToRegex(path);
      this.dynamicRoutes.push({ pattern, handler });
    } else {
      // Static route
      this.routeMap.set(path, handler);
    }
    return this;
  }

  /**
   * Register multiple routes at once
   */
  routes(routes: Record<string, RouteHandler>): this {
    for (const [path, handler] of Object.entries(routes)) {
      this.route(path, handler);
    }
    return this;
  }

  /**
   * Get page content for a given path (lazy rendering)
   */
  async get(path: string): Promise<SSRResult> {
    // Find matching route
    const match = this.matchRoute(path);
    if (!match) {
      throw new Error(`Route not found: ${path}`);
    }

    // Call the route handler to get VNode
    const vnode = match.handler(match.params);

    // Render to HTML with islands
    const result = renderToString(vnode, {
      islandBasePath: this.config.islandBasePath,
    });

    // Store islands for later code retrieval
    for (const island of result.islands) {
      this.islandsMap.set(island.id, island);
    }

    return result;
  }

  /**
   * Get island client code (lazy build)
   */
  async getIslandCode(islandId: string): Promise<string> {
    const island = this.islandsMap.get(islandId);
    if (!island) {
      throw new Error(`Island not found: ${islandId}`);
    }

    return this.builder.getCode(island);
  }

  /**
   * Get island metadata by ID
   */
  getIsland(islandId: string): IslandMetadata | undefined {
    return this.islandsMap.get(islandId);
  }

  /**
   * Clear builder cache
   */
  clearCache(islandId?: string): void {
    this.builder.clearCache(islandId);
  }

  /**
   * Match a path to a route handler
   */
  private matchRoute(path: string): RouteMatch | null {
    // Try static routes first
    const staticHandler = this.routeMap.get(path);
    if (staticHandler) {
      return { handler: staticHandler, params: {} };
    }

    // Try dynamic routes
    for (const { pattern, handler } of this.dynamicRoutes) {
      const match = path.match(pattern);
      if (match) {
        const params = this.extractParams(pattern, match);
        return { handler, params };
      }
    }

    return null;
  }

  /**
   * Convert path pattern to regex
   * Example: /blog/:id -> /^\/blog\/([^\/]+)$/
   */
  private pathToRegex(path: string): RegExp {
    const pattern = path
      .replace(/\//g, "\\/")
      .replace(/:([^\/]+)/g, "(?<$1>[^\\/]+)");
    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract params from regex match
   */
  private extractParams(
    _pattern: RegExp,
    match: RegExpMatchArray,
  ): Record<string, string> {
    return match.groups || {};
  }
}

/**
 * Create a new router with optional routes
 */
export function createRouter(
  routes?: Record<string, RouteHandler>,
  config?: RouterConfig,
): Router {
  const router = new Router(config);
  if (routes) {
    router.routes(routes);
  }
  return router;
}

/**
 * App - Main entry point for SemaJSX server applications
 *
 * Provides a unified API for:
 * - Route management
 * - SSR rendering with islands
 * - Development server with Vite
 * - Production builds
 */

import { createServer, build as viteBuild, mergeConfig } from "vite";
import type { ViteDevServer, UserConfig as ViteUserConfig } from "vite";
import { relative } from "path";
import { renderToString } from "./render";
import { renderDocument } from "./document";
import { LRUCache } from "./lru-cache";
import { createLogger } from "@semajsx/logger";
import { buildCSS, transformCSSForDev, analyzeCSSChunks } from "./css-builder";
import { buildAssets } from "./asset-builder";
import type {
  App,
  AppConfig,
  BuildOptions,
  BuildResult,
  DevOptions,
  IslandMetadata,
  RenderResult,
  RouteContext,
  RouteHandler,
} from "./shared/types";

const logger = createLogger({ prefix: "App" });

/**
 * Internal App implementation
 */
class AppImpl implements App {
  readonly config: AppConfig;

  private _routes: Map<string, RouteHandler> = new Map();
  private _viteServer: ViteDevServer | null = null;
  private _islandCache: LRUCache<string, IslandMetadata>;
  private _initialized = false;
  private _cssManifest: Map<string, string> = new Map();

  constructor(config: AppConfig = {}) {
    this.config = {
      root: process.cwd(),
      ...config,
      islands: {
        basePath: "/islands",
        cache: true,
        cacheSize: 1000,
        ...config.islands,
      },
    };

    this._islandCache = new LRUCache(this.config.islands?.cacheSize ?? 1000);

    // Register initial routes
    if (config.routes) {
      this.routes(config.routes);
    }
  }

  route(path: string, handler: RouteHandler): this {
    this._routes.set(path, handler);
    return this;
  }

  routes(routes: Record<string, RouteHandler>): this {
    for (const [path, handler] of Object.entries(routes)) {
      this._routes.set(path, handler);
    }
    return this;
  }

  async prepare(): Promise<void> {
    if (this._initialized) return;

    logger.info("Initializing app with Vite dev server...");

    const baseViteConfig: ViteUserConfig = {
      root: this.config.root,
      server: {
        middlewareMode: true,
      },
      appType: "custom",
      optimizeDeps: {
        // Disable optimization for semajsx to use source directly in development
        exclude: [
          "semajsx",
          "@semajsx/core",
          "@semajsx/dom",
          "@semajsx/signal",
          "@semajsx/ssr",
        ],
      },
      resolve: {
        // Ensure Vite respects package.json "exports" field with conditions
        conditions: ["browser", "development", "module", "import", "default"],
      },
      plugins: [this._createVirtualIslandsPlugin()],
      // Exclude problematic native modules from SSR bundling
      ssr: {
        noExternal: ["@semajsx/core", "@semajsx/dom", "@semajsx/signal"],
        external: ["lightningcss", "fsevents"],
      },
    };

    // Merge user Vite config
    const finalConfig = this.config.vite
      ? mergeConfig(baseViteConfig, this.config.vite)
      : baseViteConfig;

    this._viteServer = await createServer(finalConfig);
    this._initialized = true;

    logger.info("App initialized successfully");
  }

  async close(): Promise<void> {
    if (this._viteServer) {
      await this._viteServer.close();
      this._viteServer = null;
    }
    this._initialized = false;
    logger.info("App closed");
  }

  async render(path: string): Promise<RenderResult> {
    // Parse path and query string
    const [pathname, queryString] = path.split("?");
    const query: Record<string, string> = {};
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams) {
        query[key] = value;
      }
    }

    // Match route
    const { handler, params } = this._matchRoute(pathname || "/");
    if (!handler) {
      throw new Error(`No route found for path: ${path}`);
    }

    // Execute handler to get VNode
    const context: RouteContext = { params, query };
    const vnode = handler(context);

    // Render to string with island detection
    const basePath = this.config.islands?.basePath || "/islands";
    const result = await renderToString(vnode, {
      islandBasePath: basePath,
      // Default transformer generates standard script tags
      transformIslandScript: (island) =>
        `<script type="module" src="${island.basePath}/${island.id}.js" async></script>`,
    });

    // Cache islands
    if (this.config.islands?.cache) {
      for (const island of result.islands) {
        this._islandCache.set(island.id, island);
      }
    }

    // Apply CSS manifest mapping for production builds
    const mappedCSS = this._applyCSSTManifest(result.css);

    // Render with document template if provided
    if (this.config.document) {
      const documentVNode = this.config.document({
        children: result.html,
        scripts: result.scripts,
        islands: result.islands,
        css: mappedCSS,
        path,
        title: this.config.title,
        meta: this.config.meta,
      });

      return {
        ...result,
        css: mappedCSS,
        document: renderDocument(documentVNode),
      };
    }

    return {
      ...result,
      css: mappedCSS,
    };
  }

  async dev(
    options: DevOptions = {},
  ): Promise<{ port: number; close: () => Promise<void> }> {
    const { port = 3000, host = "localhost", open = false } = options;

    await this.prepare();

    // Create HTTP server
    const server = Bun.serve({
      port,
      hostname: host,
      fetch: async (req) => this.handleRequest(req),
    });

    logger.info(`Development server running at http://${host}:${port}`);

    if (open) {
      // Open browser (platform-specific)
      const openCmd =
        process.platform === "darwin"
          ? "open"
          : process.platform === "win32"
            ? "start"
            : "xdg-open";
      Bun.spawn([openCmd, `http://${host}:${port}`]);
    }

    return {
      port,
      close: async () => {
        server.stop();
        await this.close();
      },
    };
  }

  async build(options: BuildOptions = {}): Promise<BuildResult> {
    const {
      outDir = "dist",
      mode = "full",
      minify = true,
      sourcemap = false,
      onIslandBuilt,
    } = options;

    logger.info(`Building for production (mode: ${mode})...`);

    // Ensure output directory exists
    const { mkdir } = await import("fs/promises");
    await mkdir(outDir, { recursive: true });

    const builtIslands: BuildResult["islands"] = [];
    const manifest: BuildResult["manifest"] = {
      islands: {},
      routes: Array.from(this._routes.keys()),
      css: {},
    };

    if (mode === "full") {
      // Pre-render all routes to collect islands, CSS, and assets (by ID, not path)
      const allIslands = new Map<string, IslandMetadata>();
      const cssPerRoute = new Map<string, string[]>();
      const allAssets = new Set<string>();

      for (const [path] of this._routes) {
        try {
          const result = await this.render(path);
          for (const island of result.islands) {
            // Use island.id as key to keep all instances
            if (!allIslands.has(island.id)) {
              allIslands.set(island.id, island);
            }
          }
          // Collect CSS per route for chunk analysis
          cssPerRoute.set(path, result.css);
          // Collect assets
          for (const asset of result.assets) {
            allAssets.add(asset);
          }
        } catch (error) {
          logger.warn(`Failed to pre-render route ${path}: ${String(error)}`);
        }
      }

      // Analyze CSS chunks to extract shared CSS
      const { shared: sharedCSS, perEntry: cssPerEntry } = analyzeCSSChunks(
        cssPerRoute,
        2, // threshold: CSS used by 2+ routes goes to shared
      );

      // Collect all unique CSS files
      const allCSS = new Set<string>([
        ...sharedCSS,
        ...Array.from(cssPerEntry.values()).flat(),
      ]);

      // Build assets first (for CSS url() rewriting)
      let assetManifest: Map<string, string> | undefined;
      const rootDir = this.config.root || process.cwd();
      if (allAssets.size > 0) {
        const assetResult = await buildAssets(allAssets, outDir);
        assetManifest = assetResult.mapping;

        // Add to manifest with relative paths as keys
        for (const [original, output] of assetResult.mapping) {
          manifest.assets = manifest.assets || {};
          const relPath = relative(rootDir, original);
          manifest.assets[relPath] = output;
        }

        logger.info(`Built ${allAssets.size} assets`);
      }

      // Build CSS with lightningcss (with asset URL rewriting)
      if (allCSS.size > 0) {
        const cssResult = await buildCSS(allCSS, outDir, {
          minify,
          sourceMap: sourcemap,
          assetManifest,
        });

        // Add to manifest with relative paths as keys
        for (const [original, output] of cssResult.mapping) {
          const relPath = relative(rootDir, original);
          manifest.css[relPath] = output;
          // Keep absolute path in runtime manifest for lookup
          this._cssManifest.set(original, output);
        }

        // Add shared CSS info to manifest
        if (sharedCSS.length > 0) {
          manifest.sharedCSS = sharedCSS.map(
            (css) => cssResult.mapping.get(css) || css,
          );
          logger.info(`Extracted ${sharedCSS.length} shared CSS files`);
        }

        logger.info(`Built ${allCSS.size} CSS files`);
      }

      // Build all islands with hydration entry points in one build
      if (allIslands.size > 0) {
        const { writeFile, rm, mkdir } = await import("fs/promises");
        const { join } = await import("path");
        const tempDir = join(
          this.config.root || process.cwd(),
          ".island-entries",
        );
        await mkdir(tempDir, { recursive: true });

        // Generate entry files for all islands
        const entryPoints: Record<string, string> = {};

        for (const [, island] of allIslands) {
          const componentPath = this._normalizeModulePath(island.path);
          const componentName = island.componentName;

          const entryCode = `
import { hydrateIsland } from '@semajsx/ssr/client';
import { markIslandHydrated } from '@semajsx/ssr/client';
import * as ComponentModule from '${componentPath}';

const Component = ${componentName ? `ComponentModule['${componentName}'] || ComponentModule.${componentName} || ` : ""}ComponentModule.default ||
                  Object.values(ComponentModule).find(exp => typeof exp === 'function');

if (Component) {
  hydrateIsland('${island.id}', Component, markIslandHydrated);
}
`;

          const entryFile = join(tempDir, `${island.id}.ts`);
          await writeFile(entryFile, entryCode);
          entryPoints[island.id] = entryFile;
        }

        // Build all islands at once
        const baseConfig: ViteUserConfig = {
          root: this.config.root,
          build: {
            outDir: `${outDir}/islands`,
            emptyOutDir: true,
            minify,
            sourcemap,
            rollupOptions: {
              input: entryPoints,
              output: {
                format: "es",
                entryFileNames: "[name].js",
              },
              external: [],
            },
          },
        };

        const finalConfig = options.vite
          ? mergeConfig(baseConfig, options.vite)
          : baseConfig;

        await viteBuild(finalConfig);

        // Clean up temp directory
        await rm(tempDir, { recursive: true, force: true });

        // Record built islands
        for (const [, island] of allIslands) {
          // Use relative path for portability
          const relativeOutputPath = `islands/${island.id}.js`;

          builtIslands.push({
            id: island.id,
            path: island.path,
            outputPath: relativeOutputPath,
          });

          manifest.islands[island.id] = relativeOutputPath;

          if (onIslandBuilt) {
            onIslandBuilt(island);
          }
        }

        logger.info(`Built ${allIslands.size} islands`);
      }
    }

    // Write manifest to disk
    const { writeFile } = await import("fs/promises");
    const { join } = await import("path");
    await writeFile(
      join(outDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );

    logger.info(`Build complete. Output: ${outDir}`);

    return {
      outDir,
      islands: builtIslands,
      manifest,
    };
  }

  async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CSS requests in development
    if (pathname.endsWith(".css")) {
      try {
        const cssPath = this._resolveCSSPath(pathname);
        if (cssPath) {
          const code = await transformCSSForDev(cssPath);
          return new Response(code, {
            headers: { "Content-Type": "text/css" },
          });
        }
      } catch (error) {
        logger.error(`Failed to load CSS ${pathname}: ${error}`);
        return new Response("CSS not found", { status: 404 });
      }
    }

    // Handle Vite module requests (/@fs/, /@vite/, /node_modules/, etc.)
    if (
      pathname.startsWith("/@") ||
      pathname.startsWith("/node_modules/") ||
      pathname.includes("@vite")
    ) {
      const result = await this._handleModuleRequest(pathname);
      if (result) {
        return new Response(result.code, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    // Handle island entry points (must be before source file handler)
    const islandBasePath = this.config.islands?.basePath ?? "/islands";
    if (pathname.startsWith(islandBasePath)) {
      const match = pathname.match(new RegExp(`${islandBasePath}/(.+)\\.js`));
      if (match && match[1]) {
        const islandId = match[1];
        try {
          const code = await this.getIslandEntryPoint(islandId);
          return new Response(code, {
            headers: { "Content-Type": "application/javascript" },
          });
        } catch {
          return new Response("Island not found", { status: 404 });
        }
      }
    }

    // Handle source file requests (.ts, .tsx, .js, .jsx)
    if (/\.(tsx?|jsx?)$/.test(pathname)) {
      const result = await this._handleModuleRequest(pathname);
      if (result) {
        return new Response(result.code, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
      return new Response("Not Found", { status: 404 });
    }

    // Handle page requests
    try {
      const result = await this.render(pathname);
      return new Response(result.document || result.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("No route found")) {
        return new Response("Not Found", { status: 404 });
      }
      logger.error(`Request error: ${String(error)}`);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  getViteServer(): ViteDevServer | null {
    return this._viteServer;
  }

  async getIslandEntryPoint(islandId: string): Promise<string> {
    const island = this._islandCache.get(islandId);
    if (!island) {
      throw new Error(`Island not found: ${islandId}`);
    }

    // Normalize the component path for Vite
    const componentPath = this._normalizeModulePath(island.path);

    // Get component name for import
    const componentName = island.componentName;

    // Generate entry point code
    const entryCode = `
import { hydrateIsland } from '@semajsx/ssr/client';
import { markIslandHydrated } from '@semajsx/ssr/client';
import * as ComponentModule from '${componentPath}';

// Get the component (try named export first, then default, then first function)
const Component = ${componentName ? `ComponentModule['${componentName}'] || ComponentModule.${componentName} || ` : ""}ComponentModule.default ||
                  Object.values(ComponentModule).find(exp => typeof exp === 'function');

if (Component) {
  hydrateIsland('${islandId}', Component, markIslandHydrated);
}
`;

    // Transform through Vite if available
    if (this._viteServer) {
      const result = await this._viteServer.transformRequest(
        `virtual:island-entry:${islandId}`,
      );
      if (result) {
        return result.code;
      }
    }

    return entryCode;
  }

  getIsland(islandId: string): IslandMetadata | undefined {
    return this._islandCache.get(islandId);
  }

  // Private methods

  private _matchRoute(path: string): {
    handler: RouteHandler | undefined;
    params: Record<string, string>;
  } {
    // Exact match first
    const exactHandler = this._routes.get(path);
    if (exactHandler) {
      return { handler: exactHandler, params: {} };
    }

    // Dynamic route matching
    for (const [pattern, handler] of this._routes) {
      const params = this._matchDynamicRoute(pattern, path);
      if (params) {
        return { handler, params };
      }
    }

    return { handler: undefined, params: {} };
  }

  private _matchDynamicRoute(
    pattern: string,
    path: string,
  ): Record<string, string> | null {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]!;
      const pathPart = pathParts[i]!;

      if (patternPart.startsWith(":")) {
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        return null;
      }
    }

    return params;
  }

  /**
   * Normalize module path (convert file:// URLs to paths Vite can resolve)
   */
  private _normalizeModulePath(path: string): string {
    if (path.startsWith("file://")) {
      // Convert file:// URL to filesystem path
      const fsPath = new URL(path).pathname;

      // Make path relative to app root
      const root = this.config.root || process.cwd();
      if (root && fsPath.startsWith(root)) {
        // Path is within root, make it relative
        const relativePath = fsPath.slice(root.length);
        // Ensure it starts with / for Vite to resolve from root
        return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
      }

      // Path is outside root, use @fs protocol
      return `/@fs${fsPath}`;
    }
    return path;
  }

  private async _handleModuleRequest(
    url: string,
  ): Promise<{ code: string } | null> {
    if (!this._viteServer) return null;

    try {
      const result = await this._viteServer.transformRequest(url);
      if (result) {
        return { code: result.code };
      }
    } catch (error) {
      logger.error(`Failed to transform module ${url}: ${String(error)}`);
    }

    return null;
  }

  /**
   * Resolve CSS URL path to filesystem path
   */
  private _resolveCSSPath(urlPath: string): string | null {
    const root = this.config.root || process.cwd();

    // Handle absolute paths (e.g., /src/styles/page.css)
    if (urlPath.startsWith("/")) {
      const { join } = require("path");
      return join(root, urlPath);
    }

    return null;
  }

  /**
   * Apply CSS manifest mapping to convert source paths to hashed output paths
   */
  private _applyCSSTManifest(cssPaths: string[]): string[] {
    if (this._cssManifest.size === 0) {
      return cssPaths;
    }

    return cssPaths.map((cssPath) => this._cssManifest.get(cssPath) || cssPath);
  }

  private _createVirtualIslandsPlugin() {
    const islandCache = this._islandCache;
    const normalizeModulePath = this._normalizeModulePath.bind(this);

    return {
      name: "semajsx-virtual-islands",
      resolveId(id: string) {
        if (id.startsWith("virtual:island-entry:")) {
          return id;
        }
        return null;
      },
      load(id: string) {
        if (id.startsWith("virtual:island-entry:")) {
          const islandId = id.replace("virtual:island-entry:", "");
          const island = islandCache.get(islandId);

          if (!island) {
            return null;
          }

          const componentPath = normalizeModulePath(island.path);
          const componentName = island.componentName;

          return `
import { hydrateIsland } from '@semajsx/ssr/client';
import { markIslandHydrated } from '@semajsx/ssr/client';
import * as ComponentModule from '${componentPath}';

// Get the component (try named export first, then default, then first function)
const Component = ${componentName ? `ComponentModule['${componentName}'] || ComponentModule.${componentName} || ` : ""}ComponentModule.default ||
                  Object.values(ComponentModule).find(exp => typeof exp === 'function');

if (Component) {
  hydrateIsland('${islandId}', Component, markIslandHydrated);
}
`;
        }
        return null;
      },
    };
  }
}

/**
 * Create app from build output (for production)
 */
async function fromBuild(buildDir: string): Promise<App> {
  const { readFile, readdir, stat } = await import("fs/promises");
  const { join } = await import("path");

  // Load manifest
  const manifestPath = join(buildDir, "manifest.json");
  let manifest: {
    islands: Record<string, string>;
    routes: string[];
    css: Record<string, string>;
    assets?: Record<string, string>;
  };

  try {
    const manifestContent = await readFile(manifestPath, "utf-8");
    manifest = JSON.parse(manifestContent);
  } catch (error) {
    throw new Error(`Failed to load manifest from ${manifestPath}: ${error}`);
  }

  // Create app with routes from manifest
  const app = new AppImpl({
    root: buildDir,
  });

  // Set up CSS manifest for path mapping
  for (const [original, output] of Object.entries(manifest.css)) {
    app["_cssManifest"].set(original, output);
  }

  // Override handleRequest for production serving
  const originalHandleRequest = app.handleRequest.bind(app);
  app.handleRequest = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Serve static files from build output
    const staticPaths = ["/css/", "/assets/", "/islands/"];
    for (const prefix of staticPaths) {
      if (pathname.startsWith(prefix)) {
        const filePath = join(buildDir, pathname);
        try {
          const content = await readFile(filePath);
          const contentType = getContentType(pathname);
          return new Response(content, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      }
    }

    // For routes, use render (which will use CSS manifest mapping)
    return originalHandleRequest(request);
  };

  logger.info(`Loaded production app from ${buildDir}`);

  return app;
}

/**
 * Get content type for a file path
 */
function getContentType(filepath: string): string {
  const ext = filepath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return "application/javascript";
    case "css":
      return "text/css";
    case "html":
      return "text/html";
    case "json":
      return "application/json";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "svg":
      return "image/svg+xml";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    default:
      return "application/octet-stream";
  }
}

/**
 * Create a new SemaJSX app
 */
export const createApp: {
  (config?: AppConfig): App;
  fromBuild: typeof fromBuild;
} = Object.assign(
  function (config?: AppConfig): App {
    return new AppImpl(config);
  },
  { fromBuild },
);

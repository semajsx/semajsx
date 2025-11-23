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
import { relative, dirname, join, resolve } from "path";
import { renderToString } from "./render";
import { renderDocument } from "./document";
import { LRUCache } from "./lru-cache";
import { createLogger } from "@semajsx/logger";
import { transformCSSForDev } from "./css-builder";
import { collectResources, getEntryFiles } from "./resource-collector";
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
    const result = await renderToString(vnode, {
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

    const { mkdir, writeFile, rm, copyFile } = await import("fs/promises");
    const rootDir = this.config.root || process.cwd();
    const tempDir = join(rootDir, ".build-temp");

    // Ensure directories exist
    await mkdir(outDir, { recursive: true });
    await mkdir(tempDir, { recursive: true });

    const builtIslands: BuildResult["islands"] = [];
    const manifest: BuildResult["manifest"] = {
      islands: {},
      routes: Array.from(this._routes.keys()),
      css: {},
    };

    if (mode === "full") {
      // Phase 1: Pre-render all routes and collect resources
      const allIslands = new Map<string, IslandMetadata>();
      const allCSS = new Set<string>();
      const allAssets = new Set<string>();
      const htmlEntries: Record<string, string> = {};

      // Render all routes
      for (const [path] of this._routes) {
        try {
          const result = await this.render(path);

          // Collect islands
          for (const island of result.islands) {
            if (!allIslands.has(island.id)) {
              allIslands.set(island.id, island);
            }
          }

          // Collect CSS
          for (const css of result.css) {
            allCSS.add(css);
          }

          // Collect assets
          for (const asset of result.assets) {
            allAssets.add(asset);
          }

          // Generate HTML with resource references
          const htmlFileName = path === "/" ? "index" : path.replace(/^\//, "");
          const htmlPath = join(tempDir, `${htmlFileName}.html`);

          // Ensure directory exists for nested routes
          await mkdir(dirname(htmlPath), { recursive: true });

          // Convert CSS paths to relative paths for HTML
          const cssRefs = result.css.map((cssPath) => {
            const relPath = relative(rootDir, cssPath);
            return relPath;
          });

          // Generate island script references
          const islandScripts = result.islands.map(
            (island) =>
              `<script type="module" src="./islands/${island.id}.ts"></script>`,
          );

          // Generate HTML
          const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page</title>
  ${cssRefs.map((href) => `<link rel="stylesheet" href="./${href}">`).join("\n  ")}
</head>
<body>
  ${result.html}
  ${islandScripts.join("\n  ")}
</body>
</html>`;

          await writeFile(htmlPath, html);
          htmlEntries[htmlFileName] = htmlPath;

          logger.debug(`Rendered ${path} -> ${htmlPath}`);
        } catch (error) {
          logger.warn(`Failed to pre-render route ${path}: ${String(error)}`);
        }
      }

      // Collect additional resources from config patterns
      if (this.config.resources) {
        const islandPaths = Array.from(allIslands.values()).map((i) => {
          if (i.path.startsWith("file://")) {
            return new URL(i.path).pathname;
          }
          return i.path;
        });
        const entryFiles = getEntryFiles(islandPaths);

        const collectedResources = await collectResources(
          entryFiles,
          this.config.resources,
          rootDir,
        );

        for (const css of collectedResources.css) {
          allCSS.add(css);
        }
        for (const asset of collectedResources.assets) {
          allAssets.add(asset);
        }
      }

      // Copy CSS files to temp directory
      for (const cssPath of allCSS) {
        const relPath = relative(rootDir, cssPath);
        const destPath = join(tempDir, relPath);
        await mkdir(dirname(destPath), { recursive: true });
        await copyFile(cssPath, destPath);
      }

      // Copy asset files to temp directory
      for (const assetPath of allAssets) {
        const relPath = relative(rootDir, assetPath);
        const destPath = join(tempDir, relPath);
        await mkdir(dirname(destPath), { recursive: true });
        await copyFile(assetPath, destPath);
      }

      // Generate island entry files
      const islandsDir = join(tempDir, "islands");
      await mkdir(islandsDir, { recursive: true });

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

        await writeFile(join(islandsDir, `${island.id}.ts`), entryCode);
      }

      logger.info(
        `Phase 1 complete: ${Object.keys(htmlEntries).length} pages, ${allCSS.size} CSS, ${allAssets.size} assets, ${allIslands.size} islands`,
      );

      // Phase 2: Vite build with HTML entries
      const viteConfig: ViteUserConfig = {
        root: tempDir,
        base: "/",
        build: {
          outDir: resolve(outDir),
          emptyOutDir: true,
          minify,
          sourcemap,
          rollupOptions: {
            input: htmlEntries,
          },
        },
        // Merge user's Vite config (for PostCSS/Tailwind support)
        ...this.config.vite,
      };

      // Apply options.vite if provided
      const finalConfig = options.vite
        ? mergeConfig(viteConfig, options.vite)
        : viteConfig;

      await viteBuild(finalConfig);

      logger.info("Phase 2 complete: Vite build finished");

      // Record built islands
      for (const [, island] of allIslands) {
        // Vite will output islands to assets directory with hash
        const webPath = `/_semajsx/islands/${island.id}.js`;

        builtIslands.push({
          id: island.id,
          path: island.path,
          outputPath: webPath,
        });

        manifest.islands[island.id] = webPath;

        if (onIslandBuilt) {
          onIslandBuilt(island);
        }
      }

      // Clean up temp directory
      await rm(tempDir, { recursive: true, force: true });
    }

    // Write manifest to disk
    await writeFile(
      join(outDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );

    // Ensure _semajsx directory exists
    await mkdir(join(outDir, "_semajsx"), { recursive: true });

    // Write client manifest for runtime resource loading
    const clientManifest = {
      css: manifest.css,
      assets: manifest.assets || {},
    };
    await writeFile(
      join(outDir, "_semajsx", "manifest.js"),
      `export default ${JSON.stringify(clientManifest)};`,
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
    if (pathname.startsWith("/_semajsx/islands/")) {
      const match = pathname.match(/\/_semajsx\/islands\/(.+)\.js/);
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
  const { readFile } = await import("fs/promises");
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

    // Serve static files from build output (under /_semajsx/ namespace)
    if (pathname.startsWith("/_semajsx/")) {
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

import { mkdir, writeFile, rm } from "fs/promises";
import { join, dirname, resolve } from "path";
import { renderToString, renderDocument } from "@semajsx/server";
import { DefaultDocument } from "./document";
import {
  RawHTML,
  type SSGConfig,
  type SSGInstance,
  type Collection,
  type CollectionEntry,
  type BuildOptions,
  type BuildResult,
  type BuildState,
  type WatchOptions,
  type Watcher,
  type DocumentProps,
} from "./types";
import { MDXProcessor } from "./mdx";

/**
 * SSG (Static Site Generator) core class
 */
export class SSG implements SSGInstance {
  private config: SSGConfig;
  private rootDir: string;
  private collections: Map<string, Collection>;
  private entriesCache: Map<string, CollectionEntry[]>;
  private mdxProcessor: MDXProcessor;

  constructor(config: SSGConfig) {
    // Resolve rootDir - defaults to process.cwd() but should be set to script location
    this.rootDir = config.rootDir ?? process.cwd();

    this.config = {
      base: "/",
      ...config,
      // Resolve outDir relative to rootDir
      outDir: resolve(this.rootDir, config.outDir),
    };
    this.collections = new Map();
    this.entriesCache = new Map();
    this.mdxProcessor = new MDXProcessor(config.mdx);

    // Register collections
    for (const collection of config.collections ?? []) {
      this.collections.set(collection.name, collection);
    }
  }

  /**
   * Get the root directory for resolving paths
   */
  getRootDir(): string {
    return this.rootDir;
  }

  /**
   * Get all entries from a collection
   */
  async getCollection<T = unknown>(
    name: string,
  ): Promise<CollectionEntry<T>[]> {
    const collection = this.collections.get(name);
    if (!collection) {
      throw new Error(`Collection "${name}" not found`);
    }

    // Check cache
    if (this.entriesCache.has(name)) {
      return this.entriesCache.get(name) as CollectionEntry<T>[];
    }

    // Load entries
    const entries = await collection.source.getEntries();

    // Validate with schema and enhance render function
    const validatedEntries = entries.map((entry) => {
      const result = collection.schema.safeParse(entry.data);
      if (!result.success) {
        throw new Error(
          `Validation error in ${name}/${entry.id}: ${result.error.message}`,
        );
      }

      // Create enhanced entry with MDX rendering capability
      return {
        ...entry,
        data: result.data,
        render: async () => {
          const compiled = await this.mdxProcessor.compile(
            entry.body,
            entry.data as Record<string, unknown>,
          );
          return {
            Content: compiled.Content,
            headings: compiled.headings,
          };
        },
      };
    });

    // Cache entries
    this.entriesCache.set(name, validatedEntries);

    return validatedEntries as CollectionEntry<T>[];
  }

  /**
   * Get a single entry from a collection
   */
  async getEntry<T = unknown>(
    name: string,
    id: string,
  ): Promise<CollectionEntry<T> | null> {
    const entries = await this.getCollection<T>(name);
    return entries.find((e) => e.id === id || e.slug === id) ?? null;
  }

  /**
   * Build the static site
   */
  async build(options: BuildOptions = {}): Promise<BuildResult> {
    const { incremental = false, state: prevState } = options;
    const outDir = this.config.outDir;

    // Initialize build state
    const state: BuildState = {
      cursors: {},
      pageHashes: {},
      timestamp: Date.now(),
    };

    const stats = {
      added: 0,
      updated: 0,
      deleted: 0,
      unchanged: 0,
    };

    const builtPaths: string[] = [];

    // Clear output directory (unless incremental)
    if (!incremental) {
      await rm(outDir, { recursive: true, force: true });
    }
    await mkdir(outDir, { recursive: true });

    // Clear cache to ensure fresh data
    this.entriesCache.clear();

    // Generate all paths
    const allPaths = await this.generateAllPaths();
    const currentPaths = new Set(allPaths.map((p) => p.path));

    // Delete removed pages in incremental mode
    if (incremental && prevState) {
      for (const oldPath of Object.keys(prevState.pageHashes)) {
        if (!currentPaths.has(oldPath)) {
          const filePath = this.pathToFilePath(oldPath);
          const fullPath = join(outDir, filePath);
          try {
            await rm(fullPath);
            stats.deleted++;
          } catch {
            // File might not exist
          }
        }
      }
    }

    // Build each path
    for (const { path, props } of allPaths) {
      const html = await this.renderPath(path, props);
      const hash = this.hashContent(html);

      // Check if we need to write this file
      const prevHash = prevState?.pageHashes[path];
      const needsWrite = !incremental || !prevHash || prevHash !== hash;

      if (needsWrite) {
        const filePath = this.pathToFilePath(path);
        const fullPath = join(outDir, filePath);

        // Ensure directory exists
        await mkdir(dirname(fullPath), { recursive: true });

        // Write HTML file
        await writeFile(fullPath, html);

        builtPaths.push(path);

        if (!prevHash) {
          stats.added++;
        } else {
          stats.updated++;
        }
      } else {
        stats.unchanged++;
      }

      // Update state
      state.pageHashes[path] = hash;
    }

    // Update cursors for each collection
    for (const [name, collection] of this.collections) {
      if (collection.source.getChanges) {
        state.cursors[name] = Date.now().toString();
      }
    }

    return {
      state,
      paths: builtPaths,
      stats,
    };
  }

  /**
   * Watch for changes and rebuild
   */
  watch(options: WatchOptions = {}): Watcher {
    const unsubscribers: (() => void)[] = [];

    // Watch each collection
    for (const [name, collection] of this.collections) {
      if (collection.source.watch) {
        const unsubscribe = collection.source.watch(async (_changes) => {
          try {
            // Clear cache for this collection
            this.entriesCache.delete(name);

            // Incremental rebuild
            const result = await this.build({ incremental: true });
            options.onRebuild?.(result);
          } catch (error) {
            options.onError?.(error as Error);
          }
        });
        unsubscribers.push(unsubscribe);
      }
    }

    return {
      close: () => {
        for (const unsubscribe of unsubscribers) {
          unsubscribe();
        }
      },
    };
  }

  /**
   * Generate all static paths from routes
   */
  private async generateAllPaths(): Promise<
    Array<{ path: string; props: Record<string, unknown> }>
  > {
    const paths: Array<{ path: string; props: Record<string, unknown> }> = [];
    const routes = this.config.routes ?? [];

    for (const route of routes) {
      if (route.getStaticPaths) {
        // Dynamic route
        const staticPaths = await route.getStaticPaths(this);
        for (const sp of staticPaths) {
          const path = this.applyParams(route.path, sp.params);
          const props = {
            ...sp.props,
            params: sp.params,
          };
          paths.push({ path, props });
        }
      } else {
        // Static route
        let props: Record<string, unknown> = {};
        if (typeof route.props === "function") {
          props = await route.props(this);
        } else if (route.props) {
          props = route.props;
        }
        paths.push({ path: route.path, props });
      }
    }

    return paths;
  }

  /**
   * Render a path to HTML
   */
  private async renderPath(
    path: string,
    props: Record<string, unknown>,
  ): Promise<string> {
    const routes = this.config.routes ?? [];
    const route = routes.find((r) => this.matchRoute(r.path, path));

    if (!route) {
      throw new Error(`No route found for path: ${path}`);
    }

    // Render the component using @semajsx/server
    const vnode = route.component(props);
    const result = renderToString(vnode);

    // Create document props
    const documentProps: DocumentProps = {
      children: new RawHTML(result.html),
      title: props.title as string | undefined,
      base: this.config.base ?? "/",
      path,
      props,
    };

    // Use custom or default document template
    const template = this.config.document ?? DefaultDocument;
    const documentVNode = template(documentProps);

    return renderDocument(documentVNode);
  }

  /**
   * Convert URL path to file path
   */
  private pathToFilePath(urlPath: string): string {
    if (urlPath === "/") {
      return "index.html";
    }
    // /blog/post -> blog/post/index.html
    return `${urlPath.slice(1)}/index.html`;
  }

  /**
   * Apply params to route pattern
   */
  private applyParams(pattern: string, params: Record<string, string>): string {
    let path = pattern;
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, value);
    }
    return path;
  }

  /**
   * Check if route pattern matches path
   */
  private matchRoute(pattern: string, path: string): boolean {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart?.startsWith(":")) {
        continue; // Dynamic segment matches anything
      }

      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  /**
   * Hash content for change detection
   */
  private hashContent(content: string): string {
    // Simple hash for now
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}

/**
 * Create an SSG instance
 */
export function createSSG(config: SSGConfig): SSGInstance {
  return new SSG(config);
}

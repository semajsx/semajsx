import type { IslandMetadata } from "../shared/types";

/**
 * Island builder - lazily builds island client-side code on demand
 */
export class IslandBuilder {
  private codeCache = new Map<string, string>();
  private buildOptions: BuildOptions;

  constructor(options: BuildOptions = {}) {
    this.buildOptions = {
      minify: options.minify ?? true,
      sourcemap: options.sourcemap ?? false,
      // Don't externalize by default - bundle everything for browser
      external: options.external ?? [],
    };
  }

  /**
   * Get or build island client code
   */
  async getCode(island: IslandMetadata): Promise<string> {
    // Check cache
    if (this.codeCache.has(island.id)) {
      return this.codeCache.get(island.id)!;
    }

    // Build the island code
    const code = await this.build(island);

    // Cache the result
    this.codeCache.set(island.id, code);

    return code;
  }

  /**
   * Clear the cache for a specific island or all islands
   */
  clearCache(islandId?: string): void {
    if (islandId) {
      this.codeCache.delete(islandId);
    } else {
      this.codeCache.clear();
    }
  }

  /**
   * Build island code
   */
  private async build(island: IslandMetadata): Promise<string> {
    const entryPoint = this.createEntryPoint(island);

    // Detect runtime environment
    // @ts-ignore - Bun is a global in Bun runtime
    if (typeof Bun !== "undefined") {
      return this.buildWithBun(entryPoint, island);
    } else {
      throw new Error(
        "Island building requires Bun runtime. Other runtimes will be supported in the future.",
      );
    }
  }

  /**
   * Build using Bun's build API
   */
  private async buildWithBun(
    entryPoint: string,
    island: IslandMetadata,
  ): Promise<string> {
    try {
      // @ts-ignore - Bun is a global in Bun runtime
      const BunGlobal = Bun;

      // Write entry point to a temporary file
      const tmpDir = "/tmp/semajsx-islands";
      await BunGlobal.write(`${tmpDir}/${island.id}.tsx`, entryPoint);

      // Build with Bun
      const result = await BunGlobal.build({
        entrypoints: [`${tmpDir}/${island.id}.tsx`],
        format: "esm",
        minify: this.buildOptions.minify,
        sourcemap: this.buildOptions.sourcemap ? "inline" : "none",
        target: "browser",
        external: this.buildOptions.external,
      });

      if (!result.success) {
        console.error("Build errors:", result.logs);
        throw new Error(`Failed to build island ${island.id}`);
      }

      const output = result.outputs[0];
      if (!output) {
        throw new Error(`No output generated for island ${island.id}`);
      }

      const code = await output.text();
      return code;
    } catch (error) {
      console.error(`Error building island ${island.id}:`, error);
      throw error;
    }
  }

  /**
   * Create entry point code for island hydration
   */
  private createEntryPoint(island: IslandMetadata): string {
    const propsJson = JSON.stringify(island.props);

    // Convert file:// URL to file system path
    const componentPath = this.normalizeModulePath(island.path);

    // Use absolute path to semajsx/dom for reliable resolution
    const semajsxDomPath = this.resolveSemajsxModule("dom");

    return `
import { render } from '${semajsxDomPath}';
import * as ComponentModule from '${componentPath}';

// Get the component (try default export first, then find first function export)
const Component = ComponentModule.default ||
                  Object.values(ComponentModule).find(exp => typeof exp === 'function');

if (!Component) {
  console.error('[Island ${island.id}] No component found in module');
} else {
  // Props from server
  const props = ${propsJson};

  // Find the placeholder element
  const placeholder = document.querySelector('[data-island-id="${island.id}"]');

  if (!placeholder) {
    console.error('[Island ${island.id}] Placeholder not found');
  } else {
    // Create VNode and render
    const vnode = Component(props);
    const parent = placeholder.parentElement;

    if (parent) {
      render(vnode, parent);
      placeholder.remove();
    }
  }
}
`.trim();
  }

  /**
   * Normalize module path (convert file:// URLs to file system paths)
   */
  private normalizeModulePath(path: string): string {
    if (path.startsWith("file://")) {
      // Convert file:// URL to file system path
      return new URL(path).pathname;
    }
    return path;
  }

  /**
   * Resolve semajsx module to absolute path
   */
  private resolveSemajsxModule(subpath: string): string {
    // Resolve relative to this file (src/server/builder.ts)
    // So dom module is at ../dom/index.ts
    const thisFilePath = import.meta.url;
    const thisFileDir = new URL(".", thisFilePath).pathname;

    // Go up one level (from src/server to src) and then into the subpath
    return `${thisFileDir}../${subpath}/index.ts`;
  }
}

/**
 * Build options for island compilation
 */
export interface BuildOptions {
  /** Minify the output code */
  minify?: boolean;
  /** Generate sourcemaps */
  sourcemap?: boolean;
  /** External packages that shouldn't be bundled */
  external?: string[];
}

/**
 * Create a new island builder
 */
export function createIslandBuilder(options?: BuildOptions): IslandBuilder {
  return new IslandBuilder(options);
}

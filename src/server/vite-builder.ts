import type { IslandMetadata } from "../shared/types";
import { createServer, type ViteDevServer } from "vite";
import path from "node:path";

/**
 * Vite-based island builder
 * Uses Vite dev server for module transformation instead of bundling
 */
export class ViteIslandBuilder {
  private vite: ViteDevServer | null = null;
  private entryPoints = new Map<string, string>();
  private options: ViteBuilderOptions;

  constructor(options: ViteBuilderOptions = {}) {
    this.options = {
      dev: options.dev ?? true,
      root: options.root ?? process.cwd(),
    };
  }

  /**
   * Initialize Vite dev server
   */
  async initialize(): Promise<void> {
    if (this.vite || !this.options.dev) {
      return;
    }

    const builder = this;

    this.vite = await createServer({
      root: this.options.root,
      server: {
        middlewareMode: true,
        hmr: false, // Disable HMR for simplicity
      },
      appType: "custom",
      resolve: {
        // Ensure Vite respects package.json "exports" field
        conditions: ["development", "module", "import", "default"],
      },
      optimizeDeps: {
        // Pre-bundle semajsx for faster loading
        include: ["semajsx", "semajsx/dom", "semajsx/signal"],
      },
      plugins: [
        {
          name: "semajsx-virtual-islands",
          resolveId(id) {
            // Handle virtual island modules
            if (id.startsWith("virtual:island-")) {
              return "\0" + id; // \0 prefix indicates virtual module
            }
          },
          load(id) {
            // Provide the code for virtual island modules
            if (id.startsWith("\0virtual:island-")) {
              const islandId = id
                .replace("\0virtual:island-", "")
                .replace(".js", "");
              // Get the raw code from the entry points map
              const rawCode = builder.entryPoints.get(islandId);
              if (rawCode) {
                return rawCode;
              }
            }
          },
        },
      ],
    });

    console.log("[SemaJSX] Vite dev server initialized");
  }

  /**
   * Get or generate island entry point code (transformed by Vite)
   */
  async getEntryPoint(island: IslandMetadata): Promise<string> {
    // Generate raw entry point code
    const rawCode = this.generateEntryPoint(island);

    // Store raw code for the plugin to access
    this.entryPoints.set(island.id, rawCode);

    // If Vite is available, transform the code to resolve bare imports
    if (this.vite) {
      try {
        // Use virtual module ID
        const virtualId = `virtual:island-${island.id}.js`;

        // Transform through Vite (which will use our plugin)
        const result = await this.vite.transformRequest(virtualId);
        if (result) {
          return result.code;
        }
      } catch (error) {
        console.warn(
          `[ViteBuilder] Could not transform entry for ${island.id}:`,
          error,
        );
      }
    }

    // Fallback: return raw code
    return rawCode;
  }

  /**
   * Transform a module URL using Vite
   */
  async transformModule(url: string): Promise<{ code: string } | null> {
    if (!this.vite) {
      throw new Error("Vite server not initialized");
    }

    try {
      const result = await this.vite.transformRequest(url);
      return result
        ? {
            code: result.code,
          }
        : null;
    } catch (error) {
      console.error(`[ViteBuilder] Error transforming ${url}:`, error);
      return null;
    }
  }

  /**
   * Generate entry point for island (with imports, no bundling)
   */
  private generateEntryPoint(island: IslandMetadata): string {
    const propsJson = JSON.stringify(island.props);

    // Normalize component path
    const componentPath = this.normalizeModulePath(island.path);

    // Generate code that imports dependencies (Vite will resolve them)
    return `
// Island hydration entry point for ${island.id}
import { render } from 'semajsx/dom';
import * as ComponentModule from '${componentPath}';

// Get the component
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
   * Normalize module path (convert file:// URLs to @fs/ paths for Vite)
   */
  private normalizeModulePath(path: string): string {
    if (path.startsWith("file://")) {
      // Convert file:// URL to @fs/ path that Vite understands
      const fsPath = new URL(path).pathname;
      return `/@fs${fsPath}`;
    }
    return path;
  }

  /**
   * Close Vite server
   */
  async close(): Promise<void> {
    if (this.vite) {
      await this.vite.close();
      this.vite = null;
    }
  }

  /**
   * Get Vite dev server instance (for middleware integration)
   */
  getViteServer(): ViteDevServer | null {
    return this.vite;
  }
}

/**
 * Vite builder options
 */
export interface ViteBuilderOptions {
  /** Enable dev mode (uses Vite dev server) */
  dev?: boolean;
  /** Project root directory */
  root?: string;
}

/**
 * Create a new Vite island builder
 */
export async function createViteIslandBuilder(
  options?: ViteBuilderOptions,
): Promise<ViteIslandBuilder> {
  const builder = new ViteIslandBuilder(options);
  await builder.initialize();
  return builder;
}

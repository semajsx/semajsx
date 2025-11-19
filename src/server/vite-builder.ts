import type { IslandMetadata } from "../shared/types";
import { createServer, type ViteDevServer } from "vite";

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

    this.vite = await createServer({
      root: this.options.root,
      server: {
        middlewareMode: true,
        hmr: false, // Disable HMR for simplicity
      },
      appType: "custom",
      optimizeDeps: {
        // Pre-bundle semajsx for faster loading
        include: ["semajsx", "semajsx/dom", "semajsx/signal"],
      },
    });

    console.log("[SemaJSX] Vite dev server initialized");
  }

  /**
   * Get or generate island entry point code
   */
  async getEntryPoint(island: IslandMetadata): Promise<string> {
    // Check cache
    if (this.entryPoints.has(island.id)) {
      return this.entryPoints.get(island.id)!;
    }

    // Generate entry point
    const code = this.generateEntryPoint(island);

    // Cache it
    this.entryPoints.set(island.id, code);

    return code;
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

/**
 * CSS Builder using lightningcss
 *
 * Processes CSS files collected during SSR rendering:
 * - Transforms modern CSS syntax
 * - Handles @import and url() paths
 * - Minifies for production
 * - Generates content hashes for cache busting
 */

import { transform, bundle, type CustomAtRules } from "lightningcss";
import { readFile, writeFile, mkdir } from "fs/promises";
import { createHash } from "crypto";
import path from "path";
import { createLogger } from "@semajsx/logger";

const logger = createLogger({ prefix: "CSS" });

/**
 * CSS build options
 */
export interface CSSBuildOptions {
  /** Minify output (default: true) */
  minify?: boolean;
  /** Generate source maps (default: false) */
  sourceMap?: boolean;
  /** Browser targets */
  targets?: {
    chrome?: number;
    firefox?: number;
    safari?: number;
    edge?: number;
  };
  /** Asset manifest for URL rewriting */
  assetManifest?: Map<string, string>;
}

/**
 * Result of CSS build
 */
export interface CSSBuildResult {
  /** Map of original path to output path */
  mapping: Map<string, string>;
  /** Total size in bytes */
  totalSize: number;
}

/**
 * Build CSS files for production
 *
 * @param cssFiles - Set of CSS file paths to build
 * @param outDir - Output directory
 * @param options - Build options
 * @returns Build result with path mapping
 */
export async function buildCSS(
  cssFiles: Set<string>,
  outDir: string,
  options: CSSBuildOptions = {},
): Promise<CSSBuildResult> {
  const { minify = true, sourceMap = false, targets, assetManifest } = options;

  const mapping = new Map<string, string>();
  let totalSize = 0;

  // Create output directory
  const cssOutDir = path.join(outDir, "css");
  await mkdir(cssOutDir, { recursive: true });

  for (const cssPath of cssFiles) {
    try {
      const content = await readFile(cssPath);
      const filename = path.basename(cssPath);
      const cssDir = path.dirname(cssPath);

      // Transform with lightningcss
      const result = transform({
        filename,
        code: content,
        minify,
        sourceMap,
        targets: targets
          ? {
              chrome: targets.chrome ? targets.chrome << 16 : undefined,
              firefox: targets.firefox ? targets.firefox << 16 : undefined,
              safari: targets.safari ? targets.safari << 16 : undefined,
              edge: targets.edge ? targets.edge << 16 : undefined,
            }
          : undefined,
        drafts: {
          customMedia: true,
        },
        // Rewrite url() paths
        visitor: {
          Url(url) {
            // Skip data URLs and absolute URLs
            if (
              url.url.startsWith("data:") ||
              url.url.startsWith("http://") ||
              url.url.startsWith("https://") ||
              url.url.startsWith("//")
            ) {
              return url;
            }

            // Resolve relative path to absolute
            let absolutePath: string;
            if (url.url.startsWith("/")) {
              absolutePath = url.url;
            } else {
              absolutePath = path.resolve(cssDir, url.url);
            }

            // Check if asset has a mapped output path
            if (assetManifest && assetManifest.has(absolutePath)) {
              return { ...url, url: assetManifest.get(absolutePath)! };
            }

            // Convert to web path (relative to project root)
            if (absolutePath.startsWith("/")) {
              return { ...url, url: `/assets${absolutePath}` };
            }

            return url;
          },
        },
      });

      // Generate content hash for cache busting
      const hash = createHash("md5")
        .update(result.code)
        .digest("hex")
        .slice(0, 8);

      const baseName = path.basename(cssPath, ".css");
      const outputName = `${baseName}-${hash}.css`;
      const outputPath = path.join(cssOutDir, outputName);

      // Write CSS file
      await writeFile(outputPath, result.code);
      totalSize += result.code.length;

      // Write source map if enabled
      if (result.map && sourceMap) {
        await writeFile(`${outputPath}.map`, result.map);
      }

      // Record mapping (use web path)
      mapping.set(cssPath, `/css/${outputName}`);

      logger.debug(
        `Built ${cssPath} -> ${outputName} (${result.code.length} bytes)`,
      );
    } catch (error) {
      logger.error(`Failed to build CSS ${cssPath}: ${error}`);
      throw error;
    }
  }

  logger.info(
    `Built ${cssFiles.size} CSS files (${(totalSize / 1024).toFixed(1)} KB)`,
  );

  return { mapping, totalSize };
}

/**
 * Transform CSS for development (no minification)
 *
 * @param cssPath - Path to CSS file
 * @returns Transformed CSS code
 */
export async function transformCSSForDev(cssPath: string): Promise<string> {
  const content = await readFile(cssPath);
  const filename = path.basename(cssPath);

  const result = transform({
    filename,
    code: content,
    minify: false,
    sourceMap: false,
    drafts: {
      customMedia: true,
    },
  });

  return result.code.toString();
}

/**
 * Bundle multiple CSS files into one
 *
 * @param entryPath - Main CSS entry point (can @import others)
 * @param outDir - Output directory
 * @param options - Build options
 * @returns Output path
 */
export async function bundleCSSFile(
  entryPath: string,
  outDir: string,
  options: CSSBuildOptions = {},
): Promise<string> {
  const { minify = true, sourceMap = false, targets } = options;

  const result = bundle<CustomAtRules>({
    filename: entryPath,
    minify,
    sourceMap,
    targets: targets
      ? {
          chrome: targets.chrome ? targets.chrome << 16 : undefined,
          firefox: targets.firefox ? targets.firefox << 16 : undefined,
          safari: targets.safari ? targets.safari << 16 : undefined,
          edge: targets.edge ? targets.edge << 16 : undefined,
        }
      : undefined,
    drafts: {
      customMedia: true,
    },
  });

  // Generate hash and output path
  const hash = createHash("md5").update(result.code).digest("hex").slice(0, 8);

  const baseName = path.basename(entryPath, ".css");
  const outputName = `${baseName}-${hash}.css`;
  const cssOutDir = path.join(outDir, "css");
  const outputPath = path.join(cssOutDir, outputName);

  await mkdir(cssOutDir, { recursive: true });
  await writeFile(outputPath, result.code);

  if (result.map && sourceMap) {
    await writeFile(`${outputPath}.map`, result.map);
  }

  return `/css/${outputName}`;
}

/**
 * Analyze CSS dependencies and generate optimal chunks
 *
 * @param cssPerEntry - Map of entry name to CSS file paths
 * @param sharedThreshold - Number of entries a CSS must be used by to be shared
 * @returns Chunk plan
 */
export function analyzeCSSChunks(
  cssPerEntry: Map<string, string[]>,
  sharedThreshold: number = 2,
): {
  shared: string[];
  perEntry: Map<string, string[]>;
} {
  // Count usage of each CSS file
  const cssUsage = new Map<string, Set<string>>();

  for (const [entry, cssFiles] of cssPerEntry) {
    for (const css of cssFiles) {
      if (!cssUsage.has(css)) {
        cssUsage.set(css, new Set());
      }
      cssUsage.get(css)!.add(entry);
    }
  }

  // Separate shared and per-entry CSS
  const shared: string[] = [];
  const perEntry = new Map<string, string[]>();

  for (const [css, entries] of cssUsage) {
    if (entries.size >= sharedThreshold) {
      shared.push(css);
    } else {
      for (const entry of entries) {
        if (!perEntry.has(entry)) {
          perEntry.set(entry, []);
        }
        perEntry.get(entry)!.push(css);
      }
    }
  }

  return { shared, perEntry };
}

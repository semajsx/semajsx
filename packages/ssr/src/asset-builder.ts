/**
 * Asset Builder
 *
 * Processes static assets collected during SSR rendering:
 * - Copies to output directory
 * - Generates content hashes for cache busting
 * - Creates manifest for URL rewriting
 */

import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { createHash } from "crypto";
import path from "path";
import { createLogger } from "@semajsx/logger";

const logger = createLogger({ prefix: "Asset" });

/**
 * Asset build options
 */
export interface AssetBuildOptions {
  /** Output subdirectory name (default: 'assets') */
  subdir?: string;
}

/**
 * Result of asset build
 */
export interface AssetBuildResult {
  /** Map of original path to output path */
  mapping: Map<string, string>;
  /** Total size in bytes */
  totalSize: number;
}

/**
 * Build assets for production
 *
 * @param assetFiles - Set of asset file paths to build
 * @param outDir - Output directory
 * @param options - Build options
 * @returns Build result with path mapping
 */
export async function buildAssets(
  assetFiles: Set<string>,
  outDir: string,
  options: AssetBuildOptions = {},
): Promise<AssetBuildResult> {
  const { subdir = "assets" } = options;

  const mapping = new Map<string, string>();
  let totalSize = 0;

  // Create output directory
  const assetsOutDir = path.join(outDir, subdir);
  await mkdir(assetsOutDir, { recursive: true });

  for (const assetPath of assetFiles) {
    try {
      const content = await readFile(assetPath);
      const ext = path.extname(assetPath);
      const baseName = path.basename(assetPath, ext);

      // Generate content hash for cache busting
      const hash = createHash("md5").update(content).digest("hex").slice(0, 8);

      const outputName = `${baseName}-${hash}${ext}`;
      const outputPath = path.join(assetsOutDir, outputName);

      // Copy file
      await writeFile(outputPath, content);
      totalSize += content.length;

      // Record mapping (use web path)
      mapping.set(assetPath, `/${subdir}/${outputName}`);

      logger.debug(
        `Built ${assetPath} -> ${outputName} (${content.length} bytes)`,
      );
    } catch (error) {
      logger.error(`Failed to build asset ${assetPath}: ${error}`);
      throw error;
    }
  }

  logger.info(
    `Built ${assetFiles.size} assets (${(totalSize / 1024).toFixed(1)} KB)`,
  );

  return { mapping, totalSize };
}

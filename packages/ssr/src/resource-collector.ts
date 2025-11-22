/**
 * Resource collector - collects CSS and assets using capture patterns
 */

import { glob } from "glob";
import { minimatch } from "minimatch";
import { basename, dirname, extname, join } from "path";
import { existsSync } from "fs";
import type { ResourceConfig } from "./shared/types";

export interface CollectedResources {
  css: Set<string>;
  assets: Set<string>;
}

/**
 * Collect resources based on configuration
 *
 * @param entryFiles - Entry files to apply capture patterns to (routes, islands)
 * @param config - Resource collection configuration
 * @param rootDir - Project root directory
 * @returns Collected CSS and asset paths
 */
export async function collectResources(
  entryFiles: string[],
  config: ResourceConfig,
  rootDir: string,
): Promise<CollectedResources> {
  const css = new Set<string>();
  const assets = new Set<string>();

  // Collect from capture patterns
  if (config.capture) {
    const capturedFiles = await collectFromCapture(
      entryFiles,
      config.capture,
      rootDir,
    );
    for (const file of capturedFiles) {
      categorizeResource(file, css, assets);
    }
  }

  // Collect from include patterns
  if (config.include) {
    const includedFiles = await collectFromGlobs(
      config.include,
      config.exclude || [],
      rootDir,
    );
    for (const file of includedFiles) {
      categorizeResource(file, css, assets);
    }
  }

  return { css, assets };
}

/**
 * Collect resources using capture patterns
 */
async function collectFromCapture(
  entryFiles: string[],
  captureRules: Record<string, string[]>,
  rootDir: string,
): Promise<string[]> {
  const collected: string[] = [];

  // Sort capture rules by specificity (more specific patterns first)
  const sortedRules = sortCaptureRulesBySpecificity(captureRules);

  for (const entryFile of entryFiles) {
    // Make path relative to root for matching
    const relativePath = entryFile.startsWith(rootDir)
      ? entryFile.slice(rootDir.length + 1)
      : entryFile;

    // Find matching capture rule
    for (const [pattern, capturePatterns] of sortedRules) {
      if (minimatch(relativePath, pattern)) {
        // Apply capture patterns
        const captured = applyCapturePatterns(
          entryFile,
          capturePatterns,
          rootDir,
        );
        collected.push(...captured);
        break; // Use first matching rule (most specific)
      }
    }
  }

  return collected;
}

/**
 * Sort capture rules by specificity
 * More specific patterns (longer, more path segments) come first
 */
function sortCaptureRulesBySpecificity(
  rules: Record<string, string[]>,
): [string, string[]][] {
  return Object.entries(rules).sort(([a], [b]) => {
    // Count path segments
    const aSegments = a.split("/").length;
    const bSegments = b.split("/").length;
    if (aSegments !== bSegments) {
      return bSegments - aSegments;
    }

    // Count non-wildcard characters
    const aNonWild = a.replace(/[*?]/g, "").length;
    const bNonWild = b.replace(/[*?]/g, "").length;
    return bNonWild - aNonWild;
  });
}

/**
 * Apply capture patterns to an entry file
 */
function applyCapturePatterns(
  entryFile: string,
  patterns: string[],
  rootDir: string,
): string[] {
  const collected: string[] = [];
  const dir = dirname(entryFile);
  const ext = extname(entryFile);
  const capture = basename(entryFile, ext);

  for (const pattern of patterns) {
    // Replace ${capture} with the base filename
    const fileName = pattern.replace(/\$\{capture\}/g, capture);
    const filePath = join(dir, fileName);

    // Check if file exists
    if (existsSync(filePath)) {
      collected.push(filePath);
    }
  }

  return collected;
}

/**
 * Collect files using glob patterns
 */
async function collectFromGlobs(
  include: string[],
  exclude: string[],
  rootDir: string,
): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of include) {
    const matches = await glob(pattern, {
      cwd: rootDir,
      absolute: true,
      ignore: exclude,
    });
    files.push(...matches);
  }

  return files;
}

/**
 * Categorize a resource file as CSS or asset
 */
function categorizeResource(
  filePath: string,
  css: Set<string>,
  assets: Set<string>,
): void {
  const ext = extname(filePath).toLowerCase();

  if (ext === ".css") {
    css.add(filePath);
  } else if (isAssetExtension(ext)) {
    assets.add(filePath);
  }
}

/**
 * Check if extension is a known asset type
 */
function isAssetExtension(ext: string): boolean {
  const assetExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".otf",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
    ".pdf",
  ];
  return assetExtensions.includes(ext);
}

/**
 * Get all entry files from routes and islands
 */
export function getEntryFiles(
  islandPaths: string[],
  moduleGraph?: Map<string, string[]>,
): string[] {
  const entries = new Set<string>(islandPaths);

  // If module graph is available, include dependencies
  if (moduleGraph) {
    for (const islandPath of islandPaths) {
      const deps = moduleGraph.get(islandPath);
      if (deps) {
        for (const dep of deps) {
          entries.add(dep);
        }
      }
    }
  }

  return Array.from(entries);
}

/**
 * Virtual modules plugin for Vite
 *
 * Allows build entries to be virtual (in-memory) instead of on disk.
 * This avoids temporary directory management and simplifies path handling.
 */

import { resolve, normalize } from "path";
import type { Plugin } from "vite";

export interface VirtualModulesOptions {
  [id: string]: string;
}

/**
 * Create a Vite plugin for virtual modules
 */
export function virtualModules(modules: VirtualModulesOptions): Plugin {
  // Normalize all paths and create lookup maps
  const normalizedModules = new Map<string, string>();

  Object.keys(modules).forEach((id) => {
    // Normalize and resolve to absolute path
    const normalizedId = normalize(resolve(id));
    normalizedModules.set(normalizedId, modules[id]!);
  });

  function findModuleContent(id: string): string | null {
    // Normalize the incoming id
    const normalizedId = normalize(resolve(id));

    // Check normalized map
    if (normalizedModules.has(normalizedId)) {
      return normalizedModules.get(normalizedId)!;
    }

    return null;
  }

  return {
    name: "semajsx-virtual-modules",
    enforce: "pre", // Run before other plugins

    resolveId(id) {
      const content = findModuleContent(id);
      if (content !== null) {
        // Return the normalized absolute path
        return normalize(resolve(id));
      }

      return null;
    },

    load(id) {
      const content = findModuleContent(id);
      if (content !== null) {
        return content;
      }
      return null;
    },
  };
}

/**
 * Virtual modules plugin for Vite
 *
 * Allows build entries to be virtual (in-memory) instead of on disk.
 * This avoids temporary directory management and simplifies path handling.
 */

import { resolve, dirname } from "path";
import type { Plugin } from "vite";

export interface VirtualModulesOptions {
  [id: string]: string;
}

/**
 * Create a Vite plugin for virtual modules
 */
export function virtualModules(modules: VirtualModulesOptions): Plugin {
  const resolvedIds = new Map<string, string>();

  // Pre-resolve all module paths
  Object.keys(modules).forEach((id) => {
    resolvedIds.set(resolve(id), modules[id]!);
  });

  function findModuleContent(id: string): string | null {
    // Direct match
    if (id in modules) {
      return modules[id]!;
    }

    // Try without leading slash
    const withoutSlash = id.startsWith("/") ? id.slice(1) : id;
    if (withoutSlash in modules) {
      return modules[withoutSlash]!;
    }

    // Try with leading slash
    const withSlash = id.startsWith("/") ? id : `/${id}`;
    if (withSlash in modules) {
      return modules[withSlash]!;
    }

    // Try resolved path
    if (resolvedIds.has(id)) {
      return resolvedIds.get(id)!;
    }

    return null;
  }

  function isVirtualModule(id: string): boolean {
    return findModuleContent(id) !== null;
  }

  return {
    name: "semajsx-virtual-modules",

    resolveId(id, importer) {
      if (isVirtualModule(id)) {
        return id;
      }

      // Resolve relative imports from virtual modules
      if (importer) {
        const resolved = resolve(dirname(importer), id);
        if (resolvedIds.has(resolved)) {
          return resolved;
        }
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

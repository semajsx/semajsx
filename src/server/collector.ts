import type { VNode } from "../runtime/types";
import type { IslandMetadata } from "../shared/types";
import { isIslandVNode, getIslandMetadata } from "./island";
import { Fragment } from "../runtime/types";

/**
 * Island collector - traverses VNode tree and collects island metadata
 */
export class IslandCollector {
  private islands: IslandMetadata[] = [];
  private counter = 0;

  /**
   * Collect all islands from a VNode tree
   */
  collect(vnode: VNode): IslandMetadata[] {
    this.islands = [];
    this.counter = 0;
    this.traverse(vnode);
    return this.islands;
  }

  /**
   * Traverse VNode tree and collect islands
   */
  private traverse(vnode: VNode | null | undefined): void {
    if (!vnode) return;

    // Check if this VNode is an island
    if (isIslandVNode(vnode)) {
      const metadata = getIslandMetadata(vnode);
      if (metadata) {
        this.islands.push({
          id: `island-${this.counter++}`,
          path: metadata.modulePath,
          props: this.serializeProps(metadata.props),
          componentName:
            typeof vnode.type === "function" ? vnode.type.name : undefined,
        });
      }
      // Don't traverse into island children - they will be rendered on client
      return;
    }

    // Handle fragments
    if (vnode.type === Fragment) {
      for (const child of vnode.children) {
        this.traverse(child);
      }
      return;
    }

    // Handle function components - need to render them first
    if (typeof vnode.type === "function") {
      try {
        const result = vnode.type(vnode.props || {});
        // If result is a VNode, traverse it
        if (result && typeof result === "object" && "type" in result) {
          this.traverse(result as VNode);
        }
      } catch (error) {
        console.warn("Error rendering component during collection:", error);
      }
      return;
    }

    // Traverse children
    if (vnode.children && Array.isArray(vnode.children)) {
      for (const child of vnode.children) {
        this.traverse(child);
      }
    }
  }

  /**
   * Serialize props for client-side hydration
   * Handles common types and warns about non-serializable values
   */
  private serializeProps(props: any): Record<string, any> {
    if (!props || typeof props !== "object") {
      return {};
    }

    const serialized: Record<string, any> = {};

    for (const [key, value] of Object.entries(props)) {
      // Skip functions (event handlers, callbacks)
      if (typeof value === "function") {
        continue;
      }

      // Skip symbols
      if (typeof value === "symbol") {
        continue;
      }

      // Skip undefined
      if (value === undefined) {
        continue;
      }

      // Handle null, boolean, number, string
      if (
        value === null ||
        typeof value === "boolean" ||
        typeof value === "number" ||
        typeof value === "string"
      ) {
        serialized[key] = value;
        continue;
      }

      // Handle arrays and plain objects
      if (Array.isArray(value) || isPlainObject(value)) {
        try {
          // Test if it's JSON-serializable
          JSON.stringify(value);
          serialized[key] = value;
        } catch (error) {
          console.warn(`Cannot serialize prop "${key}":`, error);
        }
        continue;
      }

      console.warn(
        `Skipping non-serializable prop "${key}" of type ${typeof value}`,
      );
    }

    return serialized;
  }
}

/**
 * Check if a value is a plain object
 */
function isPlainObject(value: any): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Create a new island collector
 */
export function createIslandCollector(): IslandCollector {
  return new IslandCollector();
}

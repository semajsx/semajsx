/**
 * Server-side utilities for SSR with Island architecture
 */

// Island marking
export { island, isIslandComponent, isIslandVNode } from "./island";

// SSR rendering
export { renderToString } from "./render";

// Router
export { createRouter, Router } from "./router";

// Builder (for advanced usage)
export { createIslandBuilder, type BuildOptions } from "./builder";

// Collector (for advanced usage)
export { createIslandCollector, IslandCollector } from "./collector";

// Re-export shared types
export type {
  IslandMetadata,
  SSRResult,
  RouteHandler,
  RouterConfig,
} from "../shared/types";

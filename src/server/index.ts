/**
 * Server-side utilities for SSR with Island architecture
 */

// Island marking
export { island, isIslandComponent, isIslandVNode } from "./island";

// SSR rendering
export { renderToString } from "./render";

// Router (Vite-powered)
export { createViteRouter, ViteRouter } from "./vite-router";

// Builder (for advanced usage)
export {
  createViteIslandBuilder,
  type ViteBuilderOptions,
} from "./vite-builder";

// Collector (for advanced usage)
export { createIslandCollector, IslandCollector } from "./collector";

// Re-export shared types
export type {
  IslandMetadata,
  SSRResult,
  RouteHandler,
  RouterConfig,
} from "../shared/types";

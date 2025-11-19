/**
 * Server-side utilities for SSR with Island architecture
 */

// Island marking
export { island, isIslandComponent, isIslandVNode } from "./island";

// SSR rendering
export { renderToString } from "./render";

// Routers
export { createRouter, Router } from "./router"; // Legacy bundled router
export { createViteRouter, ViteRouter } from "./vite-router"; // New Vite-powered router

// Builders (for advanced usage)
export { createIslandBuilder, type BuildOptions } from "./builder";
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

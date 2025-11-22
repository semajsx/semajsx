/**
 * Server-side utilities for SSR with Island architecture
 */

// Main App API (recommended)
export { createApp } from "./app";

// SSR rendering
export { renderToString } from "./render";

// Router (Vite-powered) - legacy API, use createApp instead
export { createViteRouter, ViteRouter } from "./vite-router";

// Builder (for advanced usage)
export {
  createViteIslandBuilder,
  ViteIslandBuilder,
  type ViteBuilderOptions,
} from "./vite-builder";

// Collector (for advanced usage)
export { createIslandCollector, IslandCollector } from "./collector";

// Document templates
export { DefaultDocument, renderDocument } from "./document";

// Re-export shared types
export type {
  IslandMetadata,
  IslandScriptContext,
  IslandScriptTransformer,
  RenderToStringOptions,
  SSRResult,
  RouteContext,
  RouteHandler,
  RouterConfig,
  DocumentTemplate,
  // App API types
  App,
  AppConfig,
  BuildOptions,
  DevOptions,
  BuildResult,
  RenderResult,
} from "./shared/types";

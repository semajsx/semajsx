// Core SSG
export { createSSG, SSG } from "./ssg";

// Collection
export { defineCollection } from "./collection";

// Sources
export {
  fileSource,
  gitSource,
  remoteSource,
  createSource,
  BaseSource,
  FileSource,
  GitSource,
  RemoteSource,
  CustomSource,
} from "./sources";

// Re-export zod for convenience
export { z } from "zod";

// Types
export type {
  // Core types
  SSGConfig,
  SSGInstance,
  CollectionEntry,
  Collection,
  CollectionConfig,
  CollectionSource,
  ChangeSet,
  WatchCallback,

  // Route types
  RouteConfig,
  StaticPath,

  // Build types
  BuildOptions,
  BuildResult,
  BuildState,

  // Watch types
  WatchOptions,
  Watcher,

  // MDX types
  MDXConfig,
} from "./types";

export type {
  // Source types
  FileSourceOptions,
  GitSourceOptions,
  GitCommitSourceOptions,
  GitTagSourceOptions,
  RemoteSourceOptions,
  WebhookConfig,
  CustomSourceOptions,
} from "./sources";

/**
 * Client-side utilities for SemaJSX islands
 */

export {
  hydrate,
  hydrateIsland,
  hydrateIslands,
  hydrateIslandById,
  hasIslands,
  getIslandIds,
  getIslandInfo,
  markIslandHydrated,
} from "./hydrate";

export type { IslandInfo } from "./hydrate";

export {
  island,
  isIslandComponent,
  isIslandVNode,
  getIslandMetadata,
} from "./island";

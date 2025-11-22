/**
 * Client-side utilities for SemaJSX islands
 */

export {
  hydrateIslands,
  hydrateIslandById,
  hasIslands,
  getIslandIds,
  markIslandHydrated,
} from "./hydrate";

export { hydrate, hydrateIsland } from "./core-hydrate";

export {
  island,
  isIslandComponent,
  isIslandVNode,
  getIslandMetadata,
} from "./island";

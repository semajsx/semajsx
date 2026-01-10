import { defineConfig } from "vitest/config";

/**
 * Unit test configuration - excludes browser-dependent packages
 * Use this when Playwright browsers are not available
 */
export default defineConfig({
  test: {
    projects: [
      "packages/signal",
      "packages/terminal",
      "packages/ssr",
      "packages/ssg",
      "packages/utils",
    ],
  },
});

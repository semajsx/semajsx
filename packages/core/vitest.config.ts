import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

export default defineConfig({
  esbuild: {
    jsxImportSource: "@semajsx/core",
  },
  resolve: {
    alias: {
      "@semajsx/core": path.resolve(__dirname, "./src/index.ts"),
      "@semajsx/signal": path.resolve(__dirname, "../signal/src/index.ts"),
      "@semajsx/utils": path.resolve(__dirname, "../utils/src/index.ts"),
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});

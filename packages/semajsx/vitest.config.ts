import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import path from "path";

export default defineConfig({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
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

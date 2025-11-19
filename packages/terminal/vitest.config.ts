import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@semajsx/terminal": resolve(__dirname, "./src/index.ts"),
      "@semajsx/core": resolve(__dirname, "../core/src/index.ts"),
      "@semajsx/signal": resolve(__dirname, "../signal/src/index.ts"),
      "@semajsx/utils": resolve(__dirname, "../utils/src/index.ts"),
    },
  },
});

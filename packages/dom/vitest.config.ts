import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.{ts,tsx}"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@semajsx/dom": resolve(__dirname, "./src/index.ts"),
      "@semajsx/dom/jsx-runtime": resolve(__dirname, "./src/jsx-runtime.ts"),
      "@semajsx/dom/jsx-dev-runtime": resolve(
        __dirname,
        "./src/jsx-dev-runtime.ts",
      ),
      "@semajsx/core": resolve(__dirname, "../core/src/index.ts"),
      "@semajsx/signal": resolve(__dirname, "../signal/src/index.ts"),
      "@semajsx/utils": resolve(__dirname, "../utils/src/index.ts"),
    },
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@semajsx/signal": path.resolve(__dirname, "./src/index.ts"),
      "@semajsx/utils": path.resolve(__dirname, "../utils/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

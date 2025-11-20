import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});

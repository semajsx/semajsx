import { defineProject } from "vitest/config";

export default defineProject({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});

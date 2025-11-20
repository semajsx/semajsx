import { defineProject } from "vitest/config";

export default defineProject({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});

import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    exclude: [
      "tests/**/*.browser.test.ts",
      "tests/**/*.browser.test.tsx",
      "tests/dom/**/*.test.tsx",
      "tests/runtime/render.test.tsx",
      "tests/runtime/jsx.test.tsx",
      "tests/runtime/async.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/types.ts",
        "src/jsx-runtime.ts",
        "src/jsx-dev-runtime.ts",
      ],
    },
  },
});

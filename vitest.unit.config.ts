import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests don't need browser environment
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/**/*.browser.test.ts", "tests/**/*.browser.test.tsx"],
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

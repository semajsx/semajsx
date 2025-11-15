import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/signal": path.resolve(__dirname, "./src/signal"),
      "@/runtime": path.resolve(__dirname, "./src/runtime"),
      "@/dom": path.resolve(__dirname, "./src/dom"),
      "@/terminal": path.resolve(__dirname, "./src/terminal"),
    },
  },
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

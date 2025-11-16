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
      "semajsx": path.resolve(__dirname, "./src/index.ts"),
      "semajsx/signal": path.resolve(__dirname, "./src/signal/index.ts"),
      "semajsx/dom": path.resolve(__dirname, "./src/dom/index.ts"),
      "semajsx/dom/jsx-runtime": path.resolve(__dirname, "./src/dom/jsx-runtime.ts"),
      "semajsx/dom/jsx-dev-runtime": path.resolve(__dirname, "./src/dom/jsx-dev-runtime.ts"),
      "semajsx/terminal": path.resolve(__dirname, "./src/terminal/index.ts"),
      "semajsx/terminal/jsx-runtime": path.resolve(__dirname, "./src/terminal/jsx-runtime.ts"),
      "semajsx/terminal/jsx-dev-runtime": path.resolve(__dirname, "./src/terminal/jsx-dev-runtime.ts"),
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

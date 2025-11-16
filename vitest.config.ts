import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
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
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});

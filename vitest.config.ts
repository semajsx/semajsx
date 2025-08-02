import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Browser mode configuration (Vitest 3.x syntax)
    browser: {
      enabled: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      provider: "playwright",
      headless: true,
    },

    // Test setup files
    setupFiles: ["./packages/sema/test/setup.ts"],

    // Include browser test files
    include: [
      "packages/**/*.browser.test.{js,ts,tsx}",
      "packages/**/*.component.test.{js,ts,tsx}",
    ],

    // Global setup
    globals: true,

    // Reporter
    reporters: ["verbose"],

    // Coverage (disabled for now)
    coverage: {
      enabled: false,
    },
  },

  // Resolve configuration for imports
  resolve: {
    alias: {
      semajsx: path.resolve(__dirname, "./packages/sema/index.ts"),
      "semajsx/jsx-runtime": path.resolve(
        __dirname,
        "./packages/sema/jsx-runtime.ts",
      ),
      "semajsx/jsx-dev-runtime": path.resolve(
        __dirname,
        "./packages/sema/jsx-runtime.ts",
      ),
      "semajsx/cli": path.resolve(
        __dirname,
        "./packages/sema/platforms/cli/index.ts",
      ),
      "semajsx/server": path.resolve(
        __dirname,
        "./packages/sema/platforms/server/index.ts",
      ),
      "semajsx/dom": path.resolve(
        __dirname,
        "./packages/sema/platforms/dom/index.ts",
      ),
      "@": path.resolve(__dirname, "./packages/sema/"),
    },
  },

  // esbuild configuration for JSX
  esbuild: {
    jsx: "transform",
    jsxFactory: "createElement",
    jsxFragment: "Fragment",
    jsxInject: `import { createElement, Fragment } from 'semajsx'`,
  },
});

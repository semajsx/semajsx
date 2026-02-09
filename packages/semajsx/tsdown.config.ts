import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/signal/index.ts",
    "src/dom/index.ts",
    "src/dom/jsx-runtime.ts",
    "src/dom/jsx-dev-runtime.ts",
    "src/terminal/index.ts",
    "src/terminal/jsx-runtime.ts",
    "src/terminal/jsx-dev-runtime.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: [
    // Terminal third-party deps (not bundled)
    "yoga-layout-prebuilt",
    "chalk",
    "ansi-escapes",
    "wrap-ansi",
    "slice-ansi",
    "string-width",
    "cli-boxes",
  ],
  exports: {
    devExports: true,
  },
});

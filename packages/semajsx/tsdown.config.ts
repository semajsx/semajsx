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
  dts: false,
  clean: true,
  sourcemap: true,
  external: [
    "@semajsx/core",
    "@semajsx/dom",
    "@semajsx/server",
    "@semajsx/signal",
    "@semajsx/terminal",
    "@semajsx/utils",
  ],
  exports: {
    all: true,
    devExports: true,
  },
});

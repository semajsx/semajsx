import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/client/index.ts"],
  format: ["esm"],
  unbundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "@semajsx/core",
    "@semajsx/dom",
    "@semajsx/logger",
    "@semajsx/signal",
    "vite",
  ],
  exports: {
    all: true,
    devExports: true,
  },
});

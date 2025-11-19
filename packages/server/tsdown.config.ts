import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/client/index.ts"],
  format: ["esm"],
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
});

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    "@semajsx/core",
    "@semajsx/signal",
    "@semajsx/utils",
    "ansi-escapes",
    "chalk",
    "cli-boxes",
    "slice-ansi",
    "string-width",
    "wrap-ansi",
    "yoga-layout-prebuilt",
  ],
});

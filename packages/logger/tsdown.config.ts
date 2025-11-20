import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  unbundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["@semajsx/core", "@semajsx/terminal", "@semajsx/utils"],
  exports: {
    devExports: true,
  },
});

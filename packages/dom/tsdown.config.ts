import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
  format: ["esm"],
  unbundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["@semajsx/core", "@semajsx/signal", "@semajsx/utils"],
  exports: {
    all: true,
    devExports: true,
  },
});

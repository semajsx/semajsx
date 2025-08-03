import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
  format: "esm",
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  external: ["@semajsx/core", "@semajsx/core/jsx-runtime"],
});

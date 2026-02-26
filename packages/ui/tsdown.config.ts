import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/theme/index.ts", "src/components/button/index.ts"],
  format: ["esm"],
  unbundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  exports: {
    devExports: true,
  },
});

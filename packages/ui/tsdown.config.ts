import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/theme/index.ts",
    "src/components/avatar/index.ts",
    "src/components/badge/index.ts",
    "src/components/button/index.ts",
    "src/components/callout/index.ts",
    "src/components/card/index.ts",
    "src/components/code-block/index.ts",
    "src/components/input/index.ts",
    "src/components/kbd/index.ts",
    "src/components/separator/index.ts",
    "src/components/steps/index.ts",
    "src/components/switch/index.ts",
    "src/components/tabs/index.ts",
    "src/css.ts",
  ],
  format: ["esm"],
  unbundle: true,
  dts: true,
  clean: true,
  sourcemap: true,
  exports: {
    devExports: true,
  },
});

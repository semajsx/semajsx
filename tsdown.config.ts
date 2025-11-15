import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "jsx-runtime": "src/jsx-runtime.ts",
    "jsx-dev-runtime": "src/jsx-dev-runtime.ts",
    "signal/index": "src/signal/index.ts",
    "terminal/index": "src/terminal/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: false,
  tsconfig: "tsconfig.build.json",
  platform: "neutral",
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
      "@/signal": "./src/signal",
      "@/runtime": "./src/runtime",
      "@/dom": "./src/dom",
      "@/terminal": "./src/terminal",
    };
  },
});

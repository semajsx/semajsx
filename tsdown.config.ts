import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "signal/index": "src/signal/index.ts",
    "dom/index": "src/dom/index.ts",
    "dom/jsx-runtime": "src/dom/jsx-runtime.ts",
    "dom/jsx-dev-runtime": "src/dom/jsx-dev-runtime.ts",
    "terminal/index": "src/terminal/index.ts",
    "terminal/jsx-runtime": "src/terminal/jsx-runtime.ts",
    "terminal/jsx-dev-runtime": "src/terminal/jsx-dev-runtime.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: false,
  tsconfig: "tsconfig.lib.json",
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

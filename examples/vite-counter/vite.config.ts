import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      semajsx: resolve(__dirname, "../../src/index.ts"),
      "semajsx/jsx-runtime": resolve(__dirname, "../../src/jsx-runtime.ts"),
      "semajsx/jsx-dev-runtime": resolve(
        __dirname,
        "../../src/jsx-dev-runtime.ts",
      ),
      "semajsx/signal": resolve(__dirname, "../../src/signal/index.ts"),
      "semajsx/terminal": resolve(__dirname, "../../src/terminal/index.ts"),
      "@/": resolve(__dirname, "../../src/"),
    },
  },
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxInject: `import { h, Fragment } from 'semajsx'`,
  },
});

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/signal/index.ts",
    "src/dom/index.ts",
    "src/dom/jsx-runtime.ts",
    "src/dom/jsx-dev-runtime.ts",
    "src/terminal/index.ts",
    "src/terminal/jsx-runtime.ts",
    "src/terminal/jsx-dev-runtime.ts",
    "src/ssr/index.ts",
    "src/ssr/client.ts",
    "src/ssg/index.ts",
    "src/tailwind/index.ts",
    "src/style/index.ts",
    "src/style/react.ts",
    "src/style/vue.ts",
  ],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  external: [
    // Terminal
    "yoga-layout-prebuilt",
    "chalk",
    "ansi-escapes",
    "wrap-ansi",
    "slice-ansi",
    "string-width",
    "cli-boxes",
    // SSR
    "glob",
    "lightningcss",
    "minimatch",
    // SSG
    "@mdx-js/mdx",
    "gray-matter",
    "zod",
    // SSR/SSG optional
    "vite",
    // Style framework integrations
    "react",
    "react-dom",
    "vue",
  ],
  exports: {
    devExports: true,
  },
});

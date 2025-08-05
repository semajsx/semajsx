import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx({
      jsxImportSource: "@semajsx/web",
      jsxRuntime: "automatic",
      development: false,
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: {
              light: "vitesse-light",
              dark: "vitesse-dark",
            },
          },
        ],
      ],
      remarkPlugins: [remarkGfm, remarkFrontmatter],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".mdx"],
    alias: {
      "@/": "/src",
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@semajsx/web",
  },
});

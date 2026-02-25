import remarkGfm from "remark-gfm";
import rehypeShiki from "@shikijs/rehype";
import type { ShikiTransformer } from "@shikijs/types";
import { createSSG, fileSource } from "semajsx/ssg";
import { docsTheme } from "semajsx/ssg/plugins/docs-theme";

const rootDir = import.meta.dir;

const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  plugins: [
    docsTheme({
      title: "SemaJSX Documentation",
      description:
        "A lightweight, signal-based reactive JSX runtime for building modern web applications.",
      nav: {
        logo: "SemaJSX",
        links: [
          { label: "Docs", href: "/docs" },
          { label: "Guides", href: "/guides" },
          { label: "GitHub", href: "https://github.com/semajsx/semajsx", external: true },
        ],
      },
      hero: {
        title: "SemaJSX",
        subtitle:
          "A lightweight, signal-based reactive JSX runtime. Fine-grained updates. No virtual DOM.",
        actions: [
          { label: "Get Started", href: "/docs/getting-started", primary: true },
          { label: "View Guides", href: "/guides" },
        ],
      },
      features: {
        title: "Why SemaJSX?",
        subtitle: "Simple primitives. Powerful results.",
        items: [
          {
            icon: "\u26A1",
            title: "Fine-Grained Reactivity",
            description:
              "Signals automatically track dependencies and update only what changed. No virtual DOM diffing overhead.",
          },
          {
            icon: "\uD83D\uDCE6",
            title: "Modular Architecture",
            description:
              "Choose what you need: DOM rendering, Terminal UI, SSR, or SSG. All sharing the same reactive core.",
          },
          {
            icon: "\uD83C\uDFAF",
            title: "Type-Safe",
            description:
              "Full TypeScript support with comprehensive type inference and IDE autocompletion out of the box.",
          },
        ],
      },
      quickLinks: {
        title: "Get started in seconds.",
        subtitle: "Everything you need to build reactive applications.",
        items: [
          {
            title: "Documentation",
            description: "API reference and core concepts.",
            href: "/docs",
          },
          {
            title: "Guides",
            description: "Step-by-step tutorials and examples.",
            href: "/guides",
          },
        ],
      },
      footer: {
        links: [
          { label: "Documentation", href: "/docs" },
          { label: "Guides", href: "/guides" },
          { label: "GitHub", href: "https://github.com/semajsx/semajsx" },
        ],
        copyright: "SemaJSX",
      },
      docs: {
        source: fileSource({ directory: "content/docs" }, rootDir),
        heading: "Documentation",
        description: "Learn the fundamentals and explore the API.",
      },
      guides: {
        source: fileSource({ directory: "content/guides" }, rootDir),
        heading: "Guides",
        description: "Practical tutorials to help you build with SemaJSX.",
      },
      mdx: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypeShiki,
            {
              theme: "github-dark-dimmed",
              transformers: [
                {
                  name: "add-language-data",
                  pre(node) {
                    node.properties["data-language"] = this.options.lang;
                  },
                } satisfies ShikiTransformer,
              ],
            },
          ],
        ],
      },
    }),
  ],
});

async function main() {
  console.log("Building SemaJSX documentation site...");
  const result = await ssg.build();
  console.log(`Built ${result.paths.length} pages`);
  console.log("Stats:", result.stats);
}

main().catch(console.error);

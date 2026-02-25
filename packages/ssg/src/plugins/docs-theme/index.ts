import { z } from "zod";
import type { SSGPlugin, Collection, RouteConfig } from "../../types";
import { defineCollection } from "../../index";
import type { DocsThemeOptions } from "./types";
import { createComponents, Callout, CodeBlock } from "./components";
import { lucide as lucidePlugin } from "../lucide/index";
import type { Component } from "@semajsx/core";

export type {
  DocsThemeOptions,
  NavLink,
  HeroAction,
  FeatureItem,
  QuickLinkItem,
  DocsConfig,
  GuidesConfig,
} from "./types";

export { Callout, CodeBlock } from "./components";

// =============================================================================
// Schemas
// =============================================================================

const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().default(999),
  category: z.string().optional(),
});

const guidesSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().default(999),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

// =============================================================================
// Plugin factory
// =============================================================================

/**
 * Docs theme plugin for SSG.
 *
 * Provides an Apple-inspired documentation site with:
 * - Frosted glass navigation
 * - Home page with hero, features, and quick links
 * - Docs collection with category grouping
 * - Guides collection with difficulty levels
 * - MDX components (Callout, CodeBlock)
 * - Responsive design
 *
 * All text content, navigation links, and site metadata
 * are configured through options — nothing is hardcoded.
 *
 * @example
 * ```tsx
 * import { createSSG } from "@semajsx/ssg";
 * import { docsTheme } from "@semajsx/ssg/plugins/docs-theme";
 * import { fileSource } from "@semajsx/ssg";
 *
 * const ssg = createSSG({
 *   outDir: "./dist",
 *   plugins: [
 *     docsTheme({
 *       title: "My Docs",
 *       nav: {
 *         logo: "MyProject",
 *         links: [
 *           { label: "Docs", href: "/docs" },
 *           { label: "GitHub", href: "https://github.com/...", external: true },
 *         ],
 *       },
 *       hero: {
 *         title: "MyProject",
 *         subtitle: "A great project.",
 *         actions: [{ label: "Get Started", href: "/docs/intro", primary: true }],
 *       },
 *       docs: { source: fileSource({ directory: "content/docs" }, rootDir) },
 *     }),
 *   ],
 * });
 * ```
 */
export function docsTheme(options: DocsThemeOptions): SSGPlugin[] {
  const components = createComponents(options);
  const docsBasePath = options.docs?.basePath ?? "/docs";
  const guidesBasePath = options.guides?.basePath ?? "/guides";

  const mainPlugin: SSGPlugin = {
    name: "docs-theme",

    config() {
      const collections: Collection[] = [];
      const routes: RouteConfig[] = [];

      // --- Collections ---

      if (options.docs) {
        collections.push(
          defineCollection({
            name: "docs",
            source: options.docs.source,
            schema: docsSchema,
          }),
        );
      }

      if (options.guides) {
        collections.push(
          defineCollection({
            name: "guides",
            source: options.guides.source,
            schema: guidesSchema,
          }),
        );
      }

      // --- Routes ---

      // Home page
      routes.push({
        path: "/",
        component: components.HomePage,
        props: { title: options.title },
      });

      // Docs routes
      if (options.docs) {
        routes.push({
          path: docsBasePath,
          component: components.DocsIndex,
          props: async (ssg) => ({
            title: options.docs?.heading ?? "Documentation",
            docs: await ssg.getCollection("docs"),
          }),
        });

        routes.push({
          path: `${docsBasePath}/:slug`,
          component: components.DocPage,
          getStaticPaths: async (ssg) => {
            const allDocs = await ssg.getCollection("docs");
            return Promise.all(
              allDocs.map(async (doc) => {
                const { Content } = await doc.render();
                return {
                  params: { slug: doc.slug },
                  props: {
                    doc,
                    content: Content(),
                    title: `${(doc.data as { title: string }).title} | ${options.title}`,
                  },
                };
              }),
            );
          },
        });
      }

      // Guides routes
      if (options.guides) {
        routes.push({
          path: guidesBasePath,
          component: components.GuidesIndex,
          props: async (ssg) => ({
            title: options.guides?.heading ?? "Guides",
            guides: await ssg.getCollection("guides"),
          }),
        });

        routes.push({
          path: `${guidesBasePath}/:slug`,
          component: components.GuidePage,
          getStaticPaths: async (ssg) => {
            const allGuides = await ssg.getCollection("guides");
            return Promise.all(
              allGuides.map(async (guide) => {
                const { Content } = await guide.render();
                return {
                  params: { slug: guide.slug },
                  props: {
                    guide,
                    content: Content(),
                    title: `${(guide.data as { title: string }).title} | ${options.title}`,
                  },
                };
              }),
            );
          },
        });
      }

      // 404 page
      routes.push({
        path: "/404",
        component: components.NotFound,
        props: { title: `404 - Page Not Found | ${options.title}` },
      });

      // --- MDX ---

      const mdxComponents: Record<string, Component> = {
        Callout,
        CodeBlock,
        ...options.mdx?.components,
      };

      return {
        document: components.Document,
        collections,
        routes,
        mdx: {
          remarkPlugins: options.mdx?.remarkPlugins,
          rehypePlugins: options.mdx?.rehypePlugins,
          components: mdxComponents,
        },
      };
    },
  };

  // Compose sub-plugins Vite-style: return flat array
  const plugins: SSGPlugin[] = [mainPlugin];

  if (options.lucide !== false) {
    const lucideOpts = typeof options.lucide === "object" ? options.lucide : {};
    plugins.push(lucidePlugin(lucideOpts));
  }

  return plugins;
}

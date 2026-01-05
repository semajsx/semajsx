/** @jsxImportSource @semajsx/dom */

import { createSSG, defineCollection, fileSource, z } from "@semajsx/ssg";
import { resource } from "@semajsx/ssr";
import type { VNode } from "@semajsx/core";

// Import components
import { Layout, DocTemplate, Callout, CodeBlock } from "./components";

// Get the directory where this script is located
const rootDir = import.meta.dir;

// Create resource tools for CSS
const { Style } = resource(import.meta.url);

// Define docs collection
const docs = defineCollection({
  name: "docs",
  source: fileSource(
    {
      directory: "content/docs",
    },
    rootDir,
  ),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(999),
    category: z.string().optional(),
  }),
});

// Define guides collection
const guides = defineCollection({
  name: "guides",
  source: fileSource(
    {
      directory: "content/guides",
    },
    rootDir,
  ),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().default(999),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  }),
});

// Components
const HomePage = (): VNode => (
  <Layout>
    <Style href="./styles.css" />
    <div class="home">
      <header class="hero">
        <h1>SemaJSX</h1>
        <p class="tagline">A lightweight, signal-based reactive JSX runtime for building modern web applications</p>
        <div class="actions">
          <a href="/docs/getting-started" class="btn btn-primary">Get Started</a>
          <a href="/guides" class="btn btn-secondary">View Guides</a>
        </div>
      </header>

      <section class="features">
        <div class="feature">
          <h2>🚀 Fine-Grained Reactivity</h2>
          <p>Signals automatically track dependencies and update only what changed - no virtual DOM needed.</p>
        </div>
        <div class="feature">
          <h2>📦 Modular Architecture</h2>
          <p>Choose what you need: DOM rendering, Terminal UI, SSR, or SSG - all with the same reactive core.</p>
        </div>
        <div class="feature">
          <h2>🎯 Type-Safe</h2>
          <p>Full TypeScript support with comprehensive type inference and IDE autocompletion.</p>
        </div>
      </section>
    </div>
  </Layout>
);

const DocsIndex = ({
  docs: docsList,
}: {
  docs: Array<{ slug: string; data: { title: string; description?: string; category?: string; order: number } }>;
}): VNode => {
  // Group docs by category
  const byCategory = docsList.reduce((acc, doc) => {
    const category = doc.data.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, typeof docsList>);

  // Sort within each category
  Object.values(byCategory).forEach(items => items.sort((a, b) => a.data.order - b.data.order));

  return (
    <Layout>
      <Style href="./styles.css" />
      <div class="docs-index">
        <h1>Documentation</h1>
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category}>
            <h2>{category}</h2>
            <ul class="doc-list">
              {items.map((doc) => (
                <li key={doc.slug}>
                  <a href={`/docs/${doc.slug}`}>
                    <h3>{doc.data.title}</h3>
                    {doc.data.description && <p>{doc.data.description}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  );
};

const DocPage = ({
  doc,
  content,
}: {
  doc: { data: { title: string; description?: string } };
  content: VNode;
}): VNode => (
  <Layout>
    <Style href="./styles.css" />
    <article class="doc-page">
      <h1>{doc.data.title}</h1>
      {doc.data.description && <p class="description">{doc.data.description}</p>}
      <div class="content">{content}</div>
    </article>
  </Layout>
);

const GuidesIndex = ({
  guides: guidesList,
}: {
  guides: Array<{ slug: string; data: { title: string; description?: string; difficulty: string; order: number } }>;
}): VNode => {
  // Group guides by difficulty
  const byDifficulty = guidesList.reduce((acc, guide) => {
    const difficulty = guide.data.difficulty || "beginner";
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(guide);
    return acc;
  }, {} as Record<string, typeof guidesList>);

  // Sort within each difficulty level
  Object.values(byDifficulty).forEach(items => items.sort((a, b) => a.data.order - b.data.order));

  return (
    <Layout>
      <Style href="./styles.css" />
      <div class="guides-index">
        <h1>Guides</h1>
        {Object.entries(byDifficulty).map(([difficulty, items]) => (
          <section key={difficulty}>
            <h2>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</h2>
            <ul class="guide-list">
              {items.map((guide) => (
                <li key={guide.slug} class={`difficulty-${difficulty}`}>
                  <a href={`/guides/${guide.slug}`}>
                    <h3>{guide.data.title}</h3>
                    {guide.data.description && <p>{guide.data.description}</p>}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Layout>
  );
};

const GuidePage = ({
  guide,
  content,
}: {
  guide: { data: { title: string; description?: string; difficulty: string } };
  content: VNode;
}): VNode => (
  <Layout>
    <Style href="./styles.css" />
    <article class="guide-page">
      <div class={`difficulty-badge difficulty-${guide.data.difficulty}`}>
        {guide.data.difficulty}
      </div>
      <h1>{guide.data.title}</h1>
      {guide.data.description && <p class="description">{guide.data.description}</p>}
      <div class="content">{content}</div>
    </article>
  </Layout>
);

// Create SSG instance
const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  collections: [docs, guides],
  // Custom document template
  document: DocTemplate,
  // MDX configuration with custom components
  mdx: {
    components: {
      Callout,
      CodeBlock,
    },
  },
  routes: [
    {
      path: "/",
      component: HomePage,
      props: { title: "SemaJSX Documentation" },
    },
    {
      path: "/docs",
      component: DocsIndex as (props: Record<string, unknown>) => VNode,
      props: async (ssg) => ({
        title: "Documentation",
        docs: await ssg.getCollection("docs"),
      }),
    },
    {
      path: "/docs/:slug",
      component: DocPage as (props: Record<string, unknown>) => VNode,
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
                title: `${doc.data.title} | SemaJSX Documentation`
              },
            };
          }),
        );
      },
    },
    {
      path: "/guides",
      component: GuidesIndex as (props: Record<string, unknown>) => VNode,
      props: async (ssg) => ({
        title: "Guides",
        guides: await ssg.getCollection("guides"),
      }),
    },
    {
      path: "/guides/:slug",
      component: GuidePage as (props: Record<string, unknown>) => VNode,
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
                title: `${guide.data.title} | SemaJSX Guides`
              },
            };
          }),
        );
      },
    },
  ],
});

// Build
async function main() {
  console.log("Building SemaJSX documentation site...");
  const result = await ssg.build();
  console.log(`✅ Built ${result.paths.length} pages`);
  console.log("Stats:", result.stats);
}

main().catch(console.error);

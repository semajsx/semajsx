/** @jsxImportSource semajsx/dom */

import remarkGfm from "remark-gfm";
import { createSSG, defineCollection, fileSource, z } from "semajsx/ssg";
import { resource } from "semajsx/ssr";
import type { VNode } from "semajsx";
import {
  cx,
  flex,
  gap4,
  justifyCenter,
  mt4,
  mt8,
  py16,
  textCenter,
  textXl,
  text2xl,
  text3xl,
  text4xl,
  textLg,
  textSm,
  fontBold,
  fontSemibold,
  fontMedium,
  textColor,
  p6,
  roundedLg,
  roundedMd,
  roundedFull,
  bg,
  mb1,
  mb2,
  mb4,
  mb8,
  pb4,
  grid,
  gap8,
  extractCss,
  noUnderline,
  block,
  inline,
  inlineBlock,
  px3,
  px6,
  py1,
  py3,
  border,
  border2,
  uppercase,
} from "semajsx/tailwind";

// Import components
import { Layout, DocTemplate, Callout, CodeBlock } from "./components";
import { NotFound } from "./components/NotFound";

// Import Apple theme styles
import * as theme from "./styles/theme.style";

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

// Tokens for all page components
const allPageTokens = [
  // HomePage
  py16,
  textCenter,
  textXl,
  text2xl,
  text3xl,
  text4xl,
  textLg,
  textSm,
  fontBold,
  fontSemibold,
  fontMedium,
  textColor.gray500!,
  textColor.blue500!,
  textColor.white!,
  mb1,
  mb2,
  mb4,
  mb8,
  pb4,
  mt4,
  mt8,
  flex,
  gap4,
  justifyCenter,
  grid,
  gap8,
  p6,
  roundedLg,
  roundedMd,
  roundedFull,
  bg.gray100!,
  bg.blue500!,
  noUnderline,
  inline,
  inlineBlock,
  block,
  px3,
  px6,
  py1,
  py3,
  border,
  border2,
  uppercase,
];
export const homePageCss = extractCss(...allPageTokens);

// ============================================
// Page Components
// ============================================

const HomePage = (): VNode => (
  <Layout>
    <Style href="./styles.css" />

    {/* Hero Section - Apple-style minimal with generous whitespace */}
    <div
      class={cx(theme.heroBg._, "hero-section")}
      style="padding: 100px 24px 80px; position: relative;"
    >
      <div style="max-width: 680px; margin: 0 auto; position: relative; z-index: 1; text-align: center;">
        <h1 class={theme.heroTitle._}>SemaJSX</h1>
        <p class={theme.heroSubtitle._}>
          A lightweight, signal-based reactive JSX runtime. Fine-grained updates. No virtual DOM.
        </p>
        <div class={cx(flex, gap4, justifyCenter, "hero-cta")} style="margin-top: 2rem;">
          <a href="/docs/getting-started" class={theme.primaryButton._}>
            Get Started
          </a>
          <a href="/guides" class={theme.secondaryButton._}>
            View Guides
          </a>
        </div>
      </div>
    </div>

    {/* Features Section - Apple-style cards with subtle elevation */}
    <section
      class="section-features"
      style="max-width: 1080px; margin: 0 auto; padding: 80px 24px;"
    >
      <div style="text-align: center; margin-bottom: 3.5rem;">
        <h2 class={theme.sectionTitle._}>Why SemaJSX?</h2>
        <p class={theme.sectionSubtitle._}>Simple primitives. Powerful results.</p>
      </div>
      <div
        class="features-grid"
        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;"
      >
        <div class={theme.featureCard._}>
          <div
            class="feature-icon"
            style="font-size: 2rem; margin-bottom: 1.25rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f5f5f7; border-radius: 12px;"
          >
            {"⚡"}
          </div>
          <h3
            class="feature-heading"
            style="font-size: 1.375rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.5rem; letter-spacing: -0.01em;"
          >
            Fine-Grained Reactivity
          </h3>
          <p style="color: #6e6e73; line-height: 1.6; font-size: 0.9375rem;">
            Signals automatically track dependencies and update only what changed. No virtual DOM
            diffing overhead.
          </p>
        </div>

        <div class={theme.featureCard._}>
          <div
            class="feature-icon"
            style="font-size: 2rem; margin-bottom: 1.25rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f5f5f7; border-radius: 12px;"
          >
            {"📦"}
          </div>
          <h3
            class="feature-heading"
            style="font-size: 1.375rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.5rem; letter-spacing: -0.01em;"
          >
            Modular Architecture
          </h3>
          <p style="color: #6e6e73; line-height: 1.6; font-size: 0.9375rem;">
            Choose what you need: DOM rendering, Terminal UI, SSR, or SSG. All sharing the same
            reactive core.
          </p>
        </div>

        <div class={theme.featureCard._}>
          <div
            class="feature-icon"
            style="font-size: 2rem; margin-bottom: 1.25rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: #f5f5f7; border-radius: 12px;"
          >
            {"🎯"}
          </div>
          <h3
            class="feature-heading"
            style="font-size: 1.375rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.5rem; letter-spacing: -0.01em;"
          >
            Type-Safe
          </h3>
          <p style="color: #6e6e73; line-height: 1.6; font-size: 0.9375rem;">
            Full TypeScript support with comprehensive type inference and IDE autocompletion out of
            the box.
          </p>
        </div>
      </div>
    </section>

    {/* Quick Links Section */}
    <section
      class="section-links"
      style="max-width: 1080px; margin: 0 auto; padding: 0 24px 100px;"
    >
      <div
        class="section-links-inner"
        style="border-top: 0.5px solid rgba(0, 0, 0, 0.06); padding-top: 80px; text-align: center;"
      >
        <h2 class={theme.sectionTitle._}>Get started in seconds.</h2>
        <p class={theme.sectionSubtitle._}>Everything you need to build reactive applications.</p>
        <div
          class="links-grid"
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: 720px; margin: 0 auto;"
        >
          <a href="/docs" class={theme.docCard._} style="text-align: left;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.375rem; letter-spacing: -0.01em;">
              Documentation
            </h3>
            <p style="color: #6e6e73; font-size: 0.875rem; line-height: 1.5; margin: 0;">
              API reference and core concepts.
            </p>
          </a>
          <a href="/guides" class={theme.docCard._} style="text-align: left;">
            <h3 style="font-size: 1.125rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.375rem; letter-spacing: -0.01em;">
              Guides
            </h3>
            <p style="color: #6e6e73; font-size: 0.875rem; line-height: 1.5; margin: 0;">
              Step-by-step tutorials and examples.
            </p>
          </a>
        </div>
      </div>
    </section>
  </Layout>
);

// ============================================
// Docs Pages
// ============================================

const DocsIndex = ({
  docs: docsList,
}: {
  docs: Array<{
    slug: string;
    data: { title: string; description?: string; category?: string; order: number };
  }>;
}): VNode => {
  // Group docs by category
  const byCategory = docsList.reduce(
    (acc, doc) => {
      const category = doc.data.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(doc);
      return acc;
    },
    {} as Record<string, typeof docsList>,
  );

  // Sort within each category
  Object.values(byCategory).forEach((items) => items.sort((a, b) => a.data.order - b.data.order));

  return (
    <Layout>
      <Style href="./styles.css" />
      <div style="max-width: 720px;">
        <div style="margin-bottom: 3rem;">
          <h1
            class="page-title"
            style="font-size: 2.25rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; margin-bottom: 0.5rem;"
          >
            Documentation
          </h1>
          <p class="page-desc" style="font-size: 1.125rem; color: #6e6e73; line-height: 1.5;">
            Learn the fundamentals and explore the API.
          </p>
        </div>
        {Object.entries(byCategory).map(([category, items]) => (
          <section key={category} style="margin-bottom: 2.5rem;">
            <h2 style="font-size: 0.8125rem; font-weight: 600; color: #86868b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem;">
              {category}
            </h2>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              {items.map((doc) => (
                <a key={doc.slug} href={`/docs/${doc.slug}`} class={theme.docCard._}>
                  <h3 style="font-size: 1.0625rem; font-weight: 600; color: #1d1d1f; margin-bottom: 0.25rem; letter-spacing: -0.01em;">
                    {doc.data.title}
                  </h3>
                  {doc.data.description && (
                    <p style="color: #6e6e73; font-size: 0.875rem; line-height: 1.5; margin: 0;">
                      {doc.data.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
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
    <article class="page-container">
      <div style="margin-bottom: 2.5rem;">
        <h1
          class="page-title"
          style="font-size: 2.25rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; margin-bottom: 0.5rem;"
        >
          {doc.data.title}
        </h1>
        {doc.data.description && (
          <p
            class="page-desc"
            style="font-size: 1.125rem; color: #6e6e73; line-height: 1.5; padding-bottom: 1.5rem; border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);"
          >
            {doc.data.description}
          </p>
        )}
      </div>
      <div class="content">{content}</div>
    </article>
  </Layout>
);

// ============================================
// Guides Pages
// ============================================

const defaultMeta = { bg: "rgba(52, 199, 89, 0.12)", color: "#248a3d", label: "Beginner" };

const difficultyMeta: Record<string, { bg: string; color: string; label: string }> = {
  beginner: defaultMeta,
  intermediate: { bg: "rgba(255, 159, 10, 0.12)", color: "#b25000", label: "Intermediate" },
  advanced: { bg: "rgba(255, 69, 58, 0.12)", color: "#d70015", label: "Advanced" },
};

function getDifficultyMeta(difficulty: string) {
  return difficultyMeta[difficulty] ?? defaultMeta;
}

const GuidesIndex = ({
  guides: guidesList,
}: {
  guides: Array<{
    slug: string;
    data: { title: string; description?: string; difficulty: string; order: number };
  }>;
}): VNode => {
  // Group guides by difficulty
  const byDifficulty = guidesList.reduce(
    (acc, guide) => {
      const difficulty = guide.data.difficulty || "beginner";
      if (!acc[difficulty]) acc[difficulty] = [];
      acc[difficulty].push(guide);
      return acc;
    },
    {} as Record<string, typeof guidesList>,
  );

  // Sort within each difficulty level
  Object.values(byDifficulty).forEach((items) => items.sort((a, b) => a.data.order - b.data.order));

  return (
    <Layout>
      <Style href="./styles.css" />
      <div style="max-width: 720px;">
        <div style="margin-bottom: 3rem;">
          <h1
            class="page-title"
            style="font-size: 2.25rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; margin-bottom: 0.5rem;"
          >
            Guides
          </h1>
          <p class="page-desc" style="font-size: 1.125rem; color: #6e6e73; line-height: 1.5;">
            Practical tutorials to help you build with SemaJSX.
          </p>
        </div>
        {Object.entries(byDifficulty).map(([difficulty, items]) => {
          const meta = getDifficultyMeta(difficulty);
          return (
            <section key={difficulty} style="margin-bottom: 2.5rem;">
              <h2 style="font-size: 0.8125rem; font-weight: 600; color: #86868b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem;">
                {meta.label}
              </h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                {items.map((guide) => {
                  const guideMeta = getDifficultyMeta(guide.data.difficulty);
                  return (
                    <a key={guide.slug} href={`/guides/${guide.slug}`} class={theme.docCard._}>
                      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.375rem;">
                        <h3 style="font-size: 1.0625rem; font-weight: 600; color: #1d1d1f; letter-spacing: -0.01em; margin: 0;">
                          {guide.data.title}
                        </h3>
                        <span
                          style={`font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 980px; background: ${guideMeta.bg}; color: ${guideMeta.color}; letter-spacing: 0.02em; text-transform: uppercase; white-space: nowrap;`}
                        >
                          {guide.data.difficulty}
                        </span>
                      </div>
                      {guide.data.description && (
                        <p style="color: #6e6e73; font-size: 0.875rem; line-height: 1.5; margin: 0;">
                          {guide.data.description}
                        </p>
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
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
}): VNode => {
  const meta = getDifficultyMeta(guide.data.difficulty);

  return (
    <Layout>
      <Style href="./styles.css" />
      <article class="page-container">
        <div style="margin-bottom: 2.5rem;">
          <span
            style={`display: inline-block; font-size: 0.6875rem; font-weight: 600; padding: 0.1875rem 0.625rem; border-radius: 980px; background: ${meta.bg}; color: ${meta.color}; letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 1rem;`}
          >
            {guide.data.difficulty}
          </span>
          <h1
            class="page-title"
            style="font-size: 2.25rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.02em; margin-bottom: 0.5rem;"
          >
            {guide.data.title}
          </h1>
          {guide.data.description && (
            <p
              class="page-desc"
              style="font-size: 1.125rem; color: #6e6e73; line-height: 1.5; padding-bottom: 1.5rem; border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);"
            >
              {guide.data.description}
            </p>
          )}
        </div>
        <div class="content">{content}</div>
      </article>
    </Layout>
  );
};

// ============================================
// SSG Configuration
// ============================================

// Create SSG instance
const ssg = createSSG({
  rootDir,
  outDir: "./dist",
  collections: [docs, guides],
  // Custom document template
  document: DocTemplate,
  // MDX configuration with custom components
  mdx: {
    remarkPlugins: [remarkGfm],
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
                title: `${doc.data.title} | SemaJSX Documentation`,
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
                title: `${guide.data.title} | SemaJSX Guides`,
              },
            };
          }),
        );
      },
    },
    {
      path: "/404",
      component: NotFound as (props: Record<string, unknown>) => VNode,
      props: { title: "404 - Page Not Found | SemaJSX Documentation" },
    },
  ],
});

// Build
async function main() {
  console.log("Building SemaJSX documentation site...");
  const result = await ssg.build();
  console.log(`Built ${result.paths.length} pages`);
  console.log("Stats:", result.stats);
}

main().catch(console.error);

/** @jsxImportSource @semajsx/dom */

import type { VNode, JSXNode } from "@semajsx/core";
import type { DocumentProps } from "../../types";
import type { DocsThemeOptions, NavLink } from "./types";
import { THEME_CSS } from "./styles";
import { Icon } from "../lucide/component";

import { Callout } from "@semajsx/ui/components/callout";
import { Badge } from "@semajsx/ui/components/badge";
import { Card } from "@semajsx/ui/components/card";
import { Tabs, TabList, Tab, TabPanel } from "@semajsx/ui/components/tabs";
import { Steps, Step } from "@semajsx/ui/components/steps";
import { componentCSS } from "@semajsx/ui/css";

import type { BadgeColor } from "@semajsx/ui/components/badge";

/** Concatenate class names, filtering falsy values */
function cx(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(" ");
}

// =============================================================================
// CodeBlock — MDX component (kept custom for Shiki className integration)
// =============================================================================

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function CodeBlock({ children, className, language }: CodeBlockProps): VNode {
  const lang = language || (className?.replace(/^language-/, "") ?? "text");
  return (
    <div class="dt-code-block">
      {lang && lang !== "text" && (
        <div class="dt-code-header">
          <span class="dt-code-lang">{lang}</span>
        </div>
      )}
      <pre class={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

// =============================================================================
// Difficulty → Badge color mapping
// =============================================================================

const DIFFICULTY_COLORS: Record<string, BadgeColor> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// =============================================================================
// Component factory — creates all page components bound to theme options
// =============================================================================

interface DocsIndexProps {
  docs: Array<{
    slug: string;
    data: { title: string; description?: string; category?: string; order: number };
  }>;
}

interface DocPageProps {
  doc: { data: { title: string; description?: string } };
  content: VNode;
}

interface GuidesIndexProps {
  guides: Array<{
    slug: string;
    data: { title: string; description?: string; difficulty: string; order: number };
  }>;
}

interface GuidePageProps {
  guide: { data: { title: string; description?: string; difficulty: string } };
  content: VNode;
}

/** Component map returned by createComponents */
export interface DocsThemeComponents {
  Document: (props: DocumentProps) => VNode;
  Layout: (props: { children: JSXNode }) => VNode;
  HomePage: () => VNode;
  DocsIndexHomePage: () => VNode;
  DocsIndex: (props: DocsIndexProps) => VNode;
  DocPage: (props: DocPageProps) => VNode;
  GuidesIndex: (props: GuidesIndexProps) => VNode;
  GuidePage: (props: GuidePageProps) => VNode;
  NotFound: () => VNode;
  Callout: typeof Callout;
  CodeBlock: typeof CodeBlock;
  Tabs: typeof Tabs;
  TabList: typeof TabList;
  Tab: typeof Tab;
  TabPanel: typeof TabPanel;
  Steps: typeof Steps;
  Step: typeof Step;
}

export function createComponents(options: DocsThemeOptions): DocsThemeComponents {
  // --------------------------------------------------
  // Document
  // --------------------------------------------------
  function Document(props: DocumentProps): VNode {
    const { children, title, scripts, css } = props;
    const defaultTitle = options.title;
    const pageTitle = title ?? defaultTitle;
    const desc = options.description ?? "";

    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {desc && <meta name="description" content={desc} />}
          <meta name="theme-color" content="#fbfbfd" />
          <meta name="color-scheme" content="light" />
          <title>{pageTitle}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {css?.map((href) => (
            <link key={href} rel="stylesheet" href={href} />
          ))}
        </head>
        <body>
          {children}
          {scripts}
        </body>
      </html>
    );
  }

  // --------------------------------------------------
  // Layout (nav + main + footer)
  // --------------------------------------------------
  function Layout({ children }: { children: JSXNode }): VNode {
    const footerLinks = options.footer?.links ?? options.nav.links;
    const copyrightName = options.footer?.copyright ?? options.title;

    return (
      <div class="dt-root">
        <style>{componentCSS}</style>
        <style>{THEME_CSS}</style>

        {/* Navigation */}
        <nav class="dt-glass-nav">
          <div class="dt-nav-inner">
            <a href="/" class="dt-nav-logo">
              {options.nav.logo}
            </a>
            <ul class="dt-nav-links">
              {options.nav.links.map((link: NavLink) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    class="dt-nav-link"
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main class="dt-main">{children}</main>

        {/* Footer */}
        <footer class="dt-footer">
          <div class="dt-footer-inner">
            <div class="dt-footer-links">
              {footerLinks.map((link: NavLink) => (
                <a
                  key={link.href}
                  href={link.href}
                  class="dt-footer-link"
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <p class="dt-footer-copy">
              {`\u00A9 ${new Date().getFullYear()} ${copyrightName}`}. MIT License.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // --------------------------------------------------
  // Home Page
  // --------------------------------------------------
  function HomePage(): VNode {
    return (
      <Layout>
        {/* Hero */}
        {options.hero && (
          <div
            class={cx("dt-hero-bg", "dt-hero-section")}
            style="padding: 100px 24px 80px; position: relative;"
          >
            <div style="max-width: 680px; margin: 0 auto; position: relative; z-index: 1; text-align: center;">
              <h1 class={cx("dt-hero-title", "dt-anim-slide-up")}>{options.hero.title}</h1>
              <p class={cx("dt-hero-subtitle", "dt-anim-slide-up", "dt-stagger-1")}>
                {options.hero.subtitle}
              </p>
              {options.hero.actions && options.hero.actions.length > 0 && (
                <div class={cx("dt-hero-cta", "dt-anim-slide-up", "dt-stagger-2")}>
                  {options.hero.actions.map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      class={action.primary ? "dt-primary-btn" : "dt-secondary-btn"}
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {options.features && (
          <section
            class="dt-section-features"
            style="max-width: 1080px; margin: 0 auto; padding: 80px 24px;"
          >
            <div style="text-align: center; margin-bottom: 3.5rem;">
              <h2 class={cx("dt-section-title", "dt-anim-slide-up")}>{options.features.title}</h2>
              <p class={cx("dt-section-subtitle", "dt-anim-slide-up", "dt-stagger-1")}>
                {options.features.subtitle}
              </p>
            </div>
            <div
              class="dt-features-grid"
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;"
            >
              {options.features.items.map((item, i) => (
                <Card
                  key={item.title}
                  icon={<Icon name={item.icon} size={24} />}
                  heading={item.title}
                  description={item.description}
                  class={cx("dt-anim-scale-in", `dt-stagger-${Math.min(i + 2, 5)}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quick Links */}
        {options.quickLinks && (
          <section
            class="dt-section-links"
            style="max-width: 1080px; margin: 0 auto; padding: 0 24px 100px;"
          >
            <div
              class="dt-section-links-inner"
              style="border-top: 0.5px solid rgba(0, 0, 0, 0.06); padding-top: 80px; text-align: center;"
            >
              <h2 class={cx("dt-section-title", "dt-anim-slide-up")}>{options.quickLinks.title}</h2>
              <p class={cx("dt-section-subtitle", "dt-anim-slide-up", "dt-stagger-1")}>
                {options.quickLinks.subtitle}
              </p>
              <div
                class="dt-links-grid"
                style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: 720px; margin: 0 auto;"
              >
                {options.quickLinks.items.map((item, i) => (
                  <Card
                    key={item.href}
                    variant="link"
                    href={item.href}
                    heading={item.title}
                    description={item.description}
                    class={cx("dt-anim-scale-in", `dt-stagger-${Math.min(i + 2, 5)}`)}
                    style="text-align: left;"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </Layout>
    );
  }

  // --------------------------------------------------
  // Docs Index Home Page (preset: "docs-index")
  // --------------------------------------------------
  function DocsIndexHomePage(): VNode {
    const docsConf = options.docs;
    const guidesConf = options.guides;
    const docsBasePath = docsConf?.basePath ?? "/docs";
    const guidesBasePath = guidesConf?.basePath ?? "/guides";

    return (
      <Layout>
        <div style="max-width: 720px;">
          <div style="margin-bottom: 3rem;">
            <h1 class={cx("dt-page-title", "dt-anim-slide-up")}>{options.title}</h1>
            {options.description && (
              <p class={cx("dt-page-desc", "dt-anim-slide-up", "dt-stagger-1")}>
                {options.description}
              </p>
            )}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            {docsConf && (
              <Card
                variant="link"
                href={docsBasePath}
                heading={docsConf.heading ?? "Documentation"}
                description={docsConf.description}
                class="dt-anim-scale-in"
              />
            )}
            {guidesConf && (
              <Card
                variant="link"
                href={guidesBasePath}
                heading={guidesConf.heading ?? "Guides"}
                description={guidesConf.description}
                class="dt-anim-scale-in"
              />
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // --------------------------------------------------
  // Docs Index
  // --------------------------------------------------
  function DocsIndex({ docs: docsList }: DocsIndexProps): VNode {
    const docsConf = options.docs;
    const heading = docsConf?.heading ?? "Documentation";
    const desc = docsConf?.description ?? "";

    const byCategory = docsList.reduce(
      (acc, doc) => {
        const category = doc.data.category || "General";
        if (!acc[category]) acc[category] = [];
        acc[category].push(doc);
        return acc;
      },
      {} as Record<string, typeof docsList>,
    );
    Object.values(byCategory).forEach((items) => items.sort((a, b) => a.data.order - b.data.order));

    const basePath = docsConf?.basePath ?? "/docs";

    return (
      <Layout>
        <div style="max-width: 720px;">
          <div style="margin-bottom: 3rem;">
            <h1 class={cx("dt-page-title", "dt-anim-slide-up")}>{heading}</h1>
            {desc && <p class={cx("dt-page-desc", "dt-anim-slide-up", "dt-stagger-1")}>{desc}</p>}
          </div>
          {Object.entries(byCategory).map(([category, items]) => (
            <section key={category} class="dt-fade-in" style="margin-bottom: 2.5rem;">
              <h2 class="dt-category-heading">{category}</h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                {items.map((doc, i) => (
                  <Card
                    key={doc.slug}
                    variant="link"
                    href={`${basePath}/${doc.slug}`}
                    heading={doc.data.title}
                    description={doc.data.description}
                    class={cx("dt-anim-scale-in")}
                    style={`animation-delay: ${0.1 + i * 0.08}s;`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Layout>
    );
  }

  // --------------------------------------------------
  // Doc Page
  // --------------------------------------------------
  function DocPage({ doc, content }: DocPageProps): VNode {
    return (
      <Layout>
        <article class="dt-page-container">
          <div style="margin-bottom: 2.5rem;">
            <h1 class={cx("dt-page-title", "dt-anim-slide-up")}>{doc.data.title}</h1>
            {doc.data.description && (
              <p class={cx("dt-content-desc", "dt-anim-slide-up", "dt-stagger-1")}>
                {doc.data.description}
              </p>
            )}
          </div>
          <div class={cx("dt-content", "dt-fade-in")}>{content}</div>
        </article>
      </Layout>
    );
  }

  // --------------------------------------------------
  // Guides Index
  // --------------------------------------------------
  function GuidesIndex({ guides: guidesList }: GuidesIndexProps): VNode {
    const guidesConf = options.guides;
    const heading = guidesConf?.heading ?? "Guides";
    const desc = guidesConf?.description ?? "";

    const byDifficulty = guidesList.reduce(
      (acc, guide) => {
        const difficulty = guide.data.difficulty || "beginner";
        if (!acc[difficulty]) acc[difficulty] = [];
        acc[difficulty].push(guide);
        return acc;
      },
      {} as Record<string, typeof guidesList>,
    );
    Object.values(byDifficulty).forEach((items) =>
      items.sort((a, b) => a.data.order - b.data.order),
    );

    const basePath = guidesConf?.basePath ?? "/guides";

    return (
      <Layout>
        <div style="max-width: 720px;">
          <div style="margin-bottom: 3rem;">
            <h1 class={cx("dt-page-title", "dt-anim-slide-up")}>{heading}</h1>
            {desc && <p class={cx("dt-page-desc", "dt-anim-slide-up", "dt-stagger-1")}>{desc}</p>}
          </div>
          {Object.entries(byDifficulty).map(([difficulty, items]) => (
            <section key={difficulty} class="dt-fade-in" style="margin-bottom: 2.5rem;">
              <h2 class="dt-category-heading">{DIFFICULTY_LABELS[difficulty] ?? difficulty}</h2>
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                {items.map((guide, i) => (
                  <Card
                    key={guide.slug}
                    variant="link"
                    href={`${basePath}/${guide.slug}`}
                    class={cx("dt-anim-scale-in")}
                    style={`animation-delay: ${0.1 + i * 0.08}s;`}
                  >
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.375rem;">
                      <h3 class="dt-card-title" style="margin: 0;">
                        {guide.data.title}
                      </h3>
                      <Badge color={DIFFICULTY_COLORS[guide.data.difficulty] ?? "default"}>
                        {guide.data.difficulty}
                      </Badge>
                    </div>
                    {guide.data.description && <p class="dt-card-desc">{guide.data.description}</p>}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Layout>
    );
  }

  // --------------------------------------------------
  // Guide Page
  // --------------------------------------------------
  function GuidePage({ guide, content }: GuidePageProps): VNode {
    return (
      <Layout>
        <article class="dt-page-container">
          <div style="margin-bottom: 2.5rem;">
            <div class="dt-fade-in" style="margin-bottom: 1rem;">
              <Badge color={DIFFICULTY_COLORS[guide.data.difficulty] ?? "default"}>
                {guide.data.difficulty}
              </Badge>
            </div>
            <h1 class={cx("dt-page-title", "dt-anim-slide-up")}>{guide.data.title}</h1>
            {guide.data.description && (
              <p class={cx("dt-content-desc", "dt-anim-slide-up", "dt-stagger-1")}>
                {guide.data.description}
              </p>
            )}
          </div>
          <div class={cx("dt-content", "dt-fade-in")}>{content}</div>
        </article>
      </Layout>
    );
  }

  // --------------------------------------------------
  // 404 Not Found
  // --------------------------------------------------
  function NotFound(): VNode {
    return (
      <Layout>
        <div
          class={cx("dt-hero-bg", "dt-not-found-section")}
          style="padding: 100px 24px 80px; position: relative;"
        >
          <div style="max-width: 680px; margin: 0 auto; position: relative; z-index: 1; text-align: center;">
            <h1 class={cx("dt-not-found-title", "dt-anim-slide-up")}>404</h1>
            <p
              class={cx("dt-hero-subtitle", "dt-anim-slide-up", "dt-stagger-1")}
              style="margin-bottom: 0.75rem;"
            >
              Page Not Found
            </p>
            <p
              class={cx("dt-anim-slide-up", "dt-stagger-2")}
              style="color: #86868b; font-size: 1rem; margin-bottom: 2.5rem; max-width: 28rem; margin-left: auto; margin-right: auto; line-height: 1.6;"
            >
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div class={cx("dt-hero-cta", "dt-anim-slide-up", "dt-stagger-3", "dt-not-found-cta")}>
              <a href="/" class="dt-primary-btn">
                Go Back Home
              </a>
              <a href={options.docs?.basePath ?? "/docs"} class="dt-secondary-btn">
                View Docs
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return {
    Document,
    Layout,
    HomePage,
    DocsIndexHomePage,
    DocsIndex,
    DocPage,
    GuidesIndex,
    GuidePage,
    NotFound,
    Callout,
    CodeBlock,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    Steps,
    Step,
  };
}

// Re-export for plugin index
export { Callout, Tabs, TabList, Tab, TabPanel, Steps, Step };

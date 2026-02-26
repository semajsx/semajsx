import type { Component } from "@semajsx/core";
import type { CollectionSource } from "../../types";
import type { LucidePluginOptions } from "../lucide/index";
import type { AgentMarkdownLink } from "../agent-markdown/types";

// =============================================================================
// Navigation
// =============================================================================

export interface NavLink {
  /** Display label */
  label: string;
  /** URL path or external URL */
  href: string;
  /** Opens in new tab */
  external?: boolean;
}

// =============================================================================
// Home Page Sections
// =============================================================================

export interface HeroAction {
  /** Button label */
  label: string;
  /** Link URL */
  href: string;
  /** Use primary (filled) button style */
  primary?: boolean;
}

export interface FeatureItem {
  /** Lucide icon name in kebab-case (e.g., "zap", "package", "shield-check") */
  icon: string;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
}

export interface QuickLinkItem {
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Link URL */
  href: string;
}

// =============================================================================
// Content Sections
// =============================================================================

export interface DocsConfig {
  /** Content source for docs */
  source: CollectionSource<unknown>;
  /** URL base path (default: "/docs") */
  basePath?: string;
  /** Index page heading (default: "Documentation") */
  heading?: string;
  /** Index page description */
  description?: string;
}

export interface GuidesConfig {
  /** Content source for guides */
  source: CollectionSource<unknown>;
  /** URL base path (default: "/guides") */
  basePath?: string;
  /** Index page heading (default: "Guides") */
  heading?: string;
  /** Index page description */
  description?: string;
}

// =============================================================================
// Theme Options
// =============================================================================

export interface DocsThemeOptions {
  /** Site title (used in <title> tags and footer copyright) */
  title: string;

  /** Site description for meta tags */
  description?: string;

  /** Navigation bar configuration */
  nav: {
    /** Logo text displayed in the nav bar */
    logo: string;
    /** Navigation links */
    links: NavLink[];
  };

  /** Home page hero section (omit to skip hero) */
  hero?: {
    /** Hero heading text */
    title: string;
    /** Hero subtitle text */
    subtitle: string;
    /** Call-to-action buttons */
    actions?: HeroAction[];
  };

  /** Home page features section (omit to skip features) */
  features?: {
    /** Section heading */
    title: string;
    /** Section subtitle */
    subtitle: string;
    /** Feature cards */
    items: FeatureItem[];
  };

  /** Home page quick links section (omit to skip) */
  quickLinks?: {
    /** Section heading */
    title: string;
    /** Section subtitle */
    subtitle: string;
    /** Link cards */
    items: QuickLinkItem[];
  };

  /** Footer configuration */
  footer?: {
    /** Footer links */
    links?: NavLink[];
    /** Copyright holder name (year is auto-generated) */
    copyright?: string;
  };

  /** Docs collection (omit to disable docs section) */
  docs?: DocsConfig;

  /** Guides collection (omit to disable guides section) */
  guides?: GuidesConfig;

  /** Additional MDX plugins and components */
  mdx?: {
    remarkPlugins?: unknown[];
    rehypePlugins?: unknown[];
    /** Extra MDX components (merged with theme defaults) */
    components?: Record<string, Component>;
  };

  /** Lucide icon plugin options. Set to `false` to disable. Enabled by default. */
  lucide?: LucidePluginOptions | false;

  /**
   * Agent-friendly markdown (llms.txt) plugin options. Set to `false` to disable.
   * Enabled by default when docs or guides are configured.
   *
   * Sections are auto-derived from docs/guides collections.
   * Pass an object to customize URL, additional links, or toggle individual outputs.
   */
  agentMarkdown?: AgentMarkdownThemeOptions | false;
}

/**
 * Options specific to agent-markdown when used within docs-theme.
 * Title, description, and sections are auto-derived from the theme config.
 */
export interface AgentMarkdownThemeOptions {
  /** Site base URL for absolute links (e.g., "https://docs.example.com") */
  url?: string;
  /** Additional links for the "Optional" section of llms.txt */
  links?: AgentMarkdownLink[];
  /** Generate llms.txt (default: true) */
  llmsTxt?: boolean;
  /** Generate llms-full.txt (default: true) */
  llmsFullTxt?: boolean;
  /** Generate per-entry .md files (default: true) */
  markdownPages?: boolean;
}

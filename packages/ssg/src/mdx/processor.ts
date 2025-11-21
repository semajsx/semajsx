import { compile } from "@mdx-js/mdx";
import type { Pluggable } from "unified";
import type { VNode } from "@semajsx/core";
import type { MDXConfig, MDXCompileResult, Heading } from "./types";

/**
 * MDX Processor for compiling MDX content to JSX components
 */
export class MDXProcessor {
  private config: MDXConfig;

  constructor(config: MDXConfig = {}) {
    this.config = config;
  }

  /**
   * Compile MDX content to a JSX component
   */
  async compile(
    content: string,
    frontmatter: Record<string, unknown> = {},
  ): Promise<MDXCompileResult> {
    // Extract headings for table of contents
    const headings = this.extractHeadings(content);

    // Compile MDX to JavaScript
    const compiled = await compile(content, {
      outputFormat: "function-body",
      development: false,
      remarkPlugins: (this.config.remarkPlugins ?? []) as Pluggable[],
      rehypePlugins: (this.config.rehypePlugins ?? []) as Pluggable[],
      // Use SemaJSX runtime
      jsxImportSource: "@semajsx/dom",
    });

    // Create the Content component
    const Content = this.createComponent(
      String(compiled),
      this.config.components ?? {},
    );

    return {
      Content,
      frontmatter,
      headings,
    };
  }

  /**
   * Create a component from compiled MDX code
   */
  private createComponent(
    code: string,
    components: Record<string, (props: Record<string, unknown>) => VNode>,
  ): (props?: Record<string, unknown>) => VNode {
    // Create a function that returns the MDX content
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(
      "jsx",
      "jsxs",
      "Fragment",
      "components",
      `
      const { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment } = arguments[0];
      const _components = arguments[1];
      ${code}
      return MDXContent;
    `,
    );

    // Import JSX runtime
    // This will be resolved at runtime
    return (props: Record<string, unknown> = {}) => {
      try {
        // Dynamic import of JSX runtime
        const jsxRuntime = require("@semajsx/dom/jsx-runtime");
        const MDXContent = fn(jsxRuntime, components);
        return MDXContent({ ...props, components });
      } catch {
        // Fallback for when runtime is not available
        throw new Error(
          "MDX rendering requires @semajsx/dom/jsx-runtime to be available",
        );
      }
    };
  }

  /**
   * Extract headings from markdown content
   */
  private extractHeadings(content: string): Heading[] {
    const headings: Heading[] = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;

    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const hashes = match[1];
      const rawText = match[2];
      if (!hashes || !rawText) continue;

      const depth = hashes.length;
      const text = rawText.trim();
      const slug = this.slugify(text);

      headings.push({ depth, text, slug });
    }

    return headings;
  }

  /**
   * Convert text to URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }
}

/**
 * Create an MDX processor instance
 */
export function createMDXProcessor(config?: MDXConfig): MDXProcessor {
  return new MDXProcessor(config);
}

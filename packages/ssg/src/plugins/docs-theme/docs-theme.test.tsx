/** @jsxImportSource @semajsx/dom */

import { describe, it, expect, vi } from "vitest";
import { docsTheme, Callout, CodeBlock } from "./index";
import type { DocsThemeOptions } from "./types";
import type { SSGPlugin, CollectionSource, CollectionEntry } from "../../types";
import { createSSG, defineCollection, z } from "../../index";

// Minimal valid options for most tests
function createMinimalOptions(overrides: Partial<DocsThemeOptions> = {}): DocsThemeOptions {
  return {
    title: "Test Docs",
    nav: {
      logo: "TestLogo",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "GitHub", href: "https://github.com/test", external: true },
      ],
    },
    ...overrides,
  };
}

// Mock source for collection tests
function createMockSource<T>(entries: CollectionEntry<T>[]): CollectionSource<T> {
  return {
    id: "mock",
    getEntries: vi.fn().mockResolvedValue(entries),
    getEntry: vi.fn().mockImplementation(async (id) => entries.find((e) => e.id === id) ?? null),
  };
}

// =============================================================================
// Plugin identity
// =============================================================================

describe("docsTheme plugin", () => {
  it("should have correct plugin name", () => {
    const plugin = docsTheme(createMinimalOptions());
    expect(plugin.name).toBe("docs-theme");
  });

  it("should return an SSGPlugin with config() hook", () => {
    const plugin = docsTheme(createMinimalOptions());
    expect(typeof plugin.config).toBe("function");
  });
});

// =============================================================================
// config() — Document
// =============================================================================

describe("docsTheme config() — document", () => {
  it("should provide a document template", () => {
    const plugin = docsTheme(createMinimalOptions());
    const result = plugin.config!({} as never);
    expect(result).toBeDefined();
    expect(result!.document).toBeDefined();
    expect(typeof result!.document).toBe("function");
  });
});

// =============================================================================
// config() — Routes
// =============================================================================

describe("docsTheme config() — routes", () => {
  it("should always include home and 404 routes", () => {
    const plugin = docsTheme(createMinimalOptions());
    const result = plugin.config!({} as never);
    const routes = result!.routes!;

    const paths = routes.map((r) => r.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/404");
  });

  it("should include docs routes when docs config is provided", () => {
    const plugin = docsTheme(
      createMinimalOptions({
        docs: {
          source: createMockSource([]),
        },
      }),
    );
    const result = plugin.config!({} as never);
    const paths = result!.routes!.map((r) => r.path);

    expect(paths).toContain("/docs");
    expect(paths).toContain("/docs/:slug");
  });

  it("should include guides routes when guides config is provided", () => {
    const plugin = docsTheme(
      createMinimalOptions({
        guides: {
          source: createMockSource([]),
        },
      }),
    );
    const result = plugin.config!({} as never);
    const paths = result!.routes!.map((r) => r.path);

    expect(paths).toContain("/guides");
    expect(paths).toContain("/guides/:slug");
  });

  it("should not include docs/guides routes when not configured", () => {
    const plugin = docsTheme(createMinimalOptions());
    const result = plugin.config!({} as never);
    const paths = result!.routes!.map((r) => r.path);

    expect(paths).not.toContain("/docs");
    expect(paths).not.toContain("/docs/:slug");
    expect(paths).not.toContain("/guides");
    expect(paths).not.toContain("/guides/:slug");
  });

  it("should use custom base paths", () => {
    const plugin = docsTheme(
      createMinimalOptions({
        docs: {
          source: createMockSource([]),
          basePath: "/reference",
        },
        guides: {
          source: createMockSource([]),
          basePath: "/tutorials",
        },
      }),
    );
    const result = plugin.config!({} as never);
    const paths = result!.routes!.map((r) => r.path);

    expect(paths).toContain("/reference");
    expect(paths).toContain("/reference/:slug");
    expect(paths).toContain("/tutorials");
    expect(paths).toContain("/tutorials/:slug");
    expect(paths).not.toContain("/docs");
    expect(paths).not.toContain("/guides");
  });
});

// =============================================================================
// config() — Collections
// =============================================================================

describe("docsTheme config() — collections", () => {
  it("should register docs collection when configured", () => {
    const source = createMockSource([]);
    const plugin = docsTheme(createMinimalOptions({ docs: { source } }));
    const result = plugin.config!({} as never);

    expect(result!.collections).toHaveLength(1);
    expect(result!.collections![0].name).toBe("docs");
  });

  it("should register guides collection when configured", () => {
    const source = createMockSource([]);
    const plugin = docsTheme(createMinimalOptions({ guides: { source } }));
    const result = plugin.config!({} as never);

    expect(result!.collections).toHaveLength(1);
    expect(result!.collections![0].name).toBe("guides");
  });

  it("should register both collections when both configured", () => {
    const plugin = docsTheme(
      createMinimalOptions({
        docs: { source: createMockSource([]) },
        guides: { source: createMockSource([]) },
      }),
    );
    const result = plugin.config!({} as never);
    const names = result!.collections!.map((c) => c.name);

    expect(names).toEqual(["docs", "guides"]);
  });

  it("should register no collections when neither configured", () => {
    const plugin = docsTheme(createMinimalOptions());
    const result = plugin.config!({} as never);

    expect(result!.collections).toHaveLength(0);
  });
});

// =============================================================================
// config() — MDX
// =============================================================================

describe("docsTheme config() — mdx", () => {
  it("should include Callout and CodeBlock as default components", () => {
    const plugin = docsTheme(createMinimalOptions());
    const result = plugin.config!({} as never);
    const components = result!.mdx!.components as Record<string, unknown>;

    expect(components.Callout).toBe(Callout);
    expect(components.CodeBlock).toBe(CodeBlock);
  });

  it("should merge user MDX components", () => {
    const Custom = () => <div>custom</div>;
    const plugin = docsTheme(
      createMinimalOptions({
        mdx: { components: { Custom } },
      }),
    );
    const result = plugin.config!({} as never);
    const components = result!.mdx!.components as Record<string, unknown>;

    expect(components.Callout).toBe(Callout);
    expect(components.CodeBlock).toBe(CodeBlock);
    expect(components.Custom).toBe(Custom);
  });

  it("should pass through remark/rehype plugins", () => {
    const remarkPlugin = () => {};
    const rehypePlugin = () => {};
    const plugin = docsTheme(
      createMinimalOptions({
        mdx: {
          remarkPlugins: [remarkPlugin],
          rehypePlugins: [rehypePlugin],
        },
      }),
    );
    const result = plugin.config!({} as never);

    expect(result!.mdx!.remarkPlugins).toContain(remarkPlugin);
    expect(result!.mdx!.rehypePlugins).toContain(rehypePlugin);
  });
});

// =============================================================================
// No hardcoded text content
// =============================================================================

describe("docsTheme — no hardcoded content", () => {
  it("should use title from options in 404 route props", () => {
    const plugin = docsTheme(createMinimalOptions({ title: "MySite" }));
    const result = plugin.config!({} as never);
    const notFoundRoute = result!.routes!.find((r) => r.path === "/404");

    expect(notFoundRoute).toBeDefined();
    const props = notFoundRoute!.props as Record<string, unknown>;
    expect(props.title).toBe("404 - Page Not Found | MySite");
  });

  it("should use title from options in home route props", () => {
    const plugin = docsTheme(createMinimalOptions({ title: "MySite" }));
    const result = plugin.config!({} as never);
    const homeRoute = result!.routes!.find((r) => r.path === "/");

    expect(homeRoute).toBeDefined();
    const props = homeRoute!.props as Record<string, unknown>;
    expect(props.title).toBe("MySite");
  });
});

// =============================================================================
// Integration with SSG plugin system
// =============================================================================

describe("docsTheme — SSG integration", () => {
  it("should work with createSSG as a plugin", () => {
    const plugin = docsTheme(
      createMinimalOptions({
        docs: { source: createMockSource([]) },
      }),
    );

    // Should not throw
    const ssg = createSSG({
      outDir: "./dist",
      plugins: [plugin],
    });

    expect(ssg).toBeDefined();
  });

  it("should merge with user-provided collections", async () => {
    const themeSource = createMockSource<{ title: string }>([
      {
        id: "intro",
        slug: "intro",
        data: { title: "Intro" },
        body: "",
        render: vi.fn(),
      },
    ]);

    const userSource = createMockSource<{ name: string }>([
      {
        id: "blog-1",
        slug: "blog-1",
        data: { name: "Blog Post" },
        body: "",
        render: vi.fn(),
      },
    ]);

    const plugin = docsTheme(
      createMinimalOptions({
        docs: { source: themeSource },
      }),
    );

    const ssg = createSSG({
      outDir: "./dist",
      plugins: [plugin],
      collections: [
        defineCollection({
          name: "blog",
          source: userSource,
          schema: z.object({ name: z.string() }),
        }),
      ],
    });

    // Both plugin and user collections available
    const docs = await ssg.getCollection("docs");
    expect(docs).toHaveLength(1);

    const blog = await ssg.getCollection("blog");
    expect(blog).toHaveLength(1);
  });

  it("should let user document override theme document", () => {
    const userDoc = () => (
      <html>
        <body>user</body>
      </html>
    );

    const plugin = docsTheme(createMinimalOptions());

    let resolvedDoc: unknown;
    const inspector: SSGPlugin = {
      name: "inspector",
      enforce: "post",
      configResolved(config) {
        resolvedDoc = config.document;
      },
    };

    createSSG({
      outDir: "./dist",
      plugins: [plugin, inspector],
      document: userDoc,
    });

    // User document wins over theme document
    expect(resolvedDoc).toBe(userDoc);
  });
});

// =============================================================================
// Callout component
// =============================================================================

describe("Callout component", () => {
  it("should render with default info type", () => {
    const result = Callout({ children: "Hello" });
    expect(result).toBeDefined();
    expect(result.props.class).toContain("dt-callout-info");
  });

  it("should render with specified type", () => {
    const result = Callout({ type: "warning", children: "Warning!" });
    expect(result.props.class).toContain("dt-callout-warning");
  });

  it("should render title when provided", () => {
    const result = Callout({ title: "Note", children: "Content" });
    // VNode children should include the title div
    expect(result.children.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// CodeBlock component
// =============================================================================

describe("CodeBlock component", () => {
  it("should render code block", () => {
    const result = CodeBlock({ children: "const x = 1;", language: "ts" });
    expect(result).toBeDefined();
    expect(result.props.class).toBe("dt-code-block");
  });

  it("should extract language from className", () => {
    const result = CodeBlock({ children: "code", className: "language-python" });
    expect(result).toBeDefined();
  });

  it("should hide header for plain text", () => {
    const result = CodeBlock({ children: "plain text" });
    expect(result).toBeDefined();
  });
});

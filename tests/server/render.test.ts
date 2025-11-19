import { describe, it, expect } from "vitest";
import { renderToString } from "@/server/render";
import { island } from "@/server/island";
import { signal } from "@/signal/signal";
import { h } from "@/runtime/vnode";

describe("renderToString", () => {
  it("should render simple HTML", () => {
    const app = h("div", null, h("h1", null, "Hello"), h("p", null, "World"));

    const result = renderToString(app);

    expect(result.html).toContain("<div>");
    expect(result.html).toContain("<h1>Hello</h1>");
    expect(result.html).toContain("<p>World</p>");
    expect(result.html).toContain("</div>");
    expect(result.islands).toHaveLength(0);
  });

  it("should render islands as placeholders", () => {
    const Counter = island(function Counter({ initial = 0 }) {
      const count = signal(initial);
      return h("button", null, count);
    }, "/Counter.tsx");

    const app = h("div", null, h("h1", null, "App"), Counter({ initial: 5 }));

    const result = renderToString(app);

    expect(result.islands).toHaveLength(1);
    expect(result.islands[0].id).toBe("island-0");
    expect(result.islands[0].props).toEqual({ initial: 5 });
    expect(result.html).toContain('data-island-id="island-0"');
    expect(result.html).toContain('data-island-path="/Counter.tsx"');
  });

  it("should generate scripts for islands", () => {
    const Counter = island(() => h("button", null, "Click"), "/Counter.tsx");

    const app = Counter({});

    const result = renderToString(app, { islandBasePath: "/islands" });

    expect(result.scripts).toContain('type="module"');
    expect(result.scripts).toContain('src="/islands/island-0.js"');
  });

  it("should handle multiple islands", () => {
    const Counter = island(() => h("button", null, "Count"), "/Counter.tsx");
    const TodoList = island(() => h("ul", null), "/TodoList.tsx");

    const app = h("div", null, Counter({}), TodoList({}), Counter({}));

    const result = renderToString(app);

    expect(result.islands).toHaveLength(3);
    expect(result.islands[0].id).toBe("island-0");
    expect(result.islands[1].id).toBe("island-1");
    expect(result.islands[2].id).toBe("island-2");

    expect(result.scripts).toContain("island-0.js");
    expect(result.scripts).toContain("island-1.js");
    expect(result.scripts).toContain("island-2.js");
  });

  it("should render nested elements correctly", () => {
    const app = h(
      "div",
      { className: "container" },
      h("header", null, h("h1", null, "Title")),
      h("main", null, h("section", null, h("p", null, "Content"))),
    );

    const result = renderToString(app);

    expect(result.html).toContain('<div class="container">');
    expect(result.html).toContain("<header>");
    expect(result.html).toContain("<h1>Title</h1>");
    expect(result.html).toContain("<main>");
    expect(result.html).toContain("<section>");
    expect(result.html).toContain("<p>Content</p>");
  });

  it("should handle attributes correctly", () => {
    const app = h(
      "div",
      null,
      h("a", { href: "/about", target: "_blank", rel: "noopener" }, "Link"),
      h("input", { type: "text", value: "test", disabled: true }),
    );

    const result = renderToString(app);

    expect(result.html).toContain('href="/about"');
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('rel="noopener"');
    expect(result.html).toContain('type="text"');
    expect(result.html).toContain('value="test"');
    expect(result.html).toContain("disabled");
  });

  it("should handle className attribute", () => {
    const app = h("div", { className: "container main-content" }, "Content");

    const result = renderToString(app);

    expect(result.html).toContain('class="container main-content"');
  });

  it("should escape HTML in text content", () => {
    const app = h("div", null, h("p", null, "<script>alert('xss')</script>"));

    const result = renderToString(app);

    expect(result.html).not.toContain("<script>alert");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("should handle self-closing tags", () => {
    const app = h(
      "div",
      null,
      h("img", { src: "/logo.png", alt: "Logo" }),
      h("br"),
      h("hr"),
      h("input", { type: "text" }),
    );

    const result = renderToString(app);

    expect(result.html).toContain("<img");
    expect(result.html).toContain('src="/logo.png"');
    expect(result.html).toContain("<br />");
    expect(result.html).toContain("<hr />");
  });

  it("should handle mixed static and island content", () => {
    const Counter = island(() => h("button", null, "Count"), "/Counter.tsx");

    const app = h(
      "div",
      null,
      h("header", null, h("h1", null, "Static Header")),
      h(
        "main",
        null,
        h("p", null, "Some static content"),
        Counter({}),
        h("p", null, "More static content"),
      ),
      h("footer", null, "Static Footer"),
    );

    const result = renderToString(app);

    expect(result.html).toContain("<h1>Static Header</h1>");
    expect(result.html).toContain("<p>Some static content</p>");
    expect(result.html).toContain('data-island-id="island-0"');
    expect(result.html).toContain("<p>More static content</p>");
    expect(result.html).toContain("Static Footer");
    expect(result.islands).toHaveLength(1);
  });

  it("should use custom island base path", () => {
    const Counter = island(() => h("button", null, "Count"), "/Counter.tsx");

    const app = Counter({});

    const result = renderToString(app, { islandBasePath: "/custom/path" });

    expect(result.scripts).toContain('src="/custom/path/island-0.js"');
  });

  it("should handle array children", () => {
    const items = ["Apple", "Banana", "Cherry"];

    const app = h(
      "ul",
      null,
      ...items.map((item) => h("li", { key: item }, item)),
    );

    const result = renderToString(app);

    expect(result.html).toContain("<li>Apple</li>");
    expect(result.html).toContain("<li>Banana</li>");
    expect(result.html).toContain("<li>Cherry</li>");
  });

  it("should handle null and undefined children", () => {
    const app = h(
      "div",
      null,
      h("p", null, "Before"),
      null,
      undefined,
      h("p", null, "After"),
    );

    const result = renderToString(app);

    expect(result.html).toContain("<p>Before</p>");
    expect(result.html).toContain("<p>After</p>");
    expect(result.html).not.toContain("null");
    expect(result.html).not.toContain("undefined");
  });
});

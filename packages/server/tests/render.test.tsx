/** @jsxImportSource @semajsx/dom */

import { describe, expect, it } from "vitest";
import { renderToString } from "@semajsx/server";
import { island } from "@semajsx/server";
import { signal } from "@semajsx/signal";

describe("renderToString", () => {
  it("should render simple HTML", () => {
    const app = (
      <div>
        <h1>Hello</h1>
        <p>World</p>
      </div>
    );

    const result = renderToString(app);

    expect(result.html).toContain("<div>");
    expect(result.html).toContain("<h1>Hello</h1>");
    expect(result.html).toContain("<p>World</p>");
    expect(result.html).toContain("</div>");
    expect(result.islands).toHaveLength(0);
  });

  it("should render islands as placeholders", () => {
    const Counter = island(function CounterComponent({ initial = 0 }) {
      const count = signal(initial);
      return <button>{count}</button>;
    }, "/Counter.tsx");

    const app = (
      <div>
        <h1>App</h1>
        <Counter initial={5} />
      </div>
    );

    const result = renderToString(app);

    expect(result.islands).toHaveLength(1);
    expect(result.islands[0]?.id).toBe("counter-component-0");
    expect(result.islands[0]?.props).toEqual({ initial: 5 });
    expect(result.html).toContain('data-island-id="counter-component-0"');
    expect(result.html).toContain("data-island-props=");
  });

  it("should generate scripts for islands", () => {
    const Counter = island(() => <button>Click</button>, "/Counter.tsx");

    const app = <Counter />;

    const result = renderToString(app, { islandBasePath: "/islands" });

    expect(result.scripts).toContain('type="module"');
    expect(result.scripts).toContain('src="/islands/anonymous-0.js"');
  });

  it("should handle multiple islands", () => {
    const Counter = island(() => <button>Count</button>, "/Counter.tsx");
    const TodoList = island(() => <ul></ul>, "/TodoList.tsx");

    const app = (
      <div>
        <Counter />
        <TodoList />
        <Counter />
      </div>
    );

    const result = renderToString(app);

    expect(result.islands).toHaveLength(3);
    expect(result.islands[0]?.id).toBe("anonymous-0");
    expect(result.islands[1]?.id).toBe("anonymous-1");
    expect(result.islands[2]?.id).toBe("anonymous-2");

    expect(result.scripts).toContain("anonymous-0.js");
    expect(result.scripts).toContain("anonymous-1.js");
    expect(result.scripts).toContain("anonymous-2.js");
  });

  it("should render nested elements correctly", () => {
    const app = (
      <div className="container">
        <header>
          <h1>Title</h1>
        </header>
        <main>
          <section>
            <p>Content</p>
          </section>
        </main>
      </div>
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
    const app = (
      <div>
        <a href="/about" target="_blank" rel="noopener">
          Link
        </a>
        <input type="text" value="test" disabled={true} />
      </div>
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
    const app = <div className="container main-content">Content</div>;

    const result = renderToString(app);

    expect(result.html).toContain('class="container main-content"');
  });

  it("should escape HTML in text content", () => {
    const app = (
      <div>
        <p>{"<script>alert('xss')</script>"}</p>
      </div>
    );

    const result = renderToString(app);

    expect(result.html).not.toContain("<script>alert");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("should handle self-closing tags", () => {
    const app = (
      <div>
        <img src="/logo.png" alt="Logo" />
        <br />
        <hr />
        <input type="text" />
      </div>
    );

    const result = renderToString(app);

    expect(result.html).toContain("<img");
    expect(result.html).toContain('src="/logo.png"');
    expect(result.html).toContain("<br />");
    expect(result.html).toContain("<hr />");
  });

  it("should handle mixed static and island content", () => {
    const Counter = island(() => <button>Count</button>, "/Counter.tsx");

    const app = (
      <div>
        <header>
          <h1>Static Header</h1>
        </header>
        <main>
          <p>Some static content</p>
          <Counter />
          <p>More static content</p>
        </main>
        <footer>Static Footer</footer>
      </div>
    );

    const result = renderToString(app);

    expect(result.html).toContain("<h1>Static Header</h1>");
    expect(result.html).toContain("<p>Some static content</p>");
    expect(result.html).toContain('data-island-id="anonymous-0"');
    expect(result.html).toContain("<p>More static content</p>");
    expect(result.html).toContain("Static Footer");
    expect(result.islands).toHaveLength(1);
  });

  it("should use custom island base path", () => {
    const Counter = island(() => <button>Count</button>, "/Counter.tsx");

    const app = <Counter />;

    const result = renderToString(app, { islandBasePath: "/custom/path" });

    expect(result.scripts).toContain('src="/custom/path/anonymous-0.js"');
  });

  it("should handle array children", () => {
    const items = ["Apple", "Banana", "Cherry"];

    const app = (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );

    const result = renderToString(app);

    expect(result.html).toContain("<li>Apple</li>");
    expect(result.html).toContain("<li>Banana</li>");
    expect(result.html).toContain("<li>Cherry</li>");
  });

  it("should handle null and undefined children", () => {
    const app = (
      <div>
        <p>Before</p>
        {null}
        {undefined}
        <p>After</p>
      </div>
    );

    const result = renderToString(app);

    expect(result.html).toContain("<p>Before</p>");
    expect(result.html).toContain("<p>After</p>");
    expect(result.html).not.toContain("null");
    expect(result.html).not.toContain("undefined");
  });

  it("should not expose file paths in HTML (security)", () => {
    // Test with absolute path
    const Counter = island(
      () => <button>Click</button>,
      "file:///home/user/project/src/components/Counter.tsx",
    );

    const app = <Counter />;

    const result = renderToString(app);

    // HTML should NOT contain the file path
    expect(result.html).not.toContain("/home/user");
    expect(result.html).not.toContain("file://");
    expect(result.html).not.toContain("Counter.tsx");
    expect(result.html).not.toContain("data-island-path");

    // But should still have island ID and props
    expect(result.html).toContain('data-island-id="anonymous-0"');
    expect(result.html).toContain("data-island-props=");

    // Server-side metadata should still have the path
    expect(result.islands[0]?.path).toBe(
      "file:///home/user/project/src/components/Counter.tsx",
    );
  });
});

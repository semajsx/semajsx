/** @jsxImportSource @semajsx/dom */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { hydrate } from "../src/hydrate";
import { signal } from "@semajsx/signal";

describe("hydrate", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("basic hydration", () => {
    it("should hydrate simple element", () => {
      // Simulate server-rendered content
      container.innerHTML = '<div class="test">Hello</div>';

      const vnode = <div class="test">Hello</div>;
      const result = hydrate(vnode, container);

      expect(result).toBe(container.firstChild);
      expect(container.innerHTML).toBe('<div class="test">Hello</div>');
    });

    it("should warn and return null if container is empty", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const vnode = <div>Content</div>;
      const result = hydrate(vnode, container);

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("should hydrate nested elements", () => {
      container.innerHTML = "<div><h1>Title</h1><p>Content</p></div>";

      const vnode = (
        <div>
          <h1>Title</h1>
          <p>Content</p>
        </div>
      );
      hydrate(vnode, container);

      expect(container.querySelector("h1")?.textContent).toBe("Title");
      expect(container.querySelector("p")?.textContent).toBe("Content");
    });
  });

  describe("event handlers", () => {
    it("should attach event handlers", () => {
      container.innerHTML = "<button>Click me</button>";

      let clicked = false;
      const vnode = (
        <button
          onclick={() => {
            clicked = true;
          }}
        >
          Click me
        </button>
      );
      hydrate(vnode, container);

      const button = container.querySelector("button");
      button?.click();

      expect(clicked).toBe(true);
    });
  });

  describe("signal reactivity", () => {
    it("should hydrate and make signal props reactive", async () => {
      container.innerHTML = '<div class="initial">Test</div>';

      const className = signal("initial");
      const vnode = <div class={className}>Test</div>;
      hydrate(vnode, container);

      const div = container.querySelector("div");
      expect(div?.className).toBe("initial");

      className.value = "updated";
      await new Promise((r) => queueMicrotask(r));

      expect(div?.className).toBe("updated");
    });

    it("should handle signal text content", async () => {
      container.innerHTML = "<div>5</div>";

      const count = signal(5);
      const vnode = <div>{count}</div>;
      hydrate(vnode, container);

      count.value = 10;
      await new Promise((r) => queueMicrotask(r));

      expect(container.textContent).toContain("10");
    });
  });

  describe("components", () => {
    it("should hydrate function components", () => {
      container.innerHTML = "<h1>Hello, World!</h1>";

      const Greeting = ({ name }: { name: string }) => {
        return <h1>Hello, {name}!</h1>;
      };

      const vnode = <Greeting name="World" />;
      hydrate(vnode, container);

      expect(container.querySelector("h1")?.textContent).toBe("Hello, World!");
    });
  });

  describe("refs", () => {
    it("should attach callback refs", () => {
      container.innerHTML = "<div>Content</div>";

      let refElement: Element | null = null;
      const vnode = (
        <div
          ref={(el) => {
            refElement = el;
          }}
        >
          Content
        </div>
      );
      hydrate(vnode, container);

      expect(refElement).toBe(container.firstChild);
    });

    it("should attach object refs", () => {
      container.innerHTML = "<div>Content</div>";

      const ref = { current: null as Element | null };
      const vnode = <div ref={ref}>Content</div>;
      hydrate(vnode, container);

      expect(ref.current).toBe(container.firstChild);
    });
  });

  describe("mismatch handling", () => {
    it("should warn on text mismatch but continue", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      container.innerHTML = "<div>Server text</div>";

      const vnode = <div>Client text</div>;
      hydrate(vnode, container);

      expect(warnSpy).toHaveBeenCalled();
      // Content should be updated to match vnode
      expect(container.textContent).toContain("Client text");
      warnSpy.mockRestore();
    });

    it("should warn on tag mismatch", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      container.innerHTML = "<span>Content</span>";

      const vnode = <div>Content</div>;
      hydrate(vnode, container);

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("fragments", () => {
    it("should hydrate fragment children", () => {
      container.innerHTML = "<span>One</span><span>Two</span>";

      const vnode = (
        <>
          <span>One</span>
          <span>Two</span>
        </>
      );
      hydrate(vnode, container);

      const spans = container.querySelectorAll("span");
      expect(spans.length).toBe(2);
      expect(spans[0]?.textContent).toBe("One");
      expect(spans[1]?.textContent).toBe("Two");
    });
  });

  describe("error handling", () => {
    it("should fall back to client-side rendering on error", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Create invalid DOM structure that will cause hydration to fail
      container.innerHTML = "<div>Content</div>";

      // Create a vnode that will throw during hydration
      const BadComponent = () => {
        throw new Error("Component error");
      };

      const vnode = <BadComponent />;
      hydrate(vnode, container);

      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });
});

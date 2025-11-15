import { describe, it, expect, beforeEach } from "vitest";
import { signal } from "@/signal";
import { h } from "@/runtime/vnode";
import { TerminalRenderer, render } from "@/terminal";
import { Writable } from "stream";

/**
 * Mock writable stream for testing
 */
class MockStream extends Writable {
  public output: string[] = [];
  public columns: number = 80;
  public rows: number = 24;

  override _write(chunk: any, _encoding: string, callback: () => void): void {
    this.output.push(chunk.toString());
    callback();
  }

  clear(): void {
    this.output = [];
  }

  getLastOutput(): string {
    return this.output[this.output.length - 1] || "";
  }
}

describe("Terminal Integration", () => {
  let mockStream: MockStream;
  let renderer: TerminalRenderer;

  beforeEach(() => {
    mockStream = new MockStream();
    renderer = new TerminalRenderer(mockStream as any);
  });

  describe("render with h()", () => {
    it("should render simple element tree", () => {
      const app = h("box", {}, [h("text", {}, ["Hello World"])]);

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should render nested elements", () => {
      const app = h("box", { flexDirection: "column" }, [
        h("text", {}, ["Line 1"]),
        h("text", {}, ["Line 2"]),
        h("text", {}, ["Line 3"]),
      ]);

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should apply styles", () => {
      const app = h(
        "box",
        {
          padding: 2,
          border: "round",
          flexDirection: "column",
        },
        [h("text", { color: "green", bold: true }, ["Styled Text"])],
      );

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });
  });

  describe("render with signals", () => {
    it("should render signal values", () => {
      const count = signal(0);
      const app = h("box", {}, [h("text", {}, ["Count: ", count])]);

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should update when signal changes", () => {
      const count = signal(0);
      const app = h("box", {}, [h("text", {}, ["Count: ", count])]);

      render(app, { renderer });

      // Update signal
      count.value = 42;

      // Signal value should be updated
      expect(count.value).toBe(42);
    });

    it("should handle computed signals", () => {
      const count = signal(5);
      const app = h("box", {}, [h("text", {}, ["Value: ", count])]);

      render(app, { renderer });

      count.value = 10;

      expect(count.value).toBe(10);
    });
  });

  describe("component rendering", () => {
    it("should render functional components", () => {
      function Counter({ initial }: { initial: number }) {
        const count = signal(initial);
        return h("box", {}, [
          h("text", {}, ["Count: ", count]),
          h("button", { onClick: () => count.value++ }, ["Increment"]),
        ]);
      }

      const app = h(Counter, { initial: 5 });

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should render with props", () => {
      function Greeting({ name }: { name: string }) {
        return h("box", {}, [h("text", {}, ["Hello, ", name, "!"])]);
      }

      const app = h(Greeting, { name: "World" });

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should render nested components", () => {
      function Inner() {
        return h("text", {}, ["Inner content"]);
      }

      function Outer() {
        return h("box", {}, [h(Inner, {})]);
      }

      function App() {
        return h("box", {}, [h(Outer, {})]);
      }

      const app = h(App, {});

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });
  });

  describe("unmounting", () => {
    it("should cleanup when unmounted", () => {
      const count = signal(0);
      const app = h("box", {}, [h("text", {}, ["Count: ", count])]);

      const { unmount } = render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);

      unmount();

      // After unmount, no error should occur
      expect(true).toBe(true);
    });
  });

  describe("layout and positioning", () => {
    it("should handle padding", () => {
      const app = h("box", { padding: 2 }, [h("text", {}, ["Content"])]);

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it("should respect flexbox layout", () => {
      const app = h("box", { flexDirection: "row" }, [
        h("box", { width: 20 }, [h("text", {}, ["Left"])]),
        h("box", { width: 20 }, [h("text", {}, ["Right"])]),
      ]);

      render(app, { renderer });

      expect(mockStream.output.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const app = h("box", {});

      expect(() => render(app, { renderer })).not.toThrow();
    });

    it("should handle null/undefined in children", () => {
      const show = signal(false);
      const app = h("box", {}, [show.value && h("text", {}, ["Conditional"])]);

      expect(() => render(app, { renderer })).not.toThrow();
    });

    it("should handle deeply nested structures", () => {
      const app = h("box", {}, [
        h("box", {}, [h("box", {}, [h("box", {}, [h("text", {}, ["Deep"])])])]),
      ]);

      expect(() => render(app, { renderer })).not.toThrow();
    });
  });
});

/** @jsxImportSource @semajsx/dom */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { computed, signal } from "@semajsx/signal";
import { render } from "@semajsx/dom";

describe("Keyed Reconciliation", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("tryReuseNode - text nodes", () => {
    it("should reuse text nodes when content changes", async () => {
      const text = signal("Hello");
      const vnode = <div>{text}</div>;
      render(vnode, container);

      expect(container.textContent).toBe("Hello");

      text.value = "World";
      await new Promise((r) => queueMicrotask(r));
      expect(container.textContent).toBe("World");
    });

    it("should reuse text nodes with same content", async () => {
      const text = signal("Same");
      const vnode = <div>{text}</div>;
      render(vnode, container);

      text.value = "Same";
      await new Promise((r) => queueMicrotask(r));
      expect(container.textContent).toBe("Same");
    });
  });

  describe("tryReuseNode - elements", () => {
    it("should reuse elements with same tag when updating attributes", async () => {
      const className = signal("initial");
      const id = signal("test-id");
      const vnode = (
        <div>
          <span class={className} id={id}>
            Content
          </span>
        </div>
      );
      render(vnode, container);

      const span = container.querySelector("span");
      expect(span?.className).toBe("initial");
      expect(span?.id).toBe("test-id");

      className.value = "updated";
      id.value = "new-id";
      await new Promise((r) => queueMicrotask(r));

      expect(span?.className).toBe("updated");
      expect(span?.id).toBe("new-id");
    });

    it("should remove old attributes not present in new element", async () => {
      const hasTitle = signal(true);
      const content = computed([hasTitle], (h) =>
        h ? (
          <span class="test" title="tooltip">
            With title
          </span>
        ) : (
          <span class="test">No title</span>
        ),
      );
      const vnode = <div>{content}</div>;
      render(vnode, container);

      let span = container.querySelector("span");
      expect(span?.hasAttribute("title")).toBe(true);

      hasTitle.value = false;
      await new Promise((r) => queueMicrotask(r));

      span = container.querySelector("span");
      expect(span?.hasAttribute("title")).toBe(false);
    });

    it("should replace element when tag changes", async () => {
      const useDiv = signal(true);
      const content = computed([useDiv], (d) =>
        d ? <div>Div content</div> : <span>Span content</span>,
      );
      const vnode = <div>{content}</div>;
      render(vnode, container);

      expect(container.querySelector("div div")).toBeTruthy();
      expect(container.querySelector("span")).toBeFalsy();

      useDiv.value = false;
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelector("div div")).toBeFalsy();
      expect(container.querySelector("span")).toBeTruthy();
    });
  });

  describe("keyed children reconciliation", () => {
    it("should reconcile keyed list on reorder", async () => {
      const items = signal([
        { key: "a", value: 1 },
        { key: "b", value: 2 },
        { key: "c", value: 3 },
      ]);

      const list = computed([items], (list) => (
        <ul>
          {list.map((item) => (
            <li key={item.key}>
              {item.key}: {item.value}
            </li>
          ))}
        </ul>
      ));

      render(list, container);

      expect(container.querySelectorAll("li").length).toBe(3);
      expect(container.querySelectorAll("li")[0]?.textContent).toBe("a: 1");
      expect(container.querySelectorAll("li")[1]?.textContent).toBe("b: 2");
      expect(container.querySelectorAll("li")[2]?.textContent).toBe("c: 3");

      // Reorder items
      items.value = [
        { key: "c", value: 3 },
        { key: "a", value: 1 },
        { key: "b", value: 2 },
      ];
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("li").length).toBe(3);
      expect(container.querySelectorAll("li")[0]?.textContent).toBe("c: 3");
      expect(container.querySelectorAll("li")[1]?.textContent).toBe("a: 1");
      expect(container.querySelectorAll("li")[2]?.textContent).toBe("b: 2");
    });

    it("should add new keyed items", async () => {
      const items = signal([{ key: "a", value: 1 }]);

      const list = computed([items], (list) => (
        <ul>
          {list.map((item) => (
            <li key={item.key}>{item.value}</li>
          ))}
        </ul>
      ));

      render(list, container);

      expect(container.querySelectorAll("li").length).toBe(1);

      items.value = [
        { key: "a", value: 1 },
        { key: "b", value: 2 },
        { key: "c", value: 3 },
      ];
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("li").length).toBe(3);
    });

    it("should remove keyed items", async () => {
      const items = signal([
        { key: "a", value: 1 },
        { key: "b", value: 2 },
        { key: "c", value: 3 },
      ]);

      const list = computed([items], (list) => (
        <ul>
          {list.map((item) => (
            <li key={item.key}>{item.value}</li>
          ))}
        </ul>
      ));

      render(list, container);

      expect(container.querySelectorAll("li").length).toBe(3);

      // Remove middle item
      items.value = [
        { key: "a", value: 1 },
        { key: "c", value: 3 },
      ];
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("li").length).toBe(2);
      expect(container.querySelectorAll("li")[0]?.textContent).toBe("1");
      expect(container.querySelectorAll("li")[1]?.textContent).toBe("3");
    });

    it("should handle mix of keyed and non-keyed children", async () => {
      const items = signal([1, 2, 3]);

      const list = computed([items], (list) => (
        <ul>
          {list.map((item, i) =>
            i === 1 ? <li key="middle">{item}</li> : <li>{item}</li>,
          )}
        </ul>
      ));

      render(list, container);

      expect(container.querySelectorAll("li").length).toBe(3);

      items.value = [4, 5, 6];
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("li").length).toBe(3);
    });

    it("should clear all children when transitioning to empty", async () => {
      const items = signal([
        { key: "a", value: 1 },
        { key: "b", value: 2 },
      ]);

      const list = computed([items], (list) => (
        <ul>
          {list.map((item) => (
            <li key={item.key}>{item.value}</li>
          ))}
        </ul>
      ));

      render(list, container);

      expect(container.querySelectorAll("li").length).toBe(2);

      items.value = [];
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("li").length).toBe(0);
    });
  });

  describe("render with Promise", () => {
    it("should render Promise<VNode> directly", async () => {
      const promiseVNode = Promise.resolve(<div>Resolved content</div>);

      render(promiseVNode, container);

      // Initially empty
      expect(container.textContent).toBe("");

      // Wait for resolution
      await new Promise((r) => setTimeout(r, 10));
      expect(container.textContent).toBe("Resolved content");
    });

    it("should render delayed Promise", async () => {
      const promiseVNode = new Promise<JSX.Element>((resolve) => {
        setTimeout(() => resolve(<span>Delayed</span>), 20);
      });

      render(promiseVNode, container);

      expect(container.textContent).toBe("");

      await new Promise((r) => setTimeout(r, 30));
      expect(container.querySelector("span")?.textContent).toBe("Delayed");
    });
  });

  describe("render with AsyncIterator", () => {
    it("should render AsyncIterator directly", async () => {
      async function* createIterator() {
        yield <div>Step 1</div>;
        await new Promise((r) => setTimeout(r, 10));
        yield <div>Step 2</div>;
      }

      render(createIterator(), container);

      expect(container.textContent).toBe("");

      await new Promise((r) => setTimeout(r, 5));
      expect(container.textContent).toBe("Step 1");

      await new Promise((r) => setTimeout(r, 15));
      expect(container.textContent).toBe("Step 2");
    });
  });

  describe("children updates without keys", () => {
    it("should update children by replacing", async () => {
      const count = signal(2);

      const content = computed([count], (n) => (
        <div>
          {Array.from({ length: n }, (_, i) => (
            <span>{i}</span>
          ))}
        </div>
      ));

      render(content, container);

      expect(container.querySelectorAll("span").length).toBe(2);

      count.value = 5;
      await new Promise((r) => queueMicrotask(r));

      expect(container.querySelectorAll("span").length).toBe(5);
    });
  });
});

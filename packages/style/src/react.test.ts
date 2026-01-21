import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createElement, useState, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { signal } from "@semajsx/signal";
import { classes } from "./classes";
import { rule } from "./rule";
import { StyleAnchor, useStyle, useSignal } from "./react";

describe("React Integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    document.body.removeChild(container);
  });

  it("should render StyleAnchor with children", async () => {
    const c = classes(["box"]);
    const boxToken = rule`${c.box} { padding: 8px; }`;

    function TestComponent() {
      const cx = useStyle();
      return createElement("div", { className: cx(boxToken), "data-testid": "box" }, "Hello");
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));

    await new Promise((r) => setTimeout(r, 10));

    const box = container.querySelector('[data-testid="box"]');
    expect(box).not.toBeNull();
    expect(box?.className).toContain(c.box.toString());
  });

  it("should inject CSS when using cx with StyleToken", async () => {
    const c = classes(["btn"]);
    const btnToken = rule`${c.btn} { background: blue; }`;

    function TestComponent() {
      const cx = useStyle();
      return createElement("button", { className: cx(btnToken) }, "Click");
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));

    await new Promise((r) => setTimeout(r, 10));

    // Check that CSS was injected
    const styleEls = document.head.querySelectorAll("style");
    const hasStyle = Array.from(styleEls).some((el) =>
      el.textContent?.includes("background: blue"),
    );
    expect(hasStyle).toBe(true);
  });

  it("should combine multiple class names with cx", async () => {
    const c = classes(["base", "active"]);
    const baseToken = rule`${c.base} { padding: 8px; }`;
    const activeToken = rule`${c.active} { color: red; }`;

    function TestComponent() {
      const cx = useStyle();
      return createElement(
        "div",
        {
          className: cx(baseToken, activeToken, "custom"),
          "data-testid": "combined",
        },
        "Test",
      );
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));

    await new Promise((r) => setTimeout(r, 10));

    const el = container.querySelector('[data-testid="combined"]');
    expect(el?.className).toContain(c.base.toString());
    expect(el?.className).toContain(c.active.toString());
    expect(el?.className).toContain("custom");
  });

  it("should filter falsy values in cx", async () => {
    const c = classes(["btn", "large"]);
    const btnToken = rule`${c.btn} { padding: 8px; }`;
    const largeToken = rule`${c.large} { font-size: 18px; }`;

    function TestComponent() {
      const cx = useStyle();
      const isLarge = false;
      return createElement(
        "button",
        {
          className: cx(btnToken, isLarge && largeToken, null, undefined),
          "data-testid": "btn",
        },
        "Click",
      );
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));

    await new Promise((r) => setTimeout(r, 10));

    const btn = container.querySelector('[data-testid="btn"]');
    expect(btn?.className).toContain(c.btn.toString());
    expect(btn?.className).not.toContain(c.large.toString());
  });

  it("should handle signal bindings for reactive styles", async () => {
    const c = classes(["box"]);

    function TestComponent() {
      const cx = useStyle();
      const height = useSignal(100);

      const boxToken = rule`${c.box} { height: ${height}px; }`;

      return createElement(
        "div",
        {
          className: cx(boxToken),
          "data-testid": "reactive-box",
          onClick: () => {
            height.value = 200;
          },
        },
        "Reactive",
      );
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));

    await new Promise((r) => setTimeout(r, 10));

    // Check that the anchor element has the CSS variable
    const anchor = container.querySelector('div[style*="display: contents"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("style")).toContain("100px");
  });

  it("should work without StyleAnchor (fallback mode)", async () => {
    const c = classes(["fallback"]);
    const token = rule`${c.fallback} { margin: 4px; }`;

    function TestComponent() {
      const cx = useStyle();
      return createElement("div", { className: cx(token), "data-testid": "fallback" }, "Fallback");
    }

    // Render without StyleAnchor
    root.render(createElement(TestComponent));

    await new Promise((r) => setTimeout(r, 10));

    const el = container.querySelector('[data-testid="fallback"]');
    // Should still get the className even without StyleAnchor
    expect(el?.className).toContain(c.fallback.toString());
  });

  it("should cleanup subscriptions on unmount", async () => {
    const c = classes(["cleanup"]);
    const height = signal(100);
    const boxToken = rule`${c.cleanup} { height: ${height}px; }`;

    function TestComponent() {
      const cx = useStyle();
      return createElement("div", { className: cx(boxToken) }, "Cleanup");
    }

    root.render(createElement(StyleAnchor, null, createElement(TestComponent)));
    await new Promise((r) => setTimeout(r, 10));

    // Unmount
    root.unmount();

    // Update signal after unmount - should not throw
    height.value = 300;
    await new Promise((r) => setTimeout(r, 10));

    // Test passes if no error was thrown
    expect(true).toBe(true);
  });
});

describe("useSignal", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    document.body.removeChild(container);
  });

  it("should create a signal with initial value", async () => {
    let capturedSignal: ReturnType<typeof useSignal<number>> | null = null;

    function TestComponent() {
      const count = useSignal(42);
      capturedSignal = count;
      return createElement("span", null, String(count.value));
    }

    root.render(createElement(TestComponent));
    await new Promise((r) => setTimeout(r, 10));

    expect(capturedSignal).not.toBeNull();
    expect(capturedSignal?.value).toBe(42);
  });

  it("should preserve signal across re-renders", async () => {
    const signals: Array<ReturnType<typeof useSignal<number>>> = [];

    function TestComponent() {
      const count = useSignal(0);
      signals.push(count);

      const [, setTrigger] = useState(0);

      useEffect(() => {
        // Trigger a re-render
        setTrigger(1);
      }, []);

      return createElement("span", null, String(count.value));
    }

    root.render(createElement(TestComponent));
    await new Promise((r) => setTimeout(r, 50));

    // Should be the same signal instance across renders
    expect(signals.length).toBeGreaterThanOrEqual(2);
    expect(signals[0]).toBe(signals[1]);
  });
});

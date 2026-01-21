import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import { signal } from "@semajsx/signal";
import { classes } from "./classes";
import { rule } from "./rule";
import { StyleAnchor, useStyle, useSignal } from "./vue";

describe("Vue Integration", () => {
  let container: HTMLDivElement;
  let app: ReturnType<typeof createApp> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    app?.unmount();
    document.body.removeChild(container);
  });

  it("should render StyleAnchor with children", async () => {
    const c = classes(["box"]);
    const boxToken = rule`${c.box} { padding: 8px; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        return () => h("div", { class: cx(boxToken), "data-testid": "box" }, "Hello");
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    const box = container.querySelector('[data-testid="box"]');
    expect(box).not.toBeNull();
    expect(box?.className).toContain(c.box.toString());
  });

  it("should inject CSS when using cx with StyleToken", async () => {
    const c = classes(["btn"]);
    const btnToken = rule`${c.btn} { background: green; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        return () => h("button", { class: cx(btnToken) }, "Click");
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    // Check that CSS was injected
    const styleEls = document.head.querySelectorAll("style");
    const hasStyle = Array.from(styleEls).some((el) =>
      el.textContent?.includes("background: green"),
    );
    expect(hasStyle).toBe(true);
  });

  it("should combine multiple class names with cx", async () => {
    const c = classes(["base", "active"]);
    const baseToken = rule`${c.base} { padding: 8px; }`;
    const activeToken = rule`${c.active} { color: red; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        return () =>
          h(
            "div",
            {
              class: cx(baseToken, activeToken, "custom"),
              "data-testid": "combined",
            },
            "Test",
          );
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    const el = container.querySelector('[data-testid="combined"]');
    expect(el?.className).toContain(c.base.toString());
    expect(el?.className).toContain(c.active.toString());
    expect(el?.className).toContain("custom");
  });

  it("should filter falsy values in cx", async () => {
    const c = classes(["btn", "large"]);
    const btnToken = rule`${c.btn} { padding: 8px; }`;
    const largeToken = rule`${c.large} { font-size: 18px; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        const isLarge = false;
        return () =>
          h(
            "button",
            {
              class: cx(btnToken, isLarge && largeToken, null, undefined),
              "data-testid": "btn",
            },
            "Click",
          );
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    const btn = container.querySelector('[data-testid="btn"]');
    expect(btn?.className).toContain(c.btn.toString());
    expect(btn?.className).not.toContain(c.large.toString());
  });

  it("should handle signal bindings for reactive styles", async () => {
    const c = classes(["box"]);

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        const height = useSignal(100);

        const boxToken = rule`${c.box} { height: ${height}px; }`;

        return () =>
          h(
            "div",
            {
              class: cx(boxToken),
              "data-testid": "reactive-box",
              onClick: () => {
                height.value = 200;
              },
            },
            "Reactive",
          );
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    // Check that the anchor element has the CSS variable
    const anchor = container.querySelector('div[style*="display: contents"]');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("style")).toContain("100px");
  });

  it("should work without StyleAnchor (fallback mode)", async () => {
    const c = classes(["fallback"]);
    const token = rule`${c.fallback} { margin: 4px; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        return () => h("div", { class: cx(token), "data-testid": "fallback" }, "Fallback");
      },
    });

    // Render without StyleAnchor
    app = createApp(TestComponent);
    app.mount(container);

    await nextTick();

    const el = container.querySelector('[data-testid="fallback"]');
    // Should still get the className even without StyleAnchor
    expect(el?.className).toContain(c.fallback.toString());
  });

  it("should cleanup subscriptions on unmount", async () => {
    const c = classes(["cleanup"]);
    const height = signal(100);
    const boxToken = rule`${c.cleanup} { height: ${height}px; }`;

    const TestComponent = defineComponent({
      setup() {
        const cx = useStyle();
        return () => h("div", { class: cx(boxToken) }, "Cleanup");
      },
    });

    const App = defineComponent({
      setup() {
        return () => h(StyleAnchor, null, { default: () => h(TestComponent) });
      },
    });

    app = createApp(App);
    app.mount(container);

    await nextTick();

    // Unmount
    app.unmount();
    app = null;

    // Update signal after unmount - should not throw
    height.value = 300;
    await nextTick();

    // Test passes if no error was thrown
    expect(true).toBe(true);
  });
});

describe("useSignal (Vue)", () => {
  let container: HTMLDivElement;
  let app: ReturnType<typeof createApp> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    app?.unmount();
    document.body.removeChild(container);
  });

  it("should create a signal with initial value", async () => {
    let capturedSignal: ReturnType<typeof useSignal<number>> | null = null;

    const TestComponent = defineComponent({
      setup() {
        const count = useSignal(42);
        capturedSignal = count;
        return () => h("span", null, String(count.value));
      },
    });

    app = createApp(TestComponent);
    app.mount(container);

    await nextTick();

    expect(capturedSignal).not.toBeNull();
    expect(capturedSignal?.value).toBe(42);
  });

  it("should update signal value", async () => {
    let capturedSignal: ReturnType<typeof useSignal<number>> | null = null;

    const TestComponent = defineComponent({
      setup() {
        const count = useSignal(0);
        capturedSignal = count;
        return () =>
          h(
            "button",
            {
              onClick: () => {
                count.value++;
              },
            },
            String(count.value),
          );
      },
    });

    app = createApp(TestComponent);
    app.mount(container);

    await nextTick();

    expect(capturedSignal?.value).toBe(0);

    // Update signal
    capturedSignal!.value = 10;

    expect(capturedSignal?.value).toBe(10);
  });
});

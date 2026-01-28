import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { classes } from "./classes";
import { rule } from "./rule";
import { inject, injectStyles, preload } from "./inject";

describe("injectStyles", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should inject CSS into the target", () => {
    injectStyles(".test { color: red; }", container);

    const styleEl = container.querySelector("style");
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toBe(".test { color: red; }");
  });

  it("should inject into document.head by default", () => {
    const initialCount = document.head.querySelectorAll("style").length;

    injectStyles(".test { color: blue; }");

    const newCount = document.head.querySelectorAll("style").length;
    expect(newCount).toBe(initialCount + 1);

    // Cleanup
    const styleEls = document.head.querySelectorAll("style");
    styleEls[styleEls.length - 1]?.remove();
  });
});

describe("inject", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should inject a single StyleToken", () => {
    const c = classes(["btn"]);
    const token = rule`${c.btn} { padding: 8px; }`;

    inject(token, { target: container });

    const styleEl = container.querySelector("style");
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain("padding: 8px");
  });

  it("should inject an array of StyleTokens", () => {
    const c = classes(["btn", "icon"]);
    const btnToken = rule`${c.btn} { padding: 8px; }`;
    const iconToken = rule`${c.icon} { width: 16px; }`;

    inject([btnToken, iconToken], { target: container });

    const styleEls = container.querySelectorAll("style");
    expect(styleEls.length).toBe(2);
  });

  it("should inject an object of StyleTokens", () => {
    const c = classes(["btn", "icon"]);
    const styles = {
      btn: rule`${c.btn} { padding: 8px; }`,
      icon: rule`${c.icon} { width: 16px; }`,
    };

    inject(styles, { target: container });

    const styleEls = container.querySelectorAll("style");
    expect(styleEls.length).toBe(2);
  });

  it("should deduplicate by className", () => {
    const c = classes(["btn"]);
    const token = rule`${c.btn} { padding: 8px; }`;

    inject(token, { target: container });
    inject(token, { target: container });
    inject(token, { target: container });

    const styleEls = container.querySelectorAll("style");
    expect(styleEls.length).toBe(1);
  });
});

describe("preload", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should preload multiple style objects", () => {
    const c1 = classes(["a"]);
    const c2 = classes(["b"]);
    const styles1 = { a: rule`${c1.a} { color: red; }` };
    const styles2 = { b: rule`${c2.b} { color: blue; }` };

    // Preload injects into document.head by default
    const initialCount = document.head.querySelectorAll("style").length;
    preload(styles1, styles2);
    const newCount = document.head.querySelectorAll("style").length;

    expect(newCount).toBe(initialCount + 2);

    // Cleanup
    const styleEls = document.head.querySelectorAll("style");
    for (let i = styleEls.length - 1; i >= styleEls.length - 2; i--) {
      styleEls[i]?.remove();
    }
  });
});

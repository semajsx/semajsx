import { beforeEach, describe, expect, it } from "vitest";
import { signal } from "@/signal";
import { h } from "@/runtime/vnode";
import { render } from "@/dom/render";

describe("Ref functionality", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should set ref with signal", () => {
    const divRef = signal<HTMLDivElement | null>(null);
    const vnode = h("div", { ref: divRef }, "Hello");

    render(vnode, container);

    expect(divRef.value).toBeInstanceOf(HTMLDivElement);
    expect(divRef.value?.textContent).toBe("Hello");
  });

  it("should set ref with callback", async () => {
    let capturedElement: HTMLDivElement | null = null;
    const refCallback = (el: HTMLDivElement | null) => {
      capturedElement = el;
    };

    const vnode = h("div", { ref: refCallback }, "Hello");

    render(vnode, container);

    expect(capturedElement).toBeInstanceOf(HTMLDivElement);
    expect(capturedElement!.textContent).toBe("Hello");
  });

  it("should clear ref on unmount with signal", async () => {
    const divRef = signal<HTMLDivElement | null>(null);
    const vnode = h("div", { ref: divRef }, "Hello");

    const rendered = render(vnode, container);

    expect(divRef.value).toBeInstanceOf(HTMLDivElement);

    // Unmount
    const { unmount } = await import("@/dom/render");
    unmount(rendered);

    expect(divRef.value).toBe(null);
  });

  it("should call ref callback with null on unmount", async () => {
    const calls: Array<HTMLDivElement | null> = [];
    const refCallback = (el: HTMLDivElement | null) => {
      calls.push(el);
    };

    const vnode = h("div", { ref: refCallback }, "Hello");

    const rendered = render(vnode, container);

    expect(calls).toHaveLength(1);
    expect(calls[0]).toBeInstanceOf(HTMLDivElement);

    // Unmount
    const { unmount } = await import("@/dom/render");
    unmount(rendered);

    expect(calls).toHaveLength(2);
    expect(calls[1]).toBe(null);
  });

  it("should work with different element types", () => {
    const inputRef = signal<HTMLInputElement | null>(null);
    const buttonRef = signal<HTMLButtonElement | null>(null);

    const vnode = h("div", {}, [
      h("input", { ref: inputRef, type: "text" }),
      h("button", { ref: buttonRef }, "Click"),
    ]);

    render(vnode, container);

    expect(inputRef.value).toBeInstanceOf(HTMLInputElement);
    expect(buttonRef.value).toBeInstanceOf(HTMLButtonElement);
    expect(inputRef.value?.type).toBe("text");
    expect(buttonRef.value?.textContent).toBe("Click");
  });

  it("should allow imperative DOM manipulation via ref", () => {
    const inputRef = signal<HTMLInputElement | null>(null);
    const vnode = h("input", { ref: inputRef, type: "text" });

    render(vnode, container);

    // Imperative manipulation
    if (inputRef.value) {
      inputRef.value.value = "test value";
      inputRef.value.focus();
    }

    expect(inputRef.value?.value).toBe("test value");
    expect(document.activeElement).toBe(inputRef.value);
  });
});

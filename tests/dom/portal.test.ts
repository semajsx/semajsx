import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signal } from "@/signal";
import { h } from "@/runtime/vnode";
import { render } from "@/dom/render";
import { createPortal, PortalComponent } from "@/dom/portal";

describe("Portal functionality", () => {
  let container: HTMLDivElement;
  let portalTarget: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);

    portalTarget = document.createElement("div");
    portalTarget.id = "portal-target";
    document.body.appendChild(portalTarget);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.removeChild(portalTarget);
  });

  it("should render children to portal target using createPortal", () => {
    const vnode = h("div", {}, [
      h("p", {}, "Main content"),
      createPortal(h("div", {}, "Portal content"), portalTarget),
    ]);

    render(vnode, container);

    // Main content should be in container
    expect(container.textContent).toContain("Main content");
    expect(container.textContent).not.toContain("Portal content");

    // Portal content should be in portal target
    expect(portalTarget.textContent).toContain("Portal content");
  });

  it("should render children to portal target using PortalComponent", () => {
    const vnode = h("div", {}, [
      h("p", {}, "Main content"),
      h(PortalComponent, { container: portalTarget }, [
        h("div", {}, "Portal content"),
      ]),
    ]);

    render(vnode, container);

    expect(container.textContent).toContain("Main content");
    expect(container.textContent).not.toContain("Portal content");
    expect(portalTarget.textContent).toContain("Portal content");
  });

  it("should support multiple portals to different targets", () => {
    const target1 = document.createElement("div");
    const target2 = document.createElement("div");
    document.body.appendChild(target1);
    document.body.appendChild(target2);

    const vnode = h("div", {}, [
      createPortal(h("div", {}, "Portal 1"), target1),
      createPortal(h("div", {}, "Portal 2"), target2),
    ]);

    render(vnode, container);

    expect(target1.textContent).toBe("Portal 1");
    expect(target2.textContent).toBe("Portal 2");

    document.body.removeChild(target1);
    document.body.removeChild(target2);
  });

  it("should support reactive content in portals", async () => {
    const count = signal(0);
    const vnode = h("div", {}, [
      h("p", {}, "Main"),
      createPortal(h("div", {}, ["Count: ", count]), portalTarget),
    ]);

    render(vnode, container);

    expect(portalTarget.textContent).toBe("Count: 0");

    count.value = 5;
    // Wait for next tick
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(portalTarget.textContent).toBe("Count: 5");
  });

  it("should clean up portal content on unmount", async () => {
    const vnode = createPortal(
      h("div", { className: "portal-content" }, "Portal"),
      portalTarget,
    );

    const rendered = render(vnode, container);

    expect(portalTarget.querySelector(".portal-content")).toBeTruthy();

    const { unmount } = await import("@/dom/render");
    unmount(rendered);

    expect(portalTarget.querySelector(".portal-content")).toBeFalsy();
  });

  it("should handle nested elements in portal", () => {
    const vnode = createPortal(
      h("div", { className: "modal" }, [
        h("h1", {}, "Modal Title"),
        h("p", {}, "Modal content"),
        h("button", {}, "Close"),
      ]),
      portalTarget,
    );

    render(vnode, container);

    const modal = portalTarget.querySelector(".modal");
    expect(modal).toBeTruthy();
    expect(modal?.querySelector("h1")?.textContent).toBe("Modal Title");
    expect(modal?.querySelector("p")?.textContent).toBe("Modal content");
    expect(modal?.querySelector("button")?.textContent).toBe("Close");
  });

  it("should support event handlers in portaled content", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    const vnode = createPortal(
      h("button", { onClick: handleClick }, "Click me"),
      portalTarget,
    );

    render(vnode, container);

    const button = portalTarget.querySelector("button");
    expect(button).toBeTruthy();

    button?.click();
    expect(clicked).toBe(true);
  });

  it("should work with refs in portaled content", () => {
    const buttonRef = signal<HTMLButtonElement | null>(null);
    const vnode = createPortal(
      h("button", { ref: buttonRef }, "Portal button"),
      portalTarget,
    );

    render(vnode, container);

    expect(buttonRef.value).toBeInstanceOf(HTMLButtonElement);
    expect(buttonRef.value?.textContent).toBe("Portal button");
    expect(buttonRef.value?.parentElement).toBe(portalTarget);
  });
});

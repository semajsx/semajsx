/** @jsxImportSource semajsx/dom */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signal } from "@/signal";
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
    const vnode = (
      <div>
        <p>Main content</p>
        {createPortal(<div>Portal content</div>, portalTarget)}
      </div>
    );

    render(vnode, container);

    // Main content should be in container
    expect(container.textContent).toContain("Main content");
    expect(container.textContent).not.toContain("Portal content");

    // Portal content should be in portal target
    expect(portalTarget.textContent).toContain("Portal content");
  });

  it("should render children to portal target using PortalComponent", () => {
    const vnode = (
      <div>
        <p>Main content</p>
        <PortalComponent container={portalTarget}>
          <div>Portal content</div>
        </PortalComponent>
      </div>
    );

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

    const vnode = (
      <div>
        {createPortal(<div>Portal 1</div>, target1)}
        {createPortal(<div>Portal 2</div>, target2)}
      </div>
    );

    render(vnode, container);

    expect(target1.textContent).toBe("Portal 1");
    expect(target2.textContent).toBe("Portal 2");

    document.body.removeChild(target1);
    document.body.removeChild(target2);
  });

  it("should support reactive content in portals", async () => {
    const count = signal(0);
    const vnode = (
      <div>
        <p>Main</p>
        {createPortal(
          <div>
            Count: {count}
          </div>,
          portalTarget
        )}
      </div>
    );

    render(vnode, container);

    expect(portalTarget.textContent).toBe("Count: 0");

    count.value = 5;
    // Wait for next tick
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(portalTarget.textContent).toBe("Count: 5");
  });

  it("should clean up portal content on unmount", () => {
    const vnode = createPortal(
      <div className="portal-content">Portal</div>,
      portalTarget
    );

    const { unmount } = render(vnode, container);

    expect(portalTarget.querySelector(".portal-content")).toBeTruthy();

    unmount();

    expect(portalTarget.querySelector(".portal-content")).toBeFalsy();
  });

  it("should handle nested elements in portal", () => {
    const vnode = createPortal(
      <div className="modal">
        <h1>Modal Title</h1>
        <p>Modal content</p>
        <button>Close</button>
      </div>,
      portalTarget
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
      <button onClick={handleClick}>Click me</button>,
      portalTarget
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
      <button ref={buttonRef}>Portal button</button>,
      portalTarget
    );

    render(vnode, container);

    expect(buttonRef.value).toBeInstanceOf(HTMLButtonElement);
    expect(buttonRef.value?.textContent).toBe("Portal button");
    expect(buttonRef.value?.parentElement).toBe(portalTarget);
  });
});

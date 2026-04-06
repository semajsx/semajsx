/** @jsxImportSource @semajsx/dom */
import { describe, it, expect, vi } from "vitest";
import { signal } from "@semajsx/signal";
import { when, type ComponentAPI } from "@semajsx/core";
import { render } from "./render";

describe("ctx.onCleanup", () => {
  it("fires registered callback on unmount", () => {
    const cleanedUp = vi.fn();

    function MyComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(cleanedUp);
      return <div>hello</div>;
    }

    const container = document.createElement("div");
    const { unmount } = render(<MyComponent />, container);

    expect(cleanedUp).not.toHaveBeenCalled();
    unmount();
    expect(cleanedUp).toHaveBeenCalledOnce();
  });

  it("fires multiple callbacks in registration order", () => {
    const order: number[] = [];

    function MyComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(() => order.push(1));
      ctx?.onCleanup(() => order.push(2));
      ctx?.onCleanup(() => order.push(3));
      return <div>hello</div>;
    }

    const container = document.createElement("div");
    const { unmount } = render(<MyComponent />, container);

    unmount();
    expect(order).toEqual([1, 2, 3]);
  });

  it("fires cleanups for nested components on parent unmount", () => {
    const parentCleanup = vi.fn();
    const childCleanup = vi.fn();

    function Child(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(childCleanup);
      return <span>child</span>;
    }

    function Parent(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(parentCleanup);
      return (
        <div>
          <Child />
        </div>
      );
    }

    const container = document.createElement("div");
    const { unmount } = render(<Parent />, container);

    expect(parentCleanup).not.toHaveBeenCalled();
    expect(childCleanup).not.toHaveBeenCalled();

    unmount();

    expect(parentCleanup).toHaveBeenCalledOnce();
    expect(childCleanup).toHaveBeenCalledOnce();
  });

  it("fires cleanup when conditional rendering hides component", async () => {
    const cleanedUp = vi.fn();
    const show = signal(true);

    function Conditional(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(cleanedUp);
      return <span>visible</span>;
    }

    function App() {
      return (
        <div>
          {when(show, () => (
            <Conditional />
          ))}
        </div>
      );
    }

    const container = document.createElement("div");
    render(<App />, container);

    expect(cleanedUp).not.toHaveBeenCalled();

    // Hide the component
    show.value = false;
    await new Promise((r) => queueMicrotask(r));

    expect(cleanedUp).toHaveBeenCalledOnce();
  });

  it("supports async registration after await", async () => {
    const cleanedUp = vi.fn();
    let capturedCtx: ComponentAPI | undefined;

    async function AsyncComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      capturedCtx = ctx;
      await Promise.resolve();
      ctx?.onCleanup(cleanedUp);
      return <div>async</div>;
    }

    const container = document.createElement("div");
    const { unmount } = render(<AsyncComponent />, container);

    await Promise.resolve();
    expect(capturedCtx).toBeDefined();
    unmount();

    expect(cleanedUp).toHaveBeenCalledOnce();
  });
});

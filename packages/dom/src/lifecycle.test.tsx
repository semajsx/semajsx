/** @jsxImportSource @semajsx/dom */
import { describe, it, expect, vi } from "vitest";
import { signal } from "@semajsx/signal";
import { when } from "@semajsx/core";
import { render } from "./render";
import { onCleanup } from "./lifecycle";

describe("onCleanup", () => {
  it("fires registered callback on unmount", () => {
    const cleanedUp = vi.fn();

    function MyComponent() {
      onCleanup(cleanedUp);
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

    function MyComponent() {
      onCleanup(() => order.push(1));
      onCleanup(() => order.push(2));
      onCleanup(() => order.push(3));
      return <div>hello</div>;
    }

    const container = document.createElement("div");
    const { unmount } = render(<MyComponent />, container);

    unmount();
    expect(order).toEqual([1, 2, 3]);
  });

  it("warns when called outside component render scope", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    onCleanup(() => {});

    expect(warnSpy).toHaveBeenCalledWith(
      "[semajsx/dom] onCleanup() called outside component render scope. Callback will not run.",
    );

    warnSpy.mockRestore();
  });

  it("fires cleanups for nested components on parent unmount", () => {
    const parentCleanup = vi.fn();
    const childCleanup = vi.fn();

    function Child() {
      onCleanup(childCleanup);
      return <span>child</span>;
    }

    function Parent() {
      onCleanup(parentCleanup);
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

    function Conditional() {
      onCleanup(cleanedUp);
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
});

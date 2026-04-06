/** @jsxImportSource @semajsx/terminal */
import { describe, it, expect, vi } from "vitest";
import type { ComponentAPI } from "@semajsx/core";
import { render } from "./render";

describe("ctx.onCleanup", () => {
  it("registers cleanup callbacks for terminal components", async () => {
    const cleanedUp = vi.fn();

    function MyComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(cleanedUp);
      return <text>hello</text>;
    }

    const result = render(<MyComponent />, { autoRender: false });
    result.unmount();

    expect(cleanedUp).toHaveBeenCalledOnce();
  });

  it("runs multiple cleanup callbacks in registration order", () => {
    const order: number[] = [];

    function MyComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      ctx?.onCleanup(() => order.push(1));
      ctx?.onCleanup(() => order.push(2));
      ctx?.onCleanup(() => order.push(3));
      return <text>hello</text>;
    }

    const result = render(<MyComponent />, { autoRender: false });
    result.unmount();

    expect(order).toEqual([1, 2, 3]);
  });

  it("supports async registration after await", async () => {
    const cleanedUp = vi.fn();

    async function MyComponent(_props: Record<string, never>, ctx?: ComponentAPI) {
      await Promise.resolve();
      ctx?.onCleanup(cleanedUp);
      return <text>hello</text>;
    }

    const result = render(<MyComponent />, { autoRender: false });
    await Promise.resolve();
    result.unmount();

    expect(cleanedUp).toHaveBeenCalledOnce();
  });
});

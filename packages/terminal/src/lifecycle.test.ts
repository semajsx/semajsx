import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { onCleanup } from "@semajsx/terminal";
import { flushCleanups } from "./lifecycle";
import { createTerminalSession, setActiveSession } from "./context";

describe("Lifecycle", () => {
  beforeEach(() => {
    setActiveSession(createTerminalSession());
  });

  afterEach(() => {
    setActiveSession(null);
  });

  describe("onCleanup", () => {
    it("should register cleanup callbacks", () => {
      let called = false;
      onCleanup(() => {
        called = true;
      });
      flushCleanups();
      expect(called).toBe(true);
    });

    it("should run multiple cleanup callbacks", () => {
      const order: number[] = [];
      onCleanup(() => order.push(1));
      onCleanup(() => order.push(2));
      onCleanup(() => order.push(3));
      flushCleanups();
      expect(order).toEqual([1, 2, 3]);
    });

    it("should clear callbacks after flush", () => {
      let count = 0;
      onCleanup(() => count++);
      flushCleanups();
      flushCleanups(); // Second flush should be a no-op
      expect(count).toBe(1);
    });

    it("should not throw if a cleanup callback throws", () => {
      let secondCalled = false;
      onCleanup(() => {
        throw new Error("cleanup error");
      });
      onCleanup(() => {
        secondCalled = true;
      });
      expect(() => flushCleanups()).not.toThrow();
      expect(secondCalled).toBe(true);
    });

    it("should not register if no context is active", () => {
      setActiveSession(null);
      let called = false;
      onCleanup(() => {
        called = true;
      });
      // Re-activate and flush - should not run the callback
      setActiveSession(createTerminalSession());
      flushCleanups();
      expect(called).toBe(false);
    });
  });
});

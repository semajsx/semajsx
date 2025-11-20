import { describe, it, expect, vi } from "vitest";
import { signal, computed } from "@semajsx/signal";

// Helper to wait for microtasks (signal updates are batched with queueMicrotask)
const waitForUpdate = () => new Promise((resolve) => queueMicrotask(resolve));

describe("computed", () => {
  it("should create computed from single dependency", () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.value).toBe(10);
  });

  it("should create computed from multiple dependencies", () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed([a, b], (x, y) => x + y);

    expect(sum.value).toBe(5);
  });

  it("should support single dependency shorthand", () => {
    const count = signal(10);
    const doubled = computed(count, (c) => c * 2);

    expect(doubled.value).toBe(20);
  });

  it("should update when dependency changes", async () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.value).toBe(10);

    count.value = 10;
    await waitForUpdate();
    expect(doubled.value).toBe(20);
  });

  it("should update when any dependency changes", async () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed([a, b], (x, y) => x + y);

    expect(sum.value).toBe(3);

    a.value = 5;
    await waitForUpdate();
    expect(sum.value).toBe(7);

    b.value = 10;
    await waitForUpdate();
    expect(sum.value).toBe(15);
  });

  it("should notify subscribers", async () => {
    const count = signal(0);
    const doubled = computed([count], (c) => c * 2);
    const listener = vi.fn();

    doubled.subscribe(listener);
    count.value = 5;

    await waitForUpdate();
    await waitForUpdate(); // Need two waits: one for signal, one for computed
    expect(listener).toHaveBeenCalledWith(10);
  });

  it("should not notify if computed value is same", async () => {
    const count = signal(5);
    const isPositive = computed([count], (c) => c > 0);
    const listener = vi.fn();

    isPositive.subscribe(listener);

    count.value = 10; // Still positive
    await waitForUpdate();
    await waitForUpdate(); // Need two waits: one for signal, one for computed
    expect(listener).not.toHaveBeenCalled();
  });

  it("should support chained computed", async () => {
    const count = signal(2);
    const doubled = computed([count], (c) => c * 2);
    const quadrupled = computed([doubled], (d) => d * 2);

    expect(quadrupled.value).toBe(8);

    count.value = 5;
    await waitForUpdate();
    await waitForUpdate(); // Need two waits: signal -> doubled -> quadrupled
    expect(quadrupled.value).toBe(20);
  });

  it("should peek without subscribing", () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.peek()).toBe(10);
  });

  it("should handle complex computations", async () => {
    const firstName = signal("John");
    const lastName = signal("Doe");
    const age = signal(30);

    const profile = computed(
      [firstName, lastName, age],
      (f, l, a) => `${f} ${l}, ${a} years old`,
    );

    expect(profile.value).toBe("John Doe, 30 years old");

    firstName.value = "Jane";
    await waitForUpdate();
    expect(profile.value).toBe("Jane Doe, 30 years old");
  });
});

import { describe, it, expect, vi } from "vitest";
import { signal } from "../../src/signal/signal";
import { computed } from "../../src/signal/computed";

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

  it("should update when dependency changes", () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.value).toBe(10);

    count.value = 10;
    expect(doubled.value).toBe(20);
  });

  it("should update when any dependency changes", () => {
    const a = signal(1);
    const b = signal(2);
    const sum = computed([a, b], (x, y) => x + y);

    expect(sum.value).toBe(3);

    a.value = 5;
    expect(sum.value).toBe(7);

    b.value = 10;
    expect(sum.value).toBe(15);
  });

  it("should notify subscribers", () => {
    const count = signal(0);
    const doubled = computed([count], (c) => c * 2);
    const listener = vi.fn();

    doubled.subscribe(listener);
    count.value = 5;

    expect(listener).toHaveBeenCalledWith(10);
  });

  it("should not notify if computed value is same", () => {
    const count = signal(5);
    const isPositive = computed([count], (c) => c > 0);
    const listener = vi.fn();

    isPositive.subscribe(listener);

    count.value = 10; // Still positive
    expect(listener).not.toHaveBeenCalled();
  });

  it("should support chained computed", () => {
    const count = signal(2);
    const doubled = computed([count], (c) => c * 2);
    const quadrupled = computed([doubled], (d) => d * 2);

    expect(quadrupled.value).toBe(8);

    count.value = 5;
    expect(quadrupled.value).toBe(20);
  });

  it("should peek without subscribing", () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.peek()).toBe(10);
  });

  it("should handle complex computations", () => {
    const firstName = signal("John");
    const lastName = signal("Doe");
    const age = signal(30);

    const profile = computed(
      [firstName, lastName, age],
      (f, l, a) => `${f} ${l}, ${a} years old`,
    );

    expect(profile.value).toBe("John Doe, 30 years old");

    firstName.value = "Jane";
    expect(profile.value).toBe("Jane Doe, 30 years old");
  });
});

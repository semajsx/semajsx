import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import { sizing, w, h, minW, maxW, minH, maxH, size, sizingArb } from "./sizing";

describe("sizing namespace - width", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates sizing.w4 correctly", () => {
    expect(sizing.w4._).toBe("w-4");
    expect(sizing.w4.__cssTemplate).toBe(".w-4 { width: 1rem; }");
  });

  it("generates sizing.wFull correctly", () => {
    expect(sizing.wFull._).toBe("w-full");
    expect(sizing.wFull.__cssTemplate).toBe(".w-full { width: 100%; }");
  });

  it("generates sizing.wScreen correctly", () => {
    expect(sizing.wScreen._).toBe("w-screen");
    expect(sizing.wScreen.__cssTemplate).toBe(".w-screen { width: 100vw; }");
  });

  it("generates fractional widths correctly", () => {
    expect(sizing.w1_2._).toBe("w-1/2");
    expect(sizing.w1_2.__cssTemplate).toBe(".w-1/2 { width: 50%; }");

    expect(sizing.w1_3._).toBe("w-1/3");
    expect(sizing.w1_3.__cssTemplate).toBe(".w-1/3 { width: 33.333333%; }");
  });

  it("generates content-based widths correctly", () => {
    expect(sizing.wMin._).toBe("w-min");
    expect(sizing.wMin.__cssTemplate).toBe(".w-min { width: min-content; }");

    expect(sizing.wMax._).toBe("w-max");
    expect(sizing.wFit._).toBe("w-fit");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = w`300px`;
    expect(token._).toBe("w-300px");
    expect(token.__cssTemplate).toBe(".w-300px { width: 300px; }");
  });
});

describe("sizing namespace - min/max width", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates sizing.minW0 correctly", () => {
    expect(sizing.minW0._).toBe("min-w-0");
    expect(sizing.minW0.__cssTemplate).toBe(".min-w-0 { min-width: 0px; }");
  });

  it("generates sizing.maxWLg correctly", () => {
    expect(sizing.maxWLg._).toBe("max-w-lg");
    expect(sizing.maxWLg.__cssTemplate).toBe(".max-w-lg { max-width: 32rem; }");
  });

  it("generates sizing.maxWProse correctly", () => {
    expect(sizing.maxWProse._).toBe("max-w-prose");
    expect(sizing.maxWProse.__cssTemplate).toBe(".max-w-prose { max-width: 65ch; }");
  });

  it("generates screen breakpoint max widths", () => {
    expect(sizing.maxWScreenSm._).toBe("max-w-screen-sm");
    expect(sizing.maxWScreenSm.__cssTemplate).toBe(".max-w-screen-sm { max-width: 640px; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = maxW`800px`;
    expect(token._).toBe("max-w-800px");
    expect(token.__cssTemplate).toBe(".max-w-800px { max-width: 800px; }");
  });
});

describe("sizing namespace - height", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates sizing.h4 correctly", () => {
    expect(sizing.h4._).toBe("h-4");
    expect(sizing.h4.__cssTemplate).toBe(".h-4 { height: 1rem; }");
  });

  it("generates sizing.hFull correctly", () => {
    expect(sizing.hFull._).toBe("h-full");
    expect(sizing.hFull.__cssTemplate).toBe(".h-full { height: 100%; }");
  });

  it("generates sizing.hScreen correctly (uses vh)", () => {
    expect(sizing.hScreen._).toBe("h-screen");
    expect(sizing.hScreen.__cssTemplate).toBe(".h-screen { height: 100vh; }");
  });

  it("generates dynamic viewport heights", () => {
    expect(sizing.hSvh._).toBe("h-svh");
    expect(sizing.hSvh.__cssTemplate).toBe(".h-svh { height: 100svh; }");

    expect(sizing.hDvh._).toBe("h-dvh");
    expect(sizing.hDvh.__cssTemplate).toBe(".h-dvh { height: 100dvh; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = h`calc(100vh - 64px)`;
    expect(token._).toMatch(/^h-[a-z0-9]{5}$/);
    expect(token.__cssTemplate).toContain("calc(100vh - 64px)");
  });
});

describe("sizing namespace - min/max height", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates sizing.minH0 correctly", () => {
    expect(sizing.minH0._).toBe("min-h-0");
    expect(sizing.minH0.__cssTemplate).toBe(".min-h-0 { min-height: 0px; }");
  });

  it("generates sizing.minHScreen correctly", () => {
    expect(sizing.minHScreen._).toBe("min-h-screen");
    expect(sizing.minHScreen.__cssTemplate).toBe(".min-h-screen { min-height: 100vh; }");
  });

  it("generates sizing.maxHFull correctly", () => {
    expect(sizing.maxHFull._).toBe("max-h-full");
    expect(sizing.maxHFull.__cssTemplate).toBe(".max-h-full { max-height: 100%; }");
  });
});

describe("sizing namespace - size utility", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates sizing.size4 correctly (sets both width and height)", () => {
    expect(sizing.size4._).toBe("size-4");
    expect(sizing.size4.__cssTemplate).toBe(".size-4 { width: 1rem; height: 1rem; }");
  });

  it("generates sizing.sizeFull correctly", () => {
    expect(sizing.sizeFull._).toBe("size-full");
    expect(sizing.sizeFull.__cssTemplate).toBe(".size-full { width: 100%; height: 100%; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = size`48px`;
    expect(token._).toBe("size-48px");
    expect(token.__cssTemplate).toBe(".size-48px { width: 48px; height: 48px; }");
  });
});

describe("sizing grouped exports (legacy)", () => {
  it("sizingArb object contains all arbitrary functions", () => {
    expect(sizingArb.w).toBe(w);
    expect(sizingArb.h).toBe(h);
    expect(sizingArb.minW).toBe(minW);
    expect(sizingArb.maxW).toBe(maxW);
    expect(sizingArb.minH).toBe(minH);
    expect(sizingArb.maxH).toBe(maxH);
    expect(sizingArb.size).toBe(size);
  });
});

describe("sizing namespace destructuring", () => {
  it("supports destructuring common values", () => {
    const { w4, wFull, h4, hFull, maxWLg } = sizing;

    expect(w4._).toBe("w-4");
    expect(wFull._).toBe("w-full");
    expect(h4._).toBe("h-4");
    expect(hFull._).toBe("h-full");
    expect(maxWLg._).toBe("max-w-lg");
  });
});

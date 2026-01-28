import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import {
  w,
  minW,
  maxW,
  h,
  minH,
  maxH,
  size,
  wArb,
  hArb,
  sizeArb,
  sizing,
  sizingArb,
} from "./sizing";

describe("width utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates w-4 correctly", () => {
    expect(w["4"]._).toBe("w-4");
    expect(w["4"].__cssTemplate).toBe(".w-4 { width: 1rem; }");
  });

  it("generates w-full correctly", () => {
    expect(w["full"]._).toBe("w-full");
    expect(w["full"].__cssTemplate).toBe(".w-full { width: 100%; }");
  });

  it("generates w-screen correctly", () => {
    expect(w["screen"]._).toBe("w-screen");
    expect(w["screen"].__cssTemplate).toBe(".w-screen { width: 100vw; }");
  });

  it("generates fractional widths correctly", () => {
    expect(w["1/2"]._).toBe("w-1/2");
    expect(w["1/2"].__cssTemplate).toBe(".w-1/2 { width: 50%; }");

    expect(w["1/3"]._).toBe("w-1/3");
    expect(w["1/3"].__cssTemplate).toBe(".w-1/3 { width: 33.333333%; }");
  });

  it("generates content-based widths correctly", () => {
    expect(w["min"]._).toBe("w-min");
    expect(w["min"].__cssTemplate).toBe(".w-min { width: min-content; }");

    expect(w["max"]._).toBe("w-max");
    expect(w["fit"]._).toBe("w-fit");
  });

  it("supports arbitrary values", () => {
    const token = wArb`300px`;
    expect(token._).toBe("w-300px");
    expect(token.__cssTemplate).toBe(".w-300px { width: 300px; }");
  });
});

describe("min/max width utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates min-w-0 correctly", () => {
    expect(minW["0"]._).toBe("min-w-0");
    expect(minW["0"].__cssTemplate).toBe(".min-w-0 { min-width: 0px; }");
  });

  it("generates max-w-lg correctly", () => {
    expect(maxW["lg"]._).toBe("max-w-lg");
    expect(maxW["lg"].__cssTemplate).toBe(".max-w-lg { max-width: 32rem; }");
  });

  it("generates max-w-prose correctly", () => {
    expect(maxW["prose"]._).toBe("max-w-prose");
    expect(maxW["prose"].__cssTemplate).toBe(".max-w-prose { max-width: 65ch; }");
  });

  it("generates screen breakpoint max widths", () => {
    expect(maxW["screen-sm"]._).toBe("max-w-screen-sm");
    expect(maxW["screen-sm"].__cssTemplate).toBe(".max-w-screen-sm { max-width: 640px; }");
  });
});

describe("height utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates h-4 correctly", () => {
    expect(h["4"]._).toBe("h-4");
    expect(h["4"].__cssTemplate).toBe(".h-4 { height: 1rem; }");
  });

  it("generates h-full correctly", () => {
    expect(h["full"]._).toBe("h-full");
    expect(h["full"].__cssTemplate).toBe(".h-full { height: 100%; }");
  });

  it("generates h-screen correctly (uses vh)", () => {
    expect(h["screen"]._).toBe("h-screen");
    expect(h["screen"].__cssTemplate).toBe(".h-screen { height: 100vh; }");
  });

  it("generates dynamic viewport heights", () => {
    expect(h["svh"]._).toBe("h-svh");
    expect(h["svh"].__cssTemplate).toBe(".h-svh { height: 100svh; }");

    expect(h["dvh"]._).toBe("h-dvh");
    expect(h["dvh"].__cssTemplate).toBe(".h-dvh { height: 100dvh; }");
  });

  it("supports arbitrary values", () => {
    const token = hArb`calc(100vh - 64px)`;
    expect(token._).toMatch(/^h-[a-z0-9]{5}$/);
    expect(token.__cssTemplate).toContain("calc(100vh - 64px)");
  });
});

describe("min/max height utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates min-h-0 correctly", () => {
    expect(minH["0"]._).toBe("min-h-0");
    expect(minH["0"].__cssTemplate).toBe(".min-h-0 { min-height: 0px; }");
  });

  it("generates min-h-screen correctly", () => {
    expect(minH["screen"]._).toBe("min-h-screen");
    expect(minH["screen"].__cssTemplate).toBe(".min-h-screen { min-height: 100vh; }");
  });

  it("generates max-h-full correctly", () => {
    expect(maxH["full"]._).toBe("max-h-full");
    expect(maxH["full"].__cssTemplate).toBe(".max-h-full { max-height: 100%; }");
  });
});

describe("size utility", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates size-4 correctly (sets both width and height)", () => {
    expect(size["4"]._).toBe("size-4");
    expect(size["4"].__cssTemplate).toBe(".size-4 { width: 1rem; height: 1rem; }");
  });

  it("generates size-full correctly", () => {
    expect(size["full"]._).toBe("size-full");
    expect(size["full"].__cssTemplate).toBe(".size-full { width: 100%; height: 100%; }");
  });

  it("supports arbitrary values", () => {
    const token = sizeArb`48px`;
    expect(token._).toBe("size-48px");
    expect(token.__cssTemplate).toBe(".size-48px { width: 48px; height: 48px; }");
  });
});

describe("grouped exports", () => {
  it("sizing object contains all utilities", () => {
    expect(sizing.w).toBe(w);
    expect(sizing.h).toBe(h);
    expect(sizing.minW).toBe(minW);
    expect(sizing.maxW).toBe(maxW);
    expect(sizing.minH).toBe(minH);
    expect(sizing.maxH).toBe(maxH);
    expect(sizing.size).toBe(size);
  });

  it("sizingArb object contains all arbitrary functions", () => {
    expect(sizingArb.w).toBe(wArb);
    expect(sizingArb.h).toBe(hArb);
  });
});

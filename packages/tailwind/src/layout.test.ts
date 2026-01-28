import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import {
  position,
  inset,
  insetX,
  insetY,
  top,
  right,
  bottom,
  left,
  zIndex,
  overflow,
  overflowX,
  overflowY,
  visibility,
  topArb,
  zIndexArb,
  layout,
} from "./layout";

describe("position utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates relative correctly", () => {
    expect(position["relative"]._).toBe("relative");
    expect(position["relative"].__cssTemplate).toBe(".relative { position: relative; }");
  });

  it("generates absolute correctly", () => {
    expect(position["absolute"]._).toBe("absolute");
    expect(position["absolute"].__cssTemplate).toBe(".absolute { position: absolute; }");
  });

  it("generates fixed correctly", () => {
    expect(position["fixed"]._).toBe("fixed");
  });

  it("generates sticky correctly", () => {
    expect(position["sticky"]._).toBe("sticky");
  });
});

describe("inset utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates inset-0 correctly", () => {
    expect(inset["0"]._).toBe("inset-0");
    expect(inset["0"].__cssTemplate).toBe(".inset-0 { inset: 0px; }");
  });

  it("generates inset-4 correctly", () => {
    expect(inset["4"]._).toBe("inset-4");
    expect(inset["4"].__cssTemplate).toBe(".inset-4 { inset: 1rem; }");
  });

  it("generates inset-x-4 correctly", () => {
    expect(insetX["4"]._).toBe("inset-x-4");
    expect(insetX["4"].__cssTemplate).toBe(".inset-x-4 { left: 1rem; right: 1rem; }");
  });

  it("generates inset-y-4 correctly", () => {
    expect(insetY["4"]._).toBe("inset-y-4");
    expect(insetY["4"].__cssTemplate).toBe(".inset-y-4 { top: 1rem; bottom: 1rem; }");
  });
});

describe("top/right/bottom/left utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates top-0 correctly", () => {
    expect(top["0"]._).toBe("top-0");
    expect(top["0"].__cssTemplate).toBe(".top-0 { top: 0px; }");
  });

  it("generates right-4 correctly", () => {
    expect(right["4"]._).toBe("right-4");
    expect(right["4"].__cssTemplate).toBe(".right-4 { right: 1rem; }");
  });

  it("generates bottom-auto correctly", () => {
    expect(bottom["auto"]._).toBe("bottom-auto");
    expect(bottom["auto"].__cssTemplate).toBe(".bottom-auto { bottom: auto; }");
  });

  it("generates left-1/2 correctly", () => {
    expect(left["1/2"]._).toBe("left-1/2");
    expect(left["1/2"].__cssTemplate).toBe(".left-1/2 { left: 50%; }");
  });

  it("supports arbitrary values", () => {
    const token = topArb`100px`;
    expect(token._).toBe("top-100px");
    expect(token.__cssTemplate).toBe(".top-100px { top: 100px; }");
  });
});

describe("z-index utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates z-0 correctly", () => {
    expect(zIndex["0"]._).toBe("z-0");
    expect(zIndex["0"].__cssTemplate).toBe(".z-0 { z-index: 0; }");
  });

  it("generates z-50 correctly", () => {
    expect(zIndex["50"]._).toBe("z-50");
    expect(zIndex["50"].__cssTemplate).toBe(".z-50 { z-index: 50; }");
  });

  it("generates z-auto correctly", () => {
    expect(zIndex["auto"]._).toBe("z-auto");
    expect(zIndex["auto"].__cssTemplate).toBe(".z-auto { z-index: auto; }");
  });

  it("supports arbitrary values", () => {
    const token = zIndexArb`999`;
    expect(token._).toBe("z-999");
    expect(token.__cssTemplate).toBe(".z-999 { z-index: 999; }");
  });
});

describe("overflow utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates overflow-hidden correctly", () => {
    expect(overflow["hidden"]._).toBe("overflow-hidden");
    expect(overflow["hidden"].__cssTemplate).toBe(".overflow-hidden { overflow: hidden; }");
  });

  it("generates overflow-auto correctly", () => {
    expect(overflow["auto"]._).toBe("overflow-auto");
  });

  it("generates overflow-x-auto correctly", () => {
    expect(overflowX["auto"]._).toBe("overflow-x-auto");
    expect(overflowX["auto"].__cssTemplate).toBe(".overflow-x-auto { overflow-x: auto; }");
  });

  it("generates overflow-y-scroll correctly", () => {
    expect(overflowY["scroll"]._).toBe("overflow-y-scroll");
    expect(overflowY["scroll"].__cssTemplate).toBe(".overflow-y-scroll { overflow-y: scroll; }");
  });
});

describe("visibility utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates visible correctly", () => {
    expect(visibility["visible"]._).toBe("visible");
    expect(visibility["visible"].__cssTemplate).toBe(".visible { visibility: visible; }");
  });

  it("generates invisible correctly", () => {
    expect(visibility["invisible"]._).toBe("invisible");
    expect(visibility["invisible"].__cssTemplate).toBe(".invisible { visibility: hidden; }");
  });

  it("generates collapse correctly", () => {
    expect(visibility["collapse"]._).toBe("collapse");
  });
});

describe("grouped exports", () => {
  it("layout object contains all utilities", () => {
    expect(layout.position).toBe(position);
    expect(layout.inset).toBe(inset);
    expect(layout.top).toBe(top);
    expect(layout.zIndex).toBe(zIndex);
    expect(layout.overflow).toBe(overflow);
    expect(layout.visibility).toBe(visibility);
  });
});

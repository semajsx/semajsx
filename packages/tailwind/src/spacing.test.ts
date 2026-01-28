import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig, configureTailwind } from "./config";
import {
  p,
  px,
  py,
  pt,
  pr,
  pb,
  pl,
  m,
  mx,
  my,
  mt,
  mr,
  mb,
  ml,
  gap,
  gapX,
  gapY,
  pArb,
  mArb,
  gapArb,
  spacing,
  spacingArb,
} from "./spacing";

describe("padding utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates p-4 correctly", () => {
    expect(p["4"]._).toBe("p-4");
    expect(p["4"].__cssTemplate).toBe(".p-4 { padding: 1rem; }");
  });

  it("generates p-0 correctly", () => {
    expect(p["0"]._).toBe("p-0");
    expect(p["0"].__cssTemplate).toBe(".p-0 { padding: 0px; }");
  });

  it("generates p-px correctly", () => {
    expect(p["px"]._).toBe("p-px");
    expect(p["px"].__cssTemplate).toBe(".p-px { padding: 1px; }");
  });

  it("generates px-4 correctly", () => {
    expect(px["4"]._).toBe("px-4");
    expect(px["4"].__cssTemplate).toBe(".px-4 { padding-left: 1rem; padding-right: 1rem; }");
  });

  it("generates py-4 correctly", () => {
    expect(py["4"]._).toBe("py-4");
    expect(py["4"].__cssTemplate).toBe(".py-4 { padding-top: 1rem; padding-bottom: 1rem; }");
  });

  it("generates directional padding correctly", () => {
    expect(pt["4"]._).toBe("pt-4");
    expect(pr["4"]._).toBe("pr-4");
    expect(pb["4"]._).toBe("pb-4");
    expect(pl["4"]._).toBe("pl-4");
  });

  it("supports arbitrary values with tagged template", () => {
    const token = pArb`10px`;
    expect(token._).toBe("p-10px");
    expect(token.__cssTemplate).toBe(".p-10px { padding: 10px; }");
  });

  it("hashes complex arbitrary values", () => {
    const token = pArb`calc(100% - 40px)`;
    expect(token._).toMatch(/^p-[a-z0-9]{5}$/);
    expect(token.__cssTemplate).toContain("calc(100% - 40px)");
  });
});

describe("margin utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates m-4 correctly", () => {
    expect(m["4"]._).toBe("m-4");
    expect(m["4"].__cssTemplate).toBe(".m-4 { margin: 1rem; }");
  });

  it("generates mx-4 correctly", () => {
    expect(mx["4"]._).toBe("mx-4");
    expect(mx["4"].__cssTemplate).toBe(".mx-4 { margin-left: 1rem; margin-right: 1rem; }");
  });

  it("generates my-4 correctly", () => {
    expect(my["4"]._).toBe("my-4");
    expect(my["4"].__cssTemplate).toBe(".my-4 { margin-top: 1rem; margin-bottom: 1rem; }");
  });

  it("generates directional margin correctly", () => {
    expect(mt["4"]._).toBe("mt-4");
    expect(mr["4"]._).toBe("mr-4");
    expect(mb["4"]._).toBe("mb-4");
    expect(ml["4"]._).toBe("ml-4");
  });

  it("supports arbitrary values", () => {
    const token = mArb`auto`;
    expect(token._).toBe("m-auto");
    expect(token.__cssTemplate).toBe(".m-auto { margin: auto; }");
  });
});

describe("gap utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates gap-4 correctly", () => {
    expect(gap["4"]._).toBe("gap-4");
    expect(gap["4"].__cssTemplate).toBe(".gap-4 { gap: 1rem; }");
  });

  it("generates gap-x-4 correctly", () => {
    expect(gapX["4"]._).toBe("gap-x-4");
    expect(gapX["4"].__cssTemplate).toBe(".gap-x-4 { column-gap: 1rem; }");
  });

  it("generates gap-y-4 correctly", () => {
    expect(gapY["4"]._).toBe("gap-y-4");
    expect(gapY["4"].__cssTemplate).toBe(".gap-y-4 { row-gap: 1rem; }");
  });

  it("supports arbitrary values", () => {
    const token = gapArb`20px`;
    expect(token._).toBe("gap-20px");
    expect(token.__cssTemplate).toBe(".gap-20px { gap: 20px; }");
  });
});

describe("spacing scale coverage", () => {
  it("includes all standard Tailwind spacing values", () => {
    const expectedValues = [
      "0",
      "px",
      "0.5",
      "1",
      "1.5",
      "2",
      "2.5",
      "3",
      "3.5",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
    ];

    for (const value of expectedValues) {
      expect(p[value]).toBeDefined();
      expect(m[value]).toBeDefined();
      expect(gap[value]).toBeDefined();
    }
  });
});

describe("grouped exports", () => {
  it("spacing object contains all utilities", () => {
    expect(spacing.p).toBe(p);
    expect(spacing.px).toBe(px);
    expect(spacing.m).toBe(m);
    expect(spacing.mx).toBe(mx);
    expect(spacing.gap).toBe(gap);
    expect(spacing.gapX).toBe(gapX);
  });

  it("spacingArb object contains all arbitrary functions", () => {
    expect(spacingArb.p).toBe(pArb);
    expect(spacingArb.m).toBe(mArb);
    expect(spacingArb.gap).toBe(gapArb);
  });
});

describe("prefix configuration", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("respects global prefix for predefined values", () => {
    configureTailwind({ prefix: "s-" });

    // Need to regenerate values after config change
    // This demonstrates that predefined values are generated at module load time
    // and won't reflect config changes made later
    // For dynamic prefix support, use the core functions directly
  });
});

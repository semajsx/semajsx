import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig, configureTailwind } from "./config";
import { spacing, p, m, px, mx, gap } from "./spacing";

describe("spacing namespace - padding", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates spacing.p4 correctly", () => {
    expect(spacing.p4._).toBe("p-4");
    expect(spacing.p4.__cssTemplate).toBe(".p-4 { padding: 1rem; }");
  });

  it("generates spacing.p0 correctly", () => {
    expect(spacing.p0._).toBe("p-0");
    expect(spacing.p0.__cssTemplate).toBe(".p-0 { padding: 0px; }");
  });

  it("generates spacing.ppx correctly", () => {
    expect(spacing.ppx._).toBe("p-px");
    expect(spacing.ppx.__cssTemplate).toBe(".p-px { padding: 1px; }");
  });

  it("generates spacing.p0_5 correctly (decimal)", () => {
    expect(spacing.p0_5._).toBe("p-0.5");
    expect(spacing.p0_5.__cssTemplate).toBe(".p-0.5 { padding: 0.125rem; }");
  });

  it("generates spacing.px4 correctly", () => {
    expect(spacing.px4._).toBe("px-4");
    expect(spacing.px4.__cssTemplate).toBe(".px-4 { padding-left: 1rem; padding-right: 1rem; }");
  });

  it("generates spacing.py4 correctly", () => {
    expect(spacing.py4._).toBe("py-4");
    expect(spacing.py4.__cssTemplate).toBe(".py-4 { padding-top: 1rem; padding-bottom: 1rem; }");
  });

  it("generates directional padding correctly", () => {
    expect(spacing.pt4._).toBe("pt-4");
    expect(spacing.pr4._).toBe("pr-4");
    expect(spacing.pb4._).toBe("pb-4");
    expect(spacing.pl4._).toBe("pl-4");
  });
});

describe("spacing namespace - margin", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates spacing.m4 correctly", () => {
    expect(spacing.m4._).toBe("m-4");
    expect(spacing.m4.__cssTemplate).toBe(".m-4 { margin: 1rem; }");
  });

  it("generates spacing.mx4 correctly", () => {
    expect(spacing.mx4._).toBe("mx-4");
    expect(spacing.mx4.__cssTemplate).toBe(".mx-4 { margin-left: 1rem; margin-right: 1rem; }");
  });

  it("generates spacing.my4 correctly", () => {
    expect(spacing.my4._).toBe("my-4");
    expect(spacing.my4.__cssTemplate).toBe(".my-4 { margin-top: 1rem; margin-bottom: 1rem; }");
  });

  it("generates directional margin correctly", () => {
    expect(spacing.mt4._).toBe("mt-4");
    expect(spacing.mr4._).toBe("mr-4");
    expect(spacing.mb4._).toBe("mb-4");
    expect(spacing.ml4._).toBe("ml-4");
  });
});

describe("spacing namespace - gap", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates spacing.gap4 correctly", () => {
    expect(spacing.gap4._).toBe("gap-4");
    expect(spacing.gap4.__cssTemplate).toBe(".gap-4 { gap: 1rem; }");
  });

  it("generates spacing.gapX4 correctly", () => {
    expect(spacing.gapX4._).toBe("gap-x-4");
    expect(spacing.gapX4.__cssTemplate).toBe(".gap-x-4 { column-gap: 1rem; }");
  });

  it("generates spacing.gapY4 correctly", () => {
    expect(spacing.gapY4._).toBe("gap-y-4");
    expect(spacing.gapY4.__cssTemplate).toBe(".gap-y-4 { row-gap: 1rem; }");
  });
});

describe("arbitrary values - tagged templates", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("p`10px` generates correct token", () => {
    const token = p`10px`;
    expect(token._).toBe("p-10px");
    expect(token.__cssTemplate).toBe(".p-10px { padding: 10px; }");
  });

  it("m`auto` generates correct token", () => {
    const token = m`auto`;
    expect(token._).toBe("m-auto");
    expect(token.__cssTemplate).toBe(".m-auto { margin: auto; }");
  });

  it("px`20px` generates correct token", () => {
    const token = px`20px`;
    expect(token._).toBe("px-20px");
    expect(token.__cssTemplate).toBe(".px-20px { padding-left: 20px; padding-right: 20px; }");
  });

  it("mx`1rem` generates correct token", () => {
    const token = mx`1rem`;
    expect(token._).toBe("mx-1rem");
    expect(token.__cssTemplate).toBe(".mx-1rem { margin-left: 1rem; margin-right: 1rem; }");
  });

  it("gap`20px` generates correct token", () => {
    const token = gap`20px`;
    expect(token._).toBe("gap-20px");
    expect(token.__cssTemplate).toBe(".gap-20px { gap: 20px; }");
  });

  it("hashes complex arbitrary values", () => {
    const token = p`calc(100% - 40px)`;
    expect(token._).toMatch(/^p-[a-z0-9]{5}$/);
    expect(token.__cssTemplate).toContain("calc(100% - 40px)");
  });
});

describe("spacing scale coverage", () => {
  it("includes all standard Tailwind spacing values", () => {
    const expectedKeys = [
      "p0",
      "ppx",
      "p0_5",
      "p1",
      "p1_5",
      "p2",
      "p2_5",
      "p3",
      "p3_5",
      "p4",
      "p5",
      "p6",
      "p7",
      "p8",
      "p9",
      "p10",
      "p11",
      "p12",
      "p14",
      "p16",
      "p20",
      "p24",
      "p28",
      "p32",
      "p36",
      "p40",
      "p44",
      "p48",
      "p52",
      "p56",
      "p60",
      "p64",
      "p72",
      "p80",
      "p96",
    ];

    for (const key of expectedKeys) {
      expect(spacing[key]).toBeDefined();
    }
  });
});

describe("prefix configuration", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("respects global prefix for arbitrary values", () => {
    configureTailwind({ prefix: "s-" });

    const token = p`10px`;
    expect(token._).toBe("s-p-10px");
    expect(token.__cssTemplate).toBe(".s-p-10px { padding: 10px; }");
  });
});

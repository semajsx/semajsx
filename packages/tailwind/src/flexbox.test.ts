import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import {
  display,
  flexDirection,
  flexWrap,
  flex,
  grow,
  shrink,
  basis,
  justify,
  justifyItems,
  justifySelf,
  content,
  items,
  self,
  placeContent,
  placeItems,
  placeSelf,
  order,
  flexArb,
  basisArb,
  flexbox,
} from "./flexbox";

describe("display utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates flex display correctly", () => {
    expect(display["flex"]._).toBe("flex");
    expect(display["flex"].__cssTemplate).toBe(".flex { display: flex; }");
  });

  it("generates grid display correctly", () => {
    expect(display["grid"]._).toBe("grid");
    expect(display["grid"].__cssTemplate).toBe(".grid { display: grid; }");
  });

  it("generates hidden correctly", () => {
    expect(display["hidden"]._).toBe("hidden");
    expect(display["hidden"].__cssTemplate).toBe(".hidden { display: none; }");
  });

  it("generates inline-flex correctly", () => {
    expect(display["inline-flex"]._).toBe("inline-flex");
    expect(display["inline-flex"].__cssTemplate).toBe(".inline-flex { display: inline-flex; }");
  });
});

describe("flex direction utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates flex-row correctly", () => {
    expect(flexDirection["row"]._).toBe("flex-row");
    expect(flexDirection["row"].__cssTemplate).toBe(".flex-row { flex-direction: row; }");
  });

  it("generates flex-col correctly", () => {
    expect(flexDirection["col"]._).toBe("flex-col");
    expect(flexDirection["col"].__cssTemplate).toBe(".flex-col { flex-direction: column; }");
  });

  it("generates flex-row-reverse correctly", () => {
    expect(flexDirection["row-reverse"]._).toBe("flex-row-reverse");
    expect(flexDirection["row-reverse"].__cssTemplate).toBe(
      ".flex-row-reverse { flex-direction: row-reverse; }",
    );
  });
});

describe("flex wrap utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates flex-wrap correctly", () => {
    expect(flexWrap["wrap"]._).toBe("flex-wrap");
    expect(flexWrap["wrap"].__cssTemplate).toBe(".flex-wrap { flex-wrap: wrap; }");
  });

  it("generates flex-nowrap correctly", () => {
    expect(flexWrap["nowrap"]._).toBe("flex-nowrap");
    expect(flexWrap["nowrap"].__cssTemplate).toBe(".flex-nowrap { flex-wrap: nowrap; }");
  });
});

describe("flex utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates flex-1 correctly", () => {
    expect(flex["1"]._).toBe("flex-1");
    expect(flex["1"].__cssTemplate).toBe(".flex-1 { flex: 1 1 0%; }");
  });

  it("generates flex-auto correctly", () => {
    expect(flex["auto"]._).toBe("flex-auto");
    expect(flex["auto"].__cssTemplate).toBe(".flex-auto { flex: 1 1 auto; }");
  });

  it("generates flex-none correctly", () => {
    expect(flex["none"]._).toBe("flex-none");
    expect(flex["none"].__cssTemplate).toBe(".flex-none { flex: none; }");
  });

  it("supports arbitrary values", () => {
    const token = flexArb`2 2 0%`;
    expect(token._).toMatch(/^flex-/);
    expect(token.__cssTemplate).toContain("2 2 0%");
  });
});

describe("flex grow/shrink utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates grow correctly", () => {
    expect(grow["DEFAULT"]._).toBe("grow-DEFAULT");
    expect(grow["DEFAULT"].__cssTemplate).toBe(".grow-DEFAULT { flex-grow: 1; }");
  });

  it("generates grow-0 correctly", () => {
    expect(grow["0"]._).toBe("grow-0");
    expect(grow["0"].__cssTemplate).toBe(".grow-0 { flex-grow: 0; }");
  });

  it("generates shrink correctly", () => {
    expect(shrink["DEFAULT"]._).toBe("shrink-DEFAULT");
    expect(shrink["0"]._).toBe("shrink-0");
  });
});

describe("flex basis utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates basis-4 correctly", () => {
    expect(basis["4"]._).toBe("basis-4");
    expect(basis["4"].__cssTemplate).toBe(".basis-4 { flex-basis: 1rem; }");
  });

  it("generates basis-auto correctly", () => {
    expect(basis["auto"]._).toBe("basis-auto");
    expect(basis["auto"].__cssTemplate).toBe(".basis-auto { flex-basis: auto; }");
  });

  it("generates basis-1/2 correctly", () => {
    expect(basis["1/2"]._).toBe("basis-1/2");
    expect(basis["1/2"].__cssTemplate).toBe(".basis-1/2 { flex-basis: 50%; }");
  });

  it("supports arbitrary values", () => {
    const token = basisArb`200px`;
    expect(token._).toBe("basis-200px");
    expect(token.__cssTemplate).toBe(".basis-200px { flex-basis: 200px; }");
  });
});

describe("justify utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates justify-center correctly", () => {
    expect(justify["center"]._).toBe("justify-center");
    expect(justify["center"].__cssTemplate).toBe(".justify-center { justify-content: center; }");
  });

  it("generates justify-between correctly", () => {
    expect(justify["between"]._).toBe("justify-between");
    expect(justify["between"].__cssTemplate).toBe(
      ".justify-between { justify-content: space-between; }",
    );
  });

  it("generates justify-items-center correctly", () => {
    expect(justifyItems["center"]._).toBe("justify-items-center");
    expect(justifyItems["center"].__cssTemplate).toBe(
      ".justify-items-center { justify-items: center; }",
    );
  });

  it("generates justify-self-start correctly", () => {
    expect(justifySelf["start"]._).toBe("justify-self-start");
  });
});

describe("align utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates items-center correctly", () => {
    expect(items["center"]._).toBe("items-center");
    expect(items["center"].__cssTemplate).toBe(".items-center { align-items: center; }");
  });

  it("generates items-start correctly", () => {
    expect(items["start"]._).toBe("items-start");
    expect(items["start"].__cssTemplate).toBe(".items-start { align-items: flex-start; }");
  });

  it("generates content-center correctly", () => {
    expect(content["center"]._).toBe("content-center");
    expect(content["center"].__cssTemplate).toBe(".content-center { align-content: center; }");
  });

  it("generates self-center correctly", () => {
    expect(self["center"]._).toBe("self-center");
    expect(self["center"].__cssTemplate).toBe(".self-center { align-self: center; }");
  });
});

describe("place utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates place-content-center correctly", () => {
    expect(placeContent["center"]._).toBe("place-content-center");
    expect(placeContent["center"].__cssTemplate).toBe(
      ".place-content-center { place-content: center; }",
    );
  });

  it("generates place-items-center correctly", () => {
    expect(placeItems["center"]._).toBe("place-items-center");
    expect(placeItems["center"].__cssTemplate).toBe(".place-items-center { place-items: center; }");
  });

  it("generates place-self-center correctly", () => {
    expect(placeSelf["center"]._).toBe("place-self-center");
    expect(placeSelf["center"].__cssTemplate).toBe(".place-self-center { place-self: center; }");
  });
});

describe("order utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates order-1 correctly", () => {
    expect(order["1"]._).toBe("order-1");
    expect(order["1"].__cssTemplate).toBe(".order-1 { order: 1; }");
  });

  it("generates order-first correctly", () => {
    expect(order["first"]._).toBe("order-first");
    expect(order["first"].__cssTemplate).toBe(".order-first { order: -9999; }");
  });

  it("generates order-last correctly", () => {
    expect(order["last"]._).toBe("order-last");
    expect(order["last"].__cssTemplate).toBe(".order-last { order: 9999; }");
  });
});

describe("grouped exports", () => {
  it("flexbox object contains all utilities", () => {
    expect(flexbox.display).toBe(display);
    expect(flexbox.flex).toBe(flex);
    expect(flexbox.justify).toBe(justify);
    expect(flexbox.items).toBe(items);
    expect(flexbox.order).toBe(order);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import {
  borderWidth,
  borderRadius,
  borderStyle,
  boxShadow,
  opacity,
  cursor,
  pointerEvents,
  userSelect,
  borderWidthArb,
  borderRadiusArb,
  opacityArb,
  effects,
} from "./effects";

describe("border width utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates border (default) correctly", () => {
    expect(borderWidth["DEFAULT"]._).toBe("border");
    expect(borderWidth["DEFAULT"].__cssTemplate).toBe(".border { border-width: 1px; }");
  });

  it("generates border-0 correctly", () => {
    expect(borderWidth["0"]._).toBe("border-0");
    expect(borderWidth["0"].__cssTemplate).toBe(".border-0 { border-width: 0px; }");
  });

  it("generates border-2 correctly", () => {
    expect(borderWidth["2"]._).toBe("border-2");
    expect(borderWidth["2"].__cssTemplate).toBe(".border-2 { border-width: 2px; }");
  });

  it("supports arbitrary values", () => {
    const token = borderWidthArb`3px`;
    expect(token._).toBe("border-3px");
    expect(token.__cssTemplate).toBe(".border-3px { border-width: 3px; }");
  });
});

describe("border radius utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates rounded (default) correctly", () => {
    expect(borderRadius["DEFAULT"]._).toBe("rounded");
    expect(borderRadius["DEFAULT"].__cssTemplate).toBe(".rounded { border-radius: 0.25rem; }");
  });

  it("generates rounded-none correctly", () => {
    expect(borderRadius["none"]._).toBe("rounded-none");
    expect(borderRadius["none"].__cssTemplate).toBe(".rounded-none { border-radius: 0px; }");
  });

  it("generates rounded-lg correctly", () => {
    expect(borderRadius["lg"]._).toBe("rounded-lg");
    expect(borderRadius["lg"].__cssTemplate).toBe(".rounded-lg { border-radius: 0.5rem; }");
  });

  it("generates rounded-full correctly", () => {
    expect(borderRadius["full"]._).toBe("rounded-full");
    expect(borderRadius["full"].__cssTemplate).toBe(".rounded-full { border-radius: 9999px; }");
  });

  it("supports arbitrary values", () => {
    const token = borderRadiusArb`10px`;
    expect(token._).toBe("rounded-10px");
    expect(token.__cssTemplate).toBe(".rounded-10px { border-radius: 10px; }");
  });
});

describe("border style utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates border-solid correctly", () => {
    expect(borderStyle["solid"]._).toBe("border-solid");
    expect(borderStyle["solid"].__cssTemplate).toBe(".border-solid { border-style: solid; }");
  });

  it("generates border-dashed correctly", () => {
    expect(borderStyle["dashed"]._).toBe("border-dashed");
    expect(borderStyle["dashed"].__cssTemplate).toBe(".border-dashed { border-style: dashed; }");
  });

  it("generates border-none correctly", () => {
    expect(borderStyle["none"]._).toBe("border-none");
    expect(borderStyle["none"].__cssTemplate).toBe(".border-none { border-style: none; }");
  });
});

describe("box shadow utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates shadow (default) correctly", () => {
    expect(boxShadow["DEFAULT"]._).toBe("shadow");
    expect(boxShadow["DEFAULT"].__cssTemplate).toContain("box-shadow:");
  });

  it("generates shadow-sm correctly", () => {
    expect(boxShadow["sm"]._).toBe("shadow-sm");
    expect(boxShadow["sm"].__cssTemplate).toContain("box-shadow:");
  });

  it("generates shadow-lg correctly", () => {
    expect(boxShadow["lg"]._).toBe("shadow-lg");
  });

  it("generates shadow-none correctly", () => {
    expect(boxShadow["none"]._).toBe("shadow-none");
    expect(boxShadow["none"].__cssTemplate).toBe(".shadow-none { box-shadow: 0 0 #0000; }");
  });

  it("generates shadow-inner correctly", () => {
    expect(boxShadow["inner"]._).toBe("shadow-inner");
    expect(boxShadow["inner"].__cssTemplate).toContain("inset");
  });
});

describe("opacity utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates opacity-0 correctly", () => {
    expect(opacity["0"]._).toBe("opacity-0");
    expect(opacity["0"].__cssTemplate).toBe(".opacity-0 { opacity: 0; }");
  });

  it("generates opacity-50 correctly", () => {
    expect(opacity["50"]._).toBe("opacity-50");
    expect(opacity["50"].__cssTemplate).toBe(".opacity-50 { opacity: 0.5; }");
  });

  it("generates opacity-100 correctly", () => {
    expect(opacity["100"]._).toBe("opacity-100");
    expect(opacity["100"].__cssTemplate).toBe(".opacity-100 { opacity: 1; }");
  });

  it("supports arbitrary values", () => {
    const token = opacityArb`0.33`;
    expect(token._).toBe("opacity-0_33");
    expect(token.__cssTemplate).toBe(".opacity-0_33 { opacity: 0.33; }");
  });
});

describe("cursor utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates cursor-pointer correctly", () => {
    expect(cursor["pointer"]._).toBe("cursor-pointer");
    expect(cursor["pointer"].__cssTemplate).toBe(".cursor-pointer { cursor: pointer; }");
  });

  it("generates cursor-not-allowed correctly", () => {
    expect(cursor["not-allowed"]._).toBe("cursor-not-allowed");
    expect(cursor["not-allowed"].__cssTemplate).toBe(
      ".cursor-not-allowed { cursor: not-allowed; }",
    );
  });

  it("generates cursor-grab correctly", () => {
    expect(cursor["grab"]._).toBe("cursor-grab");
  });
});

describe("pointer events utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates pointer-events-none correctly", () => {
    expect(pointerEvents["none"]._).toBe("pointer-events-none");
    expect(pointerEvents["none"].__cssTemplate).toBe(
      ".pointer-events-none { pointer-events: none; }",
    );
  });

  it("generates pointer-events-auto correctly", () => {
    expect(pointerEvents["auto"]._).toBe("pointer-events-auto");
  });
});

describe("user select utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates select-none correctly", () => {
    expect(userSelect["none"]._).toBe("select-none");
    expect(userSelect["none"].__cssTemplate).toBe(".select-none { user-select: none; }");
  });

  it("generates select-text correctly", () => {
    expect(userSelect["text"]._).toBe("select-text");
  });

  it("generates select-all correctly", () => {
    expect(userSelect["all"]._).toBe("select-all");
  });
});

describe("grouped exports", () => {
  it("effects object contains all utilities", () => {
    expect(effects.borderWidth).toBe(borderWidth);
    expect(effects.borderRadius).toBe(borderRadius);
    expect(effects.boxShadow).toBe(boxShadow);
    expect(effects.opacity).toBe(opacity);
    expect(effects.cursor).toBe(cursor);
  });
});

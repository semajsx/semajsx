import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig } from "./config";
import {
  fontSize,
  fontWeight,
  fontFamily,
  fontStyle,
  lineHeight,
  letterSpacing,
  textAlign,
  textDecoration,
  textTransform,
  whitespace,
  wordBreak,
  truncate,
  typography,
} from "./typography";

describe("font size utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates text-base correctly", () => {
    expect(fontSize.base._).toBe("text-base");
    expect(fontSize.base.__cssTemplate).toBe(
      ".text-base { font-size: 1rem; line-height: 1.5rem; }",
    );
  });

  it("generates text-sm correctly", () => {
    expect(fontSize.sm._).toBe("text-sm");
    expect(fontSize.sm.__cssTemplate).toBe(
      ".text-sm { font-size: 0.875rem; line-height: 1.25rem; }",
    );
  });

  it("generates text-xl correctly", () => {
    expect(fontSize.xl._).toBe("text-xl");
    expect(fontSize.xl.__cssTemplate).toBe(
      ".text-xl { font-size: 1.25rem; line-height: 1.75rem; }",
    );
  });

  it("generates text-5xl correctly (line-height: 1)", () => {
    expect(fontSize["5xl"]._).toBe("text-5xl");
    expect(fontSize["5xl"].__cssTemplate).toBe(".text-5xl { font-size: 3rem; line-height: 1; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = fontSize`20px`;
    expect(token._).toBe("text-20px");
    expect(token.__cssTemplate).toBe(".text-20px { font-size: 20px; }");
  });
});

describe("font weight utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates font-normal correctly", () => {
    expect(fontWeight.normal._).toBe("font-normal");
    expect(fontWeight.normal.__cssTemplate).toBe(".font-normal { font-weight: 400; }");
  });

  it("generates font-bold correctly", () => {
    expect(fontWeight.bold._).toBe("font-bold");
    expect(fontWeight.bold.__cssTemplate).toBe(".font-bold { font-weight: 700; }");
  });

  it("generates font-semibold correctly", () => {
    expect(fontWeight.semibold._).toBe("font-semibold");
    expect(fontWeight.semibold.__cssTemplate).toBe(".font-semibold { font-weight: 600; }");
  });
});

describe("font family utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates font-sans correctly", () => {
    expect(fontFamily.sans._).toBe("font-sans");
    expect(fontFamily.sans.__cssTemplate).toContain("font-family:");
    expect(fontFamily.sans.__cssTemplate).toContain("ui-sans-serif");
  });

  it("generates font-mono correctly", () => {
    expect(fontFamily.mono._).toBe("font-mono");
    expect(fontFamily.mono.__cssTemplate).toContain("ui-monospace");
  });
});

describe("font style utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates italic correctly", () => {
    expect(fontStyle.italic._).toBe("italic");
    expect(fontStyle.italic.__cssTemplate).toBe(".italic { font-style: italic; }");
  });

  it("generates not-italic correctly", () => {
    expect(fontStyle.notItalic._).toBe("not-italic");
    expect(fontStyle.notItalic.__cssTemplate).toBe(".not-italic { font-style: normal; }");
  });
});

describe("line height utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates leading-normal correctly", () => {
    expect(lineHeight.normal._).toBe("leading-normal");
    expect(lineHeight.normal.__cssTemplate).toBe(".leading-normal { line-height: 1.5; }");
  });

  it("generates leading-tight correctly", () => {
    expect(lineHeight.tight._).toBe("leading-tight");
    expect(lineHeight.tight.__cssTemplate).toBe(".leading-tight { line-height: 1.25; }");
  });

  it("generates leading-6 correctly", () => {
    expect(lineHeight["6"]._).toBe("leading-6");
    expect(lineHeight["6"].__cssTemplate).toBe(".leading-6 { line-height: 1.5rem; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = lineHeight`1.8`;
    expect(token._).toBe("leading-1_8");
    expect(token.__cssTemplate).toBe(".leading-1_8 { line-height: 1.8; }");
  });
});

describe("letter spacing utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates tracking-normal correctly", () => {
    expect(letterSpacing.normal._).toBe("tracking-normal");
    expect(letterSpacing.normal.__cssTemplate).toBe(".tracking-normal { letter-spacing: 0em; }");
  });

  it("generates tracking-tight correctly", () => {
    expect(letterSpacing.tight._).toBe("tracking-tight");
    expect(letterSpacing.tight.__cssTemplate).toBe(".tracking-tight { letter-spacing: -0.025em; }");
  });

  it("generates tracking-widest correctly", () => {
    expect(letterSpacing.widest._).toBe("tracking-widest");
    expect(letterSpacing.widest.__cssTemplate).toBe(".tracking-widest { letter-spacing: 0.1em; }");
  });

  it("supports arbitrary values via tagged template", () => {
    const token = letterSpacing`0.15em`;
    expect(token._).toBe("tracking-0_15em");
    expect(token.__cssTemplate).toBe(".tracking-0_15em { letter-spacing: 0.15em; }");
  });
});

describe("text align utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates text-left correctly", () => {
    expect(textAlign.left._).toBe("text-left");
    expect(textAlign.left.__cssTemplate).toBe(".text-left { text-align: left; }");
  });

  it("generates text-center correctly", () => {
    expect(textAlign.center._).toBe("text-center");
    expect(textAlign.center.__cssTemplate).toBe(".text-center { text-align: center; }");
  });

  it("generates text-justify correctly", () => {
    expect(textAlign.justify._).toBe("text-justify");
    expect(textAlign.justify.__cssTemplate).toBe(".text-justify { text-align: justify; }");
  });
});

describe("text decoration utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates underline correctly", () => {
    expect(textDecoration.underline._).toBe("underline");
    expect(textDecoration.underline.__cssTemplate).toBe(
      ".underline { text-decoration-line: underline; }",
    );
  });

  it("generates no-underline correctly (camelCase access)", () => {
    expect(textDecoration.noUnderline._).toBe("no-underline");
    expect(textDecoration.noUnderline.__cssTemplate).toBe(
      ".no-underline { text-decoration-line: none; }",
    );
  });

  it("generates line-through correctly (camelCase access)", () => {
    expect(textDecoration.lineThrough._).toBe("line-through");
    expect(textDecoration.lineThrough.__cssTemplate).toBe(
      ".line-through { text-decoration-line: line-through; }",
    );
  });
});

describe("text transform utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates uppercase correctly", () => {
    expect(textTransform.uppercase._).toBe("uppercase");
    expect(textTransform.uppercase.__cssTemplate).toBe(".uppercase { text-transform: uppercase; }");
  });

  it("generates lowercase correctly", () => {
    expect(textTransform.lowercase._).toBe("lowercase");
  });

  it("generates capitalize correctly", () => {
    expect(textTransform.capitalize._).toBe("capitalize");
  });

  it("generates normal-case correctly (camelCase access)", () => {
    expect(textTransform.normalCase._).toBe("normal-case");
    expect(textTransform.normalCase.__cssTemplate).toBe(".normal-case { text-transform: none; }");
  });
});

describe("whitespace utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates whitespace-normal correctly", () => {
    expect(whitespace.normal._).toBe("whitespace-normal");
    expect(whitespace.normal.__cssTemplate).toBe(".whitespace-normal { white-space: normal; }");
  });

  it("generates whitespace-nowrap correctly", () => {
    expect(whitespace.nowrap._).toBe("whitespace-nowrap");
    expect(whitespace.nowrap.__cssTemplate).toBe(".whitespace-nowrap { white-space: nowrap; }");
  });

  it("generates whitespace-pre correctly", () => {
    expect(whitespace.pre._).toBe("whitespace-pre");
  });

  it("generates whitespace-pre-line correctly (camelCase access)", () => {
    expect(whitespace.preLine._).toBe("whitespace-preLine");
    expect(whitespace.preLine.__cssTemplate).toBe(".whitespace-preLine { white-space: pre-line; }");
  });
});

describe("word break utilities", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates break-normal correctly", () => {
    expect(wordBreak.normal._).toBe("break-normal");
    expect(wordBreak.normal.__cssTemplate).toBe(".break-normal { overflow-wrap: normal; }");
  });

  it("generates break-words correctly", () => {
    expect(wordBreak.words._).toBe("break-words");
    expect(wordBreak.words.__cssTemplate).toBe(".break-words { overflow-wrap: break-word; }");
  });

  it("generates break-all correctly", () => {
    expect(wordBreak.all._).toBe("break-all");
  });
});

describe("truncate utility", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("generates truncate correctly (combines multiple properties)", () => {
    expect(truncate._).toBe("truncate");
    expect(truncate.__cssTemplate).toBe(
      ".truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    );
  });
});

describe("grouped exports", () => {
  it("typography object contains all utilities", () => {
    expect(typography.fontSize).toBe(fontSize);
    expect(typography.fontWeight).toBe(fontWeight);
    expect(typography.fontFamily).toBe(fontFamily);
    expect(typography.fontStyle).toBe(fontStyle);
    expect(typography.lineHeight).toBe(lineHeight);
    expect(typography.letterSpacing).toBe(letterSpacing);
    expect(typography.textAlign).toBe(textAlign);
    expect(typography.textDecoration).toBe(textDecoration);
    expect(typography.textTransform).toBe(textTransform);
    expect(typography.whitespace).toBe(whitespace);
    expect(typography.wordBreak).toBe(wordBreak);
    expect(typography.truncate).toBe(truncate);
  });
});

describe("destructuring", () => {
  it("supports destructuring from fontSize", () => {
    const { base, sm, xl } = fontSize;
    expect(base._).toBe("text-base");
    expect(sm._).toBe("text-sm");
    expect(xl._).toBe("text-xl");
  });

  it("supports destructuring from fontWeight", () => {
    const { bold, normal, semibold } = fontWeight;
    expect(bold._).toBe("font-bold");
    expect(normal._).toBe("font-normal");
    expect(semibold._).toBe("font-semibold");
  });
});

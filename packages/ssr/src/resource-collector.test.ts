/**
 * Resource collector tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "fs/promises";
import { join } from "path";
import { collectResources, getEntryFiles } from "./resource-collector";

const TEST_DIR = join(process.cwd(), ".test-resources");

describe("Resource Collector", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("collectResources", () => {
    it("should collect CSS from capture patterns", async () => {
      // Create component and its CSS
      await mkdir(join(TEST_DIR, "src"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "Counter.tsx"),
        "export default () => null",
      );
      await writeFile(join(TEST_DIR, "src", "Counter.css"), ".counter {}");

      const result = await collectResources(
        [join(TEST_DIR, "src", "Counter.tsx")],
        {
          capture: {
            "**/*.tsx": ["${capture}.css"],
          },
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(1);
      expect(result.css.has(join(TEST_DIR, "src", "Counter.css"))).toBe(true);
    });

    it("should collect multiple patterns per file type", async () => {
      await mkdir(join(TEST_DIR, "src"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "Button.tsx"),
        "export default () => null",
      );
      await writeFile(join(TEST_DIR, "src", "Button.css"), ".button {}");
      await writeFile(join(TEST_DIR, "src", "Button.module.css"), ".button {}");

      const result = await collectResources(
        [join(TEST_DIR, "src", "Button.tsx")],
        {
          capture: {
            "**/*.tsx": ["${capture}.css", "${capture}.module.css"],
          },
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(2);
      expect(result.css.has(join(TEST_DIR, "src", "Button.css"))).toBe(true);
      expect(result.css.has(join(TEST_DIR, "src", "Button.module.css"))).toBe(
        true,
      );
    });

    it("should skip non-existent captured files", async () => {
      await mkdir(join(TEST_DIR, "src"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "Counter.tsx"),
        "export default () => null",
      );
      // No Counter.css file created

      const result = await collectResources(
        [join(TEST_DIR, "src", "Counter.tsx")],
        {
          capture: {
            "**/*.tsx": ["${capture}.css"],
          },
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(0);
    });

    it("should collect from include glob patterns", async () => {
      await mkdir(join(TEST_DIR, "styles"), { recursive: true });
      await writeFile(join(TEST_DIR, "styles", "global.css"), "body {}");
      await writeFile(join(TEST_DIR, "styles", "reset.css"), "* {}");

      const result = await collectResources(
        [],
        {
          include: ["styles/**/*.css"],
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(2);
    });

    it("should respect exclude patterns", async () => {
      await mkdir(join(TEST_DIR, "styles"), { recursive: true });
      await writeFile(join(TEST_DIR, "styles", "global.css"), "body {}");
      await writeFile(join(TEST_DIR, "styles", "test.css"), "test {}");

      const result = await collectResources(
        [],
        {
          include: ["styles/**/*.css"],
          exclude: ["**/*test*"],
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(1);
      expect(result.css.has(join(TEST_DIR, "styles", "global.css"))).toBe(true);
    });

    it("should prioritize more specific capture patterns", async () => {
      await mkdir(join(TEST_DIR, "src", "components"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "components", "Card.tsx"),
        "export default () => null",
      );
      await writeFile(
        join(TEST_DIR, "src", "components", "Card.styles.css"),
        ".card {}",
      );
      // Also create Card.css to verify it's not matched
      await writeFile(
        join(TEST_DIR, "src", "components", "Card.css"),
        ".card-general {}",
      );

      const result = await collectResources(
        [join(TEST_DIR, "src", "components", "Card.tsx")],
        {
          capture: {
            // Less specific pattern
            "**/*.tsx": ["${capture}.css"],
            // More specific pattern should win
            "src/components/**/*.tsx": ["${capture}.styles.css"],
          },
        },
        TEST_DIR,
      );

      // Should only match the more specific pattern
      expect(result.css.size).toBe(1);
      expect(
        result.css.has(join(TEST_DIR, "src", "components", "Card.styles.css")),
      ).toBe(true);
    });

    it("should collect assets", async () => {
      await mkdir(join(TEST_DIR, "src"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "Icon.tsx"),
        "export default () => null",
      );
      await writeFile(join(TEST_DIR, "src", "Icon.png"), "fake png");
      await writeFile(join(TEST_DIR, "src", "Icon.svg"), "<svg></svg>");

      const result = await collectResources(
        [join(TEST_DIR, "src", "Icon.tsx")],
        {
          capture: {
            "**/*.tsx": ["${capture}.png", "${capture}.svg"],
          },
        },
        TEST_DIR,
      );

      expect(result.assets.size).toBe(2);
      expect(result.assets.has(join(TEST_DIR, "src", "Icon.png"))).toBe(true);
      expect(result.assets.has(join(TEST_DIR, "src", "Icon.svg"))).toBe(true);
    });

    it("should merge capture and include results", async () => {
      await mkdir(join(TEST_DIR, "src"), { recursive: true });
      await mkdir(join(TEST_DIR, "styles"), { recursive: true });
      await writeFile(
        join(TEST_DIR, "src", "App.tsx"),
        "export default () => null",
      );
      await writeFile(join(TEST_DIR, "src", "App.css"), ".app {}");
      await writeFile(join(TEST_DIR, "styles", "global.css"), "body {}");

      const result = await collectResources(
        [join(TEST_DIR, "src", "App.tsx")],
        {
          capture: {
            "**/*.tsx": ["${capture}.css"],
          },
          include: ["styles/**/*.css"],
        },
        TEST_DIR,
      );

      expect(result.css.size).toBe(2);
      expect(result.css.has(join(TEST_DIR, "src", "App.css"))).toBe(true);
      expect(result.css.has(join(TEST_DIR, "styles", "global.css"))).toBe(true);
    });
  });

  describe("getEntryFiles", () => {
    it("should return island paths as entries", () => {
      const islandPaths = ["/src/Counter.tsx", "/src/Button.tsx"];
      const entries = getEntryFiles(islandPaths);

      expect(entries).toHaveLength(2);
      expect(entries).toContain("/src/Counter.tsx");
      expect(entries).toContain("/src/Button.tsx");
    });

    it("should include dependencies from module graph", () => {
      const islandPaths = ["/src/Counter.tsx"];
      const moduleGraph = new Map([
        [
          "/src/Counter.tsx",
          ["/src/hooks/useCount.ts", "/src/utils/format.ts"],
        ],
      ]);

      const entries = getEntryFiles(islandPaths, moduleGraph);

      expect(entries).toHaveLength(3);
      expect(entries).toContain("/src/Counter.tsx");
      expect(entries).toContain("/src/hooks/useCount.ts");
      expect(entries).toContain("/src/utils/format.ts");
    });

    it("should deduplicate entries", () => {
      const islandPaths = ["/src/Counter.tsx", "/src/Button.tsx"];
      const moduleGraph = new Map([
        ["/src/Counter.tsx", ["/src/shared.ts"]],
        ["/src/Button.tsx", ["/src/shared.ts"]],
      ]);

      const entries = getEntryFiles(islandPaths, moduleGraph);

      // Should have 3 unique entries, not 4
      expect(entries).toHaveLength(3);
    });
  });
});

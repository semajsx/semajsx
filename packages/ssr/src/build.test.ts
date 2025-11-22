/**
 * Build process tests
 *
 * Tests for CSS building, asset processing, and full build integration
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile, readdir } from "fs/promises";
import { join } from "path";
import { buildCSS, analyzeCSSChunks } from "./css-builder";
import { buildAssets } from "./asset-builder";

const TEST_DIR = join(process.cwd(), ".test-build");
const OUT_DIR = join(TEST_DIR, "dist");

describe("CSS Builder", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("should build CSS with content hash", async () => {
    // Create test CSS file
    const cssPath = join(TEST_DIR, "styles.css");
    await writeFile(cssPath, ".test { color: red; }");

    const result = await buildCSS(new Set([cssPath]), OUT_DIR, {
      minify: true,
    });

    // Check mapping exists
    expect(result.mapping.size).toBe(1);
    const outputPath = result.mapping.get(cssPath);
    expect(outputPath).toBeDefined();
    expect(outputPath).toMatch(/\/css\/styles-[a-f0-9]{8}\.css$/);

    // Verify file was created
    const files = await readdir(join(OUT_DIR, "css"));
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^styles-[a-f0-9]{8}\.css$/);

    // Verify content is minified
    const content = await readFile(join(OUT_DIR, "css", files[0]), "utf-8");
    expect(content).toBe(".test{color:red}");
  });

  it("should generate different hashes for different content", async () => {
    const css1Path = join(TEST_DIR, "a.css");
    const css2Path = join(TEST_DIR, "b.css");
    await writeFile(css1Path, ".a { color: red; }");
    await writeFile(css2Path, ".b { color: blue; }");

    const result = await buildCSS(new Set([css1Path, css2Path]), OUT_DIR);

    const hash1 = result.mapping
      .get(css1Path)!
      .match(/-([a-f0-9]{8})\.css$/)?.[1];
    const hash2 = result.mapping
      .get(css2Path)!
      .match(/-([a-f0-9]{8})\.css$/)?.[1];

    expect(hash1).not.toBe(hash2);
  });

  it("should rewrite url() paths with asset manifest", async () => {
    const cssPath = join(TEST_DIR, "styles.css");
    await writeFile(cssPath, ".bg { background: url('./image.png'); }");

    // Create asset manifest
    const assetManifest = new Map([
      [join(TEST_DIR, "image.png"), "/assets/image-abc123.png"],
    ]);

    const result = await buildCSS(new Set([cssPath]), OUT_DIR, {
      minify: false,
      assetManifest,
    });

    const files = await readdir(join(OUT_DIR, "css"));
    const content = await readFile(join(OUT_DIR, "css", files[0]), "utf-8");

    // URL should be rewritten to hashed asset path (lightningcss adds quotes)
    expect(content).toContain('url("/assets/image-abc123.png")');
  });

  it("should skip external URLs in url() rewriting", async () => {
    const cssPath = join(TEST_DIR, "styles.css");
    await writeFile(
      cssPath,
      ".bg { background: url('https://example.com/image.png'); }",
    );

    const result = await buildCSS(new Set([cssPath]), OUT_DIR, {
      minify: false,
    });

    const files = await readdir(join(OUT_DIR, "css"));
    const content = await readFile(join(OUT_DIR, "css", files[0]), "utf-8");

    // External URL should remain unchanged (lightningcss adds quotes)
    expect(content).toContain('url("https://example.com/image.png")');
  });
});

describe("Asset Builder", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("should copy assets with content hash", async () => {
    const assetPath = join(TEST_DIR, "logo.png");
    await writeFile(assetPath, "fake-png-content");

    const result = await buildAssets(new Set([assetPath]), OUT_DIR);

    // Check mapping
    expect(result.mapping.size).toBe(1);
    const outputPath = result.mapping.get(assetPath);
    expect(outputPath).toMatch(/\/assets\/logo-[a-f0-9]{8}\.png$/);

    // Verify file exists
    const files = await readdir(join(OUT_DIR, "assets"));
    expect(files.length).toBe(1);
    expect(files[0]).toMatch(/^logo-[a-f0-9]{8}\.png$/);

    // Verify content
    const content = await readFile(join(OUT_DIR, "assets", files[0]), "utf-8");
    expect(content).toBe("fake-png-content");
  });

  it("should generate different hashes for different content", async () => {
    const asset1 = join(TEST_DIR, "a.png");
    const asset2 = join(TEST_DIR, "b.png");
    await writeFile(asset1, "content-a");
    await writeFile(asset2, "content-b");

    const result = await buildAssets(new Set([asset1, asset2]), OUT_DIR);

    const hash1 = result.mapping
      .get(asset1)!
      .match(/-([a-f0-9]{8})\.png$/)?.[1];
    const hash2 = result.mapping
      .get(asset2)!
      .match(/-([a-f0-9]{8})\.png$/)?.[1];

    expect(hash1).not.toBe(hash2);
  });

  it("should track total size", async () => {
    const assetPath = join(TEST_DIR, "test.txt");
    const content = "12345678901234567890"; // 20 bytes
    await writeFile(assetPath, content);

    const result = await buildAssets(new Set([assetPath]), OUT_DIR);

    expect(result.totalSize).toBe(20);
  });
});

describe("CSS Chunk Analysis", () => {
  it("should identify shared CSS files", () => {
    const cssPerEntry = new Map([
      ["/", ["global.css", "home.css"]],
      ["/about", ["global.css", "about.css"]],
      ["/contact", ["global.css", "contact.css"]],
    ]);

    const result = analyzeCSSChunks(cssPerEntry, 2);

    // global.css is used by 3 routes, should be shared
    expect(result.shared).toContain("global.css");
    expect(result.shared.length).toBe(1);

    // Per-entry CSS
    expect(result.perEntry.get("/")).toEqual(["home.css"]);
    expect(result.perEntry.get("/about")).toEqual(["about.css"]);
    expect(result.perEntry.get("/contact")).toEqual(["contact.css"]);
  });

  it("should respect threshold parameter", () => {
    const cssPerEntry = new Map([
      ["/", ["a.css", "b.css"]],
      ["/page", ["a.css", "c.css"]],
    ]);

    // Threshold 2: a.css is shared (used by 2)
    const result2 = analyzeCSSChunks(cssPerEntry, 2);
    expect(result2.shared).toContain("a.css");

    // Threshold 3: nothing is shared
    const result3 = analyzeCSSChunks(cssPerEntry, 3);
    expect(result3.shared.length).toBe(0);
  });

  it("should handle empty input", () => {
    const result = analyzeCSSChunks(new Map(), 2);

    expect(result.shared.length).toBe(0);
    expect(result.perEntry.size).toBe(0);
  });

  it("should handle single route", () => {
    const cssPerEntry = new Map([["/", ["a.css", "b.css"]]]);

    const result = analyzeCSSChunks(cssPerEntry, 2);

    // Nothing shared with only one route
    expect(result.shared.length).toBe(0);
    expect(result.perEntry.get("/")).toEqual(["a.css", "b.css"]);
  });
});

describe("Build Integration", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("should build CSS with asset URL rewriting end-to-end", async () => {
    // Create asset
    const assetPath = join(TEST_DIR, "icon.svg");
    await writeFile(assetPath, "<svg></svg>");

    // Build asset first
    const assetResult = await buildAssets(new Set([assetPath]), OUT_DIR);

    // Create CSS that references the asset
    const cssPath = join(TEST_DIR, "styles.css");
    await writeFile(cssPath, `.icon { background: url('./icon.svg'); }`);

    // Build CSS with asset manifest
    const cssResult = await buildCSS(new Set([cssPath]), OUT_DIR, {
      minify: true,
      assetManifest: assetResult.mapping,
    });

    // Verify CSS contains rewritten URL
    const cssFiles = await readdir(join(OUT_DIR, "css"));
    const cssContent = await readFile(
      join(OUT_DIR, "css", cssFiles[0]),
      "utf-8",
    );

    // Should contain the hashed asset path
    const assetOutputPath = assetResult.mapping.get(assetPath);
    expect(cssContent).toContain(`url(${assetOutputPath})`);
  });
});

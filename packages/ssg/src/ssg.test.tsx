/** @jsxImportSource @semajsx/dom */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSSG, defineCollection, RawHTML, z } from "./index";
import type { CollectionSource, CollectionEntry } from "./types";

// Mock source for testing
function createMockSource<T>(entries: CollectionEntry<T>[]): CollectionSource<T> {
  return {
    id: "mock",
    getEntries: vi.fn().mockResolvedValue(entries),
    getEntry: vi.fn().mockImplementation(async (id) => entries.find((e) => e.id === id) ?? null),
  };
}

describe("RawHTML", () => {
  it("should have VNode structure", () => {
    const raw = new RawHTML("<p>Hello</p>");

    expect(raw.type).toBe("div");
    expect(raw.props.dangerouslySetInnerHTML.__html).toBe("<p>Hello</p>");
    expect(raw.children).toEqual([]);
  });

  it("should convert to string", () => {
    const raw = new RawHTML("<p>Hello</p>");

    expect(raw.toString()).toBe("<p>Hello</p>");
    expect(`${raw}`).toBe("<p>Hello</p>");
  });
});

describe("defineCollection", () => {
  it("should create a collection with schema", () => {
    const source = createMockSource([]);
    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({
        title: z.string(),
      }),
    });

    expect(collection.name).toBe("posts");
    expect(collection.source).toBe(source);
  });
});

describe("SSG", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get collection entries", async () => {
    const entries: CollectionEntry<{ title: string }>[] = [
      {
        id: "post-1",
        slug: "post-1",
        data: { title: "First Post" },
        body: "Content",
        render: vi.fn(),
      },
    ];

    const source = createMockSource(entries);
    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({ title: z.string() }),
    });

    const ssg = createSSG({
      outDir: "./dist",
      collections: [collection],
    });

    const result = await ssg.getCollection("posts");

    expect(result).toHaveLength(1);
    expect(result[0].data.title).toBe("First Post");
  });

  it("should get single entry", async () => {
    const entries: CollectionEntry<{ title: string }>[] = [
      {
        id: "post-1",
        slug: "post-1",
        data: { title: "First Post" },
        body: "Content",
        render: vi.fn(),
      },
    ];

    const source = createMockSource(entries);
    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({ title: z.string() }),
    });

    const ssg = createSSG({
      outDir: "./dist",
      collections: [collection],
    });

    const entry = await ssg.getEntry("posts", "post-1");

    expect(entry).not.toBeNull();
    expect(entry?.data.title).toBe("First Post");
  });

  it("should throw on missing collection", async () => {
    const ssg = createSSG({
      outDir: "./dist",
    });

    await expect(ssg.getCollection("missing")).rejects.toThrow('Collection "missing" not found');
  });

  it("should validate schema", async () => {
    const entries: CollectionEntry<unknown>[] = [
      {
        id: "post-1",
        slug: "post-1",
        data: { invalid: true }, // Missing title
        body: "Content",
        render: vi.fn(),
      },
    ];

    const source = createMockSource(entries);
    const collection = defineCollection({
      name: "posts",
      source,
      schema: z.object({ title: z.string() }),
    });

    const ssg = createSSG({
      outDir: "./dist",
      collections: [collection],
    });

    await expect(ssg.getCollection("posts")).rejects.toThrow("Validation error");
  });
});

import { describe, it, expect } from "vitest";
import { parseSequence } from "./sequence";
import type { SequenceDiagram } from "../types";

function expectSequence(input: string): SequenceDiagram {
  const result = parseSequence(input);
  if ("message" in result && "line" in result)
    throw new Error(`Parse error: ${(result as { message: string }).message}`);
  return result as SequenceDiagram;
}

describe("sequence parser", () => {
  describe("header", () => {
    it("parses sequenceDiagram keyword", () => {
      const result = expectSequence("sequenceDiagram\n  A->>B: Hello");
      expect(result.type).toBe("sequence");
    });

    it("returns error for missing header", () => {
      const result = parseSequence("A->>B: Hello");
      expect("message" in result && "line" in result).toBe(true);
    });
  });

  describe("participants", () => {
    it("parses explicit participant", () => {
      const result = expectSequence(`
        sequenceDiagram
          participant Alice
          participant Bob
          Alice->>Bob: Hello
      `);
      expect(result.participants).toHaveLength(2);
      expect(result.participants[0]).toEqual({ id: "Alice", label: "Alice", type: "participant" });
    });

    it("parses actor declaration", () => {
      const result = expectSequence(`
        sequenceDiagram
          actor User
          User->>System: Login
      `);
      expect(result.participants.find((p) => p.id === "User")?.type).toBe("actor");
    });

    it("auto-creates participants from messages", () => {
      const result = expectSequence(`
        sequenceDiagram
          Alice->>Bob: Hello
      `);
      expect(result.participants).toHaveLength(2);
    });
  });

  describe("messages", () => {
    it("parses solid arrow ->>", () => {
      const result = expectSequence(`
        sequenceDiagram
          A->>B: Hello
      `);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toMatchObject({
        from: "A",
        to: "B",
        text: "Hello",
        arrow: "solid",
      });
    });

    it("parses dotted arrow -->>", () => {
      const result = expectSequence(`
        sequenceDiagram
          A-->>B: Response
      `);
      expect(result.messages[0].arrow).toBe("dotted");
    });

    it("parses multiple messages", () => {
      const result = expectSequence(`
        sequenceDiagram
          Alice->>Bob: Hello
          Bob-->>Alice: Hi back
      `);
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].text).toBe("Hello");
      expect(result.messages[1].text).toBe("Hi back");
    });
  });

  describe("notes", () => {
    it("parses Note right of", () => {
      const result = expectSequence(`
        sequenceDiagram
          Alice->>Bob: Hello
          Note right of Bob: Important
      `);
      expect(result.notes).toHaveLength(1);
      expect(result.notes[0]).toMatchObject({
        position: "right of",
        participants: ["Bob"],
        text: "Important",
      });
    });

    it("parses Note over multiple participants", () => {
      const result = expectSequence(`
        sequenceDiagram
          Alice->>Bob: Hello
          Note over Alice,Bob: Shared note
      `);
      expect(result.notes[0].position).toBe("over");
      expect(result.notes[0].participants.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("blocks", () => {
    it("parses loop block", () => {
      const result = expectSequence(`
        sequenceDiagram
          loop Every minute
            A->>B: Ping
          end
      `);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].type).toBe("loop");
      expect(result.blocks[0].label).toBe("Every minute");
      expect(result.blocks[0].messages).toHaveLength(1);
    });

    it("parses alt block with else", () => {
      const result = expectSequence(`
        sequenceDiagram
          alt Success
            A->>B: OK
          else Failure
            A->>B: Error
          end
      `);
      expect(result.blocks).toHaveLength(1);
      expect(result.blocks[0].type).toBe("alt");
      expect(result.blocks[0].messages).toHaveLength(1);
      expect(result.blocks[0].sections).toHaveLength(1);
      expect(result.blocks[0].sections![0].label).toBe("Failure");
    });
  });

  describe("complex diagrams", () => {
    it("parses a real-world sequence diagram", () => {
      const result = expectSequence(`
        sequenceDiagram
          participant Client
          participant Server
          participant DB

          Client->>Server: GET /api/users
          Server->>DB: SELECT * FROM users
          DB-->>Server: rows
          Server-->>Client: 200 OK
      `);
      expect(result.participants).toHaveLength(3);
      expect(result.messages).toHaveLength(4);
    });
  });
});

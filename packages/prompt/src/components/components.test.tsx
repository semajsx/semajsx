/** @jsxImportSource @semajsx/prompt */

import { describe, it, expect } from "vitest";
import { renderToString } from "../render";
import { Screen } from "./Screen";
import { Section } from "./Section";
import { List } from "./List";
import { KeyValue } from "./KeyValue";
import { ActionBar } from "./ActionBar";

describe("Prompt UI Components", () => {
  describe("Screen", () => {
    it("should render a screen with header and children", () => {
      const text = renderToString(
        <Screen name="Support Inbox" time="2026-03-12" focus="thread:A">
          <section title="ROLE">
            <line>Agent</line>
          </section>
        </Screen>,
      );

      expect(text).toContain("SCREEN Support Inbox");
      expect(text).toContain("TIME 2026-03-12");
      expect(text).toContain("FOCUS thread:A");
      expect(text).toContain("[ROLE]");
      expect(text).toContain("Agent");
    });
  });

  describe("Section", () => {
    it("should render a section with title", () => {
      const text = renderToString(
        <Section title="AWARENESS">
          <item>Be careful</item>
        </Section>,
      );

      expect(text).toContain("[AWARENESS]");
      expect(text).toContain("- Be careful");
    });

    it("should render a section with viewport", () => {
      const text = renderToString(
        <Section title="TODOS" viewport="1-3/5">
          <item index={1}>Task one</item>
        </Section>,
      );

      expect(text).toContain("[TODOS] viewport=1-3/5");
      expect(text).toContain("1. Task one");
    });
  });

  describe("List", () => {
    it("should render unordered list", () => {
      const text = renderToString(<List items={[{ text: "Alpha" }, { text: "Beta" }]} />);

      expect(text).toContain("- Alpha");
      expect(text).toContain("- Beta");
    });

    it("should render ordered list", () => {
      const text = renderToString(<List ordered items={[{ text: "First" }, { text: "Second" }]} />);

      expect(text).toContain("1. First");
      expect(text).toContain("2. Second");
    });

    it("should render list items with actions", () => {
      const text = renderToString(
        <List
          ordered
          items={[
            { text: "Reply to A", priority: "high", action: { name: "reply", chat: "A" } },
            { text: "Review B", action: { name: "open", chat: "B" } },
          ]}
        />,
      );

      expect(text).toContain("1. Reply to A");
      expect(text).toContain("priority=high");
      expect(text).toContain("@act:reply chat=A");
      expect(text).toContain("2. Review B");
      expect(text).toContain("@act:open chat=B");
    });
  });

  describe("KeyValue", () => {
    it("should render key-value pairs", () => {
      const text = renderToString(
        <KeyValue
          entries={[
            { label: "Name", value: "Alice" },
            { label: "Status", value: "active" },
          ]}
        />,
      );

      expect(text).toContain("Name: Alice");
      expect(text).toContain("Status: active");
    });
  });

  describe("ActionBar", () => {
    it("should render inline action bar", () => {
      const text = renderToString(
        <ActionBar
          actions={[
            { label: "Reply", name: "reply", chat: "A" },
            { label: "Open", name: "open", chat: "B" },
          ]}
        />,
      );

      expect(text).toContain("Actions:");
      expect(text).toContain("Reply => @act:reply chat=A");
      expect(text).toContain("|");
      expect(text).toContain("Open => @act:open chat=B");
    });

    it("should support custom label", () => {
      const text = renderToString(
        <ActionBar
          label="Thread Actions"
          actions={[{ label: "Scroll Up", name: "scroll_up", chat: "A" }]}
        />,
      );

      expect(text).toContain("Thread Actions:");
      expect(text).toContain("Scroll Up => @act:scroll_up chat=A");
    });
  });

  describe("full screen composition", () => {
    it("should render a complete agent screen", () => {
      const text = renderToString(
        <Screen
          name="Support Inbox"
          time="2026-03-12 19:48:10"
          event="new_message from=A"
          focus="thread:A"
        >
          <Section title="ROLE">
            <line>Support Agent</line>
          </Section>

          <Section title="AWARENESS">
            <item>Prioritize unread messages</item>
            <item>Only visible content is guaranteed</item>
            <item>Use actions to inspect more context</item>
          </Section>

          <Section title="TODOS" viewport="1-2/5">
            <List
              ordered
              items={[
                { text: "Reply to A", priority: "high", action: { name: "reply", chat: "A" } },
                { text: "Review B context", action: { name: "open", chat: "B" } },
              ]}
            />
          </Section>

          <Section title="ACTIONS">
            <ActionBar
              actions={[
                { label: "Next page", name: "next", scope: "screen" },
                { label: "Refresh", name: "refresh" },
                { label: "Finish", name: "finish" },
              ]}
            />
          </Section>
        </Screen>,
      );

      // Header
      expect(text).toContain("SCREEN Support Inbox");
      expect(text).toContain("TIME 2026-03-12 19:48:10");
      expect(text).toContain("EVENT new_message from=A");
      expect(text).toContain("FOCUS thread:A");

      // Sections
      expect(text).toContain("[ROLE]");
      expect(text).toContain("Support Agent");
      expect(text).toContain("[AWARENESS]");
      expect(text).toContain("- Prioritize unread messages");
      expect(text).toContain("[TODOS]");

      // Todos
      expect(text).toContain("1. Reply to A");
      expect(text).toContain("@act:reply chat=A");
      expect(text).toContain("2. Review B context");

      // Actions
      expect(text).toContain("[ACTIONS]");
      expect(text).toContain("@act:finish");
    });
  });
});

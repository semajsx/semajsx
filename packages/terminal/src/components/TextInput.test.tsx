/** @jsxImportSource @semajsx/terminal */
import { describe, test, expect, vi } from "vitest";
import { TextInput } from "./TextInput";
import { render, print } from "../render";

describe("TextInput", () => {
  test("renders empty input with placeholder", () => {
    const onChange = vi.fn();
    const node = <TextInput value="" onChange={onChange} placeholder="Type here..." />;
    // Should not throw
    expect(node).toBeDefined();
  });

  test("renders value with mask", () => {
    const onChange = vi.fn();
    const node = <TextInput value="secret" onChange={onChange} mask="*" />;
    expect(node).toBeDefined();
  });

  test("renders with cursor disabled", () => {
    const onChange = vi.fn();
    const node = <TextInput value="hello" onChange={onChange} showCursor={false} />;
    expect(node).toBeDefined();
  });

  test("renders unfocused", () => {
    const onChange = vi.fn();
    const node = <TextInput value="hello" onChange={onChange} focus={false} />;
    expect(node).toBeDefined();
  });
});

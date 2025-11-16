import { describe, it, expect } from "vitest";
import { createContext } from "../../src/runtime/context";
import { h } from "../../src/runtime/vnode";
import { Fragment } from "../../src/runtime/types";
import type { ComponentAPI } from "../../src/runtime/types";

describe("Context API", () => {
  it("should create a context with default value", () => {
    const ThemeContext = createContext({ mode: "light" });

    expect(ThemeContext).toHaveProperty("id");
    expect(ThemeContext).toHaveProperty("defaultValue");
    expect(ThemeContext).toHaveProperty("Provider");
    expect(ThemeContext.defaultValue).toEqual({ mode: "light" });
  });

  it("should have unique IDs for different contexts", () => {
    const Context1 = createContext("value1");
    const Context2 = createContext("value2");

    expect(Context1.id).not.toBe(Context2.id);
  });

  it("Provider should be a valid component", () => {
    const TestContext = createContext("default");

    expect(typeof TestContext.Provider).toBe("function");
    expect((TestContext.Provider as any).__isContextProvider).toBe(true);
    expect((TestContext.Provider as any).__contextId).toBe(TestContext.id);
  });

  it("Provider should return Fragment with children", () => {
    const TestContext = createContext("test");

    const child1 = h("div", {}, "child1");
    const child2 = h("span", {}, "child2");

    const result = TestContext.Provider({ value: "new value", children: [child1, child2] });

    expect(result.type).toBe(Fragment);
    expect(result.children).toHaveLength(2);
    expect(result.children[0]).toBe(child1);
    expect(result.children[1]).toBe(child2);
  });

  it("ComponentAPI.inject should return default value when context not provided", () => {
    const ThemeContext = createContext({ mode: "light" });
    const contextMap = new Map();

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    const value = ctx.inject(ThemeContext);
    expect(value).toEqual({ mode: "light" });
  });

  it("ComponentAPI.inject should return provided value when context is set", () => {
    const ThemeContext = createContext({ mode: "light" });
    const contextMap = new Map();
    contextMap.set(ThemeContext.id, { mode: "dark" });

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    const value = ctx.inject(ThemeContext);
    expect(value).toEqual({ mode: "dark" });
  });

  it("should support multiple contexts", () => {
    const ThemeContext = createContext({ mode: "light" });
    const UserContext = createContext({ name: "Guest" });

    const contextMap = new Map();
    contextMap.set(ThemeContext.id, { mode: "dark" });
    contextMap.set(UserContext.id, { name: "Alice" });

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    expect(ctx.inject(ThemeContext)).toEqual({ mode: "dark" });
    expect(ctx.inject(UserContext)).toEqual({ name: "Alice" });
  });

  it("should handle nested context providers (context overriding)", () => {
    const ThemeContext = createContext("light");

    // Simulate parent context
    const parentContext = new Map();
    parentContext.set(ThemeContext.id, "light");

    // Simulate child context (overriding)
    const childContext = new Map(parentContext);
    childContext.set(ThemeContext.id, "dark");

    const { createComponentAPI } = require("../../src/runtime/context");

    const parentCtx = createComponentAPI(parentContext);
    const childCtx = createComponentAPI(childContext);

    expect(parentCtx.inject(ThemeContext)).toBe("light");
    expect(childCtx.inject(ThemeContext)).toBe("dark");
  });
});

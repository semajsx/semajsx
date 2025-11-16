import { describe, it, expect } from "vitest";
import { context, Context } from "../../src/runtime/context";
import { h } from "../../src/runtime/vnode";
import { Fragment } from "../../src/runtime/types";
import type { ComponentAPI } from "../../src/runtime/types";

describe("Context API", () => {
  it("should create a context (Symbol)", () => {
    const ThemeContext = context<{ mode: string }>();

    expect(typeof ThemeContext).toBe("symbol");
  });

  it("should have unique symbols for different contexts", () => {
    const Context1 = context<string>();
    const Context2 = context<string>();

    expect(Context1).not.toBe(Context2);
  });

  it("Context component should be a valid function", () => {
    expect(typeof Context).toBe("function");
    expect((Context as any).__isContextProvider).toBe(true);
  });

  it("Context component should return Fragment with children (single provide)", () => {
    const TestContext = context<string>();
    const child1 = h("div", {}, "child1");
    const child2 = h("span", {}, "child2");

    const result = Context({ provide: [TestContext, "test"], children: [child1, child2] });

    expect(result.type).toBe(Fragment);
    expect(result.children).toHaveLength(2);
    expect(result.children[0]).toBe(child1);
    expect(result.children[1]).toBe(child2);
  });

  it("Context component should return Fragment with children (multiple provides)", () => {
    const Context1 = context<string>();
    const Context2 = context<number>();
    const child = h("div", {}, "child");

    const result = Context({
      provide: [
        [Context1, "value1"],
        [Context2, 42],
      ],
      children: [child],
    });

    expect(result.type).toBe(Fragment);
    expect(result.children).toHaveLength(1);
    expect(result.children[0]).toBe(child);
  });

  it("ComponentAPI.inject should return undefined when context not provided", () => {
    const ThemeContext = context<{ mode: string }>();
    const contextMap = new Map();

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    const value = ctx.inject(ThemeContext);
    expect(value).toBeUndefined();
  });

  it("ComponentAPI.inject should return provided value when context is set", () => {
    const ThemeContext = context<{ mode: string }>();
    const contextMap = new Map();
    contextMap.set(ThemeContext, { mode: "dark" });

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    const value = ctx.inject(ThemeContext);
    expect(value).toEqual({ mode: "dark" });
  });

  it("should support multiple contexts", () => {
    const ThemeContext = context<{ mode: string }>();
    const UserContext = context<{ name: string }>();

    const contextMap = new Map();
    contextMap.set(ThemeContext, { mode: "dark" });
    contextMap.set(UserContext, { name: "Alice" });

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    expect(ctx.inject(ThemeContext)).toEqual({ mode: "dark" });
    expect(ctx.inject(UserContext)).toEqual({ name: "Alice" });
  });

  it("should handle nested context providers (context overriding)", () => {
    const ThemeContext = context<string>();

    // Simulate parent context
    const parentContext = new Map();
    parentContext.set(ThemeContext, "light");

    // Simulate child context (overriding)
    const childContext = new Map(parentContext);
    childContext.set(ThemeContext, "dark");

    const { createComponentAPI } = require("../../src/runtime/context");

    const parentCtx = createComponentAPI(parentContext);
    const childCtx = createComponentAPI(childContext);

    expect(parentCtx.inject(ThemeContext)).toBe("light");
    expect(childCtx.inject(ThemeContext)).toBe("dark");
  });

  it("should handle default value pattern (using ?? operator)", () => {
    const ThemeContext = context<{ mode: string }>();
    const contextMap = new Map();

    const { createComponentAPI } = require("../../src/runtime/context");
    const ctx: ComponentAPI = createComponentAPI(contextMap);

    // User provides default value
    const theme = ctx.inject(ThemeContext) ?? { mode: "light" };
    expect(theme).toEqual({ mode: "light" });
  });
});

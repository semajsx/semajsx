/**
 * Context API Example: Basic Usage
 *
 * This example demonstrates the basic usage of Context API:
 * - Creating a context
 * - Providing values with Provider
 * - Consuming values with ctx.inject()
 * - Nested providers (overriding values)
 */

import { createContext } from "../src/runtime";
import type { ComponentAPI } from "../src/runtime/types";

// Create contexts
const ThemeContext = createContext("light");
const LanguageContext = createContext("en");

// App component
function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Context API - Basic Example</h1>

      {/* Provide theme and language context */}
      <ThemeContext.Provider value="dark">
        <LanguageContext.Provider value="zh">
          <Section title="Section 1" />

          {/* Nested provider - overrides theme */}
          <ThemeContext.Provider value="light">
            <Section title="Section 2 (overridden theme)" />
          </ThemeContext.Provider>

          <Section title="Section 3" />
        </LanguageContext.Provider>
      </ThemeContext.Provider>

      {/* Outside providers - uses default values */}
      <Section title="Section 4 (default context)" />
    </div>
  );
}

// Section component - consumes context
function Section(props: { title: string }, ctx: ComponentAPI) {
  const theme = ctx.inject(ThemeContext);
  const language = ctx.inject(LanguageContext);

  const bgColor = theme === "dark" ? "#333" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#000";

  return (
    <div
      style={{
        background: bgColor,
        color: textColor,
        padding: "20px",
        margin: "20px 0",
        border: "2px solid #ccc",
      }}
    >
      <h2>{props.title}</h2>
      <p>Theme: {theme}</p>
      <p>Language: {language}</p>
      <Details />
    </div>
  );
}

// Details component - also consumes context
function Details(props: any, ctx: ComponentAPI) {
  const theme = ctx.inject(ThemeContext);
  const language = ctx.inject(LanguageContext);

  const greetings: Record<string, string> = {
    en: "Hello",
    zh: "你好",
    es: "Hola",
    fr: "Bonjour",
  };

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "10px",
        background: theme === "dark" ? "#444" : "#f0f0f0",
      }}
    >
      <p>
        <strong>{greetings[language] || greetings["en"]}</strong>
      </p>
      <p>This nested component also has access to context!</p>
    </div>
  );
}

// Render example
if (typeof document !== "undefined") {
  const { render } = await import("../src/dom");
  const root = document.getElementById("root");
  if (root) {
    render(<App />, root);
  }
}

export { App };

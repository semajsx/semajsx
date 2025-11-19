# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

SemaJSX is a lightweight, signal-based reactive JSX runtime for building modern web applications. It uses fine-grained reactivity with signals for efficient updates without virtual DOM diffing.

## Architecture

### Single Package Structure

This project uses a **single-package architecture** (not a monorepo):

```
semajsx/
├── src/
│   ├── signal/          # Signal reactivity system
│   ├── runtime/         # VNode and rendering engine
│   ├── dom/             # DOM rendering and operations
│   ├── terminal/        # Terminal rendering (Ink-like API)
│   ├── server/          # SSR and Island architecture
│   ├── client/          # Client-side hydration
│   ├── shared/          # Shared types and utilities
│   ├── jsx-runtime.ts   # JSX transformation (production)
│   ├── jsx-dev-runtime.ts # JSX transformation (development)
│   └── index.ts         # Main entry point
├── examples/            # Example applications
├── tests/               # Unit and integration tests
└── package.json         # Single package.json
```

### Core Modules

1. **Signal System** (`src/signal/`)
   - `signal.ts` - Writable reactive signals
   - `computed.ts` - Derived computed values
   - `batch.ts` - Batched updates
   - `utils.ts` - Utility functions (isSignal, unwrap, peek)
   - `types.ts` - Type definitions

2. **Runtime** (`src/runtime/`)
   - `vnode.ts` - VNode creation and normalization
   - `helpers.ts` - Runtime helpers (when, resource, stream)
   - `types.ts` - Core type definitions

3. **DOM Rendering** (`src/dom/`)
   - `operations.ts` - Low-level DOM manipulation
   - `properties.ts` - Property setting with signal support
   - `render.ts` - DOM rendering engine
   - `jsx-runtime.ts` - JSX runtime for DOM
   - `jsx-dev-runtime.ts` - JSX dev runtime for DOM

4. **Terminal Rendering** (`src/terminal/`)
   - `operations.ts` - Terminal-specific operations
   - `properties.ts` - Terminal property handling
   - `render.ts` - Terminal rendering engine
   - `renderer.ts` - Layout engine with Yoga
   - `jsx-runtime.ts` - JSX runtime for terminal
   - `components/` - Built-in components (Box, Text)
   - `utils/` - Terminal utilities (colors, ANSI codes)

5. **SSR & Island Architecture** (`src/server/`, `src/client/`)
   - `server/island.ts` - Island component annotation
   - `server/render.ts` - Server-side rendering to HTML
   - `server/collector.ts` - Runtime island discovery
   - `server/vite-builder.ts` - Vite-powered island module transformation
   - `server/vite-router.ts` - Route management with SSR and Vite integration
   - `client/hydrate.ts` - Client-side island hydration

## Development Commands

### Building

```bash
# Build for production
bun run build

# Watch mode for development
bun run dev

# Type checking (all files including examples and tests)
bun run typecheck

# Type checking (library code only)
bun run typecheck:lib
```

### Testing

```bash
# Run all tests
bun run test

# Run unit tests only (Node environment)
bun run test:unit

# Run with coverage
bun run test:coverage

# Run terminal tests
bun run test:terminal
```

### Examples

```bash
# Vite counter (DOM, development server)
bun run example:dev

# Bun server example
bun run example:bun

# Performance optimizations demo
bun run example:perf

# SSR Islands architecture demo
bun run example:ssr

# Terminal rendering example
bun run example:terminal
```

## Key Concepts

### Signal-Based Reactivity

- **Signals** are reactive primitives that automatically track dependencies
- When a signal changes, all effects that depend on it automatically re-run
- No virtual DOM - signals update DOM properties directly

### Rendering Flow

1. JSX is transformed to `h()` function calls
2. `h()` creates VNodes
3. VNodes are rendered to actual nodes (DOM or Terminal)
4. Signals in VNodes are automatically subscribed
5. When signals change, only affected nodes update

### Dual Rendering Targets

SemaJSX supports two rendering targets:

- **DOM Rendering** - Standard web browser rendering
  - Import from `semajsx/dom` or main `semajsx` entry
  - Full DOM API support with fine-grained reactivity

- **Terminal Rendering** - CLI applications with Ink-like API
  - Import from `semajsx/terminal`
  - Flexbox layout with Yoga
  - Built-in components: `<Box>`, `<Text>`
  - ANSI color support with chalk

### SSR Island Architecture

SemaJSX implements a modern **Island Architecture** for server-side rendering with Vite integration:

- **Runtime Discovery** - Islands are discovered during SSR rendering, no build-time analysis required
- **Manual Annotation** - Components are explicitly marked as islands using `island()` function
- **Vite-Powered** - Uses Vite for on-demand module transformation
- **Shared Dependencies** - All islands share the same dependencies (e.g., semajsx/dom)
- **Selective Hydration** - Only island components are hydrated on the client
- **Performance** - Static content loads instantly, dependencies are cached

**Island Workflow:**

```tsx
// 1. Mark component as an island
import { island } from "semajsx/server";

export const Counter = island(
  function Counter({ initial = 0 }) {
    const count = signal(initial);
    return <button onClick={() => count.value++}>{count}</button>;
  },
  import.meta.url, // Component module path
);

// 2. Use in your app (mix static and interactive)
function App() {
  return (
    <div>
      <h1>Static Content</h1>
      <Counter initial={0} /> {/* Island - will hydrate */}
      <p>More static content</p>
    </div>
  );
}

// 3. Create server with Vite router
import { createViteRouter } from "semajsx/server";

const router = await createViteRouter(
  {
    "/": () => <App />,
  },
  { dev: true },
);

// 4. Handle requests
const result = await router.get("/"); // { html, islands, scripts }
const entryPoint = await router.getIslandEntryPoint("island-0");
const module = await router.handleModuleRequest("/@fs/path/to/module");
```

**Benefits:**

- **Fast Initial Load** - Static HTML loads instantly
- **Minimal JavaScript** - Only interactive components load JS, shared dependencies
- **SEO Friendly** - Full server-side rendering
- **Runtime Flexibility** - No build-time configuration needed
- **Natural DX** - Simple `island()` wrapper for marking components
- **Browser Caching** - Shared modules can be cached long-term

### Signal VNodes

Special handling for signals in children:

```tsx
const count = signal(0);
const view = computed(() =>
  count.value > 5 ? <div>High</div> : <div>Low</div>,
);

// The signal wrapper tracks changes and replaces DOM nodes
<div>{view}</div>;
```

## Code Organization

- **Pure functions** - Most functions are pure and side-effect free
- **Dependency injection** - DOM operations are isolated
- **Type safety** - Full TypeScript coverage
- **Small modules** - Each module has a single responsibility

## Key Files

- `src/signal/signal.ts` - Core signal implementation with auto-tracking
- `src/runtime/vnode.ts` - VNode creation and children normalization
- `src/runtime/helpers.ts` - Runtime helper functions (when, resource, stream)
- `src/dom/render.ts` - DOM rendering logic with signal reactivity
- `src/dom/properties.ts` - DOM property setting with signal support
- `src/server/island.ts` - Island component annotation for SSR
- `src/server/render.ts` - Server-side rendering to HTML strings
- `src/server/vite-router.ts` - Vite-powered router with SSR
- `src/server/vite-builder.ts` - Vite integration for module transformation
- `src/client/hydrate.ts` - Client-side island hydration
- `src/terminal/render.ts` - Terminal rendering logic
- `src/terminal/renderer.ts` - Terminal layout engine with Yoga

## Development Guidelines

1. **Keep it simple** - Prefer straightforward code over clever tricks
2. **Type everything** - Use TypeScript for all code
3. **Test with examples** - Create examples to verify functionality
4. **Document edge cases** - Comment non-obvious behavior
5. **Use JSX syntax**:
   - **Always use JSX** in examples, tests, and documentation
   - **Never use `h()` directly** in user-facing code (tests, examples)
   - The `h()` function is internal - JSX is the public API
   - Exception: Internal runtime code may use `h()` for implementation
6. **Type safety rules**:
   - **NEVER use `as any`** - Avoid any type assertions that bypass type checking
   - Prefer proper type definitions over type casting
   - Use `unknown` instead of `any` when the type is genuinely unknown
   - If type assertion is absolutely necessary, use specific types (e.g., `as HTMLElement`)
   - Document why a type assertion is needed if it must be used

## Code Quality

### Type Checking

The project uses strict TypeScript configuration with comprehensive type checking:

- **Full Coverage**: `bun run typecheck` checks ALL TypeScript files including `src/`, `tests/`, and `examples/`
- **Build-Only**: `bun run typecheck:lib` checks only library code in `src/` for build validation
- **Strict Mode**: Enabled with additional checks:
  - `noUncheckedIndexedAccess`: Array/object access safety
  - `noImplicitOverride`: Explicit override declarations
  - `noUnusedLocals` / `noUnusedParameters`: No unused code
  - `noFallthroughCasesInSwitch`: Complete switch statements

### Linting & Formatting

The project uses **oxlint** (fast Rust-based linter) and **Prettier**:

- **Lint All Files**: `bun run lint` checks `src/`, `tests/`, and `examples/`
- **Auto-Fix**: `bun run lint:fix` automatically fixes issues
- **Format**: `bun run format` formats all files with Prettier

**Enforced Rules**:
- `@typescript-eslint/no-explicit-any` (error): Prevents `any` type usage
- `@typescript-eslint/no-unsafe-*` (warnings): Warns about unsafe type operations
- `english-only/no-non-english-comments` (error): English-only comments required
- Console/debugger statements (warnings): Clean production code

### Git Hooks

Pre-commit hooks automatically run on staged files:
- **Format**: Prettier on all staged files
- **Lint**: oxlint with auto-fix on TypeScript files
- **Commit Messages**: Conventional commits enforced (English only)

### Git Workflow

**IMPORTANT: Always let Git hooks run. Never use `--no-verify` flag.**

The project has pre-commit hooks that ensure code quality. These hooks:
- Automatically format code with Prettier
- Run linting and auto-fix issues
- Validate commit message format

✅ **Good - Let hooks run:**
```bash
git add .
git commit -m "feat: add new feature"
# Hooks will run automatically
```

❌ **Bad - Don't skip hooks:**
```bash
# DON'T DO THIS
git commit --no-verify -m "skip hooks"
git commit -n -m "skip hooks"
```

**Commit Message Format:**

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `style:` - Code style changes (formatting)
- `perf:` - Performance improvements

**Examples:**
```bash
git commit -m "feat: add signal batching support"
git commit -m "fix: resolve memory leak in effect cleanup"
git commit -m "refactor: convert test files to use JSX syntax"
git commit -m "test: add integration tests for portal component"
```

## Testing

The project uses **Vitest** with two test configurations:

1. **Unit Tests** (`vitest.unit.config.ts`)
   - Node environment for signal system and runtime tests
   - Fast execution without browser overhead
   - Run with: `bun run test:unit`

2. **Browser Tests** (`vitest.config.ts`)
   - Playwright/Chromium for DOM rendering tests
   - Run with: `bun run test`

### Test Structure

- `tests/signal/` - Signal system tests (signal, computed, batch)
- `tests/runtime/` - Runtime tests (VNode, helpers, context)
- `tests/dom/` - DOM-specific tests (ref, portal, signal-array)
- `tests/server/` - SSR and island tests (render, island, collector)
- `tests/terminal/` - Terminal rendering tests

### Writing Tests

**IMPORTANT: Always use JSX syntax in tests, never use `h()` function calls directly.**

✅ **Good - Use JSX:**
```tsx
/** @jsxImportSource semajsx/dom */

it("should render a component", () => {
  const Greeting = ({ name }: { name: string }) => {
    return <h1>Hello, {name}!</h1>;
  };

  const vnode = <Greeting name="World" />;
  render(vnode, container);

  expect(container.textContent).toBe("Hello, World!");
});
```

❌ **Bad - Don't use h():**
```tsx
// DON'T DO THIS
import { h } from "@/runtime/vnode";

it("should render a component", () => {
  const Greeting = ({ name }: { name: string }) => {
    return h("h1", null, `Hello, ${name}!`);
  };

  const vnode = h(Greeting, { name: "World" });  // Wrong!
  render(vnode, container);
});
```

### Test File Guidelines

1. **File Extension**: Use `.tsx` for test files that use JSX (most test files)
2. **JSX Import Source**: Always add the appropriate `@jsxImportSource` directive:
   - For DOM tests: `/** @jsxImportSource semajsx/dom */`
   - For Terminal tests: `/** @jsxImportSource semajsx/terminal */`

3. **Component Usage**: Use JSX component syntax `<Component prop={value} />` instead of function calls `Component({ prop: value })`

4. **Element Creation**: Use JSX tags `<div>content</div>` instead of `h("div", null, "content")`

### Test Examples

**DOM Component Test:**
```tsx
/** @jsxImportSource semajsx/dom */

import { signal } from "@/signal";
import { render } from "@/dom/render";

it("should handle reactive components", () => {
  const Counter = ({ initial = 0 }) => {
    const count = signal(initial);
    return <button onClick={() => count.value++}>{count}</button>;
  };

  const vnode = <Counter initial={5} />;
  render(vnode, container);

  expect(container.textContent).toBe("5");
});
```

**Terminal Component Test:**
```tsx
/** @jsxImportSource semajsx/terminal */

import { render } from "@/terminal";

it("should render terminal component", () => {
  const app = (
    <box flexDirection="column">
      <text color="green" bold={true}>
        Styled Text
      </text>
    </box>
  );

  render(app, { renderer });
  expect(mockStream.output.length).toBeGreaterThan(0);
});
```

**Island Component Test:**
```tsx
/** @jsxImportSource semajsx/dom */

import { island } from "@/server/island";
import { renderToString } from "@/server/render";

it("should render island as placeholder", () => {
  const Counter = island(
    ({ initial = 0 }) => <button>Count: {initial}</button>,
    "/Counter.tsx"
  );

  const app = (
    <div>
      <h1>App</h1>
      <Counter initial={5} />
    </div>
  );

  const result = renderToString(app);
  expect(result.islands).toHaveLength(1);
});
```

## Publishing

The package is configured to publish to npm:

```bash
bun run build
npm publish
```

Exports:

- `semajsx` - Main entry with all features
- `semajsx/jsx-runtime` - JSX transformation (production)
- `semajsx/jsx-dev-runtime` - JSX transformation (development)
- `semajsx/signal` - Signal system only
- `semajsx/dom` - DOM rendering utilities
- `semajsx/dom/jsx-runtime` - DOM JSX runtime (production)
- `semajsx/dom/jsx-dev-runtime` - DOM JSX dev runtime
- `semajsx/server` - SSR and Island architecture (island, renderToString, createViteRouter)
- `semajsx/client` - Client-side hydration utilities
- `semajsx/terminal` - Terminal rendering system
- `semajsx/terminal/jsx-runtime` - Terminal JSX runtime (production)
- `semajsx/terminal/jsx-dev-runtime` - Terminal JSX dev runtime

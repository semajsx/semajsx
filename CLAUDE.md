# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

SemaJSX is a lightweight, signal-based reactive JSX runtime for building modern web applications. It uses fine-grained reactivity with signals for efficient updates without virtual DOM diffing.

## Architecture

### Monorepo Structure

This project uses a **monorepo architecture** powered by Bun workspaces:

```
semajsx/
├── packages/
│   ├── core/                 # @semajsx/core - Runtime core (VNode, helpers)
│   ├── signal/               # @semajsx/signal - Signal reactivity system
│   ├── dom/                  # @semajsx/dom - DOM rendering
│   │   ├── src/
│   │   ├── tests/
│   │   └── examples/
│   ├── terminal/             # @semajsx/terminal - Terminal rendering
│   │   ├── src/
│   │   └── examples/
│   ├── server/               # @semajsx/server - SSR and Island architecture
│   │   ├── src/
│   │   ├── tests/
│   │   └── examples/
│   ├── logger/               # @semajsx/logger - Logging utilities
│   │   ├── src/
│   │   └── examples/
│   ├── utils/                # @semajsx/utils - Shared utilities
│   ├── semajsx/              # semajsx - Main umbrella package (re-exports)
│   │   └── src/
│   └── configs/              # Shared TypeScript configurations (internal)
│
├── package.json              # Root workspace configuration
└── MONOREPO_ARCHITECTURE.md  # Detailed architecture documentation
```

### Core Modules

1. **Signal System** (`packages/signal/`)
   - Signal reactivity primitives
   - Computed values and batching

2. **Core Runtime** (`packages/core/`)
   - VNode creation and normalization
   - Runtime helpers (when, resource, stream)

3. **DOM Rendering** (`packages/dom/`)
   - DOM manipulation and rendering
   - JSX runtime for DOM
   - Hydration support

4. **Terminal Rendering** (`packages/terminal/`)
   - Terminal-specific rendering
   - Flexbox layout with Yoga
   - Built-in components (Box, Text)

5. **Server** (`packages/server/`)
   - SSR and Island architecture
   - Vite-powered routing and building

6. **Logger** (`packages/logger/`)
   - Logging utilities

7. **Utils** (`packages/utils/`)
   - Shared utilities

## Development Commands

### Monorepo Commands (Root Level)

```bash
# Install dependencies for all packages
bun install

# Build all packages
bun run build

# Run dev mode for all packages
bun run dev

# Run tests in all packages
bun run test

# Type check all packages
bun run typecheck

# Lint all packages
bun run lint

# Format all files
bun run format

# Clean all build outputs and node_modules
bun run clean
```

### Package-Specific Commands

Navigate to a specific package to run its commands:

```bash
# Example: Work on semajsx package
cd packages/semajsx

# Build this package only
bun run build

# Watch mode for development
bun run dev

# Run tests for this package
bun run test
bun run test:unit

# Type checking
bun run typecheck
```

### Examples

Examples are located in their respective packages:

- **DOM examples**: `packages/dom/examples/`
- **Server examples**: `packages/server/examples/`
- **Terminal examples**: `packages/terminal/examples/`
- **Logger examples**: `packages/logger/examples/`

Run examples from each package directory.

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

See [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) for details on the Island Architecture.

## Code Organization

- **Pure functions** - Most functions are pure and side-effect free
- **Dependency injection** - DOM operations are isolated
- **Type safety** - Full TypeScript coverage
- **Small modules** - Each module has a single responsibility
- **Monorepo** - Clear package boundaries and dependencies

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
7. **Workspace management**:
   - Use workspace protocol (`workspace:*`) for internal dependencies
   - Always run `bun install` from the root directory
   - Use `bun --filter <package-name>` to run commands in specific packages from root

## Code Quality

### Type Checking

The project uses strict TypeScript configuration with comprehensive type checking:

- **Shared Configs**: All packages extend from `@semajsx/configs`
- **Full Coverage**: Type checking includes all packages
- **Strict Mode**: Enabled with additional checks

Run type checking:

```bash
# Check all packages
bun run typecheck

# Check specific package
cd packages/semajsx && bun run typecheck
```

### Linting & Formatting

The project uses **oxlint** (fast Rust-based linter) and **Prettier**:

- **Lint All Packages**: `bun run lint` from root
- **Auto-Fix**: `bun run lint:fix`
- **Format**: `bun run format` formats all files with Prettier

Configuration files are at the root level and apply to all packages.

### Git Hooks

Pre-commit hooks automatically run on staged files:

- **Format**: Prettier on all staged files
- **Lint**: oxlint with auto-fix on TypeScript files
- **Commit Messages**: Conventional commits enforced (English only)

### Git Workflow

**IMPORTANT: Always let Git hooks run. Never use `--no-verify` flag.**

The project has pre-commit hooks that ensure code quality.

✅ **Good - Let hooks run:**

```bash
git add .
git commit -m "feat: add new feature"
```

❌ **Bad - Don't skip hooks:**

```bash
git commit --no-verify -m "skip hooks"  # DON'T DO THIS
```

**Commit Message Format:**

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks (including monorepo setup)
- `style:` - Code style changes (formatting)
- `perf:` - Performance improvements

## Testing

The project uses **Vitest** with a dual testing strategy:

- **Node Environment**: For pure logic tests (signals, computed, utils)
- **Browser Mode + Playwright**: For DOM rendering tests with real browser APIs

### Testing Philosophy

1. **Logic in Node, behavior in Browser**
   - Pure functions and signal reactivity → Node environment (fast)
   - DOM manipulation, events, rendering → Browser Mode (real browser)

2. **Same framework, multiple strategies**
   - Use Vitest across all packages
   - Each package configures its appropriate environment

### Test Structure by Package

| Package | Environment | Purpose |
|---------|-------------|---------|
| `@semajsx/signal` | Node | Signal primitives, computed values |
| `@semajsx/core` | Node | VNode creation, runtime helpers |
| `@semajsx/dom` | Browser | DOM rendering, events, hydration |
| `@semajsx/server` | Browser | SSR, island architecture |
| `@semajsx/terminal` | Node | Terminal rendering |
| `@semajsx/utils` | Node | Utility functions |

### Dependencies

Each package declares its own test dependencies:

```bash
# Node environment tests (already included with vitest)
bun add -D vitest

# Browser Mode tests
bun add -D vitest @vitest/browser-playwright
```

### Configuration

#### Node Environment (Signal/Core)

```ts
// packages/signal/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

#### Browser Mode (DOM)

```ts
// packages/dom/vitest.config.ts
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  esbuild: {
    jsxImportSource: "semajsx",
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
```

### Running Tests

```bash
# Run all tests across all packages
bun run test

# Run tests for a specific package
cd packages/signal && bun run test
cd packages/dom && bun run test

# Run with specific browser (for browser tests)
bun run test --browser=chromium
bun run test --browser=firefox

# Run in headed mode for debugging
bun run test --browser.headless=false
```

### Test Guidelines

**IMPORTANT: Always use JSX syntax in tests, never use `h()` function calls directly.**

#### Node Environment Test Example (Signal)

```ts
// packages/signal/tests/signal.test.ts
import { describe, it, expect } from "vitest";
import { signal, computed } from "@semajsx/signal";

describe("signal", () => {
  it("should update value reactively", () => {
    const count = signal(0);
    expect(count.value).toBe(0);

    count.value = 5;
    expect(count.value).toBe(5);
  });

  it("should compute derived values", () => {
    const count = signal(5);
    const doubled = computed([count], (c) => c * 2);

    expect(doubled.value).toBe(10);

    count.value = 10;
    expect(doubled.value).toBe(20);
  });
});
```

#### Browser Mode Test Example (DOM)

```tsx
/** @jsxImportSource @semajsx/dom */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signal } from "@semajsx/signal";
import { render } from "@semajsx/dom";

describe("render", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should render simple element", () => {
    const vnode = <div class="test">Hello</div>;
    render(vnode, container);

    expect(container.innerHTML).toContain('<div class="test">Hello</div>');
  });

  it("should render signal as text", async () => {
    const count = signal(5);
    const vnode = <div>{count}</div>;
    render(vnode, container);

    expect(container.textContent).toContain("5");

    count.value = 10;
    await new Promise((resolve) => queueMicrotask(resolve));
    expect(container.textContent).toContain("10");
  });

  it("should handle event handlers", () => {
    let clicked = false;
    const vnode = (
      <button onclick={() => { clicked = true; }}>
        Click me
      </button>
    );
    render(vnode, container);

    const button = container.querySelector("button");
    button?.click();

    expect(clicked).toBe(true);
  });

  it("should render components", () => {
    const Greeting = ({ name }: { name: string }) => {
      return <h1>Hello, {name}!</h1>;
    };

    const vnode = <Greeting name="World" />;
    render(vnode, container);

    expect(container.textContent).toBe("Hello, World!");
  });
});
```

### Test Best Practices

1. **Use JSX Import Source**
   - Always add `/** @jsxImportSource @semajsx/dom */` at the top of DOM test files
   - For terminal tests, use `/** @jsxImportSource @semajsx/terminal */`

2. **Async Signal Updates**
   - Signal updates are batched via microtasks
   - Use `await new Promise((resolve) => queueMicrotask(resolve))` to wait for updates

3. **Container Cleanup**
   - Always clean up DOM containers in `afterEach`
   - Call `unmount()` when testing component lifecycle

4. **Test Isolation**
   - Each test should be independent
   - Don't share mutable state between tests

### CI/CD Integration

For CI environments, ensure Playwright browsers are installed:

```bash
# Install Playwright browsers with dependencies
npx playwright install --with-deps chromium
```

Run tests in headless mode (default):

```bash
# Fast feedback: Run Node tests first
bun run test --filter signal
bun run test --filter core

# Then run browser tests
bun run test --filter dom
```

### Debugging Browser Tests

1. **Run in headed mode**:
   ```bash
   cd packages/dom && bun run test --browser.headless=false
   ```

2. **Use Vitest UI**:
   ```bash
   bun run test --ui
   ```

3. **Browser DevTools**: In headed mode, you can open browser DevTools to inspect elements and debug

## Adding New Packages

When adding a new package to the monorepo:

1. Create package directory: `packages/<name>/`
2. Create `package.json` with appropriate name (`@semajsx/<name>`)
3. Create `tsconfig.json` extending `@semajsx/configs`
4. Add package reference to root `tsconfig.json`
5. Run `bun install` from root to set up workspace links

## Publishing

Currently, only the `semajsx` package is published to npm. In the future, individual packages will be published separately.

For now:

```bash
cd packages/semajsx
bun run build
npm publish
```

## Useful Resources

- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Detailed architecture and migration plan
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)

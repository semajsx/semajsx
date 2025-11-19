# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

SemaJSX is a lightweight, signal-based reactive JSX runtime for building modern web applications. It uses fine-grained reactivity with signals for efficient updates without virtual DOM diffing.

## Architecture

### Monorepo Structure

This project uses a **monorepo architecture** powered by PNPM workspaces and PNPM workspaces:

```
semajsx/
├── packages/
│   ├── semajsx/              # Main package (currently contains all code)
│   │   ├── src/
│   │   │   ├── signal/       # Signal reactivity system
│   │   │   ├── runtime/      # VNode and rendering engine
│   │   │   ├── dom/          # DOM rendering and operations
│   │   │   ├── terminal/     # Terminal rendering (Ink-like API)
│   │   │   ├── server/       # SSR and Island architecture
│   │   │   ├── client/       # Client-side hydration
│   │   │   ├── shared/       # Shared types and utilities
│   │   │   ├── jsx-runtime.ts
│   │   │   ├── jsx-dev-runtime.ts
│   │   │   └── index.ts
│   │   ├── tests/            # Tests
│   │   ├── examples/         # Examples
│   │   └── package.json
│   │
│   └── configs/              # Shared TypeScript configurations (internal)
│       ├── tsconfig.base.json    # Base config
│       ├── tsconfig.lib.json     # Library packages config
│       ├── tsconfig.app.json     # Application config
│       ├── tsconfig.test.json    # Test files config
│       └── package.json
│
├── package.json              # Root workspace configuration
├── pnpm-workspace.yaml       # PNPM workspace definition
├── pnpm-workspace.yaml                # PNPM workspaces configuration
└── MONOREPO_ARCHITECTURE.md  # Detailed architecture documentation
```

**Future Package Structure** (to be implemented):

The monorepo will eventually be split into these packages:

- `@semajsx/core` - Runtime core (VNode, helpers)
- `@semajsx/signal` - Signal reactivity system
- `@semajsx/dom` - DOM rendering
- `@semajsx/terminal` - Terminal rendering
- `@semajsx/server` - SSR and Island architecture
- `@semajsx/logger` - Logging utilities
- `@semajsx/utils` - Shared utilities
- `semajsx` - Main umbrella package (re-exports all packages)

See [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) for detailed migration plans.

### Core Modules (in packages/semajsx/src)

1. **Signal System** (`signal/`)
   - `signal.ts` - Writable reactive signals
   - `computed.ts` - Derived computed values
   - `batch.ts` - Batched updates
   - `utils.ts` - Utility functions (isSignal, unwrap, peek)
   - `types.ts` - Type definitions

2. **Runtime** (`runtime/`)
   - `vnode.ts` - VNode creation and normalization
   - `helpers.ts` - Runtime helpers (when, resource, stream)
   - `types.ts` - Core type definitions

3. **DOM Rendering** (`dom/`)
   - `operations.ts` - Low-level DOM manipulation
   - `properties.ts` - Property setting with signal support
   - `render.ts` - DOM rendering engine
   - `jsx-runtime.ts` - JSX runtime for DOM
   - `jsx-dev-runtime.ts` - JSX dev runtime for DOM

4. **Terminal Rendering** (`terminal/`)
   - `operations.ts` - Terminal-specific operations
   - `properties.ts` - Terminal property handling
   - `render.ts` - Terminal rendering engine
   - `renderer.ts` - Layout engine with Yoga
   - `jsx-runtime.ts` - JSX runtime for terminal
   - `components/` - Built-in components (Box, Text)
   - `utils/` - Terminal utilities (colors, ANSI codes)

5. **SSR & Island Architecture** (`server/`, `client/`)
   - `server/island.ts` - Island component annotation
   - `server/render.ts` - Server-side rendering to HTML
   - `server/collector.ts` - Runtime island discovery
   - `server/vite-builder.ts` - Vite-powered island module transformation
   - `server/vite-router.ts` - Route management with SSR and Vite integration
   - `client/hydrate.ts` - Client-side island hydration

## Development Commands

### Monorepo Commands (Root Level)

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Run dev mode for all packages
pnpm dev

# Run tests in all packages
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Format all files
pnpm format

# Clean all build outputs and node_modules
pnpm clean
```

### Package-Specific Commands

Navigate to a specific package to run its commands:

```bash
# Example: Work on semajsx package
cd packages/semajsx

# Build this package only
pnpm build

# Watch mode for development
pnpm dev

# Run tests for this package
pnpm test
pnpm test:unit

# Type checking
pnpm typecheck
```

### Examples (in packages/semajsx)

```bash
cd packages/semajsx

# Vite counter (DOM, development server)
pnpm example:dev

# Bun server example
pnpm example:bun

# Performance optimizations demo
pnpm example:perf

# SSR Islands architecture demo
pnpm example:ssr

# Terminal rendering example
pnpm example:terminal

# Logger examples
pnpm example:logger
pnpm example:logger:showcase
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
   - Always run `pnpm install` from the root directory
   - Use `pnpm -F <package-name>` to run commands in specific packages from root

## Code Quality

### Type Checking

The project uses strict TypeScript configuration with comprehensive type checking:

- **Shared Configs**: All packages extend from `@semajsx/configs`
- **Full Coverage**: Type checking includes all packages
- **Strict Mode**: Enabled with additional checks

Run type checking:

```bash
# Check all packages
pnpm typecheck

# Check specific package
cd packages/semajsx && pnpm typecheck
```

### Linting & Formatting

The project uses **oxlint** (fast Rust-based linter) and **Prettier**:

- **Lint All Packages**: `pnpm lint` from root
- **Auto-Fix**: `pnpm lint:fix`
- **Format**: `pnpm format` formats all files with Prettier

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

The project uses **Vitest** with two test configurations in `packages/semajsx`:

1. **Unit Tests** (`vitest.unit.config.ts`)
   - Node environment for signal system and runtime tests
   - Fast execution without browser overhead
   - Run with: `pnpm test:unit`

2. **Browser Tests** (`vitest.config.ts`)
   - Playwright/Chromium for DOM rendering tests
   - Run with: `pnpm test`

### Test Guidelines

**IMPORTANT: Always use JSX syntax in tests, never use `h()` function calls directly.**

See CLAUDE.md.backup for detailed testing examples and guidelines.

## Adding New Packages

When adding a new package to the monorepo:

1. Create package directory: `packages/<name>/`
2. Create `package.json` with appropriate name (`@semajsx/<name>`)
3. Create `tsconfig.json` extending `@semajsx/configs`
4. Add package reference to root `tsconfig.json`
5. Add to `pnpm-workspace.yaml` pipeline if needed
6. Run `pnpm install` from root to set up workspace links

## Publishing

Currently, only the `semajsx` package is published to npm. In the future, individual packages will be published separately.

For now:

```bash
cd packages/semajsx
pnpm build
npm publish
```

## Useful Resources

- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Detailed architecture and migration plan
- [PNPM workspaces Documentation](https://turbo.build/repo/docs)
- [PNPM Workspaces](https://pnpm.io/workspaces)

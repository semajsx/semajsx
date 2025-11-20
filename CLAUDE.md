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
│   │   └── src/
│   │       ├── vnode.ts
│   │       ├── vnode.test.ts     # Tests collocated with source
│   │       └── ...
│   ├── signal/               # @semajsx/signal - Signal reactivity system
│   ├── dom/                  # @semajsx/dom - DOM rendering
│   │   ├── src/
│   │   │   ├── render.ts
│   │   │   ├── render.test.tsx   # Tests collocated with source
│   │   │   └── ...
│   │   └── examples/
│   ├── terminal/             # @semajsx/terminal - Terminal rendering
│   │   ├── src/
│   │   └── examples/
│   ├── server/               # @semajsx/server - SSR and Island architecture
│   │   ├── src/
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

- **Node Environment**: Signal system, core runtime, utils (fast)
- **Browser Mode + Playwright**: DOM rendering with real browser APIs

### Test File Organization

Tests are **collocated** with source files:

```
packages/dom/src/
  render.ts
  render.test.tsx      # Test file next to source
  hydrate.ts
  hydrate.test.tsx
  operations.ts
  operations.test.ts
```

**Naming convention:**

- `xxx.test.ts` for TypeScript tests
- `xxx.test.tsx` for JSX tests

```bash
# Run all tests
bun run test

# Run specific package
cd packages/dom && bun run test
```

**Key Guidelines:**

- Always use JSX syntax in tests, never `h()` directly
- Use `/** @jsxImportSource @semajsx/dom */` for DOM tests
- Wait for signal updates with `await new Promise(r => queueMicrotask(r))`
- Place test files next to the source files they test

See [TESTING.md](./TESTING.md) for detailed configuration, examples, and best practices

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

- [TESTING.md](./TESTING.md) - Detailed testing guide with examples
- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Detailed architecture and migration plan
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)

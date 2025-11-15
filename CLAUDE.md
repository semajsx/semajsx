# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

SemaJSX is a lightweight, signal-based reactive JSX runtime for building modern web applications. It uses fine-grained reactivity with signals for efficient updates without virtual DOM diffing.

## File Naming Convention

**IMPORTANT:** This project uses file extensions to distinguish between rendering targets:

- **`.dom.tsx` / `.dom.ts`** - Files for DOM (browser) rendering
  - Automatically use `jsxImportSource: "semajsx/dom"`
  - Included in `tsconfig.dom.json`
  - Example: `app.dom.tsx`, `component.dom.tsx`

- **`.cli.tsx` / `.cli.ts`** - Files for Terminal/CLI rendering
  - Automatically use `jsxImportSource: "semajsx/terminal"`
  - Included in `tsconfig.cli.json`
  - Example: `server.cli.tsx`, `ui.cli.tsx`

- **`.dom.test.ts`** - Test files for DOM/signal system
  - Included in `tsconfig.dom.json`
  - Example: `signal.dom.test.ts`, `computed.dom.test.ts`

- **`.cli.test.ts`** - Test files for Terminal rendering
  - Included in `tsconfig.cli.json`
  - Example: `renderer.cli.test.ts`, `operations.cli.test.ts`

**Why this convention?**
- No need for `/** @jsxImportSource */` pragma in every file
- Clear visual distinction between rendering targets
- TypeScript automatically applies correct configuration
- Prevents accidentally using wrong JSX runtime

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

## Development Commands

### Building

```bash
# Build for production
bun run build

# Watch mode for development
bun run dev

# Type checking
bun run typecheck
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
- `src/terminal/render.ts` - Terminal rendering logic
- `src/terminal/renderer.ts` - Terminal layout engine with Yoga

## Development Guidelines

1. **Keep it simple** - Prefer straightforward code over clever tricks
2. **Type everything** - Use TypeScript for all code
3. **Test with examples** - Create examples to verify functionality
4. **Document edge cases** - Comment non-obvious behavior

## Testing

The project uses **Vitest** with two test configurations:

1. **Unit Tests** (`vitest.unit.config.ts`)
   - Node environment for signal system and runtime tests
   - Fast execution without browser overhead
   - Run with: `bun run test:unit`

2. **Browser Tests** (`vitest.config.ts`)
   - Playwright/Chromium for DOM rendering tests
   - Run with: `bun run test`

Test Structure:
- `tests/signal/` - Signal system tests (signal, computed, batch)
- `tests/runtime/` - Runtime tests (VNode, helpers)
- `tests/terminal/` - Terminal rendering tests

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
- `semajsx/terminal` - Terminal rendering system
- `semajsx/terminal/jsx-runtime` - Terminal JSX runtime (production)
- `semajsx/terminal/jsx-dev-runtime` - Terminal JSX dev runtime

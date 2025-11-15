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
│   ├── dom/             # DOM operations
│   ├── jsx-runtime.ts   # JSX transformation
│   └── index.ts         # Main entry point
├── examples/            # Example applications
└── package.json         # Single package.json
```

### Core Modules

1. **Signal System** (`src/signal/`)
   - `signal.ts` - Writable reactive signals
   - `computed.ts` - Derived computed values
   - `effect.ts` - Side effect system
   - `batch.ts` - Batched updates
   - `utils.ts` - Utility functions

2. **Runtime** (`src/runtime/`)
   - `vnode.ts` - VNode creation and normalization
   - `render.ts` - Rendering engine with signal support
   - `types.ts` - Core type definitions

3. **DOM** (`src/dom/`)
   - `operations.ts` - Low-level DOM manipulation
   - `properties.ts` - Property setting with signal support

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

### Examples

```bash
# Run the basic example
bun run example:dev

# Build example
bun run example:build
```

## Key Concepts

### Signal-Based Reactivity

- **Signals** are reactive primitives that automatically track dependencies
- When a signal changes, all effects that depend on it automatically re-run
- No virtual DOM - signals update DOM properties directly

### Rendering Flow

1. JSX is transformed to `h()` function calls
2. `h()` creates VNodes
3. VNodes are rendered to actual DOM nodes
4. Signals in VNodes are automatically subscribed
5. When signals change, only affected DOM nodes update

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
- `src/runtime/render.ts` - Main rendering logic
- `src/runtime/vnode.ts` - VNode creation and children normalization
- `src/dom/properties.ts` - Property setting with signal reactivity

## Development Guidelines

1. **Keep it simple** - Prefer straightforward code over clever tricks
2. **Type everything** - Use TypeScript for all code
3. **Test with examples** - Create examples to verify functionality
4. **Document edge cases** - Comment non-obvious behavior

## Testing

Currently testing is done through examples. Future work includes:

- Unit tests for signal system
- Integration tests for rendering
- Browser tests with Playwright

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

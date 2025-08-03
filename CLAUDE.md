# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

SemaJSX is a signal-based reactive UI framework built as a monorepo with the following packages:

- **@semajsx/core** - Core runtime and reactivity system with VNode creation, rendering engine, and plugin architecture
- **@semajsx/web** - Web/DOM-specific rendering strategies and browser optimizations
- **@semajsx/signal** - Reactive signal system for state management
- **demo app** - Example application demonstrating framework usage with Vite and TailwindCSS

## Development Commands

### Building
```bash
# Build all packages
bun run build

# Build and watch specific package
cd packages/core && bun run dev
cd packages/web && bun run dev
cd packages/signal && bun run dev
```

### Testing
```bash
# Run all tests (browser-based with Playwright)
bun run test

# Run unit tests only
bun run test:unit

# Run both unit and integration tests
bun run test:all
```

### Type Checking & Linting
```bash
# Type check all packages
bun run typecheck

# Lint (currently targets packages/sema)
bun run lint

# Format code
bun run format
```

### Demo App
```bash
cd apps/demo
bun run dev    # Start development server
bun run build  # Build for production
```

## Architecture Overview

### Core Rendering System
- **VNode**: Virtual node representation for all UI elements
- **Renderer**: Platform-agnostic rendering engine that uses strategy pattern
- **RenderStrategies**: Platform-specific implementations (web/DOM, etc.)
- **Plugin System**: Extensible architecture for adding functionality (error boundaries, dev tools, themes)

### Signal-Based Reactivity
- Components return VNodes that can contain signals
- Signal changes automatically trigger DOM updates through subscriptions
- No virtual DOM diffing - direct signal-to-DOM property binding
- Built-in components: Fragment, ErrorBoundary, Suspense

### Web Platform Features
- Event delegation and synthetic events
- Style object support with signal bindings
- Performance optimizations (batched updates, element recycling)
- Browser feature detection and polyfill integration

## Build System

- **tsdown** for TypeScript compilation and bundling
- **Vitest** for testing with browser environment using Playwright
- **Bun** as primary package manager and task runner
- **Workspace** setup for monorepo management

## Key Files to Understand

- `packages/core/src/render.ts` - Main rendering logic and component lifecycle
- `packages/core/src/vnode.ts` - VNode creation and management
- `packages/web/src/render.ts` - Web-specific rendering implementation
- `packages/web/DESIGN.md` - Detailed web architecture documentation
- `vitest.config.ts` - Browser testing configuration with Playwright

## Testing Setup

Tests run in actual browsers using Vitest browser mode with Playwright. Files ending in `.browser.test.*` or `.component.test.*` are included in the test suite.
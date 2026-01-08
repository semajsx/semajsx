# SemaJSX Architecture Summary

**Last Updated**: 2026-01-08
**Status**: Living Document

## Quick Overview

SemaJSX is a **signal-based reactive JSX runtime** for building modern web and terminal applications. It uses **fine-grained reactivity** without a virtual DOM for efficient updates.

## Core Architecture Principles

### 1. Signal-Based Reactivity

**What**: Fine-grained reactive primitives that automatically track dependencies

**Why**:

- Direct signal-to-DOM bindings (no VDOM diffing)
- Automatic subscription management
- Precise updates only where needed

**Key Components**:

- `signal()` - Reactive primitive
- `computed()` - Derived values
- `effect()` - Side effects
- Microtask batching for performance

**Reference**: ADR-0002, `.design/architecture/signal-system.md`

### 2. VNode System

**What**: Platform-agnostic virtual node representation

**Why**:

- Supports multiple rendering targets (DOM, Terminal)
- Separates JSX transformation from rendering
- Special nodes for signals, async, streams

**Key Types**:

- Element nodes (div, span, etc.)
- Text nodes (`#text`)
- Signal nodes (`#signal`)
- Async nodes (`#async`)
- Stream nodes (`#stream`)
- Fragments

**Reference**: `.design/architecture/vnode-system.md`

### 3. Dual Rendering Targets

**What**: Same JSX, different renderers (DOM and Terminal)

**Why**:

- Code reuse across platforms
- Consistent API surface
- Platform-specific optimizations

**Targets**:

- **DOM** (`@semajsx/dom`): Browser rendering with real DOM APIs
- **Terminal** (`@semajsx/terminal`): CLI rendering with Yoga flexbox + ANSI

**Reference**: ADR-0003, `.design/architecture/rendering-pipeline.md`

### 4. Context System

**What**: Symbol-based context for passing data through component trees

**Why**:

- No global state pollution
- Type-safe with TypeScript
- Async-safe via function parameters
- Multiple contexts without nesting hell

**Key API**:

- `context<T>()` - Create typed Symbol
- `<Context provide={...}>` - Provide values
- `ctx.inject()` - Consume values

**Reference**: ADR-0005, `.design/architecture/context-system.md`

### 5. Island Architecture (SSR)

**What**: Partial hydration with server-rendered static content + client islands

**Why**:

- Minimal JavaScript shipped to client
- Interactive only where needed
- Progressive enhancement

**Key Concepts**:

- Static HTML from server
- Islands for interactivity
- Automatic island detection
- Props serialization

**Reference**: `.design/architecture/island-architecture.md`

### 6. Monorepo with Bun Workspaces

**What**: Multiple packages in single repository

**Why**:

- Shared tooling and configuration
- Atomic cross-package changes
- Simplified dependency management

**Structure**:

```
packages/
├── signal/          # Reactivity system
├── core/            # Runtime core
├── dom/             # DOM rendering
├── terminal/        # Terminal rendering
├── ssr/             # Server-side rendering
├── ssg/             # Static site generation
├── logger/          # Terminal logger
├── utils/           # Shared utilities
└── semajsx/         # Umbrella package
```

**Reference**: ADR-0001, `MONOREPO_ARCHITECTURE.md`

## Key Design Decisions

### Fine-Grained Reactivity Over VDOM

**Decision**: Use signals for direct updates instead of virtual DOM diffing

**Rationale**:

- More efficient: Only update what changed
- Simpler mental model: Data flow is explicit
- Better performance: No diffing overhead

**Trade-offs**:

- Requires signal awareness in component code
- Different from React/Vue patterns
- Learning curve for developers

**Reference**: ADR-0002

### Symbol-Based Context

**Decision**: Use typed Symbols for context keys instead of object-based providers

**Rationale**:

- Type-safe: Full TypeScript inference
- No collisions: Symbols are unique
- Explicit: No hidden defaults
- Extensible: `ComponentAPI` can grow

**Trade-offs**:

- Not serializable (intentional for type safety)
- Different from React Context API
- Requires `ctx` parameter in components

**Reference**: ADR-0005

### TypeScript Native (tsgo) as Default

**Decision**: Use tsgo for type checking, tsc for builds

**Rationale**:

- 7-10x faster type checking
- Faster CI/CD pipelines
- Better developer experience
- Stable builds with tsc

**Trade-offs**:

- Requires both compilers
- Potential discrepancies (rare)
- Newer technology (less mature)

**Reference**: ADR-0004

## Module Dependencies

```
semajsx (umbrella)
├── @semajsx/core
│   ├── @semajsx/signal
│   └── @semajsx/utils
├── @semajsx/dom
│   ├── @semajsx/core
│   ├── @semajsx/signal
│   └── @semajsx/utils
├── @semajsx/terminal
│   ├── @semajsx/core
│   ├── @semajsx/signal
│   └── @semajsx/utils
├── @semajsx/ssr
│   ├── @semajsx/dom
│   ├── @semajsx/core
│   ├── @semajsx/signal
│   └── @semajsx/logger
└── @semajsx/ssg
    ├── @semajsx/ssr
    ├── @semajsx/dom
    ├── @semajsx/core
    └── @semajsx/signal
```

**Principles**:

- `signal` and `utils` have zero internal dependencies
- `core` depends only on `signal` and `utils`
- Renderers depend on `core` (and transitively `signal`, `utils`)
- Higher-level features depend on appropriate renderers

## Rendering Flow

### DOM Rendering

```
JSX Syntax
    ↓
TypeScript Compiler (transforms JSX)
    ↓
h() Function Calls
    ↓
VNode Tree
    ↓
normalize() (handle signals, async, streams)
    ↓
createNode() (create DOM elements)
    ↓
mount() (attach to DOM)
    ↓
Signal subscriptions (auto-update on changes)
```

### Terminal Rendering

```
JSX Syntax
    ↓
h() Function Calls
    ↓
VNode Tree
    ↓
Yoga Layout Engine (compute positions)
    ↓
ANSI Output (colors, positioning)
    ↓
print() (one-time) or render() (reactive)
```

## Performance Characteristics

### Signal System

- **Subscription**: O(1) via Set
- **Notification**: O(n) where n = subscribers
- **Batching**: Microtask queue (native)

### Context Lookup

- **Injection**: O(1) via Map
- **Memory**: Cloned only when overridden

### DOM Rendering

- **Initial render**: O(n) where n = nodes
- **Updates**: O(m) where m = changed signals only
- **No VDOM diffing**: Zero diff overhead

## Technology Stack

| Layer                 | Technology                   |
| --------------------- | ---------------------------- |
| **Runtime**           | Bun (1.3.4)                  |
| **Language**          | TypeScript (5.9.3)           |
| **Type Checking**     | tsgo (TypeScript Native 7.0) |
| **Linting**           | oxlint (1.38.0)              |
| **Formatting**        | oxfmt (0.23.0)               |
| **Testing**           | Vitest (4.0.16) + Playwright |
| **Package Manager**   | Bun workspaces               |
| **Build**             | Bun (for bundling)           |
| **Git Hooks**         | Husky + lint-staged          |
| **Commit Convention** | Conventional Commits         |

## Design Philosophy

### 1. User Control

- Explicit over implicit
- No hidden magic
- Users control reactivity (pass signals or static values)
- Users control defaults (`ctx.inject() ?? default`)

### 2. Fine-Grained Reactivity

- Direct data → UI connections
- No VDOM overhead
- Precise updates

### 3. Platform Agnostic

- JSX works everywhere (DOM, Terminal, future: Mobile, Desktop)
- Shared runtime core
- Platform-specific renderers

### 4. Type Safety

- Full TypeScript coverage
- Strict mode enabled
- Inference over annotations

### 5. Developer Experience

- Fast tooling (Bun, oxlint, tsgo)
- Collocated tests
- Clear error messages
- Comprehensive documentation

### 6. Performance

- Zero overhead abstractions
- Minimal runtime
- Small bundle size
- Fast type checking and linting

## Innovation Points

### JSX-Powered Terminal Logger

- First logger with native JSX support
- Flexbox layouts in terminal
- Visual-first approach

**Reference**: `.design/features/logger-api-design.md`

### Dual Rendering Targets

- Same JSX, different platforms
- Terminal UI with Flexbox (like React Native for CLI)
- Unified component model

### Symbol-Based Context

- Type-safe, no collisions
- Multiple contexts in one provider
- Async-safe via parameters

**Reference**: `.design/architecture/context-system.md`

### SSG with Collections

- Type-safe content collections (Zod validation)
- Multiple data sources (files, git, remote, custom)
- Incremental builds with content hashing

**Reference**: `.design/features/ssg-collections.md`

## Comparison with Other Frameworks

### vs React

- ✅ No VDOM (faster updates)
- ✅ No hooks (simpler mental model)
- ✅ Direct signal subscriptions
- ❌ Smaller ecosystem
- ❌ Less tooling

### vs Solid

- ✅ Similar signal-based reactivity
- ✅ Terminal rendering support
- ✅ Simpler context API
- ❌ Less mature
- ❌ Smaller community

### vs Vue

- ✅ More explicit reactivity (no hidden magic)
- ✅ Type-safe context
- ✅ Dual rendering targets
- ❌ No template syntax
- ❌ Less tooling

**Reference**: `.design/comparisons/`

## Current Limitations

1. **DevTools**: No browser extension yet
2. **Ecosystem**: Limited third-party libraries
3. **SSR Streaming**: Not yet implemented
4. **Suspense**: Basic async support, needs refinement
5. **Testing Utils**: No official testing library yet
6. **Documentation Site**: Work in progress

**Reference**: `.tasks/backlog/` for planned improvements

## Getting Started (For Contributors)

### Essential Reading

1. [CLAUDE.md](../CLAUDE.md) - Development guide
2. [TESTING.md](../TESTING.md) - Testing strategy
3. [MONOREPO_ARCHITECTURE.md](../MONOREPO_ARCHITECTURE.md) - Monorepo structure
4. `.design/architecture/` - Architecture deep dives
5. `.design/decisions/` - ADRs for key decisions

### Understanding the Code

**Start here**:

1. `packages/signal/src/signal.ts` - Core reactivity
2. `packages/core/src/vnode.ts` - VNode system
3. `packages/core/src/h.ts` - JSX transformation
4. `packages/dom/src/render.ts` - DOM rendering
5. `packages/core/src/context.ts` - Context API

### Running Examples

```bash
# Signal examples
cd packages/signal && bun run example

# DOM rendering examples
cd packages/dom/examples/basic && bun run dev

# Terminal rendering examples
cd packages/terminal/examples/basic && bun run dev

# Logger examples
cd packages/logger && bun run example:showcase

# SSR examples
cd packages/ssr/examples/basic && bun run dev

# SSG examples
cd packages/ssg/examples/blog && bun run build
```

## Future Directions

### Near Term

- Complete missing package READMEs
- Write remaining ADRs
- Implement DevTools
- Expand tutorial series

### Medium Term

- Streaming SSR
- Suspense refinement
- Testing utilities
- Enhanced error messages

### Long Term

- Mobile rendering target (React Native-style)
- Desktop rendering target (Tauri/Electron)
- Visual editor/playground
- Plugin system

**Reference**: `.tasks/` for detailed planning

## Questions?

- **Architecture**: Read `.design/architecture/`
- **Decisions**: Check `.design/decisions/`
- **Features**: See `.design/features/`
- **Usage**: Refer to `docs/` and package READMEs

---

This is a living document. Update as architecture evolves.

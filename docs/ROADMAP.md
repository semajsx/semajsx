# SemaJSX Roadmap

**Vision**: SemaJSX is a **complete independent framework** with signal-based reactivity, supporting multiple rendering targets (DOM, Terminal, SSR, SSG)

**Current Focus**: Establish SemaJSX as the preferred **no-build component library runtime** (Stage 1)

**Last Updated**: 2026-02-20

**Execution Model**: This roadmap is designed for **AI Agent execution** - phases are organized by dependency order, not calendar timelines.

---

## Current Status

### Core Runtime - COMPLETE

| Package             | Status      | Tests          | Description                                                        |
| ------------------- | ----------- | -------------- | ------------------------------------------------------------------ |
| `@semajsx/signal`   | ✅ Complete | 33 passing     | Signal, computed, batch reactivity primitives                      |
| `@semajsx/core`     | ✅ Complete | 67 passing     | VNode, Fragment, Portal, Context, helpers (when, resource, stream) |
| `@semajsx/dom`      | ✅ Complete | 100+ (browser) | DOM rendering, JSX runtime, keyed reconciliation, portal, ref      |
| `@semajsx/terminal` | ✅ Complete | 73 passing     | Terminal rendering, Box/Text components, Yoga layout               |
| `@semajsx/utils`    | ✅ Complete | 20 passing     | Shared utilities and type guards                                   |
| `@semajsx/logger`   | ✅ Complete | 28 passing     | Logging utilities                                                  |

### Styling & Integration - COMPLETE

| Package             | Status      | Tests           | Description                                                       |
| ------------------- | ----------- | --------------- | ----------------------------------------------------------------- |
| `@semajsx/style`    | ✅ Complete | 6 files passing | classes(), rule(), rules(), CSS injection, signal-reactive styles |
| `@semajsx/tailwind` | ✅ Complete | 306 passing     | Tailwind-style utilities, tree-shakeable, tagged templates        |

### Server & Build - IMPLEMENTED (Needs Polish)

| Package        | Status         | Tests      | Description                                                    |
| -------------- | -------------- | ---------- | -------------------------------------------------------------- |
| `@semajsx/ssr` | ⚠️ Implemented | 76 passing | SSR rendering, island architecture, hydration, Vite builder    |
| `@semajsx/ssg` | ⚠️ Implemented | 7 passing  | SSG engine, MDX support, collections, multiple content sources |

### Not Started

| Feature                        | Priority | Description                                                       |
| ------------------------------ | -------- | ----------------------------------------------------------------- |
| Framework adapters (React/Vue) | Phase 2  | toReact(), fromReact(), toVue(), fromVue() bidirectional wrapping |
| Component library              | Phase 3  | 25+ production components (Button, Card, Modal, etc.)             |
| Advanced styling               | Phase 1  | Theme system, design tokens, animation utilities, responsive      |
| Documentation site             | Phase 3  | Interactive playground and API reference                          |

### Test Summary

- **Total**: 579 tests passing across 32 test files (non-browser)
- **DOM browser tests**: Require Playwright (chromium) for real browser API testing
- **All packages** have collocated tests (`*.test.ts` / `*.test.tsx` next to source)

---

## 🎯 Development Strategy

SemaJSX is a complete framework, but development is staged to ensure each capability is production-ready before expanding.

**Stage 1: No-Build Component Library Runtime** (Phase 1-3) - **Current Focus**

- Build-free styling system with Tailwind integration
- Cross-framework adapters (React/Vue bidirectional nesting)
- Production component library with SSR support
- **Goal**: Establish as preferred no-build component runtime

**Stage 2: Complete Framework Capabilities** (Phase 4-6) - **Future**

- Full SSR/SSG capabilities with routing
- Terminal rendering enhancements
- Build tooling and meta-framework integration
- **Goal**: Full-featured independent framework

**Stage 3: Production & Enterprise** (Phase 7-8) - **Future**

- Performance optimization and scalability
- Enterprise-grade tooling and support
- Ecosystem growth and adoption
- **Goal**: Production-grade framework with enterprise support

---

## 📅 Phase Overview

**Dependency-Based Execution**: Each phase builds on the previous. Start next phase only when current phase success metrics are met.

### Stage 1: No-Build Component Library Runtime

```
Phase 1: Style Foundation      - Core style system + Tailwind integration    [~80% done]
Phase 2: Framework Adapters    - React + Vue adapters with style integration [not started]
Phase 3: Component Library     - 25+ components + Basic SSR + Documentation  [not started]
```

### Stage 2: Complete Independent Framework

```
Phase 4: SSR/SSG Framework     - Full SSR + SSG + Style hydration + Islands
Phase 5: Routing & Integration - File-based routing + Next.js/Remix/Nuxt patterns
Phase 6: Terminal & Multi-Target - Enhanced Terminal rendering + Unified runtime
```

### Stage 3: Production & Enterprise

```
Phase 7: Performance & Tooling - Optimization + VSCode + CLI + Build tools
Phase 8: Enterprise & Ecosystem - Enterprise support + Community growth
```

---

## 🚀 Phase 1: Style Foundation

**Goal**: Complete style system with Tailwind integration

**Status**: Core style system and Tailwind integration complete. Advanced styling remaining.

### Dependency Chain

```
Core Style System (classes, rule, rules)         ✅ DONE
    ↓
    ├─→ Signal-Reactive Styles                   ✅ DONE
    │       ↓
    └─→ Tailwind Integration ──→ Advanced Styling
              ✅ DONE              ⬜ TODO
                                      ↓
                                  Documentation   ⬜ TODO
```

### Key Deliverables

**Core Style System** - ✅ COMPLETE

- **Package**: `@semajsx/style`
- Core API: `classes()`, `rule()`, `rules()` - implemented
- Style injection (DOM/Shadow DOM) - implemented
- Signal-reactive styles with CSS variables - implemented
- Memory management and cleanup - implemented
- Tests: 6 test files passing

**Tailwind Integration** - ✅ COMPLETE

- **Package**: `@semajsx/tailwind`
- Code generator for Tailwind utilities - implemented
- Arbitrary values support (tagged templates) - implemented
- Tree-shakeable flat tokens - implemented
- Tests: 306 tests passing across 8 files

**Advanced Styling** - ⬜ TODO

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Core Style System + Tailwind (both done)

Remaining:

- Theme system (CSS custom properties)
- Design tokens support
- Animation utilities (fade, slide, scale, keyframes)
- Responsive design utilities (breakpoints, media queries)

**Documentation** - ⬜ TODO

- **Complexity**: Low
- **Priority**: P1

Remaining:

- Style system API reference
- Tailwind integration guide
- Theme and animation examples
- Performance benchmarks

### Success Metrics

- ✅ All style APIs from RFC 006 implemented
- ✅ Tailwind integration complete and tested
- ⬜ Advanced styling features available
- ⬜ Runtime bundle ≤ 15KB (style system only)
- ✅ Test coverage ≥ 80%
- ⬜ Documentation complete

**Implementation Details**: See `/docs/implementation/001-style-system/` for detailed task breakdown and validation commands

---

## 🌟 Phase 2: Framework Adapters

**Goal**: React and Vue adapters with complete style integration

### Dependency Chain

```
Phase 1 Complete (Style System + Tailwind)
    ↓
    ├─→ React Adapter (parallel with Vue Adapter)
    │       ↓
    └─→ Vue Adapter ──→ Adapter Testing & Examples
```

### Key Deliverables

**React Adapter**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Phase 1 complete (Style System)

Deliverables:

- `toReact()` - Wrap SemaJSX components for React
- `fromReact()` - Wrap React components for SemaJSX
- Props/events mapping (className ↔ class)
- `@semajsx/style/react` - StyleAnchor, useStyle(), useSignal()

**Vue Adapter**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Phase 1 complete (can run parallel with React)

Deliverables:

- `toVue()` and `fromVue()` adapters
- Vue 3 Composition API integration
- `@semajsx/style/vue` - StyleAnchor, useStyle, useSignal composables
- Bidirectional nesting support

**Examples & Integration Tests**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: React + Vue adapters complete

Deliverables:

- Example apps using both adapters
- Bidirectional nesting examples (SemaJSX ↔ React ↔ Vue)
- Style integration examples (Tailwind + themes)
- Integration test suite

### Success Metrics

- ✅ React adapter supports bidirectional nesting
- ✅ Vue adapter quality matches React adapter
- ✅ Style integration works seamlessly in both frameworks
- ✅ Example apps demonstrate all adapter features
- ✅ Test coverage ≥ 85%

---

## 🎨 Phase 3: Component Library

**Goal**: Production component library + SSR + Documentation site

### Dependency Chain

```
Phase 2 Complete (Framework Adapters)
    ↓
    ├─→ Core Components (parallel with SSR)
    │       ↓
    └─→ SSR Support ──→ Documentation Site + Component Playground
```

### Key Deliverables

**Core Component Library**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 2 complete (Framework adapters)

Deliverables:

- 25+ production components:
  - Core: Button, Card, Input, Select, Modal
  - Navigation: Tabs, Breadcrumb, Pagination
  - Feedback: Toast, Alert, Progress, Spinner
  - Forms: Checkbox, Radio, Switch, Slider
  - Data Display: Badge, Avatar, Tooltip, Popover
  - Layout: Accordion, Drawer, Divider
- Full accessibility (ARIA, WCAG 2.1 AA)
- React and Vue wrappers for all components

**SSR Support**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 2 complete (can run parallel with Components)

Deliverables:

- `@semajsx/style/server` package
- Style collection and hydration
- SSR-safe component patterns
- Meta-framework integration (Next.js, Remix, Nuxt)

**Documentation Site & Playground**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Component Library + SSR complete

Deliverables:

- Documentation site (built with SemaJSX SSR)
- Interactive component playground
- Code examples for all components
- Deploy to production

### Success Metrics

- ✅ 25+ production components with full accessibility
- ✅ SSR works in Next.js/Nuxt/Remix
- ✅ Documentation site live with playground
- ✅ All components have React + Vue wrappers
- ✅ Test coverage ≥ 88%

---

## 🔥 Phase 4: SSR/SSG Framework

**Goal**: Full server-side rendering and static site generation capabilities

### Dependency Chain

```
Phase 3 Complete (Component Library + Basic SSR)
    ↓
    ├─→ Full SSR Implementation (parallel with SSG)
    │       ↓
    └─→ SSG & Static Export ──→ Islands Architecture
                                      ↓
                                  Hydration & Streaming
```

### Key Deliverables

**Full SSR Implementation**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 3 complete

Deliverables:

- Complete `@semajsx/ssr` package
- Streaming SSR support
- Automatic code splitting
- Server components pattern
- Edge runtime support

**SSG & Static Export**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Full SSR (can run parallel)

Deliverables:

- Static site generation engine
- Incremental static regeneration (ISR)
- Build-time rendering
- Static export CLI
- Pre-rendering optimization

**Islands Architecture**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: SSR + SSG complete

Deliverables:

- Island component pattern
- Selective hydration
- Partial hydration strategy
- Client-side navigation
- Progressive enhancement

### Success Metrics

- ✅ Full SSR with streaming support
- ✅ SSG with ISR capabilities
- ✅ Islands architecture implemented
- ✅ Hydration performance < 50ms
- ✅ Build time < 10s for 100 pages

---

## 🛣️ Phase 5: Routing & Meta-Framework Integration

**Goal**: File-based routing and meta-framework patterns

### Dependency Chain

```
Phase 4 Complete (SSR/SSG)
    ↓
    ├─→ File-Based Routing (parallel with Layouts)
    │       ↓
    └─→ Layouts & Middleware ──→ Meta-Framework Patterns
```

### Key Deliverables

**File-Based Routing**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Phase 4 complete

Deliverables:

- File-based routing system
- Dynamic routes ([id].tsx)
- Catch-all routes ([...slug].tsx)
- API routes support
- Nested routing

**Layouts & Middleware**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Routing system (can run parallel)

Deliverables:

- Layout system (nested layouts)
- Route middleware
- Loading states
- Error boundaries
- Not found pages

**Meta-Framework Patterns**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Routing + Layouts complete

Deliverables:

- Next.js patterns (App Router style)
- Remix patterns (loaders/actions)
- Nuxt patterns (composables)
- SvelteKit patterns (load functions)
- Migration guides

### Success Metrics

- ✅ File-based routing complete
- ✅ Nested layouts and middleware working
- ✅ Meta-framework patterns documented
- ✅ Migration tools available
- ✅ Performance matches Next.js/Remix

---

## 🖥️ Phase 6: Terminal & Multi-Target Rendering

**Goal**: Enhanced terminal rendering and unified multi-target runtime

### Dependency Chain

```
Phase 5 Complete (Routing)
    ↓
    ├─→ Terminal Enhancements (parallel with Unified Runtime)
    │       ↓
    └─→ Unified Runtime ──→ Custom Rendering Targets
```

### Key Deliverables

**Terminal Rendering Enhancements**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Phase 5 complete

Deliverables:

- Enhanced terminal components
- Interactive TUI patterns
- Terminal SSR support
- ANSI color optimization
- Terminal-specific hooks

**Unified Rendering Runtime**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 5 complete (can run parallel)

Deliverables:

- Unified render API (DOM, Terminal, Custom)
- Render target abstraction
- Target-specific optimizations
- Cross-target components
- Render target switching

**Custom Rendering Targets**

- **Complexity**: High
- **Priority**: P2
- **Dependencies**: Unified Runtime complete

Deliverables:

- Custom renderer API
- Canvas rendering target
- PDF rendering target
- Native rendering exploration
- Renderer plugin system

### Success Metrics

- ✅ Terminal rendering enhanced
- ✅ Unified runtime for all targets
- ✅ Custom renderer API available
- ✅ Performance matches target-specific frameworks
- ✅ Example renderers documented

---

## ⚡ Phase 7: Performance & Tooling

**Goal**: Production-grade performance and developer tooling

### Dependency Chain

```
Phase 6 Complete (Multi-Target Runtime)
    ↓
    ├─→ Performance Optimization (parallel with Tooling)
    │       ↓
    └─→ Developer Tooling ──→ Build System Integration
```

### Key Deliverables

**Performance Optimization**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 6 complete

Deliverables:

- Tree-shaking improvements
- Code splitting optimization
- Virtual scrolling
- Lazy loading strategies
- CSS injection batching
- Memory leak fixes
- **Target**: Bundle < 12KB, render < 5ms

**Developer Tooling**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Phase 6 complete (can run parallel)

Deliverables:

- VSCode extension (syntax, auto-complete)
- ESLint plugin (best practices)
- Prettier plugin (formatting)
- DevTools browser extension
- Debug tooling

**Build System Integration**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Performance + Tooling

Deliverables:

- Vite plugin (HMR, transforms)
- Webpack plugin
- Rollup plugin
- esbuild plugin
- CLI scaffolding tools

### Success Metrics

- ✅ Bundle < 12KB, render < 5ms
- ✅ Developer tooling complete
- ✅ Build tool plugins available
- ✅ Performance benchmarks published
- ✅ DevTools extension released

---

## 🏢 Phase 8: Enterprise & Ecosystem

**Goal**: Enterprise readiness and ecosystem growth

### Dependency Chain

```
Phase 7 Complete (Performance & Tooling)
    ↓
    ├─→ Enterprise Features (parallel with Ecosystem)
    │       ↓
    └─→ Ecosystem Growth ──→ Community & Adoption
```

### Key Deliverables

**Enterprise Features**

- **Complexity**: High
- **Priority**: P0
- **Dependencies**: Phase 7 complete

Deliverables:

- E2E test suite
- Visual regression testing
- Security audit (OWASP)
- LTS version planning
- SLA and support options
- Enterprise documentation

**Ecosystem Growth**

- **Complexity**: Medium
- **Priority**: P0
- **Dependencies**: Phase 7 complete (can run parallel)

Deliverables:

- Component library ecosystem
- Plugin marketplace
- Template gallery
- Starter kits
- Integration examples
- Third-party adapters

**Community & Adoption**

- **Complexity**: Medium
- **Priority**: P1
- **Dependencies**: Enterprise + Ecosystem

Deliverables:

- Community forum
- Discord server
- YouTube tutorials
- Conference talks
- Training materials
- Case studies

### Success Metrics

- ✅ First enterprise customer
- ✅ 10+ third-party component libraries
- ✅ 1000+ GitHub stars
- ✅ 5000+ weekly downloads
- ✅ 100+ production applications

---

## 📊 Key Metrics

### Stage 1: No-Build Component Library Runtime

| Metric            | Phase 1 | Phase 2     | Phase 3     |
| ----------------- | ------- | ----------- | ----------- |
| Bundle Size       | ≤15KB   | ≤20KB       | ≤18KB       |
| Component Count   | 0       | 0           | 25+         |
| Framework Support | None    | React + Vue | React + Vue |
| Test Coverage     | ≥80%    | ≥85%        | ≥88%        |
| GitHub Stars      | 50+     | 200+        | 500+        |
| Weekly Downloads  | 20+     | 100+        | 500+        |

### Stage 2: Complete Independent Framework

| Metric            | Phase 4   | Phase 5    | Phase 6  |
| ----------------- | --------- | ---------- | -------- |
| Rendering Targets | DOM + SSR | DOM + SSR  | All      |
| Routing           | None      | File-based | Advanced |
| SSG Support       | ✅        | ✅         | ✅       |
| Terminal Support  | Basic     | Basic      | Enhanced |
| Test Coverage     | ≥88%      | ≥88%       | ≥90%     |
| GitHub Stars      | 700+      | 1000+      | 1500+    |
| Weekly Downloads  | 1000+     | 2000+      | 3000+    |

### Stage 3: Production & Enterprise

| Metric              | Phase 7 | Phase 8 |
| ------------------- | ------- | ------- |
| Bundle Size         | ≤12KB   | ≤10KB   |
| Build Performance   | Fast    | Optimal |
| DevTools            | ✅      | ✅      |
| Enterprise Support  | Basic   | Full    |
| Test Coverage       | ≥90%    | ≥95%    |
| GitHub Stars        | 2000+   | 5000+   |
| Weekly Downloads    | 5000+   | 10000+  |
| Component Libraries | 5+      | 10+     |
| Production Apps     | 100+    | 500+    |

---

## 🎯 Phase Completion Checkpoints

**Progression Model**: Complete all success metrics for current phase before starting next phase.

### Stage 1: No-Build Component Library Runtime

**Phase 1 → 2**: Style system + Tailwind complete, bundle ≤15KB

**Phase 2 → 3**: React + Vue adapters complete, style integration working

**Phase 3 → Stage 2**: 25+ components, basic SSR working, documentation live

### Stage 2: Complete Independent Framework

**Phase 4 → 5**: Full SSR + SSG + Islands, hydration < 50ms

**Phase 5 → 6**: File-based routing + layouts + meta-framework patterns

**Phase 6 → Stage 3**: Multi-target rendering working (DOM + Terminal + Custom)

### Stage 3: Production & Enterprise

**Phase 7 → 8**: Bundle < 12KB, performance optimized, tooling complete

**Phase 8 → v1.0**: Enterprise features + ecosystem + first customer

---

## 🎯 Unique Value Proposition

> **"SemaJSX is a complete independent framework with signal-based reactivity, supporting multiple rendering targets (DOM, Terminal, SSR, SSG). Current focus: establishing as the preferred no-build component library runtime with build-free styling and cross-framework compatibility."**

### Competitive Advantages

**vs Component Libraries**

- Not just a component library - full framework capabilities
- No build required for component development
- Cross-framework compatibility (React, Vue, standalone)

**vs Full Frameworks (Next.js, Remix, Nuxt)**

- Lighter weight and faster (signal-based, no VDOM)
- Multi-target rendering (DOM, Terminal, Custom)
- Build-free development mode
- Framework-agnostic core

**vs Web Components**

- Better DX with JSX and signals
- Lighter weight and faster hydration
- No Shadow DOM limitations

**vs Terminal Frameworks (Ink, Blessed)**

- Unified codebase for web and terminal
- Signal-based reactivity
- SSR/SSG support for terminal apps

| Feature           | SemaJSX | Next.js | Remix | Astro | Lit | Ink   |
| ----------------- | ------- | ------- | ----- | ----- | --- | ----- |
| Signals           | ✅      | ❌      | ❌    | ✅    | ❌  | ❌    |
| No Build (Dev)    | ✅      | ❌      | ❌    | ❌    | ✅  | ❌    |
| SSR/SSG           | ✅      | ✅      | ✅    | ✅    | ❌  | ❌    |
| Terminal UI       | ✅      | ❌      | ❌    | ❌    | ❌  | ✅    |
| Islands           | ✅      | Partial | ❌    | ✅    | ❌  | ❌    |
| Cross-Framework   | ✅      | ❌      | ❌    | ✅    | ✅  | ❌    |
| File-based Router | ✅      | ✅      | ✅    | ✅    | ❌  | ❌    |
| Bundle Size       | 12KB    | 90KB+   | 70KB+ | 40KB+ | 8KB | 50KB+ |

---

## 📚 Reference Documentation

- **RFC 006**: Style System Design - `/docs/rfcs/006-style-system.md`
- **RFC 007**: Component Library Runtime Vision - `/docs/rfcs/007-component-library-runtime.md`
- **RFC 008**: Cross-Framework Integration - `/docs/rfcs/008-cross-framework-integration.md`
- **Implementation Tracking**: `/docs/implementation/` - Detailed plans, progress, and decisions

---

## 📖 How to Use This Roadmap

This roadmap provides **high-level strategic direction** for the SemaJSX project.

**For AI Agents**:

- **Current focus**: Stage 1 (No-Build Component Library Runtime)
- Execute Phase 1-3 sequentially before considering Stage 2
- Each phase contains multiple phases - complete in dependency order
- Follow **dependency chains** within each phase
- Use **complexity ratings** (High/Medium/Low) to guide execution strategy
- Achieve **success metrics** before moving to next phase

**For Implementation Details**:

- **Active**: Stage 1 (Phase 1-3) - See `/docs/implementation/001-style-system/` and future directories
- **Future**: Stage 2 (Phase 4-6) - Create implementation directories when Stage 1 complete
- **Future**: Stage 3 (Phase 7-8) - Create implementation directories when Stage 2 complete
- Validation commands: See `plan.md` in each implementation directory
- Progress tracking: `progress.md` files (session-based)
- Technical decisions: `decisions.md` files (append-only)

**Current Focus**: Stage 1 - Phase 1 remaining items (Advanced Styling, Documentation), then Phase 2 (Framework Adapters)

**Note**: Stage 2-3 planning is for long-term vision. Current development focuses exclusively on Stage 1.

# SemaJSX Monorepo Architecture

## Overview

This document describes the monorepo structure for SemaJSX, a signal-based reactive JSX runtime. The project uses a monorepo architecture powered by PNPM workspaces for efficient build orchestration.

## Directory Structure

```
semajsx/
├── apps/
│   └── docs/                        # Documentation site
│       ├── package.json
│       ├── src/
│       └── tsconfig.json
│
├── packages/
│   ├── semajsx/                     # Main package (umbrella package)
│   │   ├── package.json             # name: "semajsx"
│   │   ├── src/
│   │   │   ├── index.ts             # Re-exports from all packages
│   │   │   ├── jsx-runtime.ts
│   │   │   └── jsx-dev-runtime.ts
│   │   ├── tests/                   # Integration tests
│   │   ├── examples/                # Examples using semajsx
│   │   └── tsconfig.json
│   │
│   ├── core/                        # Runtime core (VNode, helpers)
│   │   ├── package.json             # name: "@semajsx/core"
│   │   ├── src/
│   │   │   ├── vnode.ts
│   │   │   ├── helpers.ts
│   │   │   ├── context.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for core
│   │   └── tsconfig.json
│   │
│   ├── signal/                      # Signal reactivity system
│   │   ├── package.json             # name: "@semajsx/signal"
│   │   ├── src/
│   │   │   ├── signal.ts
│   │   │   ├── computed.ts
│   │   │   ├── batch.ts
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for signal
│   │   └── tsconfig.json
│   │
│   ├── dom/                         # DOM rendering
│   │   ├── package.json             # name: "@semajsx/dom"
│   │   ├── src/
│   │   │   ├── operations.ts
│   │   │   ├── properties.ts
│   │   │   ├── render.ts
│   │   │   ├── jsx-runtime.ts
│   │   │   ├── jsx-dev-runtime.ts
│   │   │   ├── ref.ts
│   │   │   ├── portal.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for DOM
│   │   ├── examples/                # DOM-specific examples
│   │   └── tsconfig.json
│   │
│   ├── terminal/                    # Terminal rendering
│   │   ├── package.json             # name: "@semajsx/terminal"
│   │   ├── src/
│   │   │   ├── operations.ts
│   │   │   ├── properties.ts
│   │   │   ├── render.ts
│   │   │   ├── renderer.ts
│   │   │   ├── jsx-runtime.ts
│   │   │   ├── jsx-dev-runtime.ts
│   │   │   ├── components/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for terminal
│   │   ├── examples/                # Terminal-specific examples
│   │   └── tsconfig.json
│   │
│   ├── server/                      # SSR and Island architecture
│   │   ├── package.json             # name: "@semajsx/ssr"
│   │   ├── src/
│   │   │   ├── island.ts
│   │   │   ├── island-noop.ts
│   │   │   ├── render.ts
│   │   │   ├── collector.ts
│   │   │   ├── vite-builder.ts
│   │   │   ├── vite-router.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for server
│   │   ├── examples/                # SSR examples
│   │   └── tsconfig.json
│   │
│   ├── logger/                      # Logging utility
│   │   ├── package.json             # name: "@semajsx/logger"
│   │   ├── src/
│   │   │   ├── logger.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for logger
│   │   ├── examples/                # Logger examples
│   │   └── tsconfig.json
│   │
│   ├── utils/                       # Shared utilities
│   │   ├── package.json             # name: "@semajsx/utils"
│   │   ├── src/
│   │   │   ├── array.ts
│   │   │   ├── object.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tests/                   # Unit tests for utils
│   │   └── tsconfig.json
│   │
│   └── configs/                     # Shared TypeScript configurations (internal)
│       ├── package.json             # name: "@semajsx/configs", private: true
│       ├── tsconfig.base.json       # Base TypeScript config
│       ├── tsconfig.lib.json        # Library package config
│       ├── tsconfig.app.json        # Application config
│       └── README.md
│
├── .github/                         # GitHub workflows and configs
├── .husky/                          # Git hooks
├── scripts/                         # Build and utility scripts
│
├── package.json                     # Root package.json with workspaces
├── pnpm-workspace.yaml                       # PNPM workspaces configuration
├── pnpm-workspace.yaml              # PNPM workspace configuration
├── tsconfig.json                    # Root TypeScript config
├── .prettierrc                      # Prettier configuration
├── .prettierignore                  # Prettier ignore patterns
├── oxlint.json                      # OxLint configuration
├── .lintstagedrc.json              # Lint-staged configuration
├── commitlint.config.js            # Commitlint configuration
└── README.md                        # Root README
```

## Package Dependencies

### Dependency Graph

```
semajsx (main package)
├── @semajsx/core
│   ├── @semajsx/signal
│   └── @semajsx/utils
├── @semajsx/signal
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
│   ├── @semajsx/core
│   ├── @semajsx/signal
│   ├── @semajsx/dom
│   └── @semajsx/utils
└── @semajsx/logger
    └── @semajsx/utils

Internal:
└── @semajsx/configs (used by all packages via tsconfig extends)
```

### Package Details

#### `semajsx` (Main Package)

- **Description**: Umbrella package that re-exports all sub-packages
- **Exports**: All features from signal, dom, terminal, server, client
- **Purpose**: Single entry point for users who want all features
- **Type**: Published package

#### `@semajsx/core`

- **Description**: Runtime core with VNode and helpers
- **Exports**: `vnode`, `helpers`, `context`, types
- **Dependencies**: `@semajsx/signal`, `@semajsx/utils`
- **Type**: Published package

#### `@semajsx/signal`

- **Description**: Signal reactivity system
- **Exports**: `signal`, `computed`, `batch`, `effect`, utility functions
- **Dependencies**: `@semajsx/utils`
- **Type**: Published package

#### `@semajsx/dom`

- **Description**: DOM rendering engine
- **Exports**: `render`, `jsx-runtime`, DOM utilities
- **Dependencies**: `@semajsx/core`, `@semajsx/signal`, `@semajsx/utils`
- **Type**: Published package

#### `@semajsx/terminal`

- **Description**: Terminal rendering with Ink-like API
- **Exports**: `render`, `jsx-runtime`, terminal components
- **Dependencies**: `@semajsx/core`, `@semajsx/signal`, `@semajsx/utils`, `yoga-layout-prebuilt`, `chalk`, etc.
- **Type**: Published package

#### `@semajsx/ssr`

- **Description**: SSR and Island architecture
- **Exports**: `island`, `renderToString`, `createViteRouter`
- **Dependencies**: `@semajsx/core`, `@semajsx/signal`, `@semajsx/dom`, `@semajsx/utils`, `vite`
- **Type**: Published package

#### `@semajsx/logger`

- **Description**: Logging utility for terminal and server
- **Exports**: `createLogger`, logger instances
- **Dependencies**: `@semajsx/utils`, `chalk`
- **Type**: Published package

#### `@semajsx/utils`

- **Description**: Shared utility functions
- **Exports**: Common utilities used across packages
- **Dependencies**: None (base package)
- **Type**: Published package

#### `@semajsx/configs`

- **Description**: Shared TypeScript configurations
- **Exports**: TypeScript config files
- **Purpose**: DRY configuration management
- **Type**: Internal package (not published)

## Migration Strategy

### Phase 1: Foundation (Current)

1. **Setup root monorepo configuration**
   - Create `pnpm-workspace.yaml`
   - Create `pnpm-workspace.yaml`
   - Update root `package.json` with workspace configuration
   - Move lint/prettier configs to root

2. **Create `packages/configs`**
   - Create shared TypeScript configurations
   - `tsconfig.base.json` - Base config
   - `tsconfig.lib.json` - Library packages
   - `tsconfig.app.json` - Application packages

3. **Move existing code to `packages/semajsx`**
   - Copy entire current `src/` to `packages/semajsx/src/`
   - Copy `tests/` to `packages/semajsx/tests/`
   - Copy `examples/` to `packages/semajsx/examples/`
   - Update `package.json` to use `@semajsx/configs`

4. **Create `apps/docs` structure**
   - Basic directory and package.json
   - Placeholder for future documentation site

### Phase 2: Package Extraction (Future)

Each package will be extracted one by one:

1. **Extract `@semajsx/signal`**
   - Move `src/signal/` to `packages/signal/src/`
   - Move related tests
   - Update imports in `packages/semajsx`

2. **Extract `@semajsx/utils`**
   - Move shared utilities
   - Update imports

3. **Extract `@semajsx/core`**
   - Move `src/runtime/` to `packages/core/src/`
   - Move related tests
   - Update imports

4. **Extract `@semajsx/dom`**
   - Move `src/dom/` to `packages/dom/src/`
   - Move DOM tests and examples
   - Update imports

5. **Extract `@semajsx/terminal`**
   - Move `src/terminal/` to `packages/terminal/src/`
   - Move terminal tests and examples
   - Update imports

6. **Extract `@semajsx/ssr`**
   - Move `src/server/` and `src/client/` to `packages/ssr/src/`
   - Move SSR tests and examples
   - Update imports

7. **Extract `@semajsx/logger`**
   - Move logger code
   - Move logger tests and examples
   - Update imports

8. **Update main `semajsx` package**
   - Convert to umbrella package
   - Re-export all sub-packages
   - Keep integration tests

## Tooling

### Build System

- **PNPM workspaces**: Orchestrates builds across packages
- **tsdown**: TypeScript compilation for library packages
- **Vite**: Build tool for examples and apps

### Package Manager

- **Choice**: PNPM (recommended) or Bun workspaces
- **Reason**: Efficient disk usage, fast installs, workspace support

### Testing

- **Vitest**: Test runner for all packages
- **Coverage**: Each package has its own coverage
- **Integration tests**: In main `semajsx` package

### Linting & Formatting

- **oxlint**: Fast Rust-based linter (root level)
- **Prettier**: Code formatting (root level)
- **lint-staged**: Pre-commit hooks (root level)

## Scripts Organization

### Root Level

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test",
    "lint": "oxlint packages apps",
    "lint:fix": "oxlint --fix packages apps",
    "format": "prettier --write .",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules"
  }
}
```

### Package Level

Each package has:

```json
{
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

## Benefits

1. **Clear Separation**: Each package has a single responsibility
2. **Independent Versioning**: Packages can be versioned independently
3. **Better Tree-Shaking**: Users can import only what they need
4. **Faster Builds**: PNPM workspaces caches and parallelizes builds
5. **Easier Testing**: Each package has focused tests
6. **Better DX**: Clear boundaries and dependencies

## Publishing Strategy

### NPM Packages

All packages except `@semajsx/configs` will be published to npm:

- `semajsx` - Main package (depends on all sub-packages)
- `@semajsx/core` - Can be used standalone
- `@semajsx/signal` - Can be used standalone
- `@semajsx/dom` - Can be used standalone
- `@semajsx/terminal` - Can be used standalone
- `@semajsx/ssr` - Requires dom package
- `@semajsx/logger` - Can be used standalone
- `@semajsx/utils` - Can be used standalone

### Versioning

- **Synchronized versioning**: All packages share the same version (easier)
- **Independent versioning**: Each package has its own version (more flexible)

Recommendation: Start with synchronized versioning, move to independent later if needed.

## Future Enhancements

1. **apps/docs**: Documentation site with examples
2. **apps/playground**: Interactive playground for trying SemaJSX
3. **packages/devtools**: Browser devtools extension
4. **packages/testing**: Testing utilities for SemaJSX apps
5. **Changesets**: Automated changelog and version management

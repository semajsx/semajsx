# JSR (JavaScript Registry) Support

This document explains how to publish SemaJSX packages to JSR (JavaScript Registry).

## Overview

SemaJSX packages are now configured for publishing to JSR, a modern JavaScript package registry that supports TypeScript natively and provides excellent developer experience.

## Package Configuration

Each package has been configured with a `jsr.json` file that defines:

- Package metadata (name, version, description)
- Export mappings pointing to TypeScript source files
- Exclude patterns for build artifacts and test files
- Dependencies between packages (for @semajsx/web)

### Package Structure

- **@semajsx/core**: Core runtime and reactivity system
- **@semajsx/signal**: Reactive signal system  
- **@semajsx/web**: Web/DOM rendering strategies (depends on @semajsx/core)

## Publishing to JSR

### Prerequisites

1. Install the JSR CLI:
   ```bash
   npm install -g jsr
   ```

2. Authenticate with JSR:
   ```bash
   jsr auth
   ```

### Publishing Commands

#### Dry Run (Validate Configuration)
```bash
# Test all packages
bun run jsr:dry-run

# Test individual packages
bun run jsr:dry-run:signal
bun run jsr:dry-run:core
bun run jsr:dry-run:web
```

#### Publish to JSR
```bash
# Publish all packages (in dependency order)
bun run jsr:publish

# Publish individual packages
bun run jsr:publish:signal  # First (no dependencies)
bun run jsr:publish:core    # Second (no dependencies)
bun run jsr:publish:web     # Third (depends on core)
```

### Publishing Order

Due to package dependencies, publish in this order:
1. `@semajsx/signal` (no dependencies)
2. `@semajsx/core` (no dependencies)
3. `@semajsx/web` (depends on @semajsx/core)

The `jsr:publish:all` script automatically handles this ordering.

## JSR Benefits

- **Native TypeScript Support**: No compilation needed, JSR handles TypeScript directly
- **Better Documentation**: Automatic API documentation generation from TypeScript
- **Faster Installation**: Optimized for modern JavaScript runtimes
- **Tree Shaking**: Better support for dead code elimination
- **Import Maps**: Native support for import mapping

## Usage After Publishing

Once published to JSR, users can import the packages using:

```typescript
import { createRenderer, h } from "jsr:@semajsx/core";
import { render } from "jsr:@semajsx/web";
import { signal } from "jsr:@semajsx/signal";
```

Or with import maps in `deno.json`:

```json
{
  "imports": {
    "@semajsx/core": "jsr:@semajsx/core@^0.0.1",
    "@semajsx/web": "jsr:@semajsx/web@^0.0.1",
    "@semajsx/signal": "jsr:@semajsx/signal@^0.0.1"
  }
}
```

## Configuration Files

### jsr.json Structure

Each package's `jsr.json` contains:

```json
{
  "name": "@semajsx/package-name",
  "version": "0.0.1",
  "description": "Package description",
  "license": "MIT",
  "exports": {
    ".": "./src/index.ts",
    // Additional exports...
  },
  "imports": {
    // Dependencies (if any)
  },
  "publish": {
    "exclude": [
      "dist",
      "tsdown.config.ts",
      "**/*.test.ts",
      "**/*.test.tsx"
    ]
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication**: Make sure you're logged in with `jsr auth`
2. **Dependencies**: Ensure @semajsx/core is published before @semajsx/web
3. **TypeScript Errors**: JSR validates TypeScript, fix any type errors first
4. **Export Paths**: Ensure all exports in jsr.json point to valid TypeScript files

### Validation

Always run dry-run before publishing:
```bash
bun run jsr:dry-run
```

This will validate your configuration without actually publishing.
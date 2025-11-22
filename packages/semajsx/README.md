# semajsx

A signal-based reactive JSX runtime for building modern web applications.

This is the main package that contains all SemaJSX features. In the future, this will become an umbrella package that re-exports all sub-packages.

## Current Status

This package currently contains the entire SemaJSX codebase. It will be gradually split into smaller packages:

- `@semajsx/signal` - Signal reactivity system
- `@semajsx/core` - Runtime core (VNode, helpers)
- `@semajsx/dom` - DOM rendering
- `@semajsx/terminal` - Terminal rendering
- `@semajsx/ssr` - SSR and Island architecture
- `@semajsx/logger` - Logging utilities
- `@semajsx/utils` - Shared utilities

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## Examples

Examples are located in the `examples/` directory.

See the [main README](../../README.md) for more information.

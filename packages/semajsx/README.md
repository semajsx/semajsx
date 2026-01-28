# semajsx

A signal-based reactive JSX runtime for building modern web applications.

This is the main umbrella package that re-exports all SemaJSX sub-packages.

## Included Packages

- `@semajsx/signal` - Signal reactivity system
- `@semajsx/core` - Runtime core (VNode, helpers)
- `@semajsx/dom` - DOM rendering
- `@semajsx/terminal` - Terminal rendering
- `@semajsx/ssr` - SSR and Island architecture
- `@semajsx/ssg` - Static site generation
- `@semajsx/style` - Modular styling system
- `@semajsx/logger` - Logging utilities
- `@semajsx/utils` - Shared utilities

## Development

```bash
# Build
bun run build

# Watch mode
bun run dev

# Run tests
bun run test

# Type checking
bun run typecheck
```

## Examples

Examples are located in the `examples/` directory.

See the [main README](../../README.md) for more information.

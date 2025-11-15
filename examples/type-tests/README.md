# Type Tests

This directory contains TypeScript type checking tests for SemaJSX.

## Files

- `type-test.dom.tsx` - Type tests for DOM rendering APIs
- `type-test.cli.tsx` - Type tests for Terminal rendering APIs

## Purpose

These files verify that:

- JSX types work correctly with TypeScript
- Component props are properly typed
- Signal types integrate correctly with rendering
- DOM and Terminal APIs have correct type signatures

## Running Type Tests

Type tests are verified during the type checking process:

```bash
# Check types for all rendering targets
bun run typecheck

# Or check manually
tsc --noEmit -p tsconfig.dom.json
tsc --noEmit -p tsconfig.cli.json
```

## What Are Type Tests?

Type tests are TypeScript files that verify compile-time type safety. They:

- Should compile without errors when types are correct
- Use TypeScript's type system to catch API misuse
- Document expected type behavior
- Serve as examples of proper API usage

Unlike runtime tests, type tests only verify that the TypeScript compiler accepts the code.

# semajsx

This is a placeholder project for the semajsx namespace on npm.

The repository is maintained at [github.com/semajsx/core](https://github.com/semajsx/core).

## About

This package is currently a placeholder to reserve the npm package name. Future updates may include actual functionality.

## Current Functionality

The package currently provides minimal utility functions:

```typescript
import { greet, get, delay } from "semajsx";

// Simple greeting
const greeting = greet("World"); // "Hello, World!"

// Safe property access
const user = { name: "John", profile: { age: 30 } };
const age = get(user.profile, "age"); // 30

// Delay execution
await delay(1000); // waits for 1 second
```

## Installation

```bash
# Using npm
npm install semajsx

# Using yarn
yarn add semajsx

# Using bun
bun add semajsx
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build
```

## License

MIT

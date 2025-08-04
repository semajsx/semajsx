# SemaJSX

A signal-based reactive UI framework built for modern JavaScript runtimes, featuring a platform-agnostic core with optimized web rendering strategies.

## Features

- 🚀 **Signal-based reactivity** - Direct signal-to-DOM binding without virtual DOM overhead
- 🔧 **Platform-agnostic core** - Extensible rendering strategies for multiple platforms
- ⚡ **High performance** - Batched updates, element pooling, and smart optimizations
- 📦 **Modular architecture** - Use only what you need with separate packages
- 🎯 **TypeScript-first** - Full type safety with excellent developer experience
- 🌐 **Modern tooling** - Published to both NPM and JSR

## Packages

- **[@semajsx/core](packages/core)** - Core runtime and reactivity system
- **[@semajsx/web](packages/web)** - Web/DOM rendering strategies and browser optimizations  
- **[@semajsx/signal](packages/signal)** - Reactive signal system for state management

## Installation

### From NPM
```bash
# Core framework
npm install @semajsx/core @semajsx/web

# Signal system (optional)
npm install @semajsx/signal
```

### From JSR
```typescript
// Using JSR imports
import { h, createRenderer } from "jsr:@semajsx/core";
import { render } from "jsr:@semajsx/web";
import { signal } from "jsr:@semajsx/signal";
```

## Quick Start

```typescript
import { h } from "@semajsx/core";
import { render, signal } from "@semajsx/web";

// Create a reactive signal
const count = signal(0);

// Define a component
function Counter() {
  return h("div", {}, [
    h("p", {}, `Count: ${count}`),
    h("button", { 
      onClick: () => count.value++ 
    }, "Increment")
  ]);
}

// Render to DOM
render(Counter, document.getElementById("app")!);
```

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run tests
bun run test

# Type checking
bun run typecheck

# Development mode (watch)
cd packages/core && bun run dev
cd packages/web && bun run dev
cd packages/signal && bun run dev
```

## Publishing

### NPM Publishing
```bash
# Build and publish to NPM
bun run build
cd packages/core && npm publish
cd packages/web && npm publish
cd packages/signal && npm publish
```

### JSR Publishing
```bash
# Validate configuration
bun run jsr:dry-run

# Publish to JSR (all packages)
bun run jsr:publish
```

See [JSR.md](JSR.md) for detailed JSR publishing instructions.

## Architecture

SemaJSX uses a modern architecture focused on performance and developer experience:

- **Signal-based reactivity**: Changes propagate directly to DOM without virtual DOM diffing
- **Platform-agnostic core**: Rendering strategies can be swapped for different platforms
- **Plugin system**: Extensible architecture for adding functionality
- **TypeScript-first**: Built with TypeScript for excellent type safety and IntelliSense

For detailed architecture documentation, see the individual package README files.

## License

MIT

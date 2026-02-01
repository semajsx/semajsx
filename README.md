# SemaJSX

A lightweight, signal-based reactive JSX runtime for building modern web applications with fine-grained reactivity.

## Features

- 🎯 **Signal-based Reactivity** - Fine-grained reactive updates without virtual DOM diffing
- ⚡ **Lightweight** - Minimal runtime overhead with direct signal-to-DOM bindings
- 🔥 **JSX Support** - Use familiar JSX syntax with TypeScript
- 📦 **Single Package** - Simple installation, no complex dependencies
- 🎨 **TypeScript-first** - Built with TypeScript for excellent type safety
- 🚀 **Modern Tooling** - Works seamlessly with Vite, esbuild, and other modern bundlers

## Installation

```bash
# Using Bun (recommended)
bun add semajsx

# Using npm
npm install semajsx

# Using pnpm
pnpm add semajsx
```

## Quick Start

### 1. Configure TypeScript

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "semajsx"
  }
}
```

### 2. Write Your First Component

```tsx
import { render, signal, computed } from "semajsx";

function Counter() {
  const count = signal(0);
  // Computed requires explicit dependency array
  const doubled = computed([count], (c) => c * 2);

  return (
    <div>
      <h1>Count: {count}</h1>
      <p>Doubled: {doubled}</p>
      <button onclick={() => count.value++}>Increment</button>
    </div>
  );
}

render(<Counter />, document.getElementById("root")!);
```

## Core Concepts

### Signals

Signals are reactive primitives that automatically track dependencies and trigger updates.

```tsx
import { signal, computed } from "semajsx";

// Create a signal
const count = signal(0);

// Read the value
console.log(count.value); // 0

// Update the value
count.value++;

// Create computed signals with explicit dependencies
const doubled = computed([count], (c) => c * 2);

// Subscribe to changes
count.subscribe((value) => {
  console.log("Count changed:", value);
});
```

### Components

Components are just functions that return JSX.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

function App() {
  return <Greeting name="World" />;
}
```

### Reactive Props

Pass signals directly as props for automatic updates:

```tsx
function DisplayCount({ count }: { count: Signal<number> }) {
  return <div>Count: {count}</div>;
}

function App() {
  const count = signal(0);

  return (
    <div>
      <DisplayCount count={count} />
      <button onclick={() => count.value++}>Increment</button>
    </div>
  );
}
```

### Conditional Rendering

Use computed signals for conditional rendering:

```tsx
function App() {
  const show = signal(true);
  const content = computed([show], (s) => (s ? <p>Visible</p> : <p>Hidden</p>));

  return (
    <div>
      {content}
      <button onclick={() => (show.value = !show.value)}>Toggle</button>
    </div>
  );
}
```

## API Reference

### Signal API

```typescript
// Create a writable signal
const count = signal(0);

// Read value (with tracking)
count.value;

// Update value
count.value = 10;
count.set(10);
count.update((prev) => prev + 1);

// Read value
console.log(count.value); // 11

// Subscribe to changes
const unsubscribe = count.subscribe((value) => {
  console.log("New value:", value);
});
```

### Computed Signals

```typescript
const count = signal(0);
// Computed requires explicit dependency array
const doubled = computed([count], (c) => c * 2);

// Computed values are read-only
console.log(doubled.value); // 0
```

### Subscriptions

```typescript
const count = signal(0);

// Subscribe to changes
const unsubscribe = count.subscribe((value) => {
  console.log("Count is:", value);
});

// Subscription with cleanup
const unsubscribe2 = count.subscribe((value) => {
  const timer = setInterval(() => {
    console.log("Current:", value);
  }, 1000);

  // Return cleanup function
  return () => clearInterval(timer);
});

// Clean up when done
unsubscribe();
unsubscribe2();
```

### Batching Updates

```typescript
import { batch } from "semajsx";

const a = signal(1);
const b = signal(2);

// Run multiple updates without triggering effects multiple times
batch(() => {
  a.value = 10;
  b.value = 20;
});
```

### Utilities

```typescript
import { isSignal, unwrap } from "semajsx";

// Check if value is a signal
if (isSignal(value)) {
  console.log(value.value);
}

// Get value from signal or plain value
// Works with both signals and plain values
const plainValue = unwrap(maybeSignal);
```

## Project Structure

```
semajsx/
├── src/
│   ├── signal/               # Signal reactivity system
│   │   ├── signal.ts         # Core signal implementation
│   │   ├── computed.ts       # Computed signals
│   │   ├── batch.ts          # Batching utilities
│   │   ├── utils.ts          # Signal utilities (isSignal, unwrap)
│   │   └── types.ts          # Type definitions
│   │
│   ├── runtime/              # Core runtime (platform-agnostic)
│   │   ├── vnode.ts          # VNode creation and normalization
│   │   ├── helpers.ts        # Runtime helpers (when, resource, stream)
│   │   └── types.ts          # Type definitions
│   │
│   ├── dom/                  # DOM rendering (browser)
│   │   ├── render.ts         # DOM rendering engine
│   │   ├── operations.ts     # DOM manipulation
│   │   ├── properties.ts     # Property handling with signals
│   │   ├── jsx-runtime.ts    # JSX runtime (production)
│   │   └── jsx-dev-runtime.ts # JSX runtime (development)
│   │
│   ├── terminal/             # Terminal rendering (CLI apps)
│   │   ├── render.ts         # Terminal rendering engine
│   │   ├── renderer.ts       # Layout engine with Yoga
│   │   ├── operations.ts     # Terminal operations
│   │   ├── properties.ts     # Property handling
│   │   ├── components/       # Built-in components (Box, Text)
│   │   ├── utils/            # Terminal utilities (colors, ANSI)
│   │   ├── jsx-runtime.ts    # Terminal JSX runtime (production)
│   │   └── jsx-dev-runtime.ts # Terminal JSX runtime (development)
│   │
│   ├── jsx-runtime.ts        # Main JSX transformation (production)
│   ├── jsx-dev-runtime.ts    # Main JSX transformation (development)
│   └── index.ts              # Main entry point
│
├── examples/                 # Example applications
│   ├── bun-server/           # Bun server with HMR
│   ├── vite-counter/         # Vite counter app
│   ├── performance-test/     # Performance optimizations
│   ├── terminal-counter/     # Terminal apps with Ink-like API
│   ├── terminal-print/       # One-off terminal output
│   ├── shared/               # Shared utilities
│   └── type-tests/           # TypeScript type tests
│
└── tests/                    # Unit and integration tests
    ├── signal/               # Signal system tests
    ├── runtime/              # Runtime tests
    └── terminal/             # Terminal rendering tests
```

## Examples

Check out the `examples/` directory for comprehensive examples:

### DOM Examples

- **bun-server** - Bun HTTP server with HMR and counter app
- **vite-counter** - Vite-based counter with multiple reactive patterns
- **performance-test** - Performance optimizations (batching, keyed lists, node pooling)

### Terminal Examples

- **terminal-counter** - Interactive terminal apps with Ink-like API
- **terminal-print** - One-off styled terminal output

### Running Examples

```bash
# Vite counter (DOM)
bun run example:dev

# Bun server
bun run example:bun

# Performance test
bun run example:perf

# Terminal counter
bun run example:terminal
```

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Watch mode
bun run dev

# Type check
bun run typecheck

# Run example
bun run example:dev
```

## Comparison with Other Frameworks

### vs React

- **SemaJSX**: Fine-grained reactivity with signals
- **React**: Virtual DOM with reconciliation

### vs Solid.js

- **SemaJSX**: Simpler API, focus on core features
- **Solid.js**: More features, larger ecosystem

### vs Vue

- **SemaJSX**: JSX-first, explicit signals
- **Vue**: Template-first, implicit reactivity

## Roadmap

- [x] Core signal system
- [x] JSX runtime
- [x] Basic rendering
- [x] List rendering with keyed reconciliation
- [ ] Portal support
- [ ] SSR (Server-Side Rendering)
- [ ] Suspense and async components
- [ ] DevTools integration

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a Pull Request.

## License

MIT © 2025

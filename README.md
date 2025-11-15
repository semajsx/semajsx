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
npm install semajsx
# or
bun add semajsx
# or
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
import { render, signal, computed } from 'semajsx';

function Counter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  return (
    <div>
      <h1>Count: {count}</h1>
      <p>Doubled: {doubled}</p>
      <button onclick={() => count.value++}>Increment</button>
    </div>
  );
}

render(<Counter />, document.getElementById('root')!);
```

## Core Concepts

### Signals

Signals are reactive primitives that automatically track dependencies and trigger updates.

```tsx
import { signal, computed, effect } from 'semajsx';

// Create a signal
const count = signal(0);

// Read the value
console.log(count.value); // 0

// Update the value
count.value++;

// Create computed signals
const doubled = computed(() => count.value * 2);

// Create effects
effect(() => {
  console.log('Count changed:', count.value);
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
  const content = computed(() => (show.value ? <p>Visible</p> : <p>Hidden</p>));

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
count.update(prev => prev + 1);

// Read without tracking
count.peek();

// Subscribe to changes
const unsubscribe = count.subscribe(value => {
  console.log('New value:', value);
});
```

### Computed Signals

```typescript
const count = signal(0);
const doubled = computed(() => count.value * 2);

// Computed values are read-only
console.log(doubled.value); // 0
```

### Effects

```typescript
const count = signal(0);

// Effect runs immediately and when dependencies change
effect(() => {
  console.log('Count is:', count.value);
});

// Effect with cleanup
effect(() => {
  const timer = setInterval(() => {
    count.value++;
  }, 1000);

  return () => clearInterval(timer);
});
```

### Batching Updates

```typescript
import { batch } from 'semajsx';

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
import { isSignal, unwrap, untrack, peek } from 'semajsx';

// Check if value is a signal
if (isSignal(value)) {
  console.log(value.value);
}

// Get value from signal or plain value
const plainValue = unwrap(maybeSignal);

// Read signal without tracking
const value = untrack(() => signal.value);

// Peek at signal value
const peeked = peek(maybeSignal);
```

## Project Structure

```
semajsx/
├── src/
│   ├── signal/          # Signal system
│   │   ├── signal.ts    # Core signal implementation
│   │   ├── computed.ts  # Computed signals
│   │   ├── effect.ts    # Effect system
│   │   ├── batch.ts     # Batching utilities
│   │   └── utils.ts     # Signal utilities
│   │
│   ├── runtime/         # Rendering runtime
│   │   ├── vnode.ts     # VNode creation
│   │   ├── render.ts    # Rendering engine
│   │   └── types.ts     # Type definitions
│   │
│   ├── dom/             # DOM operations
│   │   ├── operations.ts # DOM manipulation
│   │   └── properties.ts # Property handling
│   │
│   ├── jsx-runtime.ts   # JSX transformation (production)
│   ├── jsx-dev-runtime.ts # JSX transformation (dev)
│   └── index.ts         # Main entry point
│
└── examples/            # Example applications
    └── basic/           # Basic counter example
```

## Examples

Check out the `examples/` directory for more examples:

- **Basic Counter** - Simple counter with signals
- **Input Binding** - Two-way data binding
- **Conditional Rendering** - Dynamic content rendering

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
- [ ] List rendering with keyed reconciliation
- [ ] Portal support
- [ ] SSR (Server-Side Rendering)
- [ ] Suspense and async components
- [ ] DevTools integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2024

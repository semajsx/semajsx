# SSG Islands Example

This example demonstrates **Static Site Generation (SSG)** with the Islands Architecture in SemaJSX.

## Overview

The page combines:

- **Static components** - Rendered at build time, no JavaScript needed
- **Island components** - Interactive parts that hydrate on the client

## Components

### Static Components (No Hydration)

- `Header.tsx` - Page header with gradient background
- `Card.tsx` - Reusable content card with variants
- `Footer.tsx` - Page footer

### Island Components (Client Hydration)

- `Counter.tsx` - Interactive counter with signals
- `ContactForm.tsx` - Form with validation using computed signals

## Running the Example

### Development Mode

```bash
cd packages/server/examples/ssg-islands
bun run server.tsx
```

Visit http://localhost:3000

### Build for Production (SSG)

```bash
bun run server.tsx --build
```

This generates static HTML and island bundles in the `dist` directory.

## Key Concepts

### Static Components

Regular components that render once on the server:

```tsx
export function Card({ title, children }) {
  return (
    <div class="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### Island Components

Interactive components wrapped with `island()`:

```tsx
import { island } from "@semajsx/server/client";
import { signal } from "@semajsx/signal";

export const Counter = island(
  function Counter({ initial = 0 }) {
    const count = signal(initial);
    return <button onClick={() => count.value++}>Count: {count}</button>;
  },
  import.meta.url,
);
```

### Combining Both

```tsx
import { Card } from "./Card"; // Static
import { Counter } from "./Counter"; // Island

export function App() {
  return (
    <Card title="My Counter">
      <Counter initial={10} />
    </Card>
  );
}
```

## Benefits

1. **Fast Loading** - Pre-rendered HTML loads instantly
2. **SEO Friendly** - Search engines see complete content
3. **Minimal JS** - Only interactive components load JavaScript
4. **Progressive Enhancement** - Works without JavaScript

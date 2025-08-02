# @semajsx/core

Core runtime and reactivity system for semajsx - a next-generation JSX runtime framework.

## Features

- **Signal-based reactivity**: Explicit subscriptions instead of implicit dependency tracking
- **Platform-agnostic**: Core logic completely separated from rendering platforms through strategy pattern
- **Built-in async support**: Components can be async functions with built-in Suspense
- **Plugin system**: Extensible architecture for themes, i18n, and custom behaviors
- **TypeScript-first**: Full type safety with granularity constraints

## Installation

```bash
npm install @semajsx/core
# or
bun add @semajsx/core
```

## Basic Usage

```typescript
import { createRenderer, h } from '@semajsx/core';

// Define your render strategies for your platform
const domStrategies = {
  createElement(tagName, container) {
    return document.createElement(tagName);
  },
  createTextNode(text) {
    return document.createTextNode(text);
  },
  // ... other strategy methods
};

// Create a renderer
const renderer = createRenderer(domStrategies, {
  platform: 'dom',
  plugins: []
});

// Create components
function App() {
  return h('div', { className: 'app' },
    h('h1', null, 'Hello World'),
    h('p', null, 'Welcome to semajsx!')
  );
}

// Render to your platform
renderer.render(App(), document.getElementById('root'));
```

## Core Concepts

### Signals

Signals are the core reactivity primitive in semajsx:

```typescript
interface Signal<T> {
  readonly value: T;
  subscribe(listener: (value: T, prev?: T) => void): () => void;
  dispose?(): void;
}
```

### Components

Components are functions that return VNodes:

```typescript
// Sync component
function Button({ onClick, children }) {
  return h('button', { onClick }, children);
}

// Async component (automatically handled by Suspense)
async function UserProfile({ userId }) {
  const user = await fetchUser(userId);
  return h('div', null, `Hello, ${user.name}!`);
}
```

### Built-in Components

- **Fragment**: Group multiple elements without a wrapper
- **ErrorBoundary**: Catch and handle errors in component trees
- **Suspense**: Handle async components and lazy loading

```typescript
import { Fragment, ErrorBoundary, Suspense } from '@semajsx/core';

function App() {
  return h(ErrorBoundary, {
    fallback: (error, retry) => h('div', null, 'Error: ', error.message)
  },
    h(Suspense, {
      fallback: h('div', null, 'Loading...')
    },
      h(AsyncComponent, null)
    )
  );
}
```

### Plugins

Extend semajsx with custom behavior:

```typescript
const themePlugin = {
  name: 'theme',
  transform(vnode) {
    // Transform vnodes before rendering
    return vnode;
  },
  props(props, vnode) {
    // Modify props before applying
    return props;
  },
  loading() {
    // Provide custom loading UI
    return h('div', { className: 'custom-spinner' });
  }
};

const renderer = createRenderer(strategies, {
  platform: 'dom',
  plugins: [themePlugin]
});
```

## Platform Support

The core is platform-agnostic. Implement `RenderStrategies` for your target platform:

- DOM (web browsers)
- TUI (terminal UI)
- Canvas
- React Native
- Any custom platform

## TypeScript Support

Full TypeScript support with JSX types:

```tsx
// Enable JSX in tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@semajsx/core"
  }
}

// Now you can use JSX
function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
    </div>
  );
}
```

## License

MIT
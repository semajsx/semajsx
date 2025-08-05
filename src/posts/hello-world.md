---
title: Hello World
date: 2025-01-05
description: My first blog post using SemaJSX
---

# Hello World

Welcome to my new blog built with **SemaJSX**! This is my first post demonstrating the power of signal-based reactive UI frameworks.

## What is SemaJSX?

SemaJSX is a modern UI framework that uses signals for reactivity instead of traditional virtual DOM diffing. This means:

- **Direct Updates**: Changes to signals directly update the DOM
- **Better Performance**: No need to diff entire component trees
- **Simpler Mental Model**: State changes are predictable and traceable

## Features of This Blog

This blog showcases several SemaJSX features:

1. **Dynamic Route Loading**: Using Vite's `import.meta.glob` to load all posts
2. **Signal-Based Routing**: Navigation state managed with signals
3. **Markdown Support**: Write posts in Markdown with frontmatter metadata
4. **Responsive Design**: Built with TailwindCSS for a clean, modern look

## Code Example

Here's a simple counter component in SemaJSX:

```jsx
import { signal } from "@semajsx/signal";

function Counter() {
  const count = signal(0);
  
  return (
    <button onClick={() => count.value++}>
      Count: {count}
    </button>
  );
}
```

## What's Next?

I'll be sharing more posts about:

- Building reactive components with signals
- Performance optimizations in SemaJSX
- Real-world application patterns
- Comparing SemaJSX with other frameworks

Stay tuned for more content!
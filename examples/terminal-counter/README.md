# Terminal Counter Example

This example demonstrates how to use SemaJSX's terminal rendering capabilities to build CLI applications, similar to [Ink](https://github.com/vadimdemedes/ink).

## Features

- Terminal/CLI rendering with flexbox layout (via Yoga)
- Reactive updates using signals
- Text styling with chalk (colors, bold, italic, etc.)
- Borders and boxes with cli-boxes
- Auto-updating counter that increments every second

## Running the Example

```bash
# From the root of the project
bun run example:terminal

# Or directly
bun examples/terminal-counter/simple.ts
```

## How It Works

### 1. Create a Signal

```typescript
import { signal } from "semajsx/signal";

const count = signal(0);

// Update the signal
setInterval(() => {
  count.value++;
}, 1000);
```

### 2. Build the UI

```typescript
import { h } from "semajsx";
import { TerminalRenderer, render } from "semajsx/terminal";

const app = h(
  "box",
  {
    flexDirection: "column",
    padding: 2,
    border: "round",
    borderColor: "cyan",
  },
  [
    h("text", { bold: true, color: "green" }, ["Terminal Counter"]),
    h("text", { marginTop: 1 }, ["Count: ", count]),
  ],
);
```

### 3. Render to Terminal

```typescript
const renderer = new TerminalRenderer(process.stdout);
render(app, renderer);

// Re-render on changes
setInterval(() => {
  renderer.render();
}, 100);
```

## Available Components

### `<box>`

Container element with flexbox layout support.

**Props:**

- `flexDirection`: 'row' | 'column' | 'row-reverse' | 'column-reverse'
- `justifyContent`: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
- `alignItems`: 'flex-start' | 'center' | 'flex-end' | 'stretch'
- `width`, `height`: number | string (supports '%')
- `padding`, `margin`: number
- `border`: 'single' | 'double' | 'round' | 'bold' | 'none'
- `borderColor`: chalk color name

### `<text>`

Text element with styling support.

**Props:**

- `color`: chalk color name ('red', 'green', 'blue', etc.)
- `backgroundColor`: chalk color name
- `bold`, `italic`, `underline`, `strikethrough`, `dim`: boolean

## Dependencies

The terminal renderer uses these libraries:

- **yoga-layout-prebuilt**: Flexbox layout engine
- **chalk**: Terminal text styling
- **cli-boxes**: Border characters
- **ansi-escapes**: ANSI escape sequences
- **string-width**: Accurate string width calculation
- **slice-ansi**: Slice strings with ANSI codes

## Architecture

SemaJSX's terminal rendering is built on the same reactive core as the DOM renderer:

1. **Terminal Operations** (`src/terminal/operations.ts`): Low-level terminal node operations
2. **Terminal Renderer** (`src/terminal/renderer.ts`): Layout calculation and rendering
3. **Terminal Render** (`src/terminal/render.ts`): VNode to terminal node conversion

This architecture allows signals to work seamlessly with terminal rendering, just like they do with DOM rendering.

# semajsx

A lightweight, signal-based reactive JSX runtime for building modern web applications.

## Install

```bash
bun add semajsx
```

## Quick Start

```tsx
/** @jsxImportSource semajsx/dom */
import { signal } from "semajsx";
import { render } from "semajsx/dom";

const count = signal(0);

function Counter() {
  return <button onClick={() => count.set(count.get() + 1)}>Count: {count}</button>;
}

render(<Counter />, document.getElementById("app")!);
```

## Subpath Exports

| Import Path        | Description                      |
| ------------------ | -------------------------------- |
| `semajsx`          | Signal reactivity + core runtime |
| `semajsx/dom`      | DOM rendering                    |
| `semajsx/signal`   | Signal system                    |
| `semajsx/terminal` | Terminal rendering               |

### JSX Configuration

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "semajsx/dom"
  }
}
```

For terminal apps, use `"jsxImportSource": "semajsx/terminal"`.

### Terminal (optional)

Terminal rendering requires `yoga-layout-prebuilt`:

```bash
bun add yoga-layout-prebuilt
```

## Development

```bash
bun run build
bun run dev
bun run test
bun run typecheck
```

See the [main README](../../README.md) for more information.

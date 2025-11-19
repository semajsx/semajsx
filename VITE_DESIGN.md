# SSR Islands with Vite

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser                               │
├─────────────────────────────────────────────────────────┤
│  1. Load HTML with island placeholders                  │
│  2. Execute: <script type="module" src="/islands/0.js"> │
│     ↓                                                    │
│  3. Request /islands/0.js                               │
│     ↓                                                    │
│  4. Vite transforms & returns ESM with imports          │
│     ↓                                                    │
│  5. Browser requests dependencies:                      │
│     - /@fs/.../semajsx/dom/index.ts                    │
│     - /src/islands/Counter.tsx                         │
│     ↓                                                    │
│  6. Vite transforms each module on-demand               │
│     ↓                                                    │
│  7. Island hydrates                                     │
└─────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Router with Vite Integration

```typescript
import { createServer } from 'vite'

export async function createRouter(routes, config = {}) {
  const { dev = true } = config

  // Create Vite server for module transformation
  const vite = dev ? await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  }) : null

  return {
    async get(path) {
      const vnode = routes[path]()
      const { html, islands } = renderToString(vnode)

      // Generate module imports (not bundled scripts)
      const scripts = islands
        .map(island => `<script type="module" src="/islands/${island.id}.js"></script>`)
        .join('\n')

      return { html, islands, scripts }
    },

    async handleModuleRequest(url) {
      if (!vite) {
        throw new Error('Vite server required in dev mode')
      }

      // Let Vite handle the transformation
      return vite.transformRequest(url)
    },

    vite, // Expose for middleware
  }
}
```

### 2. Island Entry Points (No Bundling)

```typescript
// /islands/island-0.js (generated dynamically)
import { render } from 'semajsx/dom'
import { Counter } from '/src/islands/Counter.tsx'

const props = {"initial": 5}
const placeholder = document.querySelector('[data-island-id="island-0"]')

if (placeholder) {
  const vnode = Counter(props)
  render(vnode, placeholder.parentElement)
  placeholder.remove()
}
```

Vite 自动处理：
- `'semajsx/dom'` → resolve to node_modules
- `'/src/islands/Counter.tsx'` → transform TSX to JS
- 所有依赖按需加载

### 3. Server Setup

```typescript
import { createRouter } from 'semajsx/server'
import { App } from './App'

const router = await createRouter({
  '/': () => <App />
}, { dev: true })

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url)

    // Handle island module requests
    if (url.pathname.startsWith('/islands/') ||
        url.pathname.startsWith('/@')) {
      const result = await router.handleModuleRequest(url.pathname)
      return new Response(result.code, {
        headers: { 'Content-Type': 'application/javascript' }
      })
    }

    // Handle page requests
    const { html, scripts } = await router.get(url.pathname)
    return new Response(`
      <!DOCTYPE html>
      <html>
        <body>
          ${html}
          ${scripts}
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }})
  }
})

// Use Vite middleware
if (router.vite) {
  // router.vite.middlewares handles transformation
}
```

## Benefits

### Development Mode
- ✅ **No Build Step** - Islands load instantly, no bundling
- ✅ **HMR** - Hot module replacement for instant updates
- ✅ **Source Maps** - Debug original TypeScript
- ✅ **Shared Dependencies** - semajsx loaded once, cached

### Production Mode
```typescript
// Build islands ahead of time
const router = await createRouter(routes, {
  dev: false,
  build: true
})

// Pre-build all islands
await router.buildIslands()
// Generates optimized bundles in dist/islands/
```

- ✅ **Code Splitting** - Automatic chunk optimization
- ✅ **Tree Shaking** - Remove unused code
- ✅ **Minification** - Smaller bundle size
- ✅ **Long-term Caching** - Hash-based filenames

## Example Usage

```tsx
// islands/Counter.tsx
import { signal } from 'semajsx'
import { island } from 'semajsx/server'

export const Counter = island(
  function Counter({ initial = 0 }) {
    const count = signal(initial)
    return (
      <button onClick={() => count.value++}>
        Count: {count}
      </button>
    )
  },
  import.meta.url
)

// App.tsx
export function App() {
  return (
    <div>
      <h1>Static Content</h1>
      <Counter initial={0} />  {/* Auto-hydrates */}
      <p>More static content</p>
    </div>
  )
}

// server.tsx
import { createRouter } from 'semajsx/server'

const router = await createRouter({
  '/': () => <App />
}, { dev: true })

// Vite handles all module transformations automatically!
```

## Migration from Bun.build

1. Replace `buildWithBun()` with Vite transformation
2. Remove bundle caching (Vite handles this)
3. Update entry point generation (keep imports, don't bundle)
4. Add Vite middleware integration

## Next Steps

1. Install Vite: `bun add -d vite`
2. Update `src/server/builder.ts` to use Vite
3. Add `src/server/vite-plugin.ts` for custom transformations
4. Update router to integrate Vite middleware
5. Test with examples/ssr-islands

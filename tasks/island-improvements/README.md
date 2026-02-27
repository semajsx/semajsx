# Island Architecture Improvements

## Summary

Six targeted improvements to the island hydration system.
P0, P3, P4, P5 are implemented. P1, P2 remain as future work.

---

## P0: Stable Component Identifiers [DONE]

### Problem

Children serialization relies on `Function.name` to identify components.
Client reconstruction matches against module export names.
These can diverge (`export { MyTab as Tab }`, default arrow functions, minification).

### Solution (simplified)

**Zero API change.** The SSR renderer dynamically imports the island's module
at render time to build a `Function → export name` reverse map. Since the
module is already loaded (statically imported at `island()` call site),
`import()` hits the module cache — no I/O, and function references are
identity-equal so `Map.get()` works directly.

```ts
// render.ts — new internal function (cached per module path)
const moduleNameCache = new Map<string, Map<Function, string>>();

async function resolveNameMap(modulePath: string): Promise<Map<Function, string>> {
  const cached = moduleNameCache.get(modulePath);
  if (cached) return cached;
  const map = new Map<Function, string>();
  try {
    const mod = await import(modulePath);
    for (const [exportName, value] of Object.entries(mod)) {
      if (typeof value === "function") map.set(value as Function, exportName);
    }
  } catch {
    // Falls back to Function.name
  }
  moduleNameCache.set(modulePath, map);
  return map;
}
```

Used in `renderIsland()` (already async):

```ts
const nameMap = await resolveNameMap(metadata.modulePath);
const serializedChildren = serializeVNodeChildren(metadata.props?.children, nameMap);
```

Serialization prefers export name, falls back to `Function.name`:

```ts
const name = "$" + (nameMap?.get(vnode.type) || vnode.type.name || "Anonymous");
```

**No changes to**: `island()` signature, `IslandMarker` type, any user code.

---

## P1: Unify Dev/Prod Hydration Paths [TODO]

### Problem

Dev mode (`vite-builder.ts`) and prod mode (`app.ts`) generate different client entries:

|                         | Dev                                       | Prod                                               |
| ----------------------- | ----------------------------------------- | -------------------------------------------------- |
| Entry generator         | `ViteIslandBuilder.generateEntryPoint()`  | `app.build()` inline                               |
| Hydration function      | `hydrate(vnode, placeholder)`             | `hydrateAllIslands(key, Component, registry)`      |
| Granularity             | Per-island-instance (by `data-island-id`) | Per-component-type (by `data-island-src`)          |
| Children reconstruction | None (no registry)                        | Yes (via `reconstructChildren`)                    |
| DOM strategy            | `hydrate()` on the element                | `hydrateNode()` on element, `render()` on fragment |

### Solution

Make dev mode use the same `hydrateAllIslands` path as prod.
Requires `ViteIslandBuilder` to resolve by component key (not instance ID)
and deduplicate entries per component type.

---

## P2: Cross-Module Children [TODO]

### Problem

`reconstructChildren` uses a single flat `registry` (one module's exports).
Children from different modules can't be resolved.

### Solution

Deferred until a real use case appears. Short-term workaround: merge
multiple module exports when calling `hydrateAllIslands`.

---

## P3: Non-Destructive Fragment Hydration [DONE]

### Problem

Fragment-based islands deleted all nodes between comment markers and
re-rendered from scratch (`render()` into temp, insert new nodes).
This caused flash of removed content and behavioral inconsistency
with element-based islands (which used non-destructive `hydrateNode()`).

### Solution

Move existing nodes into a temporary container, run `hydrateNode()`
against the existing DOM, then move hydrated nodes back between markers.
This preserves SSR content and only attaches event handlers and signal
subscriptions — matching element-based island behavior.

---

## P4: Nested Island Placeholder [DONE]

### Problem

Nested islands were silently skipped during children serialization,
creating holes in the serialized array and breaking children index positions.

### Solution

Emit `["$island", null, null]` placeholder during SSR serialization.
Client `reconstructChildren` recognizes this marker and pushes `null`
to preserve index positions. The nested island hydrates independently.

---

## P5: Island Error Boundary [DONE]

### Problem

If any island throws during hydration, the error propagates to the global
scope and prevents other islands from hydrating. No graceful degradation.

### Solution

Wrap each island's hydration (both element-based and fragment-based) in
try/catch. On failure:

- Log the error with the island ID
- Mark the element with `data-hydration-error="true"`
- SSR content is preserved — the island stays as static HTML

---

## Implementation Status

```
P0  Stable identifiers        ✅ Done (render.ts)
P1  Unify hydration paths     ⬜ TODO (vite-builder.ts, app.ts)
P2  Cross-module children     ⬜ Deferred
P3  Fragment hydration         ✅ Done (hydrate.ts)
P4  Nested island placeholder ✅ Done (render.ts, hydrate.ts)
P5  Error boundary             ✅ Done (hydrate.ts)
```

## Files Changed

| File                        | P0  | P3  | P4  | P5  |
| --------------------------- | --- | --- | --- | --- |
| `ssr/src/render.ts`         | x   |     | x   |     |
| `ssr/src/client/hydrate.ts` |     | x   | x   | x   |

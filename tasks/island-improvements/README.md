# Island Architecture Improvements

## Summary

Six targeted improvements to the island hydration system, ordered by priority.
Each change is independent and can be landed separately.

---

## P0: Stable Component Identifiers

### Problem

Children serialization relies on `Function.name` to identify components:

```ts
// render.ts:230
const name = "$" + (vnode.type.name || "Anonymous");
```

Client reconstruction relies on matching this name against module exports:

```ts
// hydrate.ts:850
const name = type.slice(1); // "TabList"
const component = registry[name]; // registry["TabList"]
```

This breaks when:

- Export name differs from function name (`export { MyTabList as TabList }` — serializes as `$MyTabList`, registry key is `TabList`)
- Multiple components share a function name (registry collision)
- Default-exported arrow function (`export default () => ...` — serializes as `$Anonymous`)

### Solution

Pass the module exports to `island()` so it can build a `Function → export name` reverse map.

**Types change:**

```ts
// shared/types.ts
export interface IslandMarker {
  modulePath: string;
  component: Function;
  props: any;
  nameMap?: Map<Function, string>; // NEW: function → export name
}
```

**`island()` change:**

```ts
// client/island.ts
export function island<T extends Component<any>>(
  component: T,
  modulePath: string,
  moduleExports?: Record<string, any>, // NEW optional param
): T {
  // Build reverse map from module exports
  let nameMap: Map<Function, string> | undefined;
  if (moduleExports) {
    nameMap = new Map();
    for (const [exportName, value] of Object.entries(moduleExports)) {
      if (typeof value === "function") {
        nameMap.set(value, exportName);
      }
    }
  }

  const wrappedComponent = ((props: any): JSXNode => {
    const vnode = {
      type: component,
      props: props || {},
      children: [],
      [ISLAND_MARKER]: { modulePath, component, props, nameMap },
    };
    return vnode;
  }) as T;

  (wrappedComponent as any)[ISLAND_MARKER] = { modulePath, component, nameMap };
  // ...
}
```

**Serialization change:**

```ts
// render.ts — pass nameMap into collectSerializedNode

function serializeVNodeChildren(children: any, nameMap?: Map<Function, string>): any[] | undefined {
  // ... pass nameMap through
}

function collectSerializedNode(node: any, result: any[], nameMap?: Map<Function, string>): void {
  // ...
  if (typeof vnode.type === "function") {
    // Use export name from map, fall back to Function.name
    const name = "$" + (nameMap?.get(vnode.type) || vnode.type.name || "Anonymous");
    // ...
  }
}
```

**Usage:**

```ts
import * as TabsModule from "@semajsx/ui/components/tabs";

const TabsIsland = island(TabsModule.Tabs, "@semajsx/ui/components/tabs", TabsModule);
```

**Backward compatible** — the third parameter is optional. Without it, behavior is identical to today.

---

## P1: Unify Dev/Prod Hydration Paths

### Problem

Dev mode (`vite-builder.ts`) and prod mode (`app.ts`) generate different client entries:

|                         | Dev                                       | Prod                                               |
| ----------------------- | ----------------------------------------- | -------------------------------------------------- |
| Entry generator         | `ViteIslandBuilder.generateEntryPoint()`  | `app.build()` inline                               |
| Hydration function      | `hydrate(vnode, placeholder)`             | `hydrateAllIslands(key, Component, registry)`      |
| Granularity             | Per-island-instance (by `data-island-id`) | Per-component-type (by `data-island-src`)          |
| Children reconstruction | None (no registry)                        | Yes (via `reconstructChildren`)                    |
| DOM strategy            | `hydrate()` on the element                | `hydrateNode()` on element, `render()` on fragment |

Consequences:

- Island children with interactive components work in prod but silently lose interactivity in dev
- Behavioral differences between dev and prod are hard to debug

### Solution

Make dev mode use the same `hydrateAllIslands` path as prod. The dev entry should be per-component-type, not per-instance.

**Replace `ViteIslandBuilder.generateEntryPoint()`:**

```ts
// Before (per-instance, no registry):
const Component = ComponentModule['${name}'];
hydrate(Component(props), placeholder);

// After (per-component-type, with registry):
import { hydrateAllIslands } from 'semajsx/ssr/client';
import * as ComponentModule from '${componentPath}';

const Component = ComponentModule['${componentName}'] || ...;
if (Component) {
  hydrateAllIslands('${componentKey}', Component, ComponentModule);
}
```

**Impact**: `ViteIslandBuilder` needs a `componentKey` (not just `islandId`). The virtual module plugin resolves by component key instead of island instance ID. Multiple instances of the same component share one script.

The `handleRequest` path in `app.ts` would also need to deduplicate by component key (similar to what `build()` already does).

---

## P2: Cross-Module Children

### Problem

`reconstructChildren` uses a single flat `registry` — the module exports of the island's source file. If children contain components from a different module, they can't be resolved.

Example:

```tsx
<TabsIsland>
  <TabList>
    {" "}
    {/* from @semajsx/ui/components/tabs */}
    <Tab value="a">A</Tab>
  </TabList>
  <CustomPanel value="a">
    {" "}
    {/* from ./my-components — NOT in registry */}
    ...
  </CustomPanel>
</TabsIsland>
```

`$CustomPanel` would fail to resolve during reconstruction.

### Solution

Extend the serialization format to include module source hints for cross-module components. During SSR, record each component's origin module. On the client, the generated entry adds the necessary imports.

**Serialization format extension:**

```
// Current:  ["$TabList", props, children]
// Extended: ["$TabList", props, children]              — same-module (lookup in primary registry)
//           ["$CustomPanel@./my-components", props, children]  — cross-module
```

**SSR change (`collectSerializedNode`):**

```ts
if (typeof vnode.type === "function") {
  const exportName = nameMap?.get(vnode.type) || vnode.type.name || "Anonymous";

  // Check if this component is in the island's own module
  if (nameMap?.has(vnode.type)) {
    result.push(["$" + exportName, props, childrenArr]);
  } else {
    // Cross-module: include module hint
    // (requires a global component→module registry, or skip and warn)
    console.warn(`[SSR] Component "${exportName}" not in island module registry`);
    result.push(["$" + exportName, props, childrenArr]);
  }
}
```

**Practical note**: This is a significant expansion. For now, a simpler approach: allow `island()` to accept multiple module registries:

```ts
import * as TabsModule from "@semajsx/ui/components/tabs";
import * as CustomModule from "./my-components";

const TabsIsland = island(Tabs, "@semajsx/ui/components/tabs", {
  ...TabsModule,
  ...CustomModule,
});
```

Since `moduleExports` is `Record<string, any>`, merging works naturally. The build entry would need to import from all contributing modules — this requires storing the list of module paths. Defer this to a future iteration; for now, same-module children cover 90%+ of real cases.

---

## P3: Non-Destructive Fragment Hydration

### Problem

Element-based islands use `hydrateNode()` — walks existing DOM, attaches events/signals without touching structure. Non-destructive.

Fragment-based islands delete all nodes between comment markers and re-render from scratch:

```ts
// hydrate.ts:990-994
nodes.forEach((n) => {
  if (n.parentNode) n.parentNode.removeChild(n);
});
const temp = document.createElement("div");
render(vnode, temp);
```

This causes:

- Flash of removed content (FORC)
- Loss of any browser/extension-injected nodes
- Different behavior from element-based islands

### Solution

Wrap fragment children in a temporary container for `hydrateNode()`, then unwrap.

```ts
// Instead of removing and re-rendering:
if (startNode && endNode && startNode.parentNode) {
  const parent = startNode.parentNode;

  // Collect existing nodes between markers into a temp container
  const container = document.createElement("div");
  let current = startNode.nextSibling;
  while (current && current !== endNode) {
    const next = current.nextSibling;
    container.appendChild(current); // moves node, doesn't clone
    current = next;
  }

  // Create VNode and hydrate against existing DOM
  const vnode: VNode = {
    type: Component as VNode["type"],
    props,
    children: [],
  };
  hydrateNode(vnode, container, container);

  // Move hydrated nodes back between markers
  while (container.firstChild) {
    parent.insertBefore(container.firstChild, endNode);
  }

  script.setAttribute("data-island-hydrated", islandId);
  script.remove();
}
```

This preserves existing DOM structure and only attaches event handlers and signal subscriptions, matching element-based island behavior.

**Fallback**: If `hydrateNode()` detects a mismatch, it falls back to full `render()` (which already happens for element-based islands via the existing mismatch handling in `hydrate.ts`).

---

## P4: Nested Island Placeholder in Serialized Children

### Problem

Nested islands are skipped during children serialization:

```ts
// render.ts:223
if (isIslandVNode(vnode as any)) return; // silent skip
```

This creates a "hole" in the serialized children array. If the parent component iterates children by index, the count is wrong.

### Solution

Instead of skipping entirely, emit a placeholder marker that the client can recognize:

```ts
// render.ts — in collectSerializedNode
if (isIslandVNode(vnode as any)) {
  // Emit a placeholder so the parent knows a nested island exists here
  const nestedMeta = getIslandMetadata(vnode as any);
  const nestedId = /* the nested island's ID from context */;
  result.push(["$island", { id: nestedId }, null]);
  return;
}
```

On the client, `reconstructChildren` recognizes `$island` as a special marker:

```ts
if (type === "$island") {
  // Find the nested island's hydrated DOM element
  const nestedEl = document.querySelector(`[data-island-id="${props.id}"]`);
  if (nestedEl) {
    // Return a VNode that references the existing DOM
    result.push({ type: "#placeholder", props: { element: nestedEl }, children: [] });
  }
  continue;
}
```

This preserves children count and position. The parent component can still iterate children correctly; the nested island's slot contains a reference to its independently-hydrated DOM.

---

## P5: Island Error Boundary

### Problem

If an island's component throws during hydration, the error propagates to the global scope. Other islands on the page don't hydrate. No graceful degradation.

### Solution

Wrap each island hydration in a try/catch in `hydrateAllIslands`:

```ts
elements.forEach((element) => {
  const islandId = element.getAttribute("data-island-id");
  if (!islandId) return;
  if (element.hasAttribute("data-hydrated")) return;

  try {
    // ... existing hydration logic ...
    hydrateNode(vnode, element, element.parentNode as Element);
    element.setAttribute("data-hydrated", "true");
  } catch (error) {
    console.error(`[Island] Hydration failed for ${islandId}:`, error);
    element.setAttribute("data-hydration-error", "true");
    // SSR content is preserved — the island stays as static HTML
  }
});
```

The key insight: **SSR content is already in the DOM**. A failed hydration simply means the island stays non-interactive but still visible. This is the correct progressive enhancement behavior.

The same pattern applies to fragment-based islands — if hydration fails, don't remove the existing nodes.

---

## Implementation Order

```
P0  Stable identifiers     — structural risk, fix first
P1  Unify hydration paths  — dev/prod parity, catches bugs early
P5  Error boundary          — quick win, 10 lines, high impact
P3  Fragment hydration      — consistency fix
P4  Nested island placeholder — edge case, needed for composition
P2  Cross-module children   — defer until real use case appears
```

## Files Affected

| File                                  | P0  | P1  | P2  | P3  | P4  | P5  |
| ------------------------------------- | --- | --- | --- | --- | --- | --- |
| `ssr/src/shared/types.ts`             | x   |     |     |     |     |     |
| `ssr/src/client/island.ts`            | x   |     |     |     |     |     |
| `ssr/src/render.ts`                   | x   |     |     |     | x   |     |
| `ssr/src/client/hydrate.ts`           |     |     | x   | x   | x   | x   |
| `ssr/src/vite-builder.ts`             |     | x   |     |     |     |     |
| `ssr/src/app.ts`                      |     | x   |     |     |     |     |
| `ssg/src/plugins/docs-theme/index.ts` | x   |     |     |     |     |     |

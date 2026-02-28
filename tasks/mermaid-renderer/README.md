# Mermaid Diagram Renderer - Design Document

**Date**: 2026-02-28
**Status**: Draft (v2 — redesigned for SemaJSX idioms)
**Package**: `@semajsx/mermaid`

---

## 1. Overview

### 1.1 Quick Summary

- **What**: Mermaid diagrams as composable SemaJSX components
- **Why**: mermaid.js renders opaque SVG blobs. We want diagram elements that participate in SemaJSX's reactivity, theming, and composition — the same way `<Box>` and `<Text>` work in `@semajsx/terminal`
- **How**: `parse()` pure function + `<Flowchart>` / `<Sequence>` layout components + `<Node>` / `<Edge>` SVG primitives, all wired through Context and design tokens

### 1.2 Scope

- **In Scope**: Flowchart + Sequence diagram parsing, layout, and rendering
- **Out of Scope**: Class/state/ER diagrams, interactive editing

---

## 2. Design Principles

1. **Components are the API** — `<Flowchart>`, `<Node>`, `<Edge>` are first-class JSX components, just like `<Box>` and `<Text>` in terminal. The parser is a convenience that produces the same component tree.
2. **Context for everything** — Theme, renderers, layout options flow through `ctx.inject()`, not props drilling. Follows `ThemeProvider` pattern exactly.
3. **Same tokens, same rules** — Styles use `classes()` + `rule` + `defineTokens` from `@semajsx/style`, referencing `@semajsx/ui` tokens where sensible. No parallel theme system.
4. **Signals all the way down** — Not just `code` as a signal. Individual node labels, edge connections, graph structure can be reactive.
5. **`parse()` is just data** — Pure function, no side effects, no DOM. Returns typed IR that feeds into components. Users can also construct IR by hand.

---

## 3. Architecture

### 3.1 Two Entry Points, One Component Tree

```
Entry A: Mermaid string               Entry B: Programmatic IR
┌──────────────────────┐              ┌──────────────────────┐
│ parse("graph TD;     │              │ { direction: "TD",   │
│   A-->B")            │              │   nodes: [...],      │
│                      │              │   edges: [...] }     │
└──────────┬───────────┘              └──────────┬───────────┘
           │                                     │
           └──────────────┬──────────────────────┘
                          ▼
                ┌──────────────────┐
                │  <Flowchart>     │  layout component
                │    graph={ir}    │  (collects data, runs layout,
                └────────┬─────────┘   renders positioned children)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    <Node>          <Edge>          <Subgraph>
    (SVG rect)      (SVG path)      (SVG rect + children)

         all read theme from Context
         all replaceable via Context
```

### 3.2 Comparison with Existing SemaJSX Patterns

| Pattern           | `@semajsx/terminal` | `@semajsx/ui`                  | `@semajsx/mermaid` (this)         |
| ----------------- | ------------------- | ------------------------------ | --------------------------------- |
| Layout primitives | `<Box>`, `<Text>`   | `<Tabs>`, `<TabList>`, `<Tab>` | `<Flowchart>`, `<Node>`, `<Edge>` |
| Layout engine     | Yoga (flexbox)      | CSS (browser)                  | Sugiyama (layered graph)          |
| Theme             | props (color, bold) | `ThemeProvider` + Context      | `MermaidProvider` + Context       |
| Customization     | —                   | `class` prop + tokens          | Context renderers + `class` prop  |
| Style system      | ANSI (chalk)        | `classes()` + `rule` + tokens  | `classes()` + `rule` + tokens     |

### 3.3 Module Breakdown

| Module     | Responsibility                    | Location           |
| ---------- | --------------------------------- | ------------------ |
| `types.ts` | Diagram IR type definitions       | `src/types.ts`     |
| `parse()`  | Mermaid DSL → Diagram IR          | `src/parser/`      |
| `layout()` | IR → positioned coordinates       | `src/layout/`      |
| Components | SVG primitives (`<Node>`, etc.)   | `src/components/`  |
| Provider   | Context setup (theme + renderers) | `src/provider.tsx` |
| Tokens     | Design tokens + themes            | `src/tokens.ts`    |
| Styles     | `classes()` + `rule` definitions  | `src/*.style.ts`   |

---

## 4. API Design

### 4.1 Top-Level: Two Ways to Use

**Way 1: Parse from Mermaid string (convenience)**

```tsx
/** @jsxImportSource @semajsx/dom */
import { Mermaid } from "@semajsx/mermaid";

<Mermaid
  code={`
  graph TD
    A[Client] --> B[Load Balancer]
    B --> C[Server 1]
    B --> D[Server 2]
`}
/>;
```

**Way 2: Programmatic IR (full control)**

```tsx
import { Flowchart } from "@semajsx/mermaid";

<Flowchart
  graph={{
    direction: "TD",
    nodes: [
      { id: "A", label: "Client", shape: "rect" },
      { id: "B", label: "Load Balancer", shape: "round" },
      { id: "C", label: "Server 1", shape: "rect" },
      { id: "D", label: "Server 2", shape: "rect" },
    ],
    edges: [
      { source: "A", target: "B", type: "arrow" },
      { source: "B", target: "C", type: "arrow" },
      { source: "B", target: "D", type: "arrow" },
    ],
  }}
/>;
```

Both produce the same SVG. `<Mermaid>` is just `parse()` + `<Flowchart>` or `<Sequence>`.

### 4.2 `<Mermaid>` — Convenience Wrapper

```tsx
import { parse } from "@semajsx/mermaid";

function Mermaid(props: MermaidProps, ctx: ComponentAPI): JSXNode {
  // parse() is pure — no side effects
  const diagram = parse(props.code);

  if ("message" in diagram) {
    // ParseError — render error or call handler
    props.onError?.(diagram);
    return null;
  }

  if (diagram.type === "flowchart") {
    return <Flowchart graph={diagram} class={props.class} />;
  }
  if (diagram.type === "sequence") {
    return <Sequence graph={diagram} class={props.class} />;
  }

  return null;
}
```

When `code` is a `Signal<string>`, the component re-renders when the signal changes — standard SemaJSX behavior, no special handling needed.

### 4.3 Context System — The SemaJSX Way

**Instead of `overrides` prop (React/MUI pattern):**

```tsx
// ❌ NOT this (props drilling, not SemaJSX)
<Mermaid code={code} overrides={{ node: MyNode }} />
```

**Use Context (SemaJSX pattern):**

```tsx
// ✅ This — same pattern as ThemeProvider
import { MermaidProvider } from "@semajsx/mermaid";

<MermaidProvider node={GlowNode} "node:rhombus"={DiamondNode}>
  <Mermaid code={code} />
</MermaidProvider>
```

**Implementation:**

```tsx
// src/provider.tsx
/** @jsxImportSource @semajsx/dom */
import { context, Context } from "@semajsx/core";
import type { Component, ComponentAPI, JSXNode } from "@semajsx/core";
import { inject } from "@semajsx/style";
import { lightTheme, darkTheme } from "./themes";

// ── Contexts ───────────────────────────────────────────

/** Renderer map: which component renders each element type */
export interface RendererMap {
  node: Component<NodeRenderProps>;
  edge: Component<EdgeRenderProps>;
  subgraph: Component<SubgraphRenderProps>;
  label: Component<LabelRenderProps>;
  // Shape-specific overrides
  "node:rect"?: Component<NodeRenderProps>;
  "node:round"?: Component<NodeRenderProps>;
  "node:rhombus"?: Component<NodeRenderProps>;
  "node:circle"?: Component<NodeRenderProps>;
  "node:stadium"?: Component<NodeRenderProps>;
  "node:hexagon"?: Component<NodeRenderProps>;
  "node:cylinder"?: Component<NodeRenderProps>;
  // Edge-type-specific overrides
  "edge:arrow"?: Component<EdgeRenderProps>;
  "edge:dotted"?: Component<EdgeRenderProps>;
  "edge:thick"?: Component<EdgeRenderProps>;
  // Sequence diagram
  participant?: Component<ParticipantRenderProps>;
  message?: Component<MessageRenderProps>;
  lifeline?: Component<LifelineRenderProps>;
  activation?: Component<ActivationRenderProps>;
  block?: Component<BlockRenderProps>;
  note?: Component<NoteRenderProps>;
}

export const MermaidRenderers = context<RendererMap>("mermaid-renderers");
export const MermaidLayout = context<LayoutEngine>("mermaid-layout");

// ── Provider ───────────────────────────────────────────

interface MermaidProviderProps extends Partial<RendererMap> {
  children?: JSXNode;
  /** Theme preset: "light" (default) or "dark" */
  theme?: "light" | "dark";
  /** Custom layout engine (overrides built-in Sugiyama/column layout) */
  layout?: LayoutEngine;
}

function MermaidProvider(props: MermaidProviderProps, ctx: ComponentAPI): JSXNode {
  const { children, theme = "light", layout, ...rendererOverrides } = props;

  // Inject theme CSS (deduped — safe to call multiple times)
  inject(lightTheme);
  if (theme === "dark") inject(darkTheme);

  // Merge user overrides with defaults
  const renderers: RendererMap = {
    ...defaultRenderers,
    ...rendererOverrides,
  };

  // Build Context providers
  const contexts: [symbol, unknown][] = [[MermaidRenderers, renderers]];
  if (layout) contexts.push([MermaidLayout, layout]);

  return (
    <Context provide={contexts}>
      <div class={theme === "dark" ? darkTheme : undefined}>{children}</div>
    </Context>
  );
}
```

**Resolver in components (uses context, not props):**

```tsx
function resolveNodeRenderer(shape: NodeShape, ctx: ComponentAPI): Component<NodeRenderProps> {
  const renderers = ctx.inject(MermaidRenderers) ?? defaultRenderers;
  // Specific shape override → generic node → built-in default
  return renderers[`node:${shape}`] ?? renderers.node;
}
```

**Nested overrides compose naturally with Context:**

```tsx
// Inner provider overrides only rhombus, outer provides everything else
<MermaidProvider node={RoundedNode}>
  <Mermaid code={diagram1} />

  <MermaidProvider "node:rhombus"={SpecialDiamond}>
    <Mermaid code={diagram2} />
  </MermaidProvider>
</MermaidProvider>
```

### 4.4 Theme — Compose with `@semajsx/style`, not Parallel

**Tokens follow the exact same pattern as `@semajsx/ui`:**

```tsx
// src/tokens.ts
import { defineTokens } from "@semajsx/style";

const tokenDefinition = {
  // Node
  nodeFill: "#e8f4f8",
  nodeStroke: "#23395d",
  nodeText: "#1d1d1f",
  nodeRadius: "8",

  // Edge
  edgeStroke: "#666",
  edgeWidth: "2",
  edgeLabelBg: "#fff",
  edgeLabelText: "#333",

  // Arrow
  arrowFill: "#666",

  // Animation
  animatedDashArray: "5, 5",
  animatedDuration: "0.5s",
  animatedDashOffset: "-10",

  // Subgraph
  subgraphFill: "#f8f9fa",
  subgraphStroke: "#ccc",
  subgraphTitleBg: "#eee",
  subgraphTitleText: "#333",

  // Sequence
  actorFill: "#e8f4f8",
  actorStroke: "#23395d",
  lifelineStroke: "#999",
  activationFill: "#d4e6f1",
  messageStroke: "#333",
  blockFill: "rgba(200,200,200,0.1)",
  blockStroke: "#aaa",

  // General
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  fontSize: "14",
} as const;

export const tokens = defineTokens(tokenDefinition);
// tokens.nodeFill.toString() === "var(--nodeFill)"
// Used in rule`` templates to get automatic CSS custom property binding
```

**Themes use `createTheme()` — identical to `@semajsx/ui`:**

```tsx
// src/themes.ts
import { createTheme } from "@semajsx/style";
import { tokens } from "./tokens";

export const lightTheme = createTheme(tokens);

export const darkTheme = createTheme(tokens, {
  nodeFill: "#2d3748",
  nodeStroke: "#63b3ed",
  nodeText: "#e2e8f0",
  edgeStroke: "#a0aec0",
  edgeLabelBg: "#1a202c",
  edgeLabelText: "#e2e8f0",
  arrowFill: "#a0aec0",
  subgraphFill: "#1a202c",
  subgraphStroke: "#4a5568",
  subgraphTitleBg: "#2d3748",
  subgraphTitleText: "#e2e8f0",
  actorFill: "#2d3748",
  actorStroke: "#63b3ed",
  lifelineStroke: "#4a5568",
  activationFill: "#2d3748",
  messageStroke: "#a0aec0",
  blockFill: "rgba(100,100,100,0.15)",
  blockStroke: "#4a5568",
});
```

**Apply theme — all handled by `MermaidProvider`:**

```tsx
// Theme injection is centralized in MermaidProvider (see 4.3).
// Users don't need to call inject() manually.

// Default (light theme)
<MermaidProvider>
  <Mermaid code={code} />
</MermaidProvider>

// Dark theme
<MermaidProvider theme="dark">
  <Mermaid code={code} />
</MermaidProvider>
```

**Or skip MermaidProvider entirely — just use `@semajsx/ui`'s ThemeProvider + inject:**

```tsx
import { ThemeProvider } from "@semajsx/ui";
import { inject } from "@semajsx/style";
import { lightTheme } from "@semajsx/mermaid";

// Mermaid tokens are independent CSS vars — they just work alongside UI tokens
inject(lightTheme);

<ThemeProvider theme="dark">
  <Mermaid code={code} />
</ThemeProvider>;
```

### 4.5 Styles — `classes()` + `rule` for SVG

SVG elements support CSS class selectors. We use the same pattern as `@semajsx/ui`'s Button.

> **Note**: SVG uses unitless values for most properties (`stroke-width: 2`, not `2px`). The `rx` attribute is set on SVG elements directly as an attribute (not via CSS) for browser compatibility.

```tsx
// src/root.style.ts
import { classes, rule } from "@semajsx/style";

const c = classes(["svgRoot"] as const);

export const svgRoot = rule`${c.svgRoot} {
  width: 100%;
  height: auto;
  font-family: inherit;
}`;

export { c };
```

```tsx
// src/node.style.ts
import { classes, rule } from "@semajsx/style";
import { tokens } from "./tokens";

const c = classes([
  "node",
  "nodeShape",
  "nodeRect",
  "nodeRound",
  "nodeCircle",
  "nodeRhombus",
  "nodeHexagon",
  "nodeCylinder",
  "nodeStadium",
  "nodeLabel",
] as const);

// ── Base shape ─────────────────────────────────────
export const nodeShape = rule`${c.nodeShape} {
  fill: ${tokens.nodeFill};
  stroke: ${tokens.nodeStroke};
  stroke-width: ${tokens.edgeWidth};
}`;

export const nodeShapeHover = rule`${c.nodeShape}:hover {
  filter: brightness(0.95);
  cursor: pointer;
}`;

// ── Text ───────────────────────────────────────────
export const nodeLabel = rule`${c.nodeLabel} {
  fill: ${tokens.nodeText};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize}px;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`;

export { c };
```

```tsx
// src/edge.style.ts
import { classes, rule } from "@semajsx/style";
import { tokens } from "./tokens";

const c = classes([
  "edgeLine",
  "edgeArrow",
  "edgeDotted",
  "edgeThick",
  "edgeAnimated",
  "edgeLabel",
  "edgeLabelBg",
  "arrowHead",
] as const);

export const edgeLine = rule`${c.edgeLine} {
  fill: none;
  stroke: ${tokens.edgeStroke};
  stroke-width: ${tokens.edgeWidth};
}`;

export const edgeDotted = rule`${c.edgeDotted} ${c.edgeLine} {
  stroke-dasharray: 6, 4;
}`;

export const edgeAnimated = rule`
${c.edgeAnimated} ${c.edgeLine} {
  stroke-dasharray: ${tokens.animatedDashArray};
  animation: mmd-dash-flow ${tokens.animatedDuration} linear infinite;
}

@keyframes mmd-dash-flow {
  to {
    stroke-dashoffset: ${tokens.animatedDashOffset};
  }
}
`;

export const edgeThick = rule`${c.edgeThick} ${c.edgeLine} {
  stroke-width: 3;
}`;

export const edgeLabel = rule`${c.edgeLabel} {
  fill: ${tokens.edgeLabelText};
  font-family: ${tokens.fontFamily};
  font-size: 12px;
  text-anchor: middle;
  dominant-baseline: central;
}`;

export const edgeLabelBg = rule`${c.edgeLabelBg} {
  fill: ${tokens.edgeLabelBg};
  stroke: none;
}`;

export const arrowHead = rule`${c.arrowHead} {
  fill: ${tokens.arrowFill};
  stroke: none;
}`;

export { c };
```

**Theme switching is automatic:** When tokens change (via `createTheme()` dark override), all SVG elements update via CSS custom property cascade. No re-render, no re-layout — just CSS.

### 4.6 Signal Reactivity — Deep, Not Just `code`

**Level 1: Code string as signal (basic)**

```tsx
const code = signal(`graph TD; A-->B`);
<Mermaid code={code} />;
// code.value = `graph TD; A-->B-->C`;  // full re-parse + re-render
```

**Level 2: Graph IR as signal (efficient)**

```tsx
const graph = signal<FlowchartDiagram>({
  direction: "TD",
  nodes: [
    { id: "A", label: "Start", shape: "rect" },
    { id: "B", label: "End", shape: "round" },
  ],
  edges: [{ source: "A", target: "B", type: "arrow" }],
});

<Flowchart graph={graph} />;

// Add a node — only re-layouts, no re-parse
graph.update((g) => ({
  ...g,
  nodes: [...g.nodes, { id: "C", label: "New", shape: "circle" }],
  edges: [...g.edges, { source: "B", target: "C", type: "arrow" }],
}));
```

**Level 3: Computed layout (derived)**

```tsx
// Inside <Flowchart>, layout is a computed value
function Flowchart(props: FlowchartProps, ctx: ComponentAPI): JSXNode {
  const graphSignal = isSignal(props.graph)
    ? props.graph
    : signal(props.graph);

  const positioned = computed([graphSignal], (g) => flowchartLayout(g));

  // SVG re-renders when positioned changes
  return (
    <svg class={[svgRoot, props.class]} viewBox={positioned.viewBox}>
      {positioned.nodes.map((n) => /* ... */)}
      {positioned.edges.map((e) => /* ... */)}
    </svg>
  );
}
```

This is standard SemaJSX `computed()` — no special machinery.

---

## 5. Layout System

### 5.1 Design: Same Pattern as Terminal's Yoga

`@semajsx/terminal` uses Yoga to compute positions, then renders to a text buffer. Mermaid follows the identical pattern:

```
@semajsx/terminal                    @semajsx/mermaid
─────────────────                    ────────────────
VNode tree                           Diagram IR
    │                                    │
    ▼                                    ▼
Yoga.calculateLayout()               flowchartLayout() / sequenceLayout()
    │                                    │
    ▼                                    ▼
TerminalNode with x, y, w, h        PositionedNode/Edge with x, y, w, h
    │                                    │
    ▼                                    ▼
writeAt(x, y, text)                  <rect x={} y={} /> <path d={} />
(ANSI buffer)                        (SVG elements)
```

Layout is a **pure function**: IR in, positioned coordinates out. No DOM dependency, no side effects.

### 5.2 Layout Engine Interface

Layout is pluggable via Context (provided through `MermaidProvider`), same as renderers:

```typescript
interface LayoutEngine {
  flowchart(diagram: FlowchartDiagram, options?: LayoutOptions): FlowchartLayout;
  sequence(diagram: SequenceDiagram, options?: LayoutOptions): SequenceLayout;
}

interface LayoutOptions {
  /** Horizontal spacing between nodes (default: 60) */
  nodeSpacing: number;
  /** Vertical spacing between layers/ranks (default: 80) */
  rankSpacing: number;
  /** Default node width — overridden by measureText if provided (default: 150) */
  nodeWidth: number;
  /** Default node height (default: 50) */
  nodeHeight: number;
  /** Padding inside nodes around text (default: 16) */
  nodePadding: number;
  /** Padding around entire diagram (default: 20) */
  diagramPadding: number;
  /** Edge routing strategy (default: "bezier") */
  edgeRouting: "polyline" | "bezier";
  /** Custom text measurement function */
  measureText?: (text: string, fontSize: number) => { width: number; height: number };
}
```

Usage:

```tsx
// Default layout (built-in)
<MermaidProvider>
  <Mermaid code={code} />
</MermaidProvider>;

// Custom layout engine via provider
import { dagreLayout } from "@semajsx/mermaid/layout-dagre"; // optional

<MermaidProvider layout={dagreLayout}>
  <Mermaid code={code} />
</MermaidProvider>;
```

### 5.3 Built-in Flowchart Layout (Simplified Sugiyama)

Self-contained, ~400 lines, no external dependencies. Handles ~80% of real-world flowcharts.

**Algorithm — 5 phases:**

```
Phase 1: Cycle Removal
    Input:  nodes[], edges[]
    Output: edges[] with back-edges reversed
    Method: DFS, mark visited/in-stack, reverse back-edges

Phase 2: Layer Assignment
    Input:  DAG (acyclic after phase 1)
    Output: nodes[] with layer numbers
    Method: Longest-path from sources (BFS)
            Subgraph nodes constrained to same range

Phase 3: Node Ordering Within Layers
    Input:  layered nodes
    Output: nodes ordered within each layer (minimized crossings)
    Method: Barycenter heuristic, 2 passes (down then up)
            For each node, compute average position of neighbors in adjacent layer
            Sort layer by barycenter values

Phase 4: Coordinate Assignment
    Input:  ordered layers
    Output: x, y for each node
    Method: Simple fixed-grid:
            - TB/TD: x = column × (nodeWidth + nodeSpacing)
                     y = layer × (nodeHeight + rankSpacing)
            - LR:    swap x/y axes
            - Center each layer relative to widest layer

Phase 5: Edge Routing
    Input:  positioned nodes, edgeRouting option
    Output: path data for each edge
    Method:
      polyline: Source center → control points → target center
                Edges spanning multiple layers get intermediate points
                Avoids node overlap with simple offset
      bezier:   Cubic Bézier curves (C command)
                Control points offset perpendicular to source/target direction
                TB/TD: horizontal tangents at endpoints
                LR:    vertical tangents at endpoints
                Multi-layer edges use intermediate waypoints with smooth joins
```

**Bezier edge routing (default):**

```
TB/TD direction:
  Source bottom center → Target top center
  Control points extend vertically:

    M sx sy                        ← source point
    C sx (sy + offset)             ← control point 1 (below source)
      tx (ty - offset)             ← control point 2 (above target)
      tx ty                        ← target point

  offset = |ty - sy| × 0.4        ← 40% of vertical distance

LR direction:
  Same logic, rotated 90° (control points extend horizontally)
```

**Example walkthrough:**

```
Input: graph TD; A-->B; A-->C; B-->D; C-->D

Phase 1: No cycles
Phase 2: Layer 0=[A], Layer 1=[B,C], Layer 2=[D]
Phase 3: B before C (barycenter of A=0 for both, keep original order)
Phase 4: (TD, nodeW=150, nodeH=50, nodeSpacing=60, rankSpacing=80)
         A:  x=105, y=45    (centered over B,C)
         B:  x=75,  y=175
         C:  x=285, y=175
         D:  x=105, y=305   (centered over B,C)
Phase 5: (bezier)
         A→B: M 105 70 C 105 112 75 133 75 150
         A→C: M 105 70 C 105 112 285 133 285 150
         B→D: M 75 200 C 75 242 105 263 105 280
         C→D: M 285 200 C 285 242 105 263 105 280
```

**Subgraph handling:**

```
1. Collect nodes belonging to each subgraph
2. After coordinate assignment, compute bounding box around subgraph's nodes
3. Add padding around bounding box
4. If subgraph has own direction, apply sub-layout to contained nodes
```

### 5.4 Built-in Sequence Layout (Column-Based)

Simpler than flowchart — deterministic positioning, no graph theory needed.

```
Phase 1: Column Assignment
    Each participant → column index
    x = index × participantSpacing

Phase 2: Row Assignment
    Each message → row index (order of appearance)
    y = headerHeight + index × messageSpacing

Phase 3: Activation Tracking
    Per-participant stack: track activate/deactivate
    Activation rect: x = participant.x - halfWidth
                     y = activate message y
                     height = deactivate message y - activate message y

Phase 4: Block Layout
    loop/alt/opt/par blocks:
    x = min(involved participant x) - padding
    y = first message y - padding
    width = max(involved participant x) - min + padding*2
    height = last message y - first message y + padding*2
    Nested blocks: indent by nesting level
```

**Example:**

```
Input: sequenceDiagram; A->>B: Hello; B-->>A: Hi

Participants: A at x=100, B at x=300
Messages:
  "Hello": y=120, line from x=100 to x=300, solid arrow
  "Hi":    y=170, line from x=300 to x=100, dotted arrow
```

### 5.5 Text Measurement

The hardest sub-problem. Node width depends on label text, which depends on font metrics.

**Three strategies (choose via `layoutOptions.measureText`):**

| Strategy                       | Accuracy | Dependency         | When to Use          |
| ------------------------------ | -------- | ------------------ | -------------------- |
| Character estimation (default) | ~85%     | None               | SSR, quick preview   |
| Canvas measureText             | ~99%     | Browser Canvas API | Client-side          |
| User-provided function         | 100%     | User's choice      | Custom fonts, server |

**Default: Character estimation**

```typescript
function estimateTextSize(text: string, fontSize: number): { width: number; height: number } {
  // Average character width ≈ 0.6 × fontSize for proportional fonts
  const avgCharWidth = fontSize * 0.6;
  const width = text.length * avgCharWidth;
  const height = fontSize * 1.4; // line height
  return { width, height };
}
```

Node dimensions computed from text:

```typescript
function computeNodeSize(
  node: FlowNode,
  options: LayoutOptions,
): { width: number; height: number } {
  const measure = options.measureText ?? estimateTextSize;
  const textSize = measure(node.label, 14); // 14px default font size
  return {
    width: Math.max(textSize.width + options.nodePadding * 2, options.nodeWidth),
    height: Math.max(textSize.height + options.nodePadding * 2, options.nodeHeight),
  };
}
```

**Canvas measurement (optional):**

```typescript
import { canvasMeasure } from "@semajsx/mermaid/measure";

<MermaidProvider layoutOptions={{ measureText: canvasMeasure }}>
  <Mermaid code={code} />
</MermaidProvider>
```

### 5.6 Layout Alternatives

| Approach                   | Bundle Size | Quality               | Dependency |
| -------------------------- | ----------- | --------------------- | ---------- |
| Built-in Sugiyama (chosen) | ~3KB        | Good (80% of cases)   | None       |
| dagre (@dagrejs/dagre)     | ~30KB       | Excellent             | External   |
| ELK (elkjs)                | ~200KB      | Best (complex graphs) | External   |

**Decision**: Ship built-in as default, expose `LayoutEngine` interface so dagre/ELK can be plugged in via Context without changing any component code. Future: optional `@semajsx/mermaid/layout-dagre` entry point.

---

## 6. Rendering Format: SVG

### 6.1 Why SVG

| Format              | CSS Styling                      | Events                         | Scalable         | Accessible       | SemaJSX Integration   |
| ------------------- | -------------------------------- | ------------------------------ | ---------------- | ---------------- | --------------------- |
| **SVG**             | Yes (`classes()` + `rule` works) | Yes (click, hover per element) | Yes (vector)     | Yes (aria, role) | Full (JSX components) |
| Canvas              | No                               | Manual hit-testing             | Re-render needed | No               | Poor                  |
| HTML + absolute pos | Partial                          | Yes                            | CSS transforms   | Yes              | Partial               |

SVG is the only format where our `classes()` + `rule` + `tokens` pattern works natively. SVG elements accept CSS class attributes and respond to CSS custom properties.

### 6.2 SVG Structure — Flowchart

```svg
<svg class="mmd-root" viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg">

  <!-- Shared definitions: arrowheads, filters -->
  <defs>
    <marker id="mmd-arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="8" markerHeight="8" orient="auto-start-reverse"
            class="mmd-arrowHead">
      <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>
    <marker id="mmd-dot" viewBox="0 0 10 10" refX="5" refY="5"
            markerWidth="6" markerHeight="6" class="mmd-arrowDot">
      <circle cx="5" cy="5" r="4" />
    </marker>
  </defs>

  <!-- Layer 1: Subgraphs (background) -->
  <g class="mmd-subgraphs">
    <g class="mmd-subgraph" transform="translate(10, 10)">
      <rect class="mmd-subgraphBg" width="380" height="200" rx="8" />
      <text class="mmd-subgraphTitle" x="16" y="24">Backend</text>
    </g>
  </g>

  <!-- Layer 2: Edges (middle) -->
  <g class="mmd-edges">
    <g class="mmd-edge mmd-edgeArrow">
      <path class="mmd-edgeLine"
            d="M 200 70 C 200 112 200 138 200 150"
            marker-end="url(#mmd-arrow)" />
    </g>
    <g class="mmd-edge mmd-edgeDotted">
      <path class="mmd-edgeLine mmd-edgeDotted"
            d="M 100 200 C 140 200 260 200 300 200"
            marker-end="url(#mmd-arrow)" />
      <!-- Edge label -->
      <rect class="mmd-edgeLabelBg" x="170" y="188" width="60" height="20" rx="4" />
      <text class="mmd-edgeLabel" x="200" y="202">Yes</text>
    </g>
  </g>

  <!-- Layer 3: Nodes (foreground) -->
  <g class="mmd-nodes">

    <!-- Rect node — positioned with translate, shape in local coords -->
    <g class="mmd-node" transform="translate(200, 45)">
      <rect class="mmd-nodeShape mmd-nodeRect"
            x="-75" y="-25" width="150" height="50" rx="8" />
      <text class="mmd-nodeLabel" x="0" y="0">Client</text>
    </g>

    <!-- Rhombus node -->
    <g class="mmd-node" transform="translate(200, 175)">
      <polygon class="mmd-nodeShape mmd-nodeRhombus"
               points="0,-35 75,0 0,35 -75,0" />
      <text class="mmd-nodeLabel" x="0" y="0">Decision?</text>
    </g>

    <!-- Circle node -->
    <g class="mmd-node" transform="translate(100, 305)">
      <circle class="mmd-nodeShape mmd-nodeCircle" cx="0" cy="0" r="30" />
      <text class="mmd-nodeLabel" x="0" y="0">End</text>
    </g>

  </g>
</svg>
```

**Key structural decisions:**

| Decision          | Choice                               | Why                                                                                           |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Positioning       | `<g transform="translate(x,y)">`     | Local coordinates — custom renderers don't need offset math                                   |
| Arrowheads        | SVG `<marker>` in `<defs>`           | Efficient, CSS-styleable, auto-rotates with path direction                                    |
| Labels            | `<text>` with `text-anchor="middle"` | Simple, CSS-styleable. Future: `<foreignObject>` for HTML                                     |
| Layer order       | Subgraphs → Edges → Nodes            | Nodes always on top of edges, subgraphs are backgrounds                                       |
| Coordinate system | Center-origin per node               | `(0,0)` is node center. Rect: `x=-w/2, y=-h/2`. Circle: `cx=0, cy=0`. Simplest for all shapes |
| Node `rx`         | SVG attribute, not CSS               | SVG2 allows CSS `rx` but older browsers require the attribute. Set on element directly        |

### 6.3 SVG Structure — Sequence Diagram

```svg
<svg class="mmd-root" viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg">
  <defs><!-- same markers --></defs>

  <!-- Layer 1: Lifelines (dashed vertical lines, full height) -->
  <g class="mmd-lifelines">
    <line class="mmd-lifeline" x1="100" y1="70" x2="100" y2="320" />
    <line class="mmd-lifeline" x1="350" y1="70" x2="350" y2="320" />
  </g>

  <!-- Layer 2: Blocks (loop, alt, etc.) -->
  <g class="mmd-blocks">
    <g class="mmd-block mmd-blockLoop">
      <rect class="mmd-blockBg" x="60" y="180" width="330" height="100" rx="4" />
      <rect class="mmd-blockLabel" x="60" y="180" width="50" height="20" rx="4" />
      <text class="mmd-blockLabelText" x="65" y="194">loop</text>
    </g>
  </g>

  <!-- Layer 3: Activations (narrow rects on lifelines) -->
  <g class="mmd-activations">
    <rect class="mmd-activation" x="93" y="110" width="14" height="60" />
  </g>

  <!-- Layer 4: Notes -->
  <g class="mmd-notes">
    <g class="mmd-note" transform="translate(100, 250)">
      <rect class="mmd-noteBg" x="-60" y="-20" width="120" height="40" rx="4" />
      <text class="mmd-noteText" x="0" y="0">Important</text>
    </g>
  </g>

  <!-- Layer 5: Messages (horizontal arrows between lifelines) -->
  <g class="mmd-messages">
    <g class="mmd-message">
      <line class="mmd-messageLine"
            x1="100" y1="120" x2="350" y2="120"
            marker-end="url(#mmd-arrow)" />
      <text class="mmd-messageText" x="225" y="112">Hello</text>
    </g>
    <g class="mmd-message mmd-messageDotted">
      <line class="mmd-messageLine mmd-messageDotted"
            x1="350" y1="155" x2="100" y2="155"
            marker-end="url(#mmd-arrow)" />
      <text class="mmd-messageText" x="225" y="147">Hi back</text>
    </g>
  </g>

  <!-- Layer 6: Participants (top, rendered last = on top) -->
  <g class="mmd-participants">
    <g class="mmd-participant" transform="translate(100, 35)">
      <rect class="mmd-participantBox" x="-50" y="-25" width="100" height="50" rx="6" />
      <text class="mmd-participantLabel" x="0" y="0">Alice</text>
    </g>
    <g class="mmd-participant" transform="translate(350, 35)">
      <rect class="mmd-participantBox" x="-50" y="-25" width="100" height="50" rx="6" />
      <text class="mmd-participantLabel" x="0" y="0">Bob</text>
    </g>
  </g>
</svg>
```

### 6.4 Node Shape Rendering

Each shape is a component that renders SVG in local coordinates (center at 0,0):

```tsx
// src/components/nodes/rect.tsx
/** @jsxImportSource @semajsx/dom */
import * as styles from "../../node.style";
import type { NodeRenderProps } from "../../types";

export function RectNode(props: NodeRenderProps): JSXNode {
  const { node, x, y, width, height } = props.positioned;
  return (
    <g class={[styles.c.node, props.class]} transform={`translate(${x}, ${y})`}>
      <rect
        class={[styles.nodeShape, styles.nodeShapeHover]}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
      />
      <text class={styles.nodeLabel}>{node.label}</text>
    </g>
  );
}

// src/components/nodes/rhombus.tsx
export function RhombusNode(props: NodeRenderProps): JSXNode {
  const { node, x, y, width, height } = props.positioned;
  const hw = width / 2,
    hh = height / 2;
  return (
    <g class={[styles.c.node, props.class]} transform={`translate(${x}, ${y})`}>
      <polygon
        class={[styles.nodeShape, styles.nodeShapeHover]}
        points={`0,${-hh} ${hw},0 0,${hh} ${-hw},0`}
      />
      <text class={styles.nodeLabel}>{node.label}</text>
    </g>
  );
}

// src/components/nodes/circle.tsx
export function CircleNode(props: NodeRenderProps): JSXNode {
  const { node, x, y, width } = props.positioned;
  return (
    <g class={[styles.c.node, props.class]} transform={`translate(${x}, ${y})`}>
      <circle class={[styles.nodeShape, styles.nodeShapeHover]} r={width / 2} />
      <text class={styles.nodeLabel}>{node.label}</text>
    </g>
  );
}

// src/components/nodes/cylinder.tsx
export function CylinderNode(props: NodeRenderProps): JSXNode {
  const { node, x, y, width, height } = props.positioned;
  const hw = width / 2,
    hh = height / 2;
  const ry = 8; // ellipse radius for cylinder cap
  return (
    <g class={[styles.c.node, props.class]} transform={`translate(${x}, ${y})`}>
      <path
        class={[styles.nodeShape, styles.nodeShapeHover]}
        d={`M ${-hw} ${-hh + ry}
            A ${hw} ${ry} 0 0 1 ${hw} ${-hh + ry}
            L ${hw} ${hh - ry}
            A ${hw} ${ry} 0 0 1 ${-hw} ${hh - ry}
            Z`}
      />
      <ellipse class={styles.nodeShape} cx={0} cy={-hh + ry} rx={hw} ry={ry} />
      <text class={styles.nodeLabel} y={ry / 2}>
        {node.label}
      </text>
    </g>
  );
}
```

**Shape registry maps NodeShape → Component:**

```typescript
// src/components/nodes/index.ts
const shapeMap: Record<NodeShape, Component<NodeRenderProps>> = {
  rect: RectNode,
  round: RoundNode,
  stadium: StadiumNode,
  circle: CircleNode,
  rhombus: RhombusNode,
  hexagon: HexagonNode,
  cylinder: CylinderNode,
  subroutine: SubroutineNode,
  asymmetric: AsymmetricNode,
  parallelogram: ParallelogramNode,
  trapezoid: TrapezoidNode,
  "double-circle": DoubleCircleNode,
};
```

### 6.5 Edge Rendering

```tsx
// src/components/edge.tsx
/** @jsxImportSource @semajsx/dom */
import * as styles from "../edge.style";
import type { EdgeRenderProps } from "../types";

export function Edge(props: EdgeRenderProps): JSXNode {
  const { edge, path, labelPosition, labelSize } = props.positioned;

  const edgeTypeClass = {
    arrow: styles.c.edgeArrow,
    dotted: styles.c.edgeDotted,
    thick: styles.c.edgeThick,
    animated: styles.c.edgeAnimated,
    open: null,
    invisible: null,
  }[edge.type];

  const markerId =
    edge.type === "open" || edge.type === "invisible" ? undefined : "url(#mmd-arrow)";

  return (
    <g class={[edgeTypeClass, props.class]}>
      <path class={styles.edgeLine} d={path} marker-end={markerId} />
      {edge.label && labelPosition && labelSize && (
        <>
          <rect
            class={styles.edgeLabelBg}
            x={labelPosition.x - labelSize.width / 2 - 4}
            y={labelPosition.y - labelSize.height / 2 - 2}
            width={labelSize.width + 8}
            height={labelSize.height + 4}
            rx={4}
          />
          <text class={styles.edgeLabel} x={labelPosition.x} y={labelPosition.y}>
            {edge.label}
          </text>
        </>
      )}
    </g>
  );
}
```

### 6.6 Defs Component

```tsx
// src/components/defs.tsx
/** @jsxImportSource @semajsx/dom */
import * as edgeStyles from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
      <marker
        id="mmd-arrow"
        viewBox="0 0 10 10"
        refX={10}
        refY={5}
        markerWidth={8}
        markerHeight={8}
        orient="auto-start-reverse"
      >
        <path class={edgeStyles.arrowHead} d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker id="mmd-dot" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6}>
        <circle class={edgeStyles.arrowHead} cx={5} cy={5} r={4} />
      </marker>
    </defs>
  );
}
```

### 6.7 Subgraph Component

```tsx
// src/components/subgraph.tsx
/** @jsxImportSource @semajsx/dom */
import * as styles from "../subgraph.style";
import type { SubgraphRenderProps } from "../types";

export function SubgraphBox(props: SubgraphRenderProps): JSXNode {
  const { subgraph, x, y, width, height } = props.positioned;
  return (
    <g class={props.class} transform={`translate(${x}, ${y})`}>
      <rect class={styles.subgraphBg} width={width} height={height} rx={8} />
      <text class={styles.subgraphTitle} x={16} y={24}>
        {subgraph.label}
      </text>
    </g>
  );
}
```

### 6.8 Default Renderer Map

```tsx
// src/components/index.ts
import { shapeMap } from "./nodes";
import { Edge } from "./edge";
import { SubgraphBox } from "./subgraph";
import { Label } from "./label";
import { Participant } from "./sequence/participant";
import { Message } from "./sequence/message";
import { Lifeline } from "./sequence/lifeline";
import { Activation } from "./sequence/activation";
import { Block } from "./sequence/block";
import { Note } from "./sequence/note";
import type { RendererMap } from "../provider";

export const defaultRenderers: RendererMap = {
  node: shapeMap.rect,
  edge: Edge,
  subgraph: SubgraphBox,
  label: Label,
  participant: Participant,
  message: Message,
  lifeline: Lifeline,
  activation: Activation,
  block: Block,
  note: Note,
};
```

### 6.9 How `<Flowchart>` Assembles Everything

```tsx
// src/flowchart.tsx
/** @jsxImportSource @semajsx/dom */
import type { ComponentAPI, JSXNode } from "@semajsx/core";
import { isSignal, unwrap, computed } from "@semajsx/signal";
import * as rootStyles from "./root.style";
import { Defs } from "./components/defs";
import { shapeMap } from "./components/nodes";
import { Edge } from "./components/edge";
import { SubgraphBox } from "./components/subgraph";
import { builtinLayout } from "./layout";
import { MermaidLayout, MermaidRenderers } from "./provider";
import { defaultRenderers } from "./components";
import type { FlowchartDiagram, FlowchartProps } from "./types";

export function Flowchart(props: FlowchartProps, ctx: ComponentAPI): JSXNode {
  // Read layout engine from Context (or use built-in)
  const engine = ctx.inject(MermaidLayout) ?? builtinLayout;
  const renderers = ctx.inject(MermaidRenderers) ?? defaultRenderers;

  // Unwrap signal or use plain value
  const graphData = unwrap(props.graph);

  // Compute layout (pure function)
  const positioned = engine.flowchart(graphData);

  return (
    <svg
      class={[rootStyles.svgRoot, props.class]}
      viewBox={positioned.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Defs />

      {/* Layer 1: Subgraphs */}
      {positioned.subgraphs.map((s) => {
        const Comp = renderers.subgraph ?? SubgraphBox;
        return <Comp key={s.subgraph.id} positioned={s} />;
      })}

      {/* Layer 2: Edges */}
      {positioned.edges.map((e) => {
        const edgeKey = `${e.edge.source}-${e.edge.target}`;
        const Comp = renderers[`edge:${e.edge.type}`] ?? renderers.edge ?? Edge;
        return <Comp key={edgeKey} positioned={e} />;
      })}

      {/* Layer 3: Nodes */}
      {positioned.nodes.map((n) => {
        const Comp =
          renderers[`node:${n.node.shape}`] ??
          renderers.node ??
          shapeMap[n.node.shape] ??
          shapeMap.rect;
        return <Comp key={n.node.id} positioned={n} />;
      })}
    </svg>
  );
}
```

---

## 7. Animated Edges

### 7.1 Mechanism

Animated edges use CSS `stroke-dasharray` + `stroke-dashoffset` animation (same technique as xyflow). The animation is purely CSS — no JavaScript animation loop.

### 7.2 How to Trigger

Animated edges are a **programmatic-only** feature. The Mermaid DSL doesn't define an "animated" edge type. There are two ways to use them:

**Way 1: Programmatic IR (explicit type)**

```tsx
<Flowchart
  graph={{
    direction: "TD",
    nodes: [
      { id: "A", label: "Source", shape: "rect" },
      { id: "B", label: "Target", shape: "rect" },
    ],
    edges: [{ source: "A", target: "B", type: "animated" }],
  }}
/>
```

**Way 2: CSS class on any edge (more flexible)**

Any edge can be animated by adding the `edgeAnimated` class via a custom edge renderer:

```tsx
import * as styles from "@semajsx/mermaid/styles";

const AnimatedEdge = (props: EdgeRenderProps) => {
  // Delegate to default Edge but inject animated class
  return <Edge {...props} class={styles.c.edgeAnimated} />;
};

// Animate all arrow edges
<MermaidProvider "edge:arrow"={AnimatedEdge}>
  <Mermaid code={code} />
</MermaidProvider>
```

### 7.3 Customization via Tokens

Animation parameters are design tokens, customizable per theme:

| Token                | Default  | Effect               |
| -------------------- | -------- | -------------------- |
| `animatedDashArray`  | `"5, 5"` | Dash pattern density |
| `animatedDuration`   | `"0.5s"` | Flow speed           |
| `animatedDashOffset` | `"-10"`  | Per-frame offset     |

```tsx
// Slow, wide dashes
const slowTheme = createTheme(tokens, {
  animatedDashArray: "12, 8",
  animatedDuration: "1.5s",
  animatedDashOffset: "-20",
});
```

---

## 8. Diagram IR Types

```typescript
// ── Common ─────────────────────────────────────────────

type DiagramType = "flowchart" | "sequence";
type Direction = "TB" | "TD" | "BT" | "LR" | "RL";

// ── Flowchart ──────────────────────────────────────────

interface FlowchartDiagram {
  type: "flowchart";
  direction: Direction;
  nodes: FlowNode[];
  edges: FlowEdge[];
  subgraphs: Subgraph[];
}

type NodeShape =
  | "rect"
  | "round"
  | "stadium"
  | "subroutine"
  | "cylinder"
  | "circle"
  | "asymmetric"
  | "rhombus"
  | "hexagon"
  | "parallelogram"
  | "trapezoid"
  | "double-circle";

interface FlowNode {
  id: string;
  label: string;
  shape: NodeShape;
  class?: string;
  url?: string;
}

type EdgeType = "arrow" | "open" | "dotted" | "thick" | "invisible" | "animated";

interface FlowEdge {
  source: string;
  target: string;
  label?: string;
  type: EdgeType;
}

interface Subgraph {
  id: string;
  label: string;
  nodes: string[];
  direction?: Direction;
}

// ── Sequence ───────────────────────────────────────────

interface SequenceDiagram {
  type: "sequence";
  participants: Participant[];
  messages: Message[];
  blocks: Block[];
  notes: Note[];
}

interface Participant {
  id: string;
  label: string;
  type: "participant" | "actor";
}

type ArrowType = "solid" | "dotted" | "solidCross" | "dottedCross" | "solidOpen" | "dottedOpen";

interface Message {
  from: string;
  to: string;
  text: string;
  arrow: ArrowType;
  activate?: boolean;
  deactivate?: boolean;
}

type BlockType = "loop" | "alt" | "opt" | "par" | "critical" | "break";

interface Block {
  type: BlockType;
  label: string;
  messages: Message[];
  sections?: { label: string; messages: Message[] }[];
}

type NotePosition = "left of" | "right of" | "over";

interface Note {
  position: NotePosition;
  /** One participant for "left of"/"right of", one or two for "over" */
  participants: string[];
  text: string;
}

// ── Layout Output ──────────────────────────────────────

interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface PositionedNode {
  node: FlowNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PositionedEdge {
  edge: FlowEdge;
  /** SVG path data string (e.g. "M 0 0 C 10 20 30 40 50 60") */
  path: string;
  labelPosition?: Point;
  /** Measured label size — used by Edge component for background rect */
  labelSize?: Size;
}

interface PositionedSubgraph {
  subgraph: Subgraph;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlowchartLayout {
  width: number;
  height: number;
  viewBox: string;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  subgraphs: PositionedSubgraph[];
}
```

---

## 9. Component Props (Render Layer)

```typescript
// Props for renderable components (what custom renderers receive)

interface NodeRenderProps {
  positioned: PositionedNode;
  class?: ClassValue;
}

interface EdgeRenderProps {
  positioned: PositionedEdge;
  class?: ClassValue;
}

interface SubgraphRenderProps {
  positioned: PositionedSubgraph;
  children?: JSXNode;
  class?: ClassValue;
}

interface LabelRenderProps {
  text: string;
  x: number;
  y: number;
  class?: ClassValue;
}

// Sequence diagram render props
interface ParticipantRenderProps {
  participant: Participant;
  x: number;
  y: number;
  width: number;
  height: number;
  class?: ClassValue;
}

interface MessageRenderProps {
  message: Message;
  fromX: number;
  toX: number;
  y: number;
  class?: ClassValue;
}

interface NoteRenderProps {
  note: Note;
  x: number;
  y: number;
  width: number;
  height: number;
  class?: ClassValue;
}

interface LifelineRenderProps {
  participant: Participant;
  x: number;
  y1: number;
  y2: number;
  class?: ClassValue;
}

interface ActivationRenderProps {
  participant: Participant;
  x: number;
  y: number;
  width: number;
  height: number;
  class?: ClassValue;
}

interface BlockRenderProps {
  block: Block;
  x: number;
  y: number;
  width: number;
  height: number;
  class?: ClassValue;
}
```

No `theme` prop — components read tokens through CSS custom properties (set by `inject()`), exactly like `@semajsx/ui` components.

---

## 10. Usage Examples

### Basic

```tsx
/** @jsxImportSource @semajsx/dom */
import { Mermaid, MermaidProvider } from "@semajsx/mermaid";

const App = () => (
  <MermaidProvider>
    <Mermaid
      code={`
      graph TD
        A[Client] --> B[Load Balancer]
        B --> C[Server 1]
        B --> D[Server 2]
    `}
    />
  </MermaidProvider>
);
```

### Dark Theme (compose with `@semajsx/ui`)

```tsx
import { ThemeProvider } from "@semajsx/ui";
import { MermaidProvider } from "@semajsx/mermaid";

<ThemeProvider theme="dark">
  <MermaidProvider theme="dark">
    <Mermaid code={code} />
  </MermaidProvider>
</ThemeProvider>;
```

### Custom Node via Context

```tsx
import { MermaidProvider } from "@semajsx/mermaid";
import type { NodeRenderProps } from "@semajsx/mermaid";
import * as styles from "@semajsx/mermaid/styles";

const GlowNode = (props: NodeRenderProps) => {
  const { node, x, y, width, height } = props.positioned;
  return (
    <g class={[styles.c.node, props.class]} transform={`translate(${x}, ${y})`}>
      <rect
        class={[styles.nodeShape, styles.nodeShapeHover]}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={8}
        filter="url(#glow)"
      />
      <text class={styles.nodeLabel} x={0} y={0}>
        {node.label}
      </text>
    </g>
  );
};

// Context-based — wraps any number of <Mermaid> descendants
<MermaidProvider node={GlowNode}>
  <Mermaid code={code1} />
  <Mermaid code={code2} />
</MermaidProvider>;
```

### Override Only Rhombus (Nested Context)

```tsx
<MermaidProvider node={DefaultNode}>
  <Mermaid code={flowchart1} />

  <MermaidProvider "node:rhombus"={FancyDiamond}>
    <Mermaid code={flowchart2} />
  </MermaidProvider>
</MermaidProvider>
```

### Reactive Diagram

```tsx
import { signal, computed } from "@semajsx/signal";
import { Flowchart } from "@semajsx/mermaid";

const nodes = signal([
  { id: "A", label: "Start", shape: "rect" as const },
  { id: "B", label: "End", shape: "round" as const },
]);

const graph = computed([nodes], (n) => ({
  type: "flowchart" as const,
  direction: "TD" as const,
  nodes: n,
  edges: [{ source: "A", target: "B", type: "arrow" as const }],
  subgraphs: [],
}));

const App = () => (
  <div>
    <Flowchart graph={graph} />
    <button
      onClick={() => {
        nodes.update((n) => [...n, { id: "C", label: "New", shape: "circle" as const }]);
      }}
    >
      Add Node
    </button>
  </div>
);
```

### Animated Edges

```tsx
import { Flowchart } from "@semajsx/mermaid";

<Flowchart
  graph={{
    direction: "LR",
    nodes: [
      { id: "src", label: "Source", shape: "rect" },
      { id: "dst", label: "Destination", shape: "rect" },
    ],
    edges: [{ source: "src", target: "dst", type: "animated", label: "streaming" }],
    subgraphs: [],
  }}
/>;
```

### Standalone `parse()` (data only)

```tsx
import { parse } from "@semajsx/mermaid";

const result = parse(`graph TD; A-->B{Decision}-->C`);

if ("message" in result) {
  console.error(result); // ParseError
} else {
  console.log(result.nodes); // [{id: "A", ...}, {id: "B", shape: "rhombus", ...}, ...]
  console.log(result.edges); // [{source: "A", target: "B", type: "arrow"}, ...]
}
```

---

## 11. Package Structure

```
packages/mermaid/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                # Public exports
│   ├── types.ts                # All IR + render prop types
│   │
│   ├── tokens.ts               # defineTokens() — design tokens
│   ├── themes.ts               # createTheme() — light + dark
│   │
│   ├── provider.tsx            # MermaidProvider (Context + inject)
│   ├── mermaid.tsx             # <Mermaid> convenience component
│   ├── flowchart.tsx           # <Flowchart> layout + render
│   ├── sequence.tsx            # <Sequence> layout + render
│   │
│   ├── root.style.ts           # classes() + rule for root SVG
│   ├── node.style.ts           # classes() + rule for nodes
│   ├── edge.style.ts           # classes() + rule for edges
│   ├── subgraph.style.ts       # classes() + rule for subgraphs
│   ├── sequence.style.ts       # classes() + rule for sequence elements
│   │
│   ├── components/
│   │   ├── nodes/
│   │   │   ├── rect.tsx
│   │   │   ├── round.tsx
│   │   │   ├── circle.tsx
│   │   │   ├── rhombus.tsx
│   │   │   ├── hexagon.tsx
│   │   │   ├── cylinder.tsx
│   │   │   ├── stadium.tsx
│   │   │   └── index.ts        # shapeMap + defaultNodeRenderers
│   │   ├── edge.tsx
│   │   ├── defs.tsx            # SVG <defs> (arrowheads, filters)
│   │   ├── label.tsx
│   │   ├── subgraph.tsx
│   │   ├── sequence/
│   │   │   ├── participant.tsx
│   │   │   ├── lifeline.tsx
│   │   │   ├── message.tsx
│   │   │   ├── activation.tsx
│   │   │   ├── block.tsx
│   │   │   ├── note.tsx
│   │   │   └── index.ts
│   │   └── index.ts            # defaultRenderers
│   │
│   ├── parser/
│   │   ├── tokenizer.ts
│   │   ├── tokenizer.test.ts
│   │   ├── flowchart.ts
│   │   ├── flowchart.test.ts
│   │   ├── sequence.ts
│   │   ├── sequence.test.ts
│   │   └── index.ts            # parse()
│   │
│   └── layout/
│       ├── flowchart.ts
│       ├── flowchart.test.ts
│       ├── sequence.ts
│       ├── sequence.test.ts
│       ├── edge-routing.ts     # polyline + bezier routing
│       ├── edge-routing.test.ts
│       └── index.ts
│
└── examples/
    ├── basic.tsx
    ├── themed.tsx
    ├── custom-nodes.tsx
    ├── animated.tsx
    └── reactive.tsx
```

---

## 12. How Each SemaJSX Pattern Maps

| SemaJSX Pattern         | How Mermaid Uses It                                              |
| ----------------------- | ---------------------------------------------------------------- |
| `defineTokens()`        | `tokens.ts` — all diagram visual values as CSS custom properties |
| `createTheme()`         | `themes.ts` — light/dark presets, users create custom themes     |
| `classes()` + `rule`    | `*.style.ts` — SVG element classes with token references         |
| `inject()`              | `provider.tsx` — injects theme CSS on mount                      |
| `context()`             | `MermaidRenderers` + `MermaidLayout` contexts                    |
| `ctx.inject()`          | Components read renderers: `ctx.inject(MermaidRenderers)`        |
| `<Context provide={}>`  | `<MermaidProvider>` wraps with renderer + layout + theme context |
| `computed()`            | Layout derived from graph signal                                 |
| `signal()` + `unwrap()` | Graph data can be signal or plain value                          |
| `class` prop            | All components accept `class` for user styling                   |
| Collocated tests        | `*.test.ts` next to source files                                 |

---

## 13. Alternatives Considered

### Override Props vs Context

| Criteria              | `overrides` prop (v1 design) | Context (v2, chosen)          |
| --------------------- | ---------------------------- | ----------------------------- |
| SemaJSX idiom         | No (React/MUI pattern)       | Yes (`ThemeProvider` pattern) |
| Nested composition    | Manual prop merging          | Automatic (Context cascade)   |
| Cross-component scope | Per-instance only            | Any descendant `<Mermaid>`    |
| Type safety           | Same                         | Same                          |

### Separate Theme vs Token System

| Criteria                       | Separate `MermaidTheme` (v1) | `defineTokens` + `createTheme` (v2, chosen) |
| ------------------------------ | ---------------------------- | ------------------------------------------- |
| Integration with `@semajsx/ui` | None, parallel system        | Composes naturally                          |
| CSS custom properties          | No, inline values            | Yes, automatic                              |
| Runtime switching              | Need manual re-render        | Toggle class, CSS does the rest             |
| User customization             | Override object              | `createTheme(tokens, overrides)`            |

### Edge Routing: Polyline vs Bezier

| Criteria    | Polyline (M/L)          | Bezier (C) — default        |
| ----------- | ----------------------- | --------------------------- |
| Visual      | Straight lines, angular | Smooth curves, professional |
| Complexity  | Simple point-to-point   | Control point computation   |
| Crossings   | Hard to avoid overlap   | Curves route around nodes   |
| Performance | Faster                  | Negligible difference       |

**Decision**: Default to bezier. Expose `edgeRouting: "polyline" | "bezier"` in `LayoutOptions` for users who prefer straight lines.

---

## 14. Implementation Plan

### Phase 1: Foundation

- [ ] Package setup (package.json, tsconfig, workspace link)
- [ ] IR types (`types.ts`)
- [ ] Design tokens (`tokens.ts`) + themes (`themes.ts`)
- [ ] Style definitions (`*.style.ts`)
- [ ] MermaidProvider + Context setup (`provider.tsx`)

### Phase 2: Parser

- [ ] Tokenizer
- [ ] Flowchart parser
- [ ] Sequence parser (including Note support)
- [ ] Parser tests

### Phase 3: Layout

- [ ] Flowchart layout (layered graph)
- [ ] Bezier edge routing
- [ ] Sequence layout (column-based)
- [ ] Text measurement (character estimation + optional Canvas)
- [ ] Layout tests

### Phase 4: Components

- [ ] Node shape components (rect, round, circle, rhombus, hexagon, cylinder, stadium)
- [ ] Edge component + arrowhead defs
- [ ] Label + subgraph
- [ ] Sequence components (participant, lifeline, message, activation, block, note)
- [ ] Default renderer map

### Phase 5: Integration

- [ ] `<Flowchart>` layout component
- [ ] `<Sequence>` layout component
- [ ] `<Mermaid>` convenience wrapper
- [ ] Signal reactivity (graph as signal)
- [ ] Animated edge CSS
- [ ] Integration tests + examples

---

## 15. Open Questions

- [ ] **Q1**: Should mermaid tokens be namespaced under `@semajsx/ui` tokens (as `tokens.mermaid.xxx`) or standalone?
  - **Leaning**: Standalone — mermaid is an independent package, not coupled to `@semajsx/ui`
  - **Blocker**: No

- [ ] **Q2**: Should `<Flowchart>` expose `ref` for accessing the root SVG element?
  - **Leaning**: Yes, consistent with `@semajsx/dom` ref pattern
  - **Blocker**: No

- [ ] **Q3**: Tree-shakeable per-diagram exports (`@semajsx/mermaid/flowchart`)?
  - **Leaning**: Yes, separate entry points — users who only need flowchart shouldn't bundle sequence parser/layout/components
  - **Blocker**: No

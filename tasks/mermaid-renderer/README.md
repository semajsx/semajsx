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
- **Out of Scope**: Class/state/ER diagrams, interactive editing, animation

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

### 4.3 `<Flowchart>` — Layout Component

```tsx
interface FlowchartProps {
  /** Diagram data (IR or Signal<IR>) */
  graph: FlowchartDiagram | Signal<FlowchartDiagram>;
  /** Additional class for root <svg> */
  class?: ClassValue;
  /** Padding around diagram */
  padding?: number;
}

function Flowchart(props: FlowchartProps, ctx: ComponentAPI): JSXNode {
  const renderers = ctx.inject(MermaidRenderers) ?? defaultRenderers;
  const graphData = unwrap(props.graph);

  // Layout: pure function, computes positions
  const positioned = flowchartLayout(graphData);

  const NodeComp = renderers.node;
  const EdgeComp = renderers.edge;
  const SubgraphComp = renderers.subgraph;

  return (
    <svg
      class={[svgRoot, props.class]}
      viewBox={`0 0 ${positioned.width} ${positioned.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Defs />
      {positioned.subgraphs?.map((s) => (
        <SubgraphComp key={s.subgraph.id} positioned={s} />
      ))}
      {positioned.edges.map((e) => (
        <EdgeComp key={`${e.edge.source}-${e.edge.target}`} positioned={e} />
      ))}
      {positioned.nodes.map((n) => (
        <NodeComp key={n.node.id} positioned={n} />
      ))}
    </svg>
  );
}
```

Key: `ctx.inject(MermaidRenderers)` reads which components to use for nodes/edges. Same pattern as `ctx.inject(ThemeContext)` in `@semajsx/ui`.

### 4.4 Context System — The SemaJSX Way

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
import { context, Context } from "@semajsx/core";
import type { Component, ComponentAPI, JSXNode } from "@semajsx/core";

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
}

const MermaidRenderers = context<RendererMap>("mermaid-renderers");

// ── Provider ───────────────────────────────────────────

interface MermaidProviderProps extends Partial<RendererMap> {
  children?: JSXNode;
}

function MermaidProvider(props: MermaidProviderProps): JSXNode {
  const { children, ...rendererOverrides } = props;

  // Merge user overrides with defaults
  const renderers: RendererMap = {
    ...defaultRenderers,
    ...rendererOverrides,
  };

  return <Context provide={[MermaidRenderers, renderers]}>{children}</Context>;
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

### 4.5 Theme — Compose with `@semajsx/style`, not Parallel

**Tokens follow the exact same pattern as `@semajsx/ui`:**

```tsx
// src/tokens.ts
import { defineTokens } from "@semajsx/style";

const tokenDefinition = {
  // Node
  nodeFill: "#e8f4f8",
  nodeStroke: "#23395d",
  nodeText: "#1d1d1f",
  nodeRadius: "8px",

  // Edge
  edgeStroke: "#666",
  edgeLabelBg: "#fff",
  edgeLabelText: "#333",

  // Arrow
  arrowFill: "#666",

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
  fontSize: "14px",
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

**Apply theme via Context — same as `<ThemeProvider>`:**

```tsx
import { inject } from "@semajsx/style";
import { lightTheme, darkTheme } from "./themes";

function MermaidProvider(props: MermaidProviderProps): JSXNode {
  const theme = props.theme ?? "light";

  inject(lightTheme);
  if (theme === "dark") inject(darkTheme);

  const renderers = { ...defaultRenderers, ...pickRenderers(props) };

  return (
    <Context provide={[MermaidRenderers, renderers]}>
      <div class={theme === "dark" ? darkTheme : undefined}>{props.children}</div>
    </Context>
  );
}
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

### 4.6 Styles — `classes()` + `rule` for SVG

SVG elements support CSS class selectors. We use the same pattern as `@semajsx/ui`'s Button:

```tsx
// src/node.style.ts
import { classes, rule, rules } from "@semajsx/style";
import { tokens } from "./tokens";

const c = classes([
  "node",
  "nodeRect",
  "nodeRound",
  "nodeCircle",
  "nodeRhombus",
  "nodeLabel",
] as const);

export const node = rule`${c.node} {
  fill: ${tokens.nodeFill};
  stroke: ${tokens.nodeStroke};
  stroke-width: 2px;
  transition: fill 0.2s ease, stroke 0.2s ease;
}`;

export const nodeHover = rule`${c.node}:hover {
  filter: brightness(0.95);
  cursor: pointer;
}`;

export const nodeRect = rule`${c.nodeRect} {
  rx: ${tokens.nodeRadius};
}`;

export const nodeLabel = rule`${c.nodeLabel} {
  fill: ${tokens.nodeText};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize};
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`;

// Export class refs for use in components
export { c };
```

**Used in components — same as Button uses `styles.root`:**

```tsx
// src/components/rect-node.tsx
/** @jsxImportSource @semajsx/dom */
import * as styles from "../node.style";
import type { NodeRenderProps } from "../types";

export function RectNode(props: NodeRenderProps): JSXNode {
  const { positioned, class: extraClass } = props;
  const { node, x, y, width, height } = positioned;

  return (
    <g class={extraClass}>
      <rect
        class={[styles.node, styles.nodeRect, styles.nodeHover]}
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
      />
      <text class={styles.nodeLabel} x={x} y={y}>
        {node.label}
      </text>
    </g>
  );
}
```

No hardcoded colors. All values come from tokens → CSS custom properties → automatic theme switching.

### 4.7 Signal Reactivity — Deep, Not Just `code`

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

Layout is pluggable via Context, same as renderers:

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
  /** Custom text measurement function */
  measureText?: (text: string, fontSize: number) => { width: number; height: number };
}

// Provided via Context — same pattern as MermaidRenderers
const MermaidLayout = context<LayoutEngine>("mermaid-layout");
```

Usage:

```tsx
// Default layout (built-in)
<Mermaid code={code} />;

// Custom layout engine via Context
import { MermaidProvider } from "@semajsx/mermaid";
import { dagreLayout } from "@semajsx/mermaid/layout-dagre"; // optional

<MermaidProvider layout={dagreLayout}>
  <Mermaid code={code} />
</MermaidProvider>;
```

`<Flowchart>` reads layout engine from Context:

```tsx
function Flowchart(props: FlowchartProps, ctx: ComponentAPI): JSXNode {
  const engine = ctx.inject(MermaidLayout) ?? builtinLayout;
  const graphData = unwrap(props.graph);
  const positioned = engine.flowchart(graphData, props.layoutOptions);
  // ... render positioned data as SVG
}
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
    Input:  positioned nodes
    Output: polyline points[] for each edge
    Method: Source center → control points → target center
            Edges spanning multiple layers get intermediate points
            Avoids node overlap with simple offset
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
Phase 5: A→B: [(105,70), (75,150)]
         A→C: [(105,70), (285,150)]
         B→D: [(75,200), (105,280)]
         C→D: [(285,200), (105,280)]
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
            d="M 200 70 L 200 150"
            marker-end="url(#mmd-arrow)" />
    </g>
    <g class="mmd-edge mmd-edgeDotted">
      <path class="mmd-edgeLine"
            d="M 100 200 L 300 200"
            stroke-dasharray="6,4"
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

| Decision          | Choice                               | Why                                                                                            |
| ----------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Positioning       | `<g transform="translate(x,y)">`     | Local coordinates — custom renderers don't need offset math                                    |
| Arrowheads        | SVG `<marker>` in `<defs>`           | Efficient, CSS-styleable, auto-rotates with path direction                                     |
| Labels            | `<text>` with `text-anchor="middle"` | Simple, CSS-styleable. Future: `<foreignObject>` for HTML                                      |
| Layer order       | Subgraphs → Edges → Nodes            | Nodes always on top of edges, subgraphs are backgrounds                                        |
| Coordinate system | Center-origin per node               | `(0,0)` is node center. Rect: `x=-w/2, y=-h/2`. Circle: `cx=0, cy=0`. Simplest for all shapes. |

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

  <!-- Layer 4: Messages (horizontal arrows between lifelines) -->
  <g class="mmd-messages">
    <g class="mmd-message">
      <line class="mmd-messageLine"
            x1="100" y1="120" x2="350" y2="120"
            marker-end="url(#mmd-arrow)" />
      <text class="mmd-messageText" x="225" y="112">Hello</text>
    </g>
    <g class="mmd-message mmd-messageDotted">
      <line class="mmd-messageLine"
            x1="350" y1="155" x2="100" y2="155"
            stroke-dasharray="6,4"
            marker-end="url(#mmd-arrow)" />
      <text class="mmd-messageText" x="225" y="147">Hi back</text>
    </g>
  </g>

  <!-- Layer 5: Participants (top, rendered last = on top) -->
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

### 6.4 CSS Styling of SVG Elements

All SVG elements use CSS classes. Styled via `classes()` + `rule` + `tokens`:

```tsx
// src/node.style.ts
import { classes, rule, rules } from "@semajsx/style";
import { tokens } from "./tokens";

const c = classes([
  "nodeShape",
  "nodeRect",
  "nodeRound",
  "nodeRhombus",
  "nodeCircle",
  "nodeHexagon",
  "nodeCylinder",
  "nodeStadium",
  "nodeLabel",
  "node",
] as const);

// ── Base shape ─────────────────────────────────────
export const nodeShape = rule`${c.nodeShape} {
  fill: ${tokens.nodeFill};
  stroke: ${tokens.nodeStroke};
  stroke-width: 2;
}`;

export const nodeShapeHover = rule`${c.nodeShape}:hover {
  filter: brightness(0.95);
  cursor: pointer;
}`;

// ── Shape variants (additional classes) ─────────────
export const nodeRect = rule`${c.nodeRect} { rx: 8; }`;
export const nodeRound = rule`${c.nodeRound} { rx: 20; }`;
export const nodeStadium = rule`${c.nodeStadium} { rx: 999; }`;

// ── Text ───────────────────────────────────────────
export const nodeLabel = rule`${c.nodeLabel} {
  fill: ${tokens.nodeText};
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize};
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}`;

export { c };

// src/edge.style.ts
import { classes, rule } from "@semajsx/style";
import { tokens } from "./tokens";

const c = classes([
  "edgeLine",
  "edgeArrow",
  "edgeDotted",
  "edgeThick",
  "edgeLabel",
  "edgeLabelBg",
  "arrowHead",
] as const);

export const edgeLine = rule`${c.edgeLine} {
  fill: none;
  stroke: ${tokens.edgeStroke};
  stroke-width: 2;
}`;

export const edgeDotted = rule`${c.edgeDotted} ${c.edgeLine} {
  stroke-dasharray: 6, 4;
}`;

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

### 6.5 Node Shape Rendering

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
        class={[styles.nodeShape, styles.nodeRect, styles.nodeShapeHover]}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
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

### 6.6 Edge Rendering

```tsx
// src/components/edge.tsx
/** @jsxImportSource @semajsx/dom */
import * as styles from "../edge.style";
import type { EdgeRenderProps } from "../types";

export function Edge(props: EdgeRenderProps): JSXNode {
  const { edge, points, labelPosition } = props.positioned;

  // Build SVG path from points
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const edgeTypeClass = {
    arrow: styles.c.edgeArrow,
    dotted: styles.c.edgeDotted,
    thick: styles.c.edgeThick,
    open: null,
    invisible: null,
  }[edge.type];

  const markerId =
    edge.type === "open" || edge.type === "invisible" ? undefined : "url(#mmd-arrow)";

  return (
    <g class={[edgeTypeClass, props.class]}>
      <path class={styles.edgeLine} d={d} marker-end={markerId} />
      {edge.label && labelPosition && (
        <>
          <rect
            class={styles.edgeLabelBg}
            x={labelPosition.x - 30}
            y={labelPosition.y - 10}
            width={60}
            height={20}
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

### 6.7 How `<Flowchart>` Assembles Everything

```tsx
// src/flowchart.tsx
/** @jsxImportSource @semajsx/dom */
import { context, Context } from "@semajsx/core";
import type { ComponentAPI, JSXNode } from "@semajsx/core";
import { isSignal, unwrap, computed } from "@semajsx/signal";
import { inject } from "@semajsx/style";
import * as rootStyles from "./root.style";
import { Defs } from "./components/defs";
import { shapeMap } from "./components/nodes";
import { Edge } from "./components/edge";
import { SubgraphBox } from "./components/subgraph";
import { builtinLayout } from "./layout";
import { lightTheme } from "./themes";
import type { FlowchartDiagram, FlowchartProps } from "./types";

export function Flowchart(props: FlowchartProps, ctx: ComponentAPI): JSXNode {
  // Inject default theme CSS (deduped — safe to call multiple times)
  inject(lightTheme);

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

## 7. Diagram IR Types

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

type EdgeType = "arrow" | "open" | "dotted" | "thick" | "invisible";

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

// ── Layout Output ──────────────────────────────────────

interface Point {
  x: number;
  y: number;
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
  points: Point[];
  labelPosition?: Point;
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

## 6. Component Props (Render Layer)

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
```

No `theme` prop — components read tokens through CSS custom properties (set by `inject()`), exactly like `@semajsx/ui` components.

---

## 7. Usage Examples

### Basic

```tsx
/** @jsxImportSource @semajsx/dom */
import { Mermaid } from "@semajsx/mermaid";
import { inject } from "@semajsx/style";
import { lightTheme } from "@semajsx/mermaid";

inject(lightTheme);

const App = () => (
  <Mermaid
    code={`
    graph TD
      A[Client] --> B[Load Balancer]
      B --> C[Server 1]
      B --> D[Server 2]
  `}
  />
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
    <g>
      <rect
        class={[styles.node, styles.nodeRect]}
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        filter="url(#glow)"
      />
      <text class={styles.nodeLabel} x={x} y={y}>
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

## 8. Package Structure

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
│   │   │   └── index.ts        # defaultNodeRenderers map
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
│       └── index.ts
│
└── examples/
    ├── basic.tsx
    ├── themed.tsx
    ├── custom-nodes.tsx
    └── reactive.tsx
```

---

## 9. How Each SemaJSX Pattern Maps

| SemaJSX Pattern         | How Mermaid Uses It                                              |
| ----------------------- | ---------------------------------------------------------------- |
| `defineTokens()`        | `tokens.ts` — all diagram visual values as CSS custom properties |
| `createTheme()`         | `themes.ts` — light/dark presets, users create custom themes     |
| `classes()` + `rule`    | `*.style.ts` — SVG element classes with token references         |
| `inject()`              | `provider.tsx` — injects theme CSS on mount                      |
| `context()`             | `MermaidRenderers` context — carries renderer components         |
| `ctx.inject()`          | Components read renderers: `ctx.inject(MermaidRenderers)`        |
| `<Context provide={}>`  | `<MermaidProvider>` wraps with renderer + theme context          |
| `computed()`            | Layout derived from graph signal                                 |
| `signal()` + `unwrap()` | Graph data can be signal or plain value                          |
| `class` prop            | All components accept `class` for user styling                   |
| Collocated tests        | `*.test.ts` next to source files                                 |

---

## 10. Alternatives Considered

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

---

## 11. Implementation Plan

### Phase 1: Foundation

- [ ] Package setup (package.json, tsconfig, workspace link)
- [ ] IR types (`types.ts`)
- [ ] Design tokens (`tokens.ts`) + themes (`themes.ts`)
- [ ] Style definitions (`*.style.ts`)
- [ ] MermaidProvider + Context setup (`provider.tsx`)

### Phase 2: Parser

- [ ] Tokenizer
- [ ] Flowchart parser
- [ ] Sequence parser
- [ ] Parser tests

### Phase 3: Layout

- [ ] Flowchart layout (layered graph)
- [ ] Sequence layout (column-based)
- [ ] Layout tests

### Phase 4: Components

- [ ] Node shape components (rect, round, circle, rhombus, hexagon, cylinder, stadium)
- [ ] Edge component + arrowhead defs
- [ ] Label + subgraph
- [ ] Sequence components (participant, lifeline, message, activation, block)
- [ ] Default renderer map

### Phase 5: Integration

- [ ] `<Flowchart>` layout component
- [ ] `<Sequence>` layout component
- [ ] `<Mermaid>` convenience wrapper
- [ ] Signal reactivity (graph as signal)
- [ ] Integration tests + examples

---

## 12. Open Questions

- [ ] **Q1**: Should mermaid tokens be namespaced under `@semajsx/ui` tokens (as `tokens.mermaid.xxx`) or standalone?
  - **Leaning**: Standalone — mermaid is an independent package, not coupled to `@semajsx/ui`
  - **Blocker**: No

- [ ] **Q2**: Should `<Flowchart>` expose `ref` for accessing the root SVG element?
  - **Leaning**: Yes, consistent with `@semajsx/dom` ref pattern
  - **Blocker**: No

- [ ] **Q3**: Tree-shakeable per-diagram exports (`@semajsx/mermaid/flowchart`)?
  - **Leaning**: Yes, separate entry points — users who only need flowchart shouldn't bundle sequence parser/layout/components
  - **Blocker**: No

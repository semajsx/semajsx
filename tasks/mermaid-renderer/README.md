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

## 5. Diagram IR Types

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

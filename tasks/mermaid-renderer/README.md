# Mermaid Diagram Renderer - Design Document

**Date**: 2026-02-28
**Status**: Draft
**Package**: `@semajsx/mermaid`

---

## 1. Overview

### 1.1 Quick Summary

- **What**: A SemaJSX component library that parses Mermaid diagram code into structured data and renders it as composable, themeable JSX components (SVG-based)
- **Why**: Mermaid diagrams are ubiquitous in documentation and technical content. Current solutions (mermaid.js) render to opaque SVG blobs that cannot be styled, themed, or customized at the component level. A SemaJSX-native renderer enables deep integration with the theme system, signal reactivity, and custom component overrides.
- **How**: Self-contained parser (Mermaid DSL → AST) + layout engine (auto-positioning) + SVG component tree (themeable primitives)

### 1.2 Scope

- **In Scope**:
  - Mermaid code parser → structured IR (intermediate representation)
  - Flowchart diagram type (primary, covers ~70% of usage)
  - Sequence diagram type (secondary)
  - SVG-based rendering via SemaJSX JSX components
  - Theme integration via `@semajsx/style` design tokens
  - Component override system (replace any node/edge renderer)
  - Signal-reactive updates (change data → diagram re-renders)

- **Out of Scope** (future phases):
  - Class diagrams, state diagrams, ER diagrams, Gantt, pie charts
  - Animation/transition between states
  - Interactive editing (drag-and-drop)
  - Server-side rendering of diagrams

---

## 2. Design Principles

1. **Parse, don't render opaquely** - Convert Mermaid code to structured data first, then render with JSX. The IR is the API boundary.
2. **Composable primitives** - Every visual element (node, edge, label, arrowhead) is a standalone JSX component that can be overridden.
3. **Theme-first** - All colors, spacing, typography use design tokens from `@semajsx/style`. Zero hardcoded visual values.
4. **Self-contained parser** - No dependency on the mermaid.js library (~800KB). Write a focused parser for supported diagram types.
5. **Reactive by default** - Signal inputs cause targeted SVG updates, not full re-renders.

---

## 3. Architecture

### 3.1 System Structure

```
Mermaid Code (string)
      │
      ▼
┌─────────────┐
│   Parser     │  Mermaid DSL → Diagram IR
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Layout     │  IR → Positioned IR (coordinates, sizes)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Renderer    │  Positioned IR → JSX/SVG component tree
└─────────────┘
       │
       ▼
  <svg> ... </svg>  (rendered by @semajsx/dom)
```

### 3.2 Module Breakdown

| Module        | Responsibility                            | Location          |
| ------------- | ----------------------------------------- | ----------------- |
| `parser/`     | Tokenize + parse Mermaid DSL → Diagram IR | `src/parser/`     |
| `ir/`         | Diagram IR type definitions               | `src/ir/`         |
| `layout/`     | Auto-layout algorithms (Dagre-like)       | `src/layout/`     |
| `components/` | SVG primitive components                  | `src/components/` |
| `themes/`     | Design tokens and theme presets           | `src/themes/`     |
| `overrides/`  | Override system for custom rendering      | `src/overrides/`  |
| `Mermaid`     | Top-level `<Mermaid>` component           | `src/mermaid.tsx` |

### 3.3 Data Flow

```
User provides: <Mermaid code={`graph TD; A-->B`} />
                          │
         1. Parse ────────┘
                          │
                          ▼
              DiagramIR { type: "flowchart", nodes: [...], edges: [...] }
                          │
         2. Layout ───────┘
                          │
                          ▼
              LayoutResult { nodes: [{x, y, w, h, ...}], edges: [{points, ...}] }
                          │
         3. Render ───────┘
                          │
                          ▼
              <svg>
                <FlowNode x={0} y={0} label="A" shape="rect" />
                <FlowNode x={0} y={100} label="B" shape="rect" />
                <Edge points={[...]} arrowHead="normal" />
              </svg>
```

---

## 4. API Design

### 4.1 Core Interfaces - Diagram IR

```typescript
// ── Diagram Types ──────────────────────────────────────

type DiagramType = "flowchart" | "sequence";

interface Diagram {
  type: DiagramType;
  direction?: Direction;
}

type Direction = "TB" | "TD" | "BT" | "LR" | "RL";

// ── Flowchart IR ───────────────────────────────────────

interface FlowchartDiagram extends Diagram {
  type: "flowchart";
  direction: Direction;
  nodes: FlowNode[];
  edges: FlowEdge[];
  subgraphs: Subgraph[];
}

type NodeShape =
  | "rect" // [text]
  | "round" // (text)
  | "stadium" // ([text])
  | "subroutine" // [[text]]
  | "cylinder" // [(text)]
  | "circle" // ((text))
  | "asymmetric" // >text]
  | "rhombus" // {text}
  | "hexagon" // {{text}}
  | "parallelogram" // [/text/]
  | "trapezoid" // [/text\]
  | "double-circle"; // (((text)))

interface FlowNode {
  id: string;
  label: string;
  shape: NodeShape;
  class?: string; // user-defined CSS class
  style?: string; // inline style from Mermaid
  url?: string; // click link
}

type EdgeType =
  | "arrow" // -->
  | "open" // ---
  | "dotted" // -.->
  | "thick" // ==>
  | "invisible"; // ~~~

interface FlowEdge {
  source: string; // node id
  target: string; // node id
  label?: string;
  type: EdgeType;
  animated?: boolean;
}

interface Subgraph {
  id: string;
  label: string;
  nodes: string[]; // node ids contained in this subgraph
  direction?: Direction;
}

// ── Sequence Diagram IR ────────────────────────────────

interface SequenceDiagram extends Diagram {
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

type ArrowType =
  | "solid" // ->>
  | "dotted" // -->>
  | "solidCross" // -x
  | "dottedCross" // --x
  | "solidOpen" // -)
  | "dottedOpen"; // --)

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
  sections?: { label: string; messages: Message[] }[]; // for alt/par
}
```

### 4.2 Layout Result Types

```typescript
interface LayoutResult {
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  subgraphs?: PositionedSubgraph[];
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
  points: Point[]; // polyline path points
  labelPosition?: Point;
}

interface Point {
  x: number;
  y: number;
}

interface PositionedSubgraph {
  subgraph: Subgraph;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### 4.3 Public Component API

```tsx
// ── Top-level Component ────────────────────────────────

import { Mermaid } from "@semajsx/mermaid";

// Basic usage
<Mermaid code={`
  graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[Cancel]
`} />

// With theme
import { darkTheme } from "@semajsx/mermaid/themes";

<Mermaid
  code={code}
  theme={darkTheme}
/>

// With signal (reactive)
const code = signal(`graph TD; A-->B`);

<Mermaid code={code} />

// code.value = `graph TD; A-->B-->C`;  // diagram updates

// With component overrides
<Mermaid
  code={code}
  overrides={{
    node: MyCustomNode,
    edge: MyCustomEdge,
    "node:rhombus": MyDiamondNode,   // override specific shape
    "edge:dotted": MyDottedEdge,     // override specific edge type
    label: MyCustomLabel,
    arrowHead: MyCustomArrowHead,
    subgraph: MyCustomSubgraph,
  }}
/>

// ── Props ──────────────────────────────────────────────

interface MermaidProps {
  /** Mermaid code string (or Signal<string>) */
  code: string | Signal<string>;

  /** Theme token overrides */
  theme?: MermaidTheme;

  /** Component overrides for custom rendering */
  overrides?: MermaidOverrides;

  /** Additional class for root SVG */
  class?: ClassValue;

  /** Explicit width (default: auto from layout) */
  width?: number | string;

  /** Explicit height (default: auto from layout) */
  height?: number | string;

  /** Padding around the diagram */
  padding?: number;

  /** Callback when parsing fails */
  onError?: (error: ParseError) => void;
}
```

### 4.4 Override System

```typescript
// ── Override Types ─────────────────────────────────────

interface MermaidOverrides {
  // Flowchart overrides
  node?: Component<NodeProps>;
  edge?: Component<EdgeProps>;
  label?: Component<LabelProps>;
  arrowHead?: Component<ArrowHeadProps>;
  subgraph?: Component<SubgraphProps>;

  // Shape-specific node overrides (take precedence over generic `node`)
  "node:rect"?: Component<NodeProps>;
  "node:round"?: Component<NodeProps>;
  "node:rhombus"?: Component<NodeProps>;
  "node:circle"?: Component<NodeProps>;
  "node:stadium"?: Component<NodeProps>;
  "node:hexagon"?: Component<NodeProps>;
  "node:cylinder"?: Component<NodeProps>;
  // ... other shapes

  // Edge-type-specific overrides
  "edge:arrow"?: Component<EdgeProps>;
  "edge:dotted"?: Component<EdgeProps>;
  "edge:thick"?: Component<EdgeProps>;
  "edge:open"?: Component<EdgeProps>;

  // Sequence diagram overrides
  participant?: Component<ParticipantProps>;
  message?: Component<MessageProps>;
  lifeline?: Component<LifelineProps>;
  activation?: Component<ActivationProps>;
  block?: Component<BlockProps>;
}

// ── Primitive Component Props ──────────────────────────

interface NodeProps {
  node: FlowNode;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: MermaidThemeTokens;
  children?: JSXNode; // label content
}

interface EdgeProps {
  edge: FlowEdge;
  points: Point[];
  labelPosition?: Point;
  theme: MermaidThemeTokens;
}

interface LabelProps {
  text: string;
  x: number;
  y: number;
  theme: MermaidThemeTokens;
}

interface ArrowHeadProps {
  type: EdgeType;
  position: Point;
  angle: number; // rotation angle in degrees
  theme: MermaidThemeTokens;
}

interface SubgraphProps {
  subgraph: Subgraph;
  x: number;
  y: number;
  width: number;
  height: number;
  theme: MermaidThemeTokens;
  children?: JSXNode;
}
```

### 4.5 Theme System

```typescript
// ── Theme Tokens ───────────────────────────────────────

import { defineTokens, createTheme } from "@semajsx/style";

const mermaidTokens = defineTokens({
  // Node styles
  node: {
    fill: "#e8f4f8",
    stroke: "#23395d",
    strokeWidth: "2px",
    text: "#1d1d1f",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "8px",
    padding: "12px 16px",
  },

  // Edge styles
  edge: {
    stroke: "#666",
    strokeWidth: "2px",
    labelBg: "#fff",
    labelText: "#333",
    labelFontSize: "12px",
  },

  // Arrow head
  arrow: {
    fill: "#666",
  },

  // Subgraph
  subgraph: {
    fill: "#f8f9fa",
    stroke: "#ccc",
    strokeWidth: "1px",
    titleBg: "#eee",
    titleText: "#333",
    borderRadius: "8px",
  },

  // Sequence diagram specific
  sequence: {
    actorFill: "#e8f4f8",
    actorStroke: "#23395d",
    actorText: "#1d1d1f",
    lifelineStroke: "#999",
    lifelineDash: "5,5",
    activationFill: "#d4e6f1",
    activationStroke: "#23395d",
    messageFill: "none",
    messageStroke: "#333",
    messageText: "#333",
    blockFill: "rgba(200,200,200,0.1)",
    blockStroke: "#aaa",
    blockText: "#555",
  },

  // General
  background: "transparent",
  fontFamily: "'Inter', sans-serif",
});

// Pre-built themes
export const lightTheme = createTheme(mermaidTokens);

export const darkTheme = createTheme(mermaidTokens, {
  node: {
    fill: "#2d3748",
    stroke: "#63b3ed",
    text: "#e2e8f0",
  },
  edge: {
    stroke: "#a0aec0",
    labelBg: "#1a202c",
    labelText: "#e2e8f0",
  },
  arrow: { fill: "#a0aec0" },
  subgraph: {
    fill: "#1a202c",
    stroke: "#4a5568",
    titleBg: "#2d3748",
    titleText: "#e2e8f0",
  },
  background: "transparent",
});

// Users can create custom themes
const myTheme = createTheme(mermaidTokens, {
  node: { fill: "#fef3c7", stroke: "#f59e0b" },
  edge: { stroke: "#f59e0b" },
});
```

### 4.6 Usage Examples

**Basic Flowchart**:

```tsx
/** @jsxImportSource @semajsx/dom */
import { Mermaid } from "@semajsx/mermaid";

const App = () => (
  <div>
    <h1>System Architecture</h1>
    <Mermaid
      code={`
      graph TD
        A[Client] --> B[Load Balancer]
        B --> C[Server 1]
        B --> D[Server 2]
        C --> E[(Database)]
        D --> E
    `}
    />
  </div>
);
```

**Reactive Diagram**:

```tsx
import { signal } from "@semajsx/signal";
import { Mermaid } from "@semajsx/mermaid";

const diagram = signal(`graph LR; A-->B`);

const App = () => (
  <div>
    <Mermaid code={diagram} />
    <button
      onClick={() => {
        diagram.value = `graph LR; A-->B-->C`;
      }}
    >
      Add Node
    </button>
  </div>
);
```

**Custom Node Renderer**:

```tsx
import { Mermaid } from "@semajsx/mermaid";
import type { NodeProps } from "@semajsx/mermaid";

const GlowNode = (props: NodeProps) => (
  <g>
    <rect
      x={props.x - props.width / 2}
      y={props.y - props.height / 2}
      width={props.width}
      height={props.height}
      rx={12}
      fill={props.theme.node.fill}
      stroke={props.theme.node.stroke}
      filter="url(#glow)"
    />
    <text
      x={props.x}
      y={props.y}
      text-anchor="middle"
      dominant-baseline="central"
      fill={props.theme.node.text}
    >
      {props.node.label}
    </text>
  </g>
);

<Mermaid code={code} overrides={{ node: GlowNode }} />;
```

**Integration with @semajsx/ui Theme**:

```tsx
import { ThemeProvider } from "@semajsx/ui";
import { Mermaid } from "@semajsx/mermaid";
import { darkTheme } from "@semajsx/mermaid/themes";

// Mermaid respects the surrounding theme context
<ThemeProvider theme="dark">
  <Mermaid code={code} theme={darkTheme} />
</ThemeProvider>;
```

---

## 5. Implementation Details

### 5.1 Parser

The parser converts Mermaid text into a Diagram IR. It's a hand-written recursive descent parser (no external dependencies).

**Why self-contained?**

- `mermaid` npm package is ~800KB (includes D3, dagre, rendering)
- `@mermaid-js/parser` uses Langium (~200KB), heavy for our needs
- Our scope is limited (flowchart + sequence), so a focused parser is small (~5KB)

**Parser Architecture**:

```
Mermaid code string
      │
  1. Tokenizer ─── produces Token[]
      │
  2. Parser ─────── consumes tokens, produces DiagramIR
      │
      ▼
  DiagramIR
```

**Tokenizer**:

```typescript
type TokenType =
  | "keyword" // graph, subgraph, end, participant, loop, alt, etc.
  | "direction" // TD, TB, BT, LR, RL
  | "arrow" // -->, ---, -.-> , ==>, ~~~ , ->>, -->>
  | "id" // node/participant identifiers
  | "text" // text within delimiters [text], (text), {text}, "text"
  | "pipe" // |text| (edge labels)
  | "open" // [ ( { < delimiters
  | "close" // ] ) } > delimiters
  | "semicolon" // ;
  | "newline" // \n
  | "colon" // :
  | "eof";

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
```

**Parser Functions**:

```typescript
function parse(code: string): Diagram | ParseError;
function parseFlowchart(tokens: Token[]): FlowchartDiagram;
function parseSequence(tokens: Token[]): SequenceDiagram;
```

**Error Handling**:

```typescript
interface ParseError {
  message: string;
  line: number;
  column: number;
  source: string; // the problematic portion of code
}
```

### 5.2 Layout Engine

The layout engine computes x, y positions for all nodes and edges.

**Flowchart Layout** (simplified Sugiyama/layered graph drawing):

1. **Cycle removal** - Break cycles with back-edge detection (DFS)
2. **Layer assignment** - Assign nodes to layers (longest path method)
3. **Ordering** - Minimize edge crossings within layers (barycenter heuristic)
4. **Coordinate assignment** - Compute x, y positions with minimum spacing
5. **Edge routing** - Compute polyline paths between node positions

**Parameters**:

```typescript
interface LayoutOptions {
  nodeSpacing: number; // horizontal spacing between nodes (default: 60)
  rankSpacing: number; // vertical spacing between layers (default: 80)
  nodeWidth: number; // default node width (default: 150)
  nodeHeight: number; // default node height (default: 50)
  direction: Direction; // TB, LR, etc.
}
```

**Sequence Diagram Layout** (simpler, column-based):

1. **Column assignment** - Each participant gets a column at fixed spacing
2. **Row assignment** - Each message gets a row at fixed spacing
3. **Block layout** - Blocks (loop/alt) span columns and rows of their content
4. **Activation tracking** - Track activation stack per participant

### 5.3 SVG Component Primitives

Each visual element is a JSX component rendering SVG elements:

**Node shapes**:

| Shape         | SVG Element            |
| ------------- | ---------------------- |
| rect          | `<rect>`               |
| round         | `<rect rx="...">`      |
| stadium       | `<rect rx="large">`    |
| circle        | `<circle>`             |
| rhombus       | `<polygon>` (diamond)  |
| hexagon       | `<polygon>` (6 points) |
| cylinder      | `<path>` (custom)      |
| parallelogram | `<polygon>` (skewed)   |

**Edge rendering**:

```typescript
// Compute SVG path from points
function edgePath(points: Point[], type: EdgeType): string {
  // Generates "M x0 y0 L x1 y1 L x2 y2 ..." for straight lines
  // Or cubic bezier for smooth curves
}

// Arrowhead as SVG marker
<defs>
  <marker id="arrow-normal" ...>
    <path d="M 0 0 L 10 5 L 0 10 z" />
  </marker>
</defs>
```

### 5.4 Override Resolution

```typescript
function resolveComponent(
  elementType: string, // "node", "edge", etc.
  specificType: string, // "rect", "dotted", etc.
  overrides: MermaidOverrides,
  defaults: MermaidOverrides,
): Component {
  // 1. Check specific override: overrides["node:rect"]
  // 2. Check generic override: overrides["node"]
  // 3. Check specific default: defaults["node:rect"]
  // 4. Fall back to generic default: defaults["node"]
  const specificKey = `${elementType}:${specificType}`;
  return (
    overrides[specificKey] ??
    overrides[elementType] ??
    defaults[specificKey] ??
    defaults[elementType]
  );
}
```

### 5.5 Signal Reactivity

When `code` is a Signal:

```typescript
function Mermaid(props: MermaidProps) {
  const codeValue = isSignal(props.code) ? props.code : signal(props.code);

  // computed: parse + layout whenever code changes
  const layout = computed([codeValue], (code) => {
    const parsed = parse(code);
    if ("message" in parsed) {
      props.onError?.(parsed);
      return null;
    }
    return computeLayout(parsed);
  });

  // Render based on computed layout
  return (
    <svg class={[rootStyle, props.class]} viewBox={...}>
      {when(layout, (l) => renderDiagram(l, props.overrides, props.theme))}
    </svg>
  );
}
```

---

## 6. Package Structure

```
packages/mermaid/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Public API exports
│   ├── mermaid.tsx            # <Mermaid> top-level component
│   │
│   ├── ir/
│   │   └── types.ts           # Diagram IR type definitions
│   │
│   ├── parser/
│   │   ├── tokenizer.ts       # Mermaid tokenizer
│   │   ├── tokenizer.test.ts
│   │   ├── flowchart.ts       # Flowchart parser
│   │   ├── flowchart.test.ts
│   │   ├── sequence.ts        # Sequence diagram parser
│   │   ├── sequence.test.ts
│   │   └── index.ts           # parse() entry point
│   │
│   ├── layout/
│   │   ├── flowchart.ts       # Layered graph layout
│   │   ├── flowchart.test.ts
│   │   ├── sequence.ts        # Column-based layout
│   │   ├── sequence.test.ts
│   │   └── index.ts
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
│   │   │   └── index.ts       # Shape registry
│   │   ├── edges/
│   │   │   ├── edge.tsx        # Generic edge with path
│   │   │   ├── arrow-heads.tsx # Arrowhead markers
│   │   │   └── index.ts
│   │   ├── labels/
│   │   │   └── label.tsx
│   │   ├── subgraph.tsx
│   │   ├── sequence/
│   │   │   ├── participant.tsx
│   │   │   ├── lifeline.tsx
│   │   │   ├── message.tsx
│   │   │   ├── activation.tsx
│   │   │   ├── block.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── themes/
│   │   ├── tokens.ts           # Design token definitions
│   │   ├── light.ts            # Light theme
│   │   ├── dark.ts             # Dark theme
│   │   └── index.ts
│   │
│   └── overrides/
│       └── types.ts            # Override type definitions
│
└── examples/
    ├── basic.tsx
    ├── themed.tsx
    ├── custom-nodes.tsx
    └── reactive.tsx
```

---

## 7. Alternatives Considered

### 7.1 Alternative A: Wrap mermaid.js and post-process SVG

**Description**: Use mermaid.js to render, then parse the output SVG and replace elements.

**Pros**:

- Full Mermaid syntax support immediately
- Battle-tested parsing and layout

**Cons**:

- ~800KB dependency
- Fragile: mermaid.js SVG structure changes across versions
- Cannot control layout algorithm
- SSR-unfriendly (requires DOM/JSDOM)

**Why not chosen**: Too heavy, too fragile, defeats the purpose of fine-grained control.

### 7.2 Alternative B: Use @mermaid-js/parser + custom renderer

**Description**: Use mermaid's official Langium-based parser, write custom layout + rendering.

**Pros**:

- Official parser, full syntax support
- Maintained by mermaid team

**Cons**:

- Langium runtime is ~200KB
- Parser produces Langium CST (not clean AST), requires significant transformation
- Tight coupling to mermaid's internal grammar changes
- Only covers parsing, still need layout + render

**Why not chosen**: Langium dependency is too heavy. CST-to-IR transformation is complex enough that writing a focused parser for 2 diagram types is simpler.

### 7.3 Comparison Matrix

| Criteria          | Self-contained (chosen) | Wrap mermaid.js | @mermaid-js/parser |
| ----------------- | ----------------------- | --------------- | ------------------ |
| Bundle size       | ~15KB                   | ~800KB          | ~200KB             |
| Diagram coverage  | 2 types initially       | All types       | All types          |
| Customization     | Full control            | Limited         | Medium             |
| Maintenance       | Own parser              | Dep on mermaid  | Dep on Langium     |
| Theme integration | Native                  | Post-process    | Native             |
| SSR-friendly      | Yes                     | No              | Yes                |

---

## 8. Implementation Plan

### Phase 1: Parser + IR (Core)

- [ ] Define IR types for flowchart and sequence diagrams
- [ ] Implement tokenizer
- [ ] Implement flowchart parser
- [ ] Implement sequence diagram parser
- [ ] Tests for all parser paths

### Phase 2: Layout Engine

- [ ] Implement flowchart layout (layered graph)
- [ ] Implement sequence diagram layout (column-based)
- [ ] Tests for layout algorithms

### Phase 3: SVG Components

- [ ] Implement node shape components (rect, round, circle, rhombus, etc.)
- [ ] Implement edge component with path computation
- [ ] Implement arrowhead markers
- [ ] Implement label component
- [ ] Implement subgraph component
- [ ] Implement sequence diagram components (participant, lifeline, message, etc.)

### Phase 4: Integration

- [ ] Implement `<Mermaid>` top-level component
- [ ] Implement theme tokens and presets (light/dark)
- [ ] Implement override system
- [ ] Implement signal reactivity for code input
- [ ] Integration tests

### Phase 5: Polish

- [ ] Error boundary and error display
- [ ] Examples
- [ ] Package setup (package.json, tsconfig, exports)

---

## 9. Open Questions

- [ ] **Q1**: Should we support Mermaid `classDef` and `style` inline directives in the first version?
  - **Leaning**: Yes for `classDef`, skip `style` inline for now
  - **Blocker**: No

- [ ] **Q2**: Should the layout engine be a separate package (`@semajsx/layout`) for reuse?
  - **Leaning**: Start in `@semajsx/mermaid`, extract later if needed
  - **Blocker**: No

- [ ] **Q3**: Should we support `click` event bindings from Mermaid syntax?
  - **Leaning**: Yes, map to onClick props
  - **Blocker**: No

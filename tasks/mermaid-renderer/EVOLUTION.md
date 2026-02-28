# Mermaid Renderer - Evolution Record

## Requirement (2026-02-28)

**Problem**: Need a Mermaid diagram renderer for SemaJSX that parses Mermaid code into structured data and renders via composable, themeable JSX components.

**Key requirements**:

- Parse Mermaid DSL → structured IR (not opaque SVG)
- Render with SemaJSX JSX components (SVG primitives)
- Composable element components (nodes, edges, labels, arrowheads)
- Theme integration via `@semajsx/style` design tokens
- Component override system for custom rendering of any element type

**Success criteria**:

- Flowchart and sequence diagram support
- Self-contained parser (no mermaid.js dependency)
- Full theme customization
- Override any node shape / edge type with custom component
- Signal-reactive (change code → diagram updates)

## Research (2026-02-28)

### Mermaid Parsing Options

| Option                       | Bundle Size | Coverage                          | Verdict                        |
| ---------------------------- | ----------- | --------------------------------- | ------------------------------ |
| Self-contained parser        | ~15KB       | 2 types                           | **Chosen**                     |
| Wrap mermaid.js              | ~800KB      | All types                         | Too heavy                      |
| @mermaid-js/parser (Langium) | ~200KB      | 7 types (not flowchart/sequence!) | Missing key types              |
| beautiful-mermaid parsers    | ~50KB       | 5 types                           | Good reference, but dependency |

**Decision**: Write self-contained parsers for flowchart + sequence. The official `@mermaid-js/parser` doesn't cover flowchart or sequence yet (still on legacy JISON). Writing focused parsers for 2 types is tractable and keeps bundle small.

### Prior Art

- **beautiful-mermaid**: Closest prior art. Hand-written TypeScript parsers, Dagre layout, SVG + ASCII output. Good reference for AST shapes.
- **Ferrite** (Rust): egui native rendering with theme integration. Validates the parse→layout→render pipeline.
- **Selkie** (Rust): Full reimplementation. Shows parsing is tractable without parser generators.
- **ZenUML**: Uses HTML elements instead of SVG, enabling CSS customization. Interesting approach but SVG is more appropriate for diagrams.

### Layout Approach

- Flowchart: Layered graph layout (Sugiyama-style), similar to Dagre
- Sequence: Column-based layout (each participant = column, each message = row)
- Start with a simple built-in layout, can integrate Dagre/ELK later if needed

## Design (2026-02-28)

See [README.md](./README.md) for the full design document.

**Architecture**: Parser → IR → Layout → SVG Components

**Key decisions**:

1. Self-contained parser (no mermaid.js dependency)
2. SVG rendering (not HTML/Canvas)
3. Override system with shape-specific granularity (`"node:rhombus"`)
4. Theme via `@semajsx/style` design tokens
5. Signal reactivity via computed parse+layout

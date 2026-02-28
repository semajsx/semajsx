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

## Design v1 (2026-02-28)

Initial design with monolithic `<Mermaid>` component, `overrides` prop, and separate theme system.

**Problems identified**:

- `overrides` prop is React/MUI pattern, not SemaJSX (should use Context + `ctx.inject()`)
- Separate theme system instead of composing with `@semajsx/style` `defineTokens` + `createTheme`
- No declarative JSX API (SemaJSX's terminal has `<Box>`, `<Text>` as primitives)
- Components receive theme as prop instead of reading from Context
- Styles don't use `classes()` + `rule` pattern

## Design v2 (2026-02-28)

Redesigned to follow SemaJSX idioms. See [README.md](./README.md) for the full design document.

**Architecture**: Same pipeline (Parser → IR → Layout → SVG Components), but with SemaJSX-native patterns.

**Key changes from v1**:

1. **Context-based customization** — `<MermaidProvider>` + `ctx.inject(MermaidRenderers)` instead of `overrides` prop. Same pattern as `<ThemeProvider>`.
2. **`defineTokens()` + `createTheme()`** — Uses existing `@semajsx/style` primitives for all visual values. No parallel theme system.
3. **`classes()` + `rule`** — SVG elements styled via CSS classes with token references, identical to `@semajsx/ui` Button/Card.
4. **Components read theme from CSS vars** — No `theme` prop. Tokens are CSS custom properties, injected by provider.
5. **Two entry points** — `<Mermaid code={}>` (convenience) and `<Flowchart graph={}>` (programmatic IR). Both produce same SVG.
6. **Signal-reactive at IR level** — `graph` prop can be `Signal<FlowchartDiagram>`, not just `Signal<string>`.
7. **Nested Context composition** — Override renderers at any tree depth, outer providers cascade to inner.

**Decisions preserved from v1**:

1. Self-contained parser (no mermaid.js dependency)
2. SVG rendering
3. Shape-specific granularity (`"node:rhombus"`)
4. Flowchart + sequence diagram scope

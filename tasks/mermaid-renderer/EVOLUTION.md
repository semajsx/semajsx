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

## Design v2 Review & Fixes (2026-02-28)

Full review of v2 design found 13 issues. All fixed in single pass.

**Structural fixes**:

1. **Section numbering** — Sections 6-12 were misnumbered after Layout System (5) and Rendering Format (6) were inserted. Fixed to 1-15.
2. **Duplicate MermaidProvider** — Two contradicting versions (4.4 renderers-only, 4.5 with theme). Merged into one authoritative version in 4.3 that handles renderers, theme, and layout.
3. **Duplicate Flowchart** — Two versions (4.3 direct call, 6.7 context-based). Merged into one authoritative version in 6.9 using `ctx.inject(MermaidLayout)`.
4. **Duplicate node.style.ts** — Two versions with different class names. Merged into one in 4.5 with complete class list.
5. **Theme injection location** — `inject(lightTheme)` was inside `Flowchart` (missed `Sequence`). Moved to `MermaidProvider` only.

**Missing definitions added**:

6. **root.style.ts** — Was referenced but never defined. Added in 4.5.
7. **Defs component** — Was referenced but only shown as raw SVG. Added JSX component in 6.6.
8. **SubgraphBox component** — Was referenced but never defined. Added in 6.7.
9. **defaultRenderers** — Was referenced everywhere but never assembled. Added in 6.8.

**Design gaps filled**:

10. **layout prop** — `MermaidProviderProps` now includes `layout?: LayoutEngine`.
11. **Edge label sizing** — Hardcoded `width={60}` replaced with `labelSize` from layout output. `PositionedEdge` now carries `labelSize?: Size` computed during layout.
12. **Bezier curves** — Edge routing now defaults to cubic Bézier (`C` command) instead of polyline (`M`/`L`). `LayoutOptions.edgeRouting: "polyline" | "bezier"` added. Bezier algorithm documented in 5.3 Phase 5.
13. **Animated edge trigger** — Clarified as programmatic-only feature (Mermaid DSL has no "animated" type). Documented two approaches: explicit `type: "animated"` in IR, or CSS class injection via custom renderer. New Section 7 dedicated to this.
14. **Sequence Note type** — Added `Note` interface to IR (`position`, `participants[]`, `text`), `notes: Note[]` to `SequenceDiagram`, `note` to `RendererMap`, `NoteRenderProps`, note layer in sequence SVG structure.

**Minor fixes**:

15. **viewBox** — Unified to use `positioned.viewBox` from layout output everywhere.
16. **stroke-width units** — Standardized to unitless values (SVG convention). `stroke-width: 2` not `2px`. Token values are unitless numbers.
17. **SVG rx** — Documented as attribute (not CSS) for browser compatibility. Set directly on `<rect rx={8}>`.
18. **Unused imports** — Removed `rules` import that was never used.
19. **PositionedEdge.path** — Changed from `points: Point[]` to `path: string` (SVG path data). Edge component receives ready-to-use path string from layout, supporting both polyline and bezier.

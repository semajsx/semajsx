# Design Documents

This directory contains **technical design documents** for features and systems in SemaJSX.

---

## Purpose

Design documents:
- **Detail implementation** of approved features
- **Explain architectural choices** and trade-offs
- **Guide implementation** with clear specifications
- **Preserve knowledge** for future maintainers

---

## When to Create a Design Document

Create a design document when:
- ✅ Implementing a **major feature** (with or without RFC)
- ✅ Making **architectural changes** that need documentation
- ✅ **Complex implementation** that requires planning
- ✅ **Multiple approaches** exist and you need to choose
- ✅ **Future maintainers** will need to understand design rationale

Don't create a design document for:
- ❌ Simple bug fixes
- ❌ Trivial features with obvious implementation
- ❌ Documentation-only changes

---

## Design Document Lifecycle

```
RFC (if major) → Design Doc → Implementation → Update Doc if needed
```

### Before Implementation
1. **After RFC approval** (for major features)
2. **Draft design document** using [template.md](./template.md)
3. **Explore alternatives** - create multiple drafts in `.workspace/drafts/` if needed
4. **Peer review** - get feedback from team
5. **Finalize and approve** - move final version here

### During Implementation
- Reference design doc in code comments when relevant
- Update design doc if implementation deviates significantly

### After Implementation
- Mark status as "Implemented"
- Link to relevant code and tests
- Keep as reference for future work

---

## Document Structure

A good design document includes:

1. **Overview** - High-level summary
2. **Design Principles** - Guiding principles
3. **Architecture** - System structure and data flow
4. **API Design** - Public interfaces and usage examples
5. **Implementation Details** - Algorithms, data structures, edge cases
6. **Alternatives Considered** - What you didn't choose and why
7. **Performance** - Complexity analysis and bottlenecks
8. **Testing Strategy** - How to verify correctness
9. **Implementation Plan** - Phased approach and milestones

See [template.md](./template.md) for the complete structure.

---

## Naming Convention

```
feature-name-design.md
```

**Examples**:
- `context-api-design.md`
- `logger-api-design.md`
- `ssr-html-entry-build.md`

Use descriptive, lowercase names with hyphens.

---

## Design Status

Design documents can have the following statuses:

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress |
| **In Review** | Ready for feedback |
| **Approved** | Ready for implementation |
| **Implemented** | Feature is built |
| **Deprecated** | No longer relevant |

---

## Existing Design Documents

| Document | Feature | Status |
|----------|---------|--------|
| [context-api-design.md](./context-api-design.md) | Context API | Implemented |
| [logger-api-design.md](./logger-api-design.md) | Terminal Logger API | Implemented |
| [ssr-html-entry-build.md](./ssr-html-entry-build.md) | SSR HTML Entry Build | Implemented |
| [template.md](./template.md) | Template | Template |

---

## Design Principles for SemaJSX

When designing features, follow these principles:

1. **Simplicity First** - Simple over complex
2. **Explicit Over Implicit** - Clear and predictable behavior
3. **Fine-Grained Reactivity** - Signals, not virtual DOM
4. **Type Safety** - Full TypeScript support
5. **Performance** - Fast by default
6. **Developer Experience** - Intuitive and delightful APIs

---

## Drafting Process

### Multiple Design Iterations

When exploring different approaches:

1. **Create drafts** in `.workspace/drafts/`:
   ```
   .workspace/drafts/
   ├── context-api-v1.md  # First approach
   ├── context-api-v2.md  # Alternative approach
   └── context-api-v3-final.md  # Chosen approach
   ```

2. **Compare and decide** - Document trade-offs

3. **Move final version** to `../designs/`:
   ```bash
   mv .workspace/drafts/context-api-v3-final.md ../designs/context-api-design.md
   ```

4. **Clean up drafts** after implementation

---

## Template

Use [template.md](./template.md) to create new design documents. The template provides:

- Complete structure with all sections
- Examples and guidance
- Markdown formatting
- Best practices

---

## Related Documentation

- **Before design**: Check if [RFC](../rfcs/) exists
- **Architectural decisions**: Create [ADR](../adrs/) for key choices
- **Implementation**: Follow [Workflow Guide](../guides/workflow.md)

---

## Getting Started

1. Copy [template.md](./template.md) to `feature-name-design.md`
2. Fill in all relevant sections
3. Add diagrams if helpful (ASCII art or links to images)
4. Share with team for review
5. Iterate until approved
6. Implement according to design
7. Update status after implementation

**Questions?** See [DOCS.md](../../DOCS.md) for the complete documentation index.

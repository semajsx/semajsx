# Development Workflow

Standard development workflow for SemaJSX.

---

## Overview

```
Discovery → Design → Implementation → Verification → Archive
```

**Purpose**: Flexible but structured approach ensuring quality, traceability, and knowledge preservation.

**Adapt to scale**: Use full process for major features, simplified for minor changes.

---

## Stages

### 1. Discovery 📋

**Goal**: Clarify what problem to solve and why.

**Output**:

- RFC document (`rfcs/YYYY-MM-DD-feature.md`)
- Research materials (`.workspace/research/`)

**When**: Major features, breaking changes, unclear scope.

**Template**: [rfcs/template.md](./rfcs/template.md)

---

### 2. Design 🎨

**Goal**: Determine how to implement and why this design.

**Output**:

- Design document (`designs/feature-design.md`)
- ADRs for key decisions (`adrs/NNNN-decision.md`)
- Drafts (`.workspace/drafts/`)

**When**: After RFC approval, or directly for smaller features.

**Templates**: [designs/template.md](./designs/template.md), [adrs/template.md](./adrs/template.md)

---

### 3. Implementation 💻

**Goal**: Turn design into code.

**Output**:

- Source code (`packages/*/src/`)
- Tests (`*.test.ts`)
- Examples (`packages/*/examples/`)

**Git**: Small atomic commits, link design doc in PR.

---

### 4. Verification ✅

**Goal**: Ensure quality and design goals achieved.

**Checklist**:

- [ ] All tests pass
- [ ] Code coverage > 80%
- [ ] Lint/type checks pass
- [ ] Implementation matches design
- [ ] Documentation complete

---

### 5. Archive 📦

**Goal**: Clean up, document, release.

**Tasks**:

- Update CHANGELOG.md
- Move final designs from `.workspace/` to `docs/`
- Delete temporary drafts
- Release version

---

## When to Use

| Change Type   | RFC      | Design | ADR              | Example       |
| ------------- | -------- | ------ | ---------------- | ------------- |
| Major feature | ✅       | ✅     | If needed        | New engine    |
| Minor feature | Optional | ✅     | If needed        | New helper    |
| Bug fix       | ❌       | ❌     | ❌               | Fix error     |
| Refactor      | Optional | ✅     | If architectural | Restructure   |
| Docs          | ❌       | ❌     | ❌               | Update README |
| Breaking      | ✅       | ✅     | ✅               | Change API    |

**Rule of thumb**:

- **Simple change?** Direct PR
- **Need to think through design?** Create design doc
- **Major feature or breaking?** Full workflow (RFC + Design + ADR)

---

## Directory Structure

```
docs/
├── workflow.md          # This file
├── rfcs/                # Feature proposals
├── designs/             # Technical designs
└── adrs/                # Architecture decisions

.workspace/              # Temporary (git-ignored)
├── research/            # Investigation materials
├── drafts/              # Design iterations
├── discussions/         # Meeting notes
└── experiments/         # Prototype code
```

---

## Information Lifecycle

| Type        | Location                  | Lifecycle                          |
| ----------- | ------------------------- | ---------------------------------- |
| Research    | `.workspace/research/`    | Temporary, archive or delete       |
| Drafts      | `.workspace/drafts/`      | Temporary, final → `docs/designs/` |
| Discussions | `.workspace/discussions/` | Temporary, extract → RFC/ADR       |
| Experiments | `.workspace/experiments/` | Temporary, delete after validation |
| RFC         | `docs/rfcs/`              | Permanent                          |
| Design      | `docs/designs/`           | Permanent                          |
| ADR         | `docs/adrs/`              | Permanent                          |

---

## Quick Reference

**Proposing feature**: Create [RFC](./rfcs/template.md)  
**Designing implementation**: Create [Design Doc](./designs/template.md)  
**Recording decision**: Create [ADR](./adrs/template.md)  
**Drafting design**: Use `.workspace/drafts/`  
**Researching**: Use `.workspace/research/`

---

## Example Flow

```
1. User requests: "Add Context API"

2. Discovery:
   - Create RFC: docs/rfcs/2026-01-15-context-api.md
   - Research: .workspace/research/react-vs-solid-context.md

3. Design:
   - Draft v1: .workspace/drafts/context-v1.md
   - Draft v2: .workspace/drafts/context-v2.md
   - Finalize: docs/designs/context-api-design.md
   - Decision: docs/adrs/0001-use-function-params-for-context.md

4. Implementation:
   - Code: packages/core/src/context.ts
   - Tests: packages/core/src/context.test.ts
   - Examples: packages/dom/examples/context-demo/

5. Verification:
   - All tests pass ✅
   - Coverage 85% ✅
   - Lint clean ✅

6. Archive:
   - CHANGELOG.md updated
   - Delete .workspace/drafts/context-*.md
   - Release v0.5.0
```

---

## Working with AI

AI can help with:

- **Discovery**: Research, draft RFC
- **Design**: Generate drafts, suggest alternatives
- **Implementation**: Write code, tests, docs
- **Verification**: Review code quality
- **Archive**: Generate CHANGELOG, organize docs

**Tip**: Reference design docs and RFCs in your prompts for context.

---

## Questions?

- **"Do I need an RFC?"** → Only for major features or breaking changes
- **"Do I need a design doc?"** → If you need to think through the design, yes
- **"Do I need an ADR?"** → Only for significant architectural decisions
- **"Can I skip stages?"** → Yes! Use the decision matrix above

See [DOCS.md](../DOCS.md) for complete documentation index.

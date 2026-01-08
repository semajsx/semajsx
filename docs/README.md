# Internal Development Documentation

This directory contains **internal development documentation** for SemaJSX contributors, maintainers, and AI assistants.

---

## Purpose

These documents are for **people building and maintaining SemaJSX**, not for users of the framework.

- **Audience**: Contributors, maintainers, AI assistants
- **Content**: How we build SemaJSX, design decisions, architectural choices
- **Style**: Technical, detailed, rationale-focused

For **user-facing documentation** (how to use SemaJSX), see:
- Project README: [../README.md](../README.md)
- Package READMEs: `../packages/*/README.md`
- Online docs: [../apps/docs/content/](../apps/docs/content/)

---

## Directory Structure

```
docs/
├── workflow.md          # Development workflow guide
├── rfcs/                # Request for Comments (Feature proposals)
│   ├── README.md
│   └── template.md
├── designs/             # Technical design documents
│   ├── README.md
│   ├── template.md
│   ├── context-api-design.md
│   ├── logger-api-design.md
│   └── ssr-html-entry-build.md
└── adrs/                # Architecture Decision Records
    ├── README.md
    └── template.md
```

---

## Document Types

### 1. Development Workflow

**File**: [workflow.md](./workflow.md)

Describes the standard development process:
- Discovery → Design → Implementation → Verification → Archive
- When to create RFCs, design docs, ADRs
- Templates and best practices

**Read this first** to understand how development works.

---

### 2. RFCs (Request for Comments)

**Directory**: [rfcs/](./rfcs/)

Feature proposals and requirements gathering.

**When to create**:
- Proposing major new features
- Making breaking changes
- Need stakeholder approval

**Example**: "RFC: Add Context API for Component Communication"

See [rfcs/README.md](./rfcs/README.md) for details.

---

### 3. Design Documents

**Directory**: [designs/](./designs/)

Detailed technical designs for features and systems.

**When to create**:
- Implementing major features
- Making architectural changes
- Need to document design rationale

**Example**: "Context API Design Document"

See [designs/README.md](./designs/README.md) for details.

**Existing Design Docs**:
- [context-api-design.md](./designs/context-api-design.md) - Context API implementation
- [logger-api-design.md](./designs/logger-api-design.md) - Terminal Logger API
- [ssr-html-entry-build.md](./designs/ssr-html-entry-build.md) - SSR HTML entry build system

---

### 4. ADRs (Architecture Decision Records)

**Directory**: [adrs/](./adrs/)

Lightweight records of important architectural decisions.

**When to create**:
- Making significant architectural choices
- Choosing between multiple viable alternatives
- Decisions with long-term impact

**Example**: "ADR-0001: Use Signals for Reactivity"

See [adrs/README.md](./adrs/README.md) for details.

---

## Related Documentation

### Root-Level Development Docs

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](../CLAUDE.md) | AI assistant instructions |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contribution guidelines |
| [MONOREPO_ARCHITECTURE.md](../MONOREPO_ARCHITECTURE.md) | Monorepo structure |
| [TESTING.md](../TESTING.md) | Testing strategy |

### User-Facing Docs

| Location | Purpose |
|----------|---------|
| [README.md](../README.md) | Project introduction |
| [CHANGELOG.md](../CHANGELOG.md) | Version history |
| [packages/\*/README.md](../packages/) | Package usage guides |
| [apps/docs/content/](../apps/docs/content/) | Tutorials & API reference |

---

## Complete Documentation Index

See [DOCS.md](../DOCS.md) for a complete index of all documentation in the project.

---

## Getting Started

### For Contributors

1. **Read the workflow**: [workflow.md](./workflow.md)
2. **Understand the architecture**: [MONOREPO_ARCHITECTURE.md](../MONOREPO_ARCHITECTURE.md)
3. **Learn testing approach**: [TESTING.md](../TESTING.md)
4. **Follow contribution guidelines**: [CONTRIBUTING.md](../CONTRIBUTING.md)

### For AI Assistants

1. **Start with**: [CLAUDE.md](../CLAUDE.md)
2. **Understand workflow**: [workflow.md](./workflow.md)
3. **Reference designs**: [designs/](./designs/)
4. **Check ADRs**: [adrs/](./adrs/) (when created)

---

## Temporary Workspace

For work-in-progress materials, use `.workspace/` (git-ignored):

```
.workspace/
├── research/       # Research materials
├── drafts/         # Design document drafts
├── discussions/    # Meeting notes
└── experiments/    # Prototype code
```

See [.workspace/README.md](../.workspace/README.md) for details.

---

## Creating New Documentation

| Task | Document Type | Location |
|------|--------------|----------|
| Propose major feature | RFC | `docs/rfcs/YYYY-MM-DD-feature.md` |
| Design implementation | Design Doc | `docs/designs/feature-design.md` |
| Record architectural decision | ADR | `docs/adrs/NNNN-decision-title.md` |
| Teach users | Tutorial | `apps/docs/content/guides/` |
| Document API | Reference | `apps/docs/content/docs/` or package README |

Use the templates in each directory to create consistent documentation.

---

**Questions?** See [DOCS.md](../DOCS.md) for the complete documentation index or [workflow.md](./workflow.md) for the development process.

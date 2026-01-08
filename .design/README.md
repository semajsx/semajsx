# .design Directory

This directory contains internal design documentation for SemaJSX, including architectural decisions, feature designs, discussions, and research.

## Purpose

The `.design/` directory serves as the central repository for:

- **Architecture**: Deep dives into system design
- **Decisions**: Architectural Decision Records (ADRs)
- **Features**: Feature design documents
- **Discussions**: Active design discussions
- **Research**: Investigation and research notes
- **Comparisons**: Framework comparisons
- **Archive**: Historical and superseded documents

## Directory Structure

```
.design/
├── README.md                    # This file
├── DOCUMENTATION_PLAN.md        # Overall documentation strategy
│
├── architecture/                # Architectural design docs
├── decisions/                   # ADRs (Architectural Decision Records)
├── features/                    # Feature design documents
├── discussions/                 # Active design discussions
├── research/                    # Research notes
├── comparisons/                 # Framework comparisons
└── archive/                     # Historical documents
```

## Document Types

### Architecture Documents

**Purpose**: Explain how major system components work

**Examples**:

- Signal system implementation
- Rendering pipeline
- VNode normalization
- Context API design

**Audience**: Contributors, maintainers

**Lifecycle**: Permanent, updated as system evolves

### Architectural Decision Records (ADRs)

**Purpose**: Record significant architectural decisions

**Format**: `.design/decisions/NNNN-title.md`

**Template**: See DOCUMENTATION_PLAN.md

**Key Principle**: ADRs are never deleted, only superseded

**Examples**:

- 0001-use-bun-workspaces.md
- 0002-signal-based-reactivity.md
- 0003-dual-rendering-targets.md

### Feature Designs

**Purpose**: Document feature design and implementation approach

**Audience**: Contributors implementing features

**Lifecycle**: Created before implementation, maintained after

**Examples**:

- logger-api-design.md
- ssg-collections.md
- hydration-strategy.md

### Discussions

**Purpose**: Capture ongoing design discussions and proposals

**Format**: `.design/discussions/YYYY-MM-topic.md`

**Lifecycle**: Active → Resolved → Archived

**Examples**:

- 2024-12-suspense-api.md
- 2025-01-devtools-plan.md

### Research Notes

**Purpose**: Document investigation results and findings

**Audience**: Team members evaluating options

**Examples**:

- vdom-vs-signals.md (performance research)
- ssr-frameworks-survey.md
- build-tool-options.md

### Comparisons

**Purpose**: Compare SemaJSX with other frameworks

**Audience**: Users evaluating SemaJSX, contributors understanding trade-offs

**Examples**:

- react.md
- solid.md
- vue.md

### Archive

**Purpose**: Store superseded or completed design documents

**Principle**: Never delete, only archive with reason

**Format**: Add archive header to document:

```markdown
> **ARCHIVED**: YYYY-MM-DD
> **Reason**: Superseded by [new doc]
```

## Usage Guidelines

### Creating New Documents

1. **Choose the right type**: Architecture, ADR, Feature, or Discussion
2. **Use templates**: See DOCUMENTATION_PLAN.md for templates
3. **Follow naming conventions**:
   - ADRs: `NNNN-title.md`
   - Discussions: `YYYY-MM-topic.md`
   - Others: `kebab-case.md`
4. **Add metadata**: Status, date, owner
5. **Cross-link**: Reference related docs

### Document Status Values

- **Draft**: Initial version, work in progress
- **In Review**: Ready for team review
- **Approved**: Reviewed and accepted
- **Implemented**: Feature completed
- **Superseded**: Replaced by newer document
- **Archived**: Historical reference only

### Maintenance

- **Review cycle**: Quarterly for architecture docs
- **Update on changes**: Keep docs synchronized with code
- **Archive when done**: Move completed discussions to archive
- **Link updates**: Update cross-references when moving docs

## Visibility

📢 **IMPORTANT**: Documents in `.design/` are **internal** and not included in public documentation.

For public-facing documentation:

- User guides → `docs/`
- Package APIs → `packages/*/README.md`
- Tutorials → `apps/docs/content/`

## Getting Started

### As a Contributor

1. Read architecture docs to understand system design
2. Review relevant ADRs to understand decisions
3. Check active discussions for ongoing work
4. Reference feature designs when implementing

### As a Core Team Member

1. Create ADRs for significant decisions
2. Document feature designs before implementing
3. Start discussions for proposals
4. Keep documents updated
5. Archive completed items

## 🚀 Quick Start

**New here?** Start with these in order:

1. **[📋 Cheat Sheet](./DOCUMENTATION_CHEATSHEET.md)** - Ultra-compact reference (1 page)
2. **[📚 Quick Guide](../DOC_GUIDE.md)** - Decision tree and quick actions (3 pages)
3. **[🌳 Workflow](./DOCUMENTATION_WORKFLOW.md)** - Visual flowcharts and diagrams
4. **[📖 Full Plan](./DOCUMENTATION_PLAN.md)** - Complete strategy with templates (60+ pages)

## Quick Links

- [Documentation Plan](./DOCUMENTATION_PLAN.md) - Full documentation strategy
- [Architecture Summary](./ARCHITECTURE_SUMMARY.md) - System architecture overview
- [Decisions](./decisions/) - All ADRs
- [Active Discussions](./discussions/) - Current proposals
- [Architecture Deep Dives](./architecture/) - System design details

## Questions?

For questions about:

- **What to document**: See DOCUMENTATION_PLAN.md
- **How to document**: Use templates in DOCUMENTATION_PLAN.md
- **Where to document**: Refer to directory structure above
- **When to document**: Before major implementation, after significant decisions

---

**Last Updated**: 2026-01-08

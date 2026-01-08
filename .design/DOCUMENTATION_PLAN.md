# 📚 SemaJSX Documentation Organization Plan

## Overview

This document defines the comprehensive documentation strategy for SemaJSX, including structure, classification, lifecycle management, and maintenance guidelines.

**Last Updated**: 2026-01-08
**Status**: Proposed
**Owner**: Core Team

---

## 🎯 Documentation Goals

### Primary Objectives

1. **Accessibility**: Make it easy for developers to find what they need
2. **Maintainability**: Keep documentation synchronized with code
3. **Traceability**: Track design decisions and their evolution
4. **Clarity**: Separate different types of documentation by purpose
5. **Lifecycle Management**: Handle temporary, transitional, and permanent docs

### Target Audiences

- **New Users**: Getting started, tutorials, examples
- **Contributors**: Architecture, design decisions, contributing guides
- **Maintainers**: Technical deep dives, implementation details
- **Decision Makers**: Comparisons, trade-offs, roadmap

---

## 📁 Directory Structure

### Root-Level Documentation

```
semajsx/
├── README.md                          # Project overview, quick start (PUBLIC)
├── CHANGELOG.md                       # Version history (PUBLIC)
├── CONTRIBUTING.md                    # Contribution guide (PUBLIC)
├── CODE_OF_CONDUCT.md                 # Community guidelines (PUBLIC)
├── LICENSE                            # MIT License (PUBLIC)
│
├── CLAUDE.md                          # Claude Code development guide (INTERNAL)
├── MONOREPO_ARCHITECTURE.md           # Monorepo structure & migration (INTERNAL)
├── TESTING.md                         # Testing strategy & guide (INTERNAL)
│
├── .design/                           # Design documents & decisions (INTERNAL)
│   ├── DOCUMENTATION_PLAN.md          # This file
│   ├── README.md                      # Overview of .design directory
│   │
│   ├── architecture/                  # Architectural design docs
│   │   ├── overview.md                # High-level architecture
│   │   ├── signal-system.md           # Signal implementation deep dive
│   │   ├── vnode-system.md            # VNode design
│   │   ├── rendering-pipeline.md      # Rendering flow
│   │   ├── context-system.md          # Context API design (moved from apps/docs/)
│   │   └── island-architecture.md     # SSR/Islands explanation
│   │
│   ├── decisions/                     # Architectural Decision Records (ADRs)
│   │   ├── README.md                  # ADR index
│   │   ├── 0001-use-bun-workspaces.md
│   │   ├── 0002-signal-based-reactivity.md
│   │   ├── 0003-dual-rendering-targets.md
│   │   ├── 0004-typescript-native-default.md
│   │   └── 0005-symbol-based-context.md
│   │
│   ├── features/                      # Feature design documents
│   │   ├── logger-api-design.md       # Logger design philosophy (moved from packages/logger/)
│   │   ├── ssg-collections.md         # SSG collections design
│   │   ├── hydration-strategy.md      # Hydration approach
│   │   └── terminal-flexbox.md        # Terminal layout design
│   │
│   ├── comparisons/                   # Framework comparisons
│   │   ├── react.md                   # vs React
│   │   ├── solid.md                   # vs Solid
│   │   ├── vue.md                     # vs Vue
│   │   └── svelte.md                  # vs Svelte
│   │
│   ├── discussions/                   # Design discussions & proposals
│   │   ├── README.md                  # Active discussions index
│   │   ├── 2024-12-suspense-api.md    # Suspense implementation proposal
│   │   ├── 2025-01-devtools-plan.md   # DevTools design discussion
│   │   └── [YYYY-MM-topic].md         # Naming convention
│   │
│   ├── research/                      # Research notes & spike results
│   │   ├── vdom-vs-signals.md         # Performance comparison research
│   │   ├── ssr-frameworks-survey.md   # Survey of SSR approaches
│   │   └── build-tool-options.md      # Bundler evaluation
│   │
│   └── archive/                       # Historical/obsolete design docs
│       ├── README.md                  # Archive index with reasons
│       └── old-context-api.md         # Superseded designs
│
├── .tasks/                            # Project tasks & planning (INTERNAL)
│   ├── README.md                      # Task management guide
│   │
│   ├── active/                        # Current active tasks
│   │   ├── complete-package-readmes.md
│   │   ├── devtools-implementation.md
│   │   └── [feature-name].md          # Task template
│   │
│   ├── backlog/                       # Planned but not started
│   │   ├── suspense-support.md
│   │   ├── streaming-ssr.md
│   │   └── [feature-name].md
│   │
│   ├── completed/                     # Finished tasks (archive)
│   │   ├── 2024-12-typescript-native.md
│   │   └── 2025-01-oxlint-migration.md
│   │
│   └── templates/                     # Task templates
│       ├── feature-task.md            # Feature development template
│       ├── bug-task.md                # Bug fix template
│       └── refactor-task.md           # Refactoring template
│
├── .temp/                             # Temporary working documents (GITIGNORED)
│   ├── README.md                      # Temp docs usage guide
│   ├── scratch/                       # Quick notes, experiments
│   ├── reviews/                       # Code review notes
│   └── investigations/                # Bug investigation notes
│
├── docs/                              # Public-facing documentation
│   ├── getting-started/               # Tutorials & guides
│   ├── api/                           # API reference
│   ├── guides/                        # How-to guides
│   ├── architecture/                  # Public architecture overview
│   ├── migration/                     # Migration guides
│   └── troubleshooting/               # Common issues & solutions
│
└── apps/docs/                         # Documentation website (VitePress/Astro)
    ├── content/
    │   ├── docs/                      # Main documentation
    │   ├── guides/                    # Tutorial guides
    │   ├── api/                       # API reference
    │   └── blog/                      # Blog posts & announcements
    └── public/                        # Static assets
```

### Package-Level Documentation

```
packages/<package-name>/
├── README.md                          # Package overview & API (PUBLIC)
├── CHANGELOG.md                       # Package-specific changelog (PUBLIC)
│
├── docs/                              # Package-specific detailed docs
│   ├── api.md                         # Complete API reference
│   ├── examples.md                    # Usage examples
│   └── implementation.md              # Implementation notes
│
├── examples/                          # Runnable examples
│   ├── basic/
│   ├── advanced/
│   └── <example-name>/
│       ├── README.md                  # Example documentation
│       └── index.tsx                  # Example code
│
└── src/                               # Source code
    ├── **/*.ts                        # Implementation
    └── **/*.test.ts                   # Tests (collocated)
```

---

## 📋 Documentation Classification

### By Purpose

| Type                | Location                | Audience     | Lifecycle    | Visibility |
| ------------------- | ----------------------- | ------------ | ------------ | ---------- |
| **Public Docs**     | `docs/`, `README.md`    | Users        | Permanent    | Public     |
| **Architecture**    | `.design/architecture/` | Contributors | Permanent    | Internal   |
| **Decisions (ADR)** | `.design/decisions/`    | All          | Permanent    | Internal   |
| **Feature Design**  | `.design/features/`     | Contributors | Permanent    | Internal   |
| **Discussions**     | `.design/discussions/`  | Core Team    | Transitional | Internal   |
| **Research**        | `.design/research/`     | Contributors | Reference    | Internal   |
| **Tasks**           | `.tasks/active/`        | Core Team    | Temporary    | Internal   |
| **Scratch**         | `.temp/scratch/`        | Individual   | Ephemeral    | Gitignored |

### By Lifecycle

#### 1. **Permanent Documents** (Never Deleted)

**Location**: `docs/`, `.design/architecture/`, `.design/decisions/`

**Characteristics**:

- Canonical reference material
- Maintained and updated as system evolves
- Versioned in git
- Subject to review process

**Examples**:

- Architecture overviews
- ADRs (never deleted, only superseded)
- Public API documentation
- Contributing guidelines

**Maintenance**:

- Regular reviews (quarterly)
- Updated with major changes
- Versioned when appropriate

#### 2. **Transitional Documents** (Move or Archive)

**Location**: `.design/discussions/`, `.tasks/active/`

**Characteristics**:

- Active work in progress
- Eventually resolved or archived
- Contains decision rationale
- May become permanent docs

**Examples**:

- Design proposals
- Feature planning docs
- Active task tracking
- Investigation reports

**Lifecycle**:

1. **Created**: When discussion/task starts
2. **Active**: Under development/discussion
3. **Resolved**: Decision made or task completed
4. **Archived**: Moved to `.design/archive/` or `.tasks/completed/`

**Maintenance**:

- Monthly review of active items
- Archive completed items
- Extract lessons into permanent docs

#### 3. **Temporary Documents** (Deleted After Use)

**Location**: `.temp/`

**Characteristics**:

- Short-lived working documents
- Personal notes and scratch work
- Not reviewed or versioned
- Gitignored

**Examples**:

- Quick investigation notes
- Code review scratch pads
- Personal TODO lists
- Debugging logs

**Lifecycle**:

1. **Created**: When needed
2. **Used**: During work
3. **Deleted**: After completion (hours/days)

**Maintenance**:

- `.temp/` is gitignored
- Individual responsibility
- Clean up weekly

#### 4. **Archived Documents** (Historical Reference)

**Location**: `.design/archive/`, `.tasks/completed/`

**Characteristics**:

- Completed or obsolete
- Kept for historical context
- Read-only reference
- Includes reason for archival

**Examples**:

- Superseded designs
- Rejected proposals
- Completed tasks
- Old implementation notes

**Maintenance**:

- Never deleted
- Includes "Archived: YYYY-MM-DD, Reason"
- Linked from new docs when relevant

---

## 📝 Document Types & Templates

### 1. Architectural Decision Record (ADR)

**Location**: `.design/decisions/NNNN-title.md`

**Template**:

```markdown
# ADR-NNNN: [Title]

**Status**: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
**Date**: YYYY-MM-DD
**Deciders**: [Names]
**Tags**: #architecture #performance #api

## Context

What is the issue/problem we're addressing?

## Decision

What decision did we make?

## Rationale

Why did we choose this approach?

## Consequences

What are the implications (positive and negative)?

## Alternatives Considered

What other options did we evaluate?

## References

- Links to discussions
- Related ADRs
- External resources
```

**Numbering**: Sequential (0001, 0002, ...)

**Lifecycle**: Permanent (never deleted, only superseded)

### 2. Feature Design Document

**Location**: `.design/features/[feature-name].md`

**Template**:

```markdown
# [Feature Name] Design

**Status**: Draft | In Review | Approved | Implemented
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD
**Owner**: [Name]

## Overview

Brief description of the feature.

## Goals

What problems does this solve?

## Non-Goals

What is explicitly out of scope?

## Design

### API Design

Public API and usage examples.

### Implementation

High-level implementation approach.

### Edge Cases

How do we handle edge cases?

## Alternatives Considered

Other approaches and why they were rejected.

## Performance Implications

Impact on bundle size, runtime, memory.

## Migration Strategy

How do users adopt this feature?

## Testing Strategy

How do we verify correctness?

## Open Questions

Unresolved issues for discussion.

## References

- Related ADRs
- Discussions
- External inspiration
```

### 3. Task Document

**Location**: `.tasks/active/[task-name].md`

**Template**:

```markdown
# Task: [Task Name]

**Type**: Feature | Bug Fix | Refactor | Docs
**Status**: Planning | In Progress | Review | Completed | Blocked
**Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Created**: YYYY-MM-DD
**Owner**: [Name]
**Estimated Effort**: S/M/L/XL
**Target Version**: vX.Y.Z

## Description

What needs to be done?

## Requirements

- [ ] Requirement 1
- [ ] Requirement 2

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Implementation Plan

1. Step 1
2. Step 2

## Progress

- [x] 2025-01-08: Initial investigation
- [ ] 2025-01-09: Implementation started

## Blockers

None | [Description of blocker]

## Notes

Additional context, learnings, decisions.

## Related

- ADR-XXXX
- Issue #123
- PR #456
```

**Lifecycle**:

- Move to `.tasks/completed/` when done
- Add completion date and summary

### 4. Discussion Document

**Location**: `.design/discussions/[YYYY-MM-topic].md`

**Template**:

```markdown
# Discussion: [Topic]

**Status**: Open | Resolved | Abandoned
**Created**: YYYY-MM-DD
**Participants**: [Names]
**Resolution Date**: YYYY-MM-DD (if resolved)

## Question

What are we trying to decide?

## Options

### Option A: [Name]

**Pros**:

- Pro 1
- Pro 2

**Cons**:

- Con 1
- Con 2

### Option B: [Name]

[Similar structure]

## Discussion

Notes from meetings, comments, feedback.

## Resolution

If resolved: What was decided and why?

## Next Steps

- [ ] Action item 1
- [ ] Action item 2

## References

- Related discussions
- External resources
```

**Lifecycle**:

- Open → Resolved → Archive to `.design/archive/`
- Extract decision into ADR if significant

---

## 🔄 Document Lifecycle Management

### Active Documents Workflow

```
                    ┌─────────────────┐
                    │  Idea / Proposal│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Discussion Doc │ (.design/discussions/)
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
       ┌────────────────┐       ┌────────────────┐
       │  Decision Made │       │    Rejected    │
       │      (ADR)     │       │   (Archive)    │
       └────────┬───────┘       └────────────────┘
                │
                ▼
       ┌────────────────┐
       │  Feature Design│ (.design/features/)
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │   Task Created │ (.tasks/active/)
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │  Implementation│
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │   Task Done    │ (.tasks/completed/)
       │  Design Stays  │ (.design/features/)
       └────────────────┘
```

### Archive Criteria

A document should be archived when:

1. **Superseded**: New design/decision replaces it
2. **Completed**: Task finished, outcome documented
3. **Rejected**: Proposal declined, rationale recorded
4. **Obsolete**: No longer relevant to current system
5. **Stale**: Inactive for 6+ months with no resolution

### Archive Process

1. Add archive header to document:

   ```markdown
   > **ARCHIVED**: YYYY-MM-DD
   > **Reason**: [Brief explanation]
   > **Superseded by**: [Link to new doc if applicable]
   ```

2. Move to appropriate archive directory
3. Update index/README with archived status
4. Link from new documentation if relevant

---

## 📊 Documentation Metrics & Health

### Quality Metrics

- **Coverage**: % of packages with complete READMEs
- **Freshness**: Days since last update
- **Completeness**: API reference coverage
- **Accuracy**: Sync with current implementation

### Review Schedule

| Document Type   | Review Frequency |
| --------------- | ---------------- |
| Public Docs     | Every release    |
| Architecture    | Quarterly        |
| ADRs            | When superseded  |
| Feature Designs | When implemented |
| Active Tasks    | Weekly           |
| Discussions     | Bi-weekly        |

### Ownership

| Area         | Owner           | Backup      |
| ------------ | --------------- | ----------- |
| Public Docs  | Product Lead    | Tech Writer |
| Architecture | Architect       | Senior Dev  |
| ADRs         | Core Team       | Architect   |
| Tasks        | Project Manager | Team Leads  |

---

## 🛠️ Tools & Automation

### Recommended Tools

1. **Markdown Linter**: Vale or markdownlint
2. **Link Checker**: markdown-link-check
3. **Documentation Generator**: TypeDoc for API reference
4. **Search**: Algolia DocSearch for docs site
5. **Diagrams**: Mermaid for architecture diagrams

### Automation Ideas

```yaml
# .github/workflows/docs-quality.yml
- Check for broken links
- Validate ADR numbering
- Ensure all packages have READMEs
- Check for stale documents (no update in 6 months)
- Generate API reference from code
```

---

## 📚 Writing Guidelines

### General Principles

1. **Clarity**: Write for your audience (user vs contributor)
2. **Conciseness**: Respect reader's time
3. **Examples**: Show, don't just tell
4. **Structure**: Use consistent formatting
5. **Maintenance**: Date documents, note status

### Style Guide

- **Headings**: Use Title Case for H1, Sentence case for H2-H6
- **Code**: Always use syntax highlighting
- **Lists**: Use `-` for unordered, `1.` for ordered
- **Emphasis**: `**bold**` for important, `*italic*` for new terms
- **Links**: Descriptive text, not "click here"
- **Diagrams**: Use Mermaid for consistency

### Code Examples

```typescript
// ✅ Good: Real-world, runnable example
import { signal } from "semajsx/signal";

const count = signal(0);
const increment = () => count.value++;

// ❌ Bad: Pseudo-code or incomplete
const x = doSomething();
```

---

## 🎯 Current Status & Next Steps

### Completed ✅

- Root-level documentation (README, CONTRIBUTING, etc.)
- Basic package READMEs (signal, core, utils, logger, ssg)
- Two design documents (Context API, Logger API)
- Testing guide (TESTING.md)
- Monorepo architecture doc

### In Progress 🚧

- Creating `.design/` directory structure
- Migrating existing design docs
- Creating ADR index

### Planned 📋

1. **Immediate** (P0):
   - [ ] Create `.design/` directory structure
   - [ ] Write ADRs for key decisions (Bun workspaces, signals, dual rendering, TypeScript Native)
   - [ ] Migrate existing design docs to `.design/features/`
   - [ ] Create missing package READMEs (dom, terminal, ssr)

2. **Short-term** (P1):
   - [ ] Create `.tasks/` structure
   - [ ] Document active tasks/features
   - [ ] Establish documentation review process
   - [ ] Set up automated link checking

3. **Medium-term** (P2):
   - [ ] Complete architecture documentation series
   - [ ] Write framework comparison guides
   - [ ] Create comprehensive API reference site
   - [ ] Add more tutorials and examples

4. **Long-term** (P3):
   - [ ] Video tutorials
   - [ ] Interactive playground with docs
   - [ ] Documentation translations
   - [ ] Community contribution to docs

---

## 🤝 Contributing to Documentation

### Who Can Contribute?

- **Core Team**: All documentation types
- **Contributors**: Public docs, examples, guides
- **Users**: Typo fixes, clarifications, examples

### Review Process

1. **Public Docs**: Requires 1 approval from core team
2. **Architecture/ADRs**: Requires 2 approvals
3. **Tasks**: Owner + project manager
4. **Typo fixes**: Can be merged directly

### Best Practices

- Update documentation in same PR as code changes
- Add examples for new features
- Update changelog and migration guides
- Cross-link related documentation

---

## 📞 Questions?

For questions about documentation:

- **Structure**: Ask in `.design/discussions/`
- **Writing**: Refer to this guide
- **Tools**: See team wiki
- **Review**: Tag documentation owner

---

## Appendix: Migration Plan

### Phase 1: Structure (Week 1)

1. Create `.design/` directory hierarchy
2. Create `.tasks/` directory hierarchy
3. Add `.temp/` to `.gitignore`
4. Create README files for each directory

### Phase 2: Migration (Week 2)

1. Migrate `apps/docs/context-api-design.md` → `.design/architecture/context-system.md`
2. Migrate `packages/logger/LOGGER_API_DESIGN.md` → `.design/features/logger-api-design.md`
3. Move `.github/CONFIG_OPTIMIZATION.md` → `.design/decisions/0004-typescript-native-default.md` (as ADR)

### Phase 3: Backfill (Week 3-4)

1. Write ADRs for major decisions:
   - ADR-0001: Use Bun workspaces
   - ADR-0002: Signal-based reactivity over VDOM
   - ADR-0003: Dual rendering targets (DOM + Terminal)
   - ADR-0005: Symbol-based context API

2. Document active features in `.tasks/active/`
3. Create documentation health check automation

### Phase 4: Continuous Improvement

1. Regular documentation reviews
2. Keep structure updated
3. Gather feedback from users and contributors
4. Iterate on process

---

**End of Documentation Plan**

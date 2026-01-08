# Documentation Index

This document provides an index of all documentation in the SemaJSX project, organized by purpose and audience.

---

## 📚 Documentation Categories

SemaJSX documentation is organized into two main categories:

### 1. **Internal Development Documentation**
For contributors, maintainers, and AI assistants. These documents describe how the project is built and maintained.

### 2. **User-Facing Documentation**
For users of SemaJSX. These documents describe how to use the framework.

---

## 🔧 Internal Development Documentation

### Core Development Guides

| Document | Purpose | Audience |
|----------|---------|----------|
| [CLAUDE.md](./CLAUDE.md) | AI assistant instructions and project overview | AI, Contributors |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines and development setup | Contributors |
| [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) | Monorepo structure and organization | Contributors, Maintainers |
| [TESTING.md](./TESTING.md) | Testing strategy and guidelines | Contributors |
| [docs/workflow.md](./docs/workflow.md) | Development workflow (Discovery → Design → Implementation → Verification → Archive) | Contributors, AI |

### Configuration and Optimization

| Document | Purpose |
|----------|---------|
| [.github/CONFIG_OPTIMIZATION.md](./.github/CONFIG_OPTIMIZATION.md) | Configuration optimization notes |

### Design Documents

Design documents for implemented or in-progress features:

| Document | Feature | Status |
|----------|---------|--------|
| [docs/designs/context-api-design.md](./docs/designs/context-api-design.md) | Context API design | Implemented |
| [docs/designs/logger-api-design.md](./docs/designs/logger-api-design.md) | Terminal Logger API design | Implemented |
| [docs/designs/ssr-html-entry-build.md](./docs/designs/ssr-html-entry-build.md) | SSR HTML entry build system | Implemented |
| [docs/designs/template.md](./docs/designs/template.md) | Template for new design docs | Template |

### RFCs (Request for Comments)

Feature proposals and requirements:

| Document | Status |
|----------|--------|
| [docs/rfcs/template.md](./docs/rfcs/template.md) | Template for new RFCs | Template |

_No RFCs yet. Create new RFCs in `docs/rfcs/` using the template._

### ADRs (Architecture Decision Records)

Key architectural decisions:

| Document | Decision | Status |
|----------|----------|--------|
| [docs/adrs/template.md](./docs/adrs/template.md) | Template for new ADRs | Template |

_No ADRs yet. Create new ADRs in `docs/adrs/` using the template._

### Temporary Workspace

Work-in-progress materials (git-ignored):

```
.workspace/
├── research/       # Research materials
├── drafts/         # Design document drafts
├── discussions/    # Meeting notes
└── experiments/    # Prototype code
```

See [.workspace/README.md](./.workspace/README.md) for details.

---

## 📖 User-Facing Documentation

### Main Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](./README.md) | Project introduction and quick start | All users |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes | All users |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community guidelines | All users |

### Package Documentation

Each package has its own README for users:

#### Core Packages

| Package | Documentation | Description |
|---------|--------------|-------------|
| `semajsx` | [packages/semajsx/README.md](./packages/semajsx/README.md) | Main umbrella package |
| `@semajsx/core` | [packages/core/README.md](./packages/core/README.md) | Runtime core (VNode, helpers) |
| `@semajsx/signal` | [packages/signal/README.md](./packages/signal/README.md) | Signal reactivity system |
| `@semajsx/dom` | [packages/dom/README.md](./packages/dom/README.md) | DOM rendering |
| `@semajsx/ssr` | [packages/ssr/README.md](./packages/ssr/README.md) | Server-side rendering |
| `@semajsx/ssg` | [packages/ssg/README.md](./packages/ssg/README.md) | Static site generation |
| `@semajsx/terminal` | [packages/terminal/README.md](./packages/terminal/README.md) | Terminal rendering |
| `@semajsx/logger` | [packages/logger/src/README.md](./packages/logger/src/README.md) | Logging utilities |
| `@semajsx/utils` | [packages/utils/README.md](./packages/utils/README.md) | Shared utilities |

#### Internal Packages

| Package | Documentation | Description |
|---------|--------------|-------------|
| `@semajsx/configs` | [packages/configs/README.md](./packages/configs/README.md) | Shared TypeScript configurations |

### Online Documentation

User guides and tutorials are published to the documentation site:

| Section | Location | Description |
|---------|----------|-------------|
| Docs | [apps/docs/content/docs/](./apps/docs/content/docs/) | API reference and concepts |
| Guides | [apps/docs/content/guides/](./apps/docs/content/guides/) | Step-by-step tutorials |

**Key User Docs:**
- [Getting Started](./apps/docs/content/docs/getting-started.md)
- [Signals](./apps/docs/content/docs/signals.md)
- [Components](./apps/docs/content/docs/components.md)
- [SSG](./apps/docs/content/docs/ssg.md)
- [Building a Counter](./apps/docs/content/guides/building-a-counter.md)

---

## 🗂️ Documentation Organization Principles

### Internal vs User-Facing

| Aspect | Internal Docs | User Docs |
|--------|--------------|-----------|
| **Purpose** | How we build SemaJSX | How to use SemaJSX |
| **Audience** | Contributors, AI, Maintainers | Developers using SemaJSX |
| **Location** | Root level, `apps/docs/{rfcs,designs,adrs,guides}` | `README.md`, `packages/*/README.md`, `apps/docs/content/` |
| **Style** | Technical, detailed, decision-focused | Tutorial, practical, example-focused |
| **Examples** | Architecture decisions, design rationale | Code examples, usage patterns |

### Document Lifecycle

```
Internal Documents:
RFC → Design Doc → Implementation → ADR (if architectural) → Archive

User Documents:
Draft → Review → Publish to docs site → Update with versions
```

### When to Create What

| Situation | Document Type | Location |
|-----------|--------------|----------|
| Proposing major feature | RFC | `docs/rfcs/` |
| Designing implementation | Design Doc | `docs/designs/` |
| Recording architectural choice | ADR | `docs/adrs/` |
| Explaining development process | Guide | `apps/docs/guides/` or root level |
| Teaching users how to use | Tutorial | `apps/docs/content/guides/` |
| Documenting API | Reference | `apps/docs/content/docs/` or package README |

---

## 🔍 Finding Documentation

### For Contributors

**"How do I develop a new feature?"**
→ [docs/workflow.md](./docs/workflow.md)

**"How does the monorepo work?"**
→ [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md)

**"How do I write tests?"**
→ [TESTING.md](./TESTING.md)

**"How do I contribute?"**
→ [CONTRIBUTING.md](./CONTRIBUTING.md)

**"What design decisions were made?"**
→ [docs/designs/](./docs/designs/)

### For Users

**"How do I get started with SemaJSX?"**
→ [README.md](./README.md) and [Getting Started](./apps/docs/content/docs/getting-started.md)

**"How do signals work?"**
→ [apps/docs/content/docs/signals.md](./apps/docs/content/docs/signals.md)

**"What changed in the latest version?"**
→ [CHANGELOG.md](./CHANGELOG.md)

**"How do I use [specific package]?"**
→ Check the package's README: `packages/[package-name]/README.md`

### For AI Assistants

**Start here:** [CLAUDE.md](./CLAUDE.md)

**Key references:**
- [Development Workflow](./docs/workflow.md) - How to plan and execute work
- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Project structure
- [TESTING.md](./TESTING.md) - Testing approach
- [Design Documents](./docs/designs/) - Implementation details

---

## 📝 Document Templates

When creating new documentation, use the appropriate template:

- **RFC**: [docs/rfcs/template.md](./docs/rfcs/template.md)
- **Design Document**: [docs/designs/template.md](./docs/designs/template.md)
- **ADR**: [docs/adrs/template.md](./docs/adrs/template.md)

---

## 🔄 Maintaining This Index

When adding new documentation:

1. **Internal docs**: Add to the appropriate section above
2. **User docs**: Ensure it's listed in the User-Facing section
3. **Keep organized**: Group similar documents together
4. **Link everything**: Every document should be reachable from this index

**Last updated**: 2026-01-08

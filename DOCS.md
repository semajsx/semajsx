# Documentation Index

Quick reference to all documentation in SemaJSX.

---

## 📂 Two Types of Documentation

| Type | Purpose | Location |
|------|---------|----------|
| **Internal** | How we build SemaJSX | Root + `docs/` |
| **User** | How to use SemaJSX | `README.md`, `packages/*/README.md`, `apps/docs/content/` |

---

## 🔧 Internal Documentation (Contributors, AI)

### Core Guides
- [CLAUDE.md](./CLAUDE.md) - AI instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) - Monorepo structure
- [TESTING.md](./TESTING.md) - Testing guide
- [docs/workflow.md](./docs/workflow.md) - Development workflow

### Design & Decisions
- [docs/designs/](./docs/designs/) - Design documents ([context-api](./docs/designs/context-api-design.md), [logger](./docs/designs/logger-api-design.md), [ssr](./docs/designs/ssr-html-entry-build.md))
- [docs/rfcs/](./docs/rfcs/) - Feature proposals (none yet)
- [docs/adrs/](./docs/adrs/) - Architecture decisions (none yet)

### Workspace
- `.workspace/` - Temp files (research, drafts, experiments) - git-ignored

---

## 📖 User Documentation

### Main Docs
- [README.md](./README.md) - Project intro
- [CHANGELOG.md](./CHANGELOG.md) - Version history

### Packages
- `semajsx` - [README](./packages/semajsx/README.md)
- `@semajsx/core` - [README](./packages/core/README.md)
- `@semajsx/signal` - [README](./packages/signal/README.md)
- `@semajsx/dom` - [README](./packages/dom/README.md)
- `@semajsx/ssr` - [README](./packages/ssr/README.md)
- `@semajsx/ssg` - [README](./packages/ssg/README.md)
- `@semajsx/terminal` - [README](./packages/terminal/README.md)
- `@semajsx/logger` - [README](./packages/logger/src/README.md)
- `@semajsx/utils` - [README](./packages/utils/README.md)

### Online Docs
- [apps/docs/content/docs/](./apps/docs/content/docs/) - API reference
- [apps/docs/content/guides/](./apps/docs/content/guides/) - Tutorials

---

## 🎯 Quick Lookup

| I want to... | Go to |
|--------------|-------|
| Start using SemaJSX | [README.md](./README.md) |
| Contribute code | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Understand architecture | [MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md) |
| Write tests | [TESTING.md](./TESTING.md) |
| Design a feature | [docs/workflow.md](./docs/workflow.md) |
| See design decisions | [docs/designs/](./docs/designs/) |

---

## 📝 Creating New Docs

| What | Where | Template |
|------|-------|----------|
| Feature proposal | `docs/rfcs/` | [template](./docs/rfcs/template.md) |
| Design doc | `docs/designs/` | [template](./docs/designs/template.md) |
| Architecture decision | `docs/adrs/` | [template](./docs/adrs/template.md) |
| User tutorial | `apps/docs/content/guides/` | - |
| API reference | `apps/docs/content/docs/` | - |

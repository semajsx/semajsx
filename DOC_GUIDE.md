# 📚 Documentation Quick Guide

> **One-page reference for SemaJSX documentation system**

## 🤔 Simple Question: Should I Document This?

```
Ask yourself:
├─ Is this a significant decision?        → ADR (.design/decisions/)
├─ Am I designing a feature?              → Feature Design (.design/features/)
├─ Am I tracking a task?                  → Task (.tasks/active/)
├─ Am I discussing options?               → Discussion (.design/discussions/)
├─ Am I investigating something?          → .temp/ (personal notes)
└─ Is this temporary scratch work?        → .temp/ (gitignored)
```

## 🎯 Three Core Principles

1. **Permanent First** - ADRs and architecture docs never deleted
2. **Task-Oriented** - Active work tracked in `.tasks/`
3. **Personal Space** - `.temp/` for scratch work (gitignored)

## 📂 Quick Location Guide

| I want to...                 | Location                   | Lifespan   |
| ---------------------------- | -------------------------- | ---------- |
| 💡 Record a decision         | `.design/decisions/`       | Permanent  |
| 🏗️ Design a feature          | `.design/features/`        | Permanent  |
| 💬 Discuss options           | `.design/discussions/`     | Until done |
| 📋 Track a task              | `.tasks/active/`           | Until done |
| 🔍 Document research         | `.design/research/`        | Reference  |
| 📝 Quick notes/investigation | `.temp/`                   | Temporary  |
| 📖 Write user documentation  | `docs/` or `packages/*/`   | Permanent  |
| 🗄️ Archive completed work    | `.design/archive/` or done | Historical |

## 🚦 Decision Tree

### Step 1: What am I doing?

```
┌─ Making a significant decision
│  └─> Use ADR (.design/decisions/NNNN-title.md)
│
├─ Designing a new feature
│  └─> Feature Design (.design/features/name.md)
│
├─ Working on a task
│  └─> Task Document (.tasks/active/name.md)
│
├─ Discussing/proposing
│  └─> Discussion (.design/discussions/YYYY-MM-topic.md)
│
├─ Investigating/researching
│  ├─> Temporary: .temp/investigations/
│  └─> Shareable: .design/research/
│
└─ Quick notes/scratch
   └─> .temp/scratch/ (gitignored)
```

### Step 2: Is it temporary or permanent?

```
Temporary (hours/days)
└─> .temp/ (gitignored)

Transitional (weeks/months, then archive)
└─> .design/discussions/ or .tasks/active/

Permanent (never deleted)
└─> .design/decisions/ or .design/architecture/
```

## ⚡ Quick Actions

### Record a Decision

```bash
# 1. Find next ADR number
ls .design/decisions/ | grep -E '^[0-9]+' | sort -n | tail -1

# 2. Create new ADR
cp .design/DOCUMENTATION_PLAN.md # See ADR template
edit .design/decisions/NNNN-my-decision.md
```

### Start a Task

```bash
# 1. Copy template
cp .tasks/templates/feature-task.md .tasks/active/my-feature.md

# 2. Fill in details
# 3. Start working
```

### Make Temporary Notes

```bash
# Just create a file in .temp (gitignored)
echo "Notes..." > .temp/investigations/$(date +%Y-%m-%d)-issue.md
```

## 🎭 Role-Based Quick Start

### As a Developer

1. **Starting a task?** → Create in `.tasks/active/`
2. **Found a bug?** → Notes in `.temp/`, task if non-trivial
3. **Need to decide?** → Discuss in `.design/discussions/`

### As a Contributor

1. **Read** `.design/ARCHITECTURE_SUMMARY.md` - Understand system
2. **Check** `.design/decisions/` - Understand past decisions
3. **Review** `.tasks/active/` - See current work

### As Core Team

1. **Major decision?** → Write ADR (`.design/decisions/`)
2. **New feature?** → Design doc (`.design/features/`)
3. **Planning work?** → Task doc (`.tasks/active/`)

## 📊 Document Lifecycle

```
Idea/Investigation
    ↓ (.temp/ - personal notes)
    ↓
Discussion/Proposal
    ↓ (.design/discussions/)
    ↓
Decision Made
    ↓ (ADR: .design/decisions/)
    ↓
Feature Design
    ↓ (.design/features/)
    ↓
Task Created
    ↓ (.tasks/active/)
    ↓
Implementation
    ↓
Completion
    ↓ (Task → .tasks/completed/)
    ↓ (Design stays in .design/)
    ↓ (Public docs updated)
```

## 🔗 Where to Learn More

- **Full strategy**: `.design/DOCUMENTATION_PLAN.md` (6000+ lines)
- **Architecture**: `.design/ARCHITECTURE_SUMMARY.md` (700+ lines)
- **Templates**: See DOCUMENTATION_PLAN.md for all templates
- **ADR guide**: `.design/decisions/README.md`
- **Task guide**: `.tasks/README.md`
- **Each directory**: Has its own README.md

## 💡 Mental Model

Think of it like Git workflow:

```
.temp/          = Working directory (not committed)
.tasks/         = Staging area (work in progress)
.design/        = Repository (committed, permanent)
docs/           = Published (public facing)
```

## ⚠️ Common Pitfalls

❌ **Don't**:

- Store permanent docs in `.temp/` (gitignored!)
- Delete ADRs (supersede instead)
- Skip documentation for "quick fixes"
- Mix temporary and permanent docs

✅ **Do**:

- Use `.temp/` freely for personal notes
- Graduate important findings to proper locations
- Write ADRs for significant decisions
- Keep documents updated with code changes

## 🚀 Quick Commands

```bash
# List all ADRs
ls -1 .design/decisions/*.md

# See active tasks
ls -1 .tasks/active/*.md

# Check what's in temp (your personal notes)
ls -R .temp/

# Find documentation by topic
grep -r "signal" .design/

# Create dated investigation note
touch .temp/investigations/$(date +%Y-%m-%d)-topic.md
```

## 📞 Still Confused?

1. **Quick answer?** → This file (you're reading it!)
2. **Need template?** → See `.design/DOCUMENTATION_PLAN.md`
3. **Want full details?** → See respective directory's README.md
4. **Not sure where?** → Use the decision tree above

---

**Remember**: When in doubt, start in `.temp/` for personal notes, then graduate to proper location when ready.

**Version**: 1.0 | **Last Updated**: 2026-01-08

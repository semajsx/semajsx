# 📋 Documentation Cheat Sheet

> Ultra-compact reference - print and keep handy!

---

## 🤔 Decision in 10 Seconds

| I am...                 | Put it in...                  | Deleted?                |
| ----------------------- | ----------------------------- | ----------------------- |
| 💡 Making a decision    | `.design/decisions/NNNN-*.md` | Never                   |
| 🏗️ Designing a feature  | `.design/features/*.md`       | Never                   |
| 📋 Working on a task    | `.tasks/active/*.md`          | When done → completed   |
| 💬 Proposing/discussing | `.design/discussions/*.md`    | When resolved → archive |
| 🔍 Researching (team)   | `.design/research/*.md`       | Never                   |
| 📝 Taking quick notes   | `.temp/*`                     | Anytime                 |

---

## ⚡ Quick Commands

```bash
# Where does this go?
cat DOC_GUIDE.md

# Create ADR
vim .design/decisions/$(printf "%04d" $(($(ls .design/decisions/*.md | wc -l)+1)))-my-decision.md

# Start task
cp .tasks/templates/feature-task.md .tasks/active/my-task.md

# Quick note (gitignored)
echo "..." > .temp/scratch/$(date +%Y-%m-%d)-notes.md
```

---

## 🎯 The Rule of Thumb

```
Temporary?    → .temp/ (gitignored)
Transitional? → .tasks/ or .design/discussions/
Permanent?    → .design/ (never delete)
Public?       → docs/ or packages/*/README.md
```

---

## 📍 Essential Files

| File                                | Purpose                     |
| ----------------------------------- | --------------------------- |
| `DOC_GUIDE.md`                      | Start here - one-page guide |
| `.design/DOCUMENTATION_PLAN.md`     | Full strategy + templates   |
| `.design/ARCHITECTURE_SUMMARY.md`   | System architecture         |
| `.design/DOCUMENTATION_WORKFLOW.md` | Visual flowcharts           |
| `CLAUDE.md`                         | Development guide           |

---

## 🚦 Priority

- **P0 (Red)**: Breaking change, security → ADR now
- **P1 (Yellow)**: New feature, refactor → Design doc
- **P2 (Blue)**: Bug fix, improvement → Task doc
- **P3 (Gray)**: Trivial → Code comment or PR

---

## 🔑 Key Concepts

1. **ADRs never deleted** - Only superseded
2. **Tasks have lifecycle** - Active → Completed
3. **`.temp/` is safe** - Gitignored, use freely
4. **Discussions resolve** - Become ADR or archived
5. **Graduate upwards** - Start temp, move to permanent

---

## 📞 Help

```bash
# Lost?
less DOC_GUIDE.md

# Need template?
ls .design/DOCUMENTATION_PLAN.md  # See templates section
ls .tasks/templates/

# What's documented?
tree -L 2 .design/
tree -L 2 .tasks/
```

---

**Version 1.0** | Print and keep near your keyboard! 🖨️

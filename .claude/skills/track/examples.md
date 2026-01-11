# Track Skill Examples

Examples showing progress tracking with the `/track` skill.

## Example 1: Mark Task Group Complete

```
User: Mark task group 3 complete with coverage 94%

Updating progress.md...

## Session: 2026-01-11

**Completed Task Groups**:
- ✅ Task Group 1: Foundation (coverage: 100%)
- ✅ Task Group 2: classes() (coverage: 92%)
- ✅ Task Group 3: rule() (coverage: 94%) ← NEW

[PostToolUse hook triggers]

📝 Auto-committed: chore(impl): complete task group 3 - coverage 94%
```

---

## Example 2: Log Blocker

```
User: Log blocker - TypeScript error in @types/react

Updating progress.md...

**Blocked**:
- 🚫 Task Group 4 - TypeScript error in @types/react@19 incompatible

[Auto-committed]
📝 chore(impl): log blocker - typescript error
```

---

## Example 3: Update Metrics

```
User: Update metrics - bundle 12KB, build 1.2s

**Metrics Achieved**:
- Bundle size: 12KB (target: ≤15KB) ✅
- Build time: 1.2s

📝 Auto-committed: chore(impl): update metrics
```

---

## Example 4: PostToolUse Auto-Commit

```
[Skill edits progress.md]

[PostToolUse hook triggers]

File modified: docs/implementation/*/progress.md
Extracting commit message from update...

📝 Auto-committed: chore(impl): complete task group 2 - coverage 88%
```

**Hook behavior**:
- Detects progress.md edit
- Generates descriptive commit message
- Auto-commits immediately

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/workflow examples](../workflow/examples.md) - Orchestration

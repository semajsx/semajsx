# Workflow Skill Examples

Concise examples showing key usage patterns for the `/workflow` skill.

## Example 1: Starting New Implementation

```
User: Start implementing context API

📋 Starting implementation: Context API
📁 Plan: docs/implementation/004-context-api/plan.md

Task Groups: 3 (Core API, Provider, Tests)
Dependencies: All clear ✅

Initializing tracking files...
✅ Created: progress.md, decisions.md, retrospective.md
📝 Committed: chore(impl): start implementation - context-api

Starting Task Group 1: Core API...
```

**What happens**:
- Detects plan.md exists
- Creates progress.md, decisions.md, retrospective.md
- Commits initial state
- Starts first task group

---

## Example 2: Auto-Resume After Break

```
User: Continue work

📊 Resuming workflow session...

Implementation: Context API (004-context-api)
Last Activity: Yesterday at 16:45
Last Commit: feat(impl): complete task group 1

Progress: 1/3 task groups (33%)

✅ Completed:
  - Task Group 1: Core API (coverage: 87%)

🚧 Next:
  - Task Group 2: Provider Component

Continue Task Group 2? [Yes]
```

**How it works**:
- Scans `docs/implementation/` for Status ≠ "Complete"
- Reads progress.md for current state
- Checks git log for last activity
- Auto-loads context and continues

---

## Example 3: PostToolUse Auto-Update

```
[Working on Task Group 2]

$ bun run test:coverage
Coverage: 88%

[PostToolUse hook triggers]

Updating progress.md with results...
✅ Coverage: 88% (target: ≥80%)

📝 Auto-committed: chore(impl): validation results - context-api
```

**Hook behavior**:
- Detects validation command (test:coverage)
- Extracts metrics from output
- Updates progress.md
- Auto-commits changes

---

## Example 4: Stop Hook Prevents Incomplete Exit

```
User: (tries to stop)

[Stop hook triggers]

⚠️ Before stopping, verify:
1. Validation passed? ❌ Not yet run
2. Task group complete? ❌ Incomplete
3. Changes committed? ⚠️ Uncommitted files

Cannot stop yet - completing Task Group 2...

[Runs validation]
[Commits changes]

✅ Task Group 2 complete
Safe to stop. Work saved.
```

**What it prevents**:
- Stopping with unrun validation
- Stopping mid-task group
- Losing uncommitted work

---

## Example 5: All Complete - Ready for Archive

```
User: What's next?

📊 Implementation Status

All task groups complete ✅ (3/3)

Metrics:
  - Coverage: 91% (target: ≥80%) ✅
  - Bundle: 3.2KB (target: ≤5KB) ✅

🎉 Implementation complete!

Next: Run `/archive` to generate retrospective.
```

**When to archive**:
- All task groups validated ✅
- All metrics met ✅
- No blockers ✅

---

## Common Patterns

### Daily Work Session

```
Morning:
  /workflow → Auto-resumes from git state

During work:
  Code + tests → PostToolUse updates progress
  Validation runs → Auto-commits results

End of day:
  Stop hook → Ensures everything committed
```

### Handling Blockers

```
Hit blocker → Log in progress.md
Fix blocker → /verify to confirm
Update progress → Continue task group
```

### Multiple Implementations

```
/workflow
  ↓
⚠️ Multiple active implementations
  ↓
User selects which one
  ↓
Resumes selected implementation
```

---

## Integration with Other Skills

```
/workflow
  ├─ Delegates to /implement (task execution)
  ├─ Calls /verify (validation in fork)
  ├─ Uses /track (progress updates)
  ├─ Uses /decide (decision logging)
  └─ Triggers /archive (when complete)
```

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/implement examples](../implement/examples.md) - Task execution
- [/verify examples](../verify/examples.md) - Validation
- [/archive examples](../archive/examples.md) - Completion

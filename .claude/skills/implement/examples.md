# Implement Skill Examples

Examples showing task group execution with the `/implement` skill.

## Example 1: Task Group Execution

```
User: Execute task group 3

📋 Task Group 3: rule() Implementation

Complexity: Medium
Dependencies: ✅ Task Groups 1, 2 complete

Tasks:
- [ ] Implement template string parsing
- [ ] Add ClassRef interpolation
- [ ] Support signal detection
- [ ] Handle plain value interpolation

Validation:
- bun run build ✅
- bun run test:coverage ✅ ≥90%
- bun run typecheck ✅

Starting implementation...

[Writes packages/style/src/rule.ts]
[Writes packages/style/src/rule.test.ts]

Running validation...

$ bun run build
✅ Build passed (1.1s)

$ bun run test:coverage
✅ Coverage: 94% (target: ≥90%)

$ bun run typecheck
✅ Type check passed

All validation passed ✅

Marking Task Group 3 complete...
📝 Committed: feat(impl): complete task group 3 - rule() implementation

Task Group 3 complete. Ready for Task Group 4.
```

---

## Example 2: Validation Failure and Fix

```
[Implements Task Group 2]

Running validation...

$ bun run test:coverage
❌ Coverage: 72% (target: ≥80%)

Validation failed. Adding tests...

[Writes additional tests]

$ bun run test:coverage
✅ Coverage: 88% (target: ≥80%)

Validation passed ✅
Task Group 2 complete.
```

---

## Example 3: Stop Hook Prevents Incomplete Exit

```
[Implementing Task Group 4]

User: (tries to stop)

[Stop hook triggers]

Before stopping, verify:
1. All tasks complete? ❌ Signal detection pending
2. Validation passed? ❌ Not yet run
3. Progress updated? ❌ No
4. Committed? ⚠️ Uncommitted changes

Cannot stop - continuing work...

[Completes remaining tasks]
[Runs validation]
[Updates progress]
[Commits]

✅ Task Group 4 complete
Safe to stop.
```

---

## Example 4: Called by /workflow

```
/workflow
  ↓
Determines: Task Group 3 ready
  ↓
"Continue Task Group 3?"
  ↓
User: Yes
  ↓
Executes Task Group 3
  ↓
[Implementation + validation]
  ↓
Task Group 3 complete
  ↓
"Continue to Task Group 4?"
```

---

## Execution Flow

```
1. Load plan.md for task group details
2. Check dependencies met
3. Execute tasks (code + tests)
4. Run validation
5. Update progress.md
6. Commit
```

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/workflow examples](../workflow/examples.md) - Orchestration
- [/verify examples](../verify/examples.md) - Validation

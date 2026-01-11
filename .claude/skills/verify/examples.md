# Verify Skill Examples

Concise examples showing how the `/verify` skill runs validation in forked context.

## Example 1: Full Validation Suite

```
User: Run full verification

[Forked context - isolated execution]

$ bun run build
✅ Passed (1.2s)

$ bun run test
✅ 89/89 passed (2.1s)

$ bun run test:coverage
✅ 91% (target: ≥80%)

$ bun run typecheck
✅ No errors (0.8s)

$ bun run lint
✅ No errors (0.3s)

[Returns clean report to main context]
```

**Report**:
```markdown
# Verification Report

**Date**: 2026-01-11T15:45:00Z
**Implementation**: Context API
**Commit**: a1b2c3d

## Core Validation

- ✅ Build: Passed (1.2s)
- ✅ Tests: 89/89 passed
- ✅ Coverage: 91% (≥80%)
- ✅ Typecheck: No errors
- ✅ Lint: No errors

## Summary

✅ All validation passed
✅ Ready for task group completion
```

**Key benefit**: Verbose output stays in forked context, main conversation gets clean report only.

---

## Example 2: Validation Failure

```
[Forked context]

$ bun run test
❌ 87/89 passed, 2 failed

$ bun run test:coverage
❌ Coverage: 72% (target: ≥80%)

[Returns failure report]
```

**Report**:
```markdown
# Verification Report

## Core Validation

- ✅ Build: Passed
- ❌ Tests: 87/89 (2 failed)
- ❌ Coverage: 72% (target: ≥80%)
- ✅ Typecheck: Passed
- ✅ Lint: Passed

## Failed Tests

- should handle nested context (context.test.ts:45)
- should update context value (context.test.ts:67)

## Coverage Issues

| File       | Coverage | Missing Lines |
|------------|----------|---------------|
| context.ts | 60%      | 23-45, 67-89  |

## Summary

❌ Validation failed
Next: Fix failing tests, add coverage
```

---

## Example 3: Quick Coverage Check

```
User: What's our test coverage?

[Runs only coverage check in fork]

$ bun run test:coverage
Coverage: 91%
```

**Report**:
```markdown
# Coverage Check

✅ Coverage: 91% (target: ≥80%)

Breakdown:
- packages/core: 94%
- packages/dom: 88%
- packages/signal: 96%
```

---

## Example 4: Called by /implement

```
/implement 3
  ↓
[Task group code complete]
  ↓
Calls: /verify
  ↓
[Forked validation]
  ↓
Returns: ✅ Report
  ↓
Mark task group complete
```

**Integration flow**:
- /implement finishes coding
- Needs validation before marking complete
- Calls /verify in fork
- Gets clean ✅/❌ report
- Proceeds based on result

---

## Context Fork Benefits

**Without fork** (hypothetical):
```
$ bun run test
[500 lines of test output]
[200 lines of coverage]
[100 lines of typecheck]

Agent: All tests passed
```

**With fork** (actual):
```
Running verification...

# Verification Report
✅ All passed
```

**Benefits**:
- Main conversation stays clean (3 lines vs 800+)
- Token-efficient
- Easy to read
- Professional output

---

## PreToolUse Hook Reminder

```
[Forked context begins]

[Hook triggers]

You are in forked verification context.

Tasks:
1. Run ALL validation commands
2. Collect results
3. DO NOT update progress.md
4. Return markdown report

[Continues execution]
```

**Purpose**: Reminds Claude it's in read-only forked context.

---

## Common Usage

```
# During development
Code → /verify → Fix → /verify → ✅

# Before commit
Complete task → /verify → If ✅ commit

# After blocker fix
Fix issue → /verify → If ✅ continue
```

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/workflow examples](../workflow/examples.md) - Integration
- [/implement examples](../implement/examples.md) - Task execution

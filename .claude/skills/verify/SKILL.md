---
name: verify
description: Run comprehensive validation suite in isolated context - builds, tests, typecheck, lint, coverage
context: fork
allowed-tools:
  - Read
  - Bash
user-invocable: true
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: prompt
          timeout: 10
          prompt: |
            You are in a forked verification context.

            Your task:
            1. Run ALL validation commands
            2. Collect results (exit codes, metrics)
            3. Do NOT update progress.md (read-only)
            4. Return structured markdown report to parent context

            Validation commands:
            - bun run build
            - bun run test
            - bun run test:coverage
            - bun run typecheck
            - bun run lint
---

# Verification Suite

Run comprehensive validation suite in isolated forked context and return clean structured report to parent conversation.

## Purpose

This skill runs validation in a **separate forked context** to:
- **Avoid cluttering main conversation** with verbose test output
- **Generate clean reports** without noise
- **Allow parallel execution** with main work
- **Provide independent verification**

## Usage

```
Run full verification

Check coverage only

Verify all validation passes
```

The skill will:
1. Execute in forked context (isolated)
2. Run all validation commands
3. Collect results and metrics
4. Return clean markdown report to parent

## How It Works

### Context Fork

This skill uses `context: fork`, meaning:

**Isolated Execution**:
- Runs in separate conversation thread
- Verbose output doesn't pollute main chat
- Only final report returns to parent

**Parallel Execution**:
- Main conversation can continue while verification runs
- Multiple verifications can run concurrently
- Non-blocking operation

**Flow**:
```
Main Context                  Forked Context
    │                              │
    │─────── /verify ──────────────>│
    │                              │ Run: bun run build
    │                              │ Run: bun run test
    │ (continues working)          │ Run: bun run test:coverage
    │                              │ Run: bun run typecheck
    │                              │ Run: bun run lint
    │                              │
    │                              │ Generate report
    │<────── Report Markdown ───────│
    │                              X (context ends)
    │
    │ (clean report displayed)
```

### Validation Commands

Runs standard validation suite:

1. **Build**: `bun run build`
   - Verifies: Code compiles
   - Extracts: Build time

2. **Tests**: `bun run test`
   - Verifies: All tests pass
   - Extracts: Pass/fail count

3. **Coverage**: `bun run test:coverage`
   - Verifies: Coverage ≥ target
   - Extracts: Coverage percentage

4. **Type Check**: `bun run typecheck`
   - Verifies: TypeScript strict mode passes
   - Extracts: Error count

5. **Lint**: `bun run lint`
   - Verifies: No lint errors
   - Extracts: Error/warning count

### Report Generation

After all commands complete, generates markdown report:

```markdown
# Verification Report

**Date**: 2026-01-11T15:45:00Z
**Commit**: a1b2c3d
**Branch**: feature/context-api

## Core Validation

- ✅ `bun run build`: Passed (1.2s)
- ✅ `bun run test`: 89/89 passed (2.1s)
- ✅ `bun run test:coverage`: 91% (target: ≥80%)
- ✅ `bun run typecheck`: No errors (0.8s)
- ✅ `bun run lint`: No errors (0.3s)

## Metrics

| Metric         | Target  | Actual | Status |
|----------------|---------|--------|--------|
| Test Coverage  | ≥80%    | 91%    | ✅     |
| Test Pass Rate | 100%    | 100%   | ✅     |

## Summary

✅ All validation passed
✅ All metrics within targets
✅ Ready for task group completion
```

## Hook: Execution Reminder

**Type**: `prompt` (LLM-based)

**Why prompt instead of command?**
- Reminder about forked context
- Ensures proper behavior
- Prevents accidental progress.md updates

**What it does**:
- Reminds you're in forked context
- Lists commands to run
- Clarifies read-only mode

## Integration

### Called by `/workflow`

```
/workflow verify
  ↓
  Calls: /verify
  ↓
  [Forked context runs validation]
  ↓
  Returns: Markdown report
  ↓
  /workflow displays report
```

### Called by `/implement`

```
/implement 3
  ↓
  [Task group execution]
  ↓
  Needs validation check
  ↓
  Calls: /verify
  ↓
  Returns: Results
  ↓
  /implement proceeds based on results
```

### Direct invocation

```
User: "Run full verification"
  ↓
  /verify invoked
  ↓
  [Forked context runs all commands]
  ↓
  Returns: Clean report
```

## File Structure

**Reads**:
- `package.json` - Available scripts
- `docs/implementation/*/progress.md` - Target metrics
- Git state - Commit hash, branch

**Does NOT Write**:
- No file modifications (read-only mode)
- No commits
- No progress updates

**Returns**:
- Markdown report (to parent context)

**Allowed Tools**:
- `Read` - Read files for context
- `Bash` - Run validation commands

## Examples

### Example 1: Full Validation Suite

```
User: Run full verification

[Forked context begins]

🔍 Running verification suite...

$ bun run build
[build output...]
✅ Build passed (1.2s)

$ bun run test
[test output...]
✅ 89/89 tests passed (2.1s)

$ bun run test:coverage
[coverage output...]
✅ Coverage: 91%

$ bun run typecheck
[typecheck output...]
✅ No errors (0.8s)

$ bun run lint
[lint output...]
✅ No errors (0.3s)

Generating report...

[Returns to main context]

# Verification Report

**Date**: 2026-01-11T15:45:00Z
**Implementation**: Context API (004-context-api)
**Commit**: a1b2c3d
**Branch**: feature/context-api

## Core Validation

- ✅ `bun run build`: Passed (1.2s)
- ✅ `bun run test`: 89/89 passed (2.1s)
- ✅ `bun run test:coverage`: 91% (target: ≥80%)
- ✅ `bun run typecheck`: No errors (0.8s)
- ✅ `bun run lint`: No errors (0.3s)

## Metrics

| Metric         | Target  | Actual | Status |
|----------------|---------|--------|--------|
| Test Coverage  | ≥80%    | 91%    | ✅     |
| Test Pass Rate | 100%    | 100%   | ✅     |

## Summary

✅ All validation passed
✅ All metrics within targets
✅ Ready for task group completion
```

### Example 2: Validation Failure

```
User: Check if everything passes

[Forked context runs validation]

# Verification Report

**Date**: 2026-01-11T16:00:00Z
**Implementation**: Context API (004-context-api)

## Core Validation

- ✅ `bun run build`: Passed (1.1s)
- ❌ `bun run test`: 87/89 passed, 2 failed (2.3s)
- ❌ `bun run test:coverage`: 72% (target: ≥80%)
- ✅ `bun run typecheck`: No errors
- ✅ `bun run lint`: No errors

## Failed Tests

- `should handle nested context` (packages/core/src/context.test.ts:45)
- `should update context value` (packages/core/src/context.test.ts:67)

## Metrics

| Metric         | Target  | Actual | Status |
|----------------|---------|--------|--------|
| Test Coverage  | ≥80%    | 72%    | ❌     |
| Test Pass Rate | 100%    | 97.8%  | ❌     |

## Summary

❌ Validation failed
❌ 2 tests failing
❌ Coverage below target (72% < 80%)

**Next Steps**:
1. Fix failing tests in packages/core/src/context.test.ts
2. Add tests for uncovered code
3. Re-run verification
```

### Example 3: Quick Coverage Check

```
User: What's our test coverage?

[Skill runs bun run test:coverage in fork]

# Coverage Check

**Coverage**: 91% (target: ≥80%)

✅ Coverage meets target

**Breakdown**:
- packages/core: 94%
- packages/dom: 88%
- packages/signal: 96%
```

## Benefits of Context Fork

### 1. Clean Main Conversation

**Without fork**:
```
User: /verify
Agent: Running bun run test...
[500 lines of test output]
[200 lines of coverage report]
[100 lines of typecheck output]
Agent: All tests passed
```

**With fork**:
```
User: /verify
Agent: Running verification in isolated context...

# Verification Report
✅ All validation passed
```

### 2. Parallel Execution

Main context continues working while verification runs:

```
Main: Working on Task Group 3...
  ↓
User: /verify (forks)
  ↓
Main: [continues Task Group 3 work]
  ↓
[Verification completes]
  ↓
Main: Verification report: ✅ All passed
  ↓
Main: [continues Task Group 3]
```

### 3. Token Efficiency

Verbose output stays in forked context, doesn't consume tokens in main conversation.

### 4. Multiple Verifications

Can run multiple verifications in parallel:

```
/verify (for current implementation)
/verify (for different branch)
```

Both execute independently, return separate reports.

## Best Practices

1. **Run before completing task groups** - Verify work before marking complete
2. **Trust the report** - Fork context is isolated and accurate
3. **Don't update progress.md** - This skill is read-only
4. **Use regularly** - Quick verification without cluttering conversation
5. **Review failures immediately** - Don't proceed with ❌ status

## Troubleshooting

### Issue: Forked context hangs

**Cause**: Validation command hanging (e.g., interactive prompt)

**Solution**:
- Check validation commands run non-interactively
- Ensure no prompts in test/build scripts
- Use `CI=true` environment variable if needed

### Issue: Report missing metrics

**Cause**: Command output format different than expected

**Solution**:
- Check command actually ran successfully
- Review exit codes and output
- Manually run commands to see actual format

### Issue: Fork not returning

**Cause**: Context fork timeout or error

**Solution**:
- Wait longer (may be running tests)
- Check validation commands work manually
- Report issue if consistent problem

## Design Rationale

### Why `context: fork`?

**Considered alternatives**:
1. ❌ Run in main context (clutters conversation)
2. ❌ Suppress output (lose debugging info)
3. ✅ Fork context (isolated, clean)

**Chosen**: `context: fork` because:
- Keeps main conversation clean
- Preserves full output for debugging
- Allows parallel execution
- Returns structured report only

### Why `user-invocable: true`?

Unlike other skills, this is **user-facing**:
- Users want to manually check validation
- Should be visible in `/` menu
- Common operation during development

### Why restrict to `Read` and `Bash`?

**Security and scope**:
- No file modifications needed
- No git operations needed
- Read-only verification
- Clear audit trail

### Why `type: prompt` for PreToolUse?

**Better than command**:
- Flexible reminder
- Can adapt to context
- Explains read-only mode
- Guides execution flow

## Template: Report Structure

```markdown
# Verification Report

**Date**: YYYY-MM-DDTHH:MM:SSZ
**Implementation**: [Name] ([Directory])
**Commit**: [Hash]
**Branch**: [Branch]

## Core Validation

- [✅/❌] `bun run build`: [Status] ([Time])
- [✅/❌] `bun run test`: [N/N passed] ([Time])
- [✅/❌] `bun run test:coverage`: [N%] (target: ≥N%)
- [✅/❌] `bun run typecheck`: [Status] ([Time])
- [✅/❌] `bun run lint`: [Status] ([Time])

## Failed Tests (if any)

- [Test name] ([File:Line])

## Metrics

| Metric         | Target  | Actual | Status |
|----------------|---------|--------|--------|
| Test Coverage  | ≥N%     | N%     | [✅/❌] |
| Test Pass Rate | 100%    | N%     | [✅/❌] |

## Summary

[✅/❌] [Overall status]
[✅/❌] [Metrics status]
[✅/❌] [Recommendation]
```

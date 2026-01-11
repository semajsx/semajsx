---
name: implement
description: Execute task groups from implementation plans - writes code, runs tests, validates work
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - Bash
user-invocable: false
hooks:
  Stop:
    - hooks:
        - type: prompt
          timeout: 30
          prompt: |
            Before stopping task group execution, verify:

            1. **All tasks in task group complete** - check plan.md task list
            2. **Validation run and passed** - all commands must pass
            3. **Progress.md updated** - must show validation results
            4. **Changes committed** - git status should be clean

            If ANY incomplete:
            - Report what's missing
            - Continue working
            - Do NOT stop

            If all complete:
            - Mark task group complete in progress.md
            - Commit: "feat(impl): complete task group N - [name]"
            - Reply: "Task Group N complete."
---

# Implementation Executor

Execute task groups from implementation plans - reads plan.md, implements code and tests, runs validation, tracks progress.

## Purpose

This skill executes individual task groups:

- **Read plan.md** for task details
- **Implement code** following plan
- **Write tests** with ≥80% coverage
- **Run validation** (build, test, typecheck, lint)
- **Update progress** via `/track`

**Note**: Internal skill, called by `/workflow`. Can be invoked directly but workflow is preferred.

**See also**: [examples.md](examples.md) for detailed usage examples

## Usage

Describe the task group to execute:

```
Execute task group 3

Implement task group 2 from the plan

Work on the next task group
```

The skill will:

1. Load plan.md for task group details
2. Check dependencies met
3. Execute tasks
4. Run validation
5. Update progress

## How It Works

### Execution Flow

1. **Load Plan**
   - Read `docs/implementation/*/plan.md`
   - Extract task group details
   - Get file list, validation criteria

2. **Check Dependencies**
   - Read `progress.md`
   - Verify previous task groups complete
   - Block if dependencies not met

3. **Execute Tasks**
   - Implement code according to plan
   - Write tests (collocated `.test.ts`/`.test.tsx`)
   - Add examples if needed
   - Commit incrementally

4. **Run Validation**

   ```bash
   bun run build        # Must pass
   bun run test         # All pass
   bun run test:coverage # ≥ target
   bun run typecheck    # 0 errors
   bun run lint         # 0 errors
   ```

5. **Update Progress**
   - Mark task group complete
   - Record validation results
   - Commit final state

### Hook: Completeness Check

**Type**: `prompt` (LLM-based)

**Why prompt?**

- Needs to understand task context
- Verify all subtasks complete
- Check validation passed
- Ensure proper commit

**What it does**:

- Reviews task list from plan.md
- Checks all validation passed
- Ensures progress.md updated
- Verifies git state clean
- Prevents incomplete task groups

## Integration

### Called by `/workflow`

```
/workflow
  ↓
  Determines: Task Group 3 ready
  ↓
  Executes Task Group 3
  ↓
  [Reads plan.md]
  ↓
  [Implements code + tests]
  ↓
  [Runs validation]
  ↓
  [Updates progress]
  ↓
  Task Group 3 complete
```

### Direct invocation

```
User: "Execute task group 2"
  ↓
  Skill loads plan.md
  ↓
  Implements Task Group 2
  ↓
  Validation passes
  ↓
  Progress updated
```

## File Structure

**Reads**:

- `docs/implementation/*/plan.md` - Task structure
- `docs/implementation/*/progress.md` - Current state

**Writes**:

- Source files (`packages/*/src/*.ts`)
- Test files (`packages/*/src/*.test.ts`)
- `docs/implementation/*/progress.md` - Updates

**Commits**:

- `feat: implement X` - Code commits
- `test: add tests for X` - Test commits
- `feat(impl): complete task group N - [name]` - Completion

**Allowed Tools**:

- All standard tools (Read, Write, Edit, Bash, etc.)

## Examples

### Example: Task Group Execution

```
User: Execute task group 3

📋 Task Group 3: rule() Implementation

**Complexity**: Medium
**Dependencies**: ✅ Task Group 1, 2 complete

**Tasks**:
- [ ] Implement template string parsing
- [ ] Add ClassRef interpolation
- [ ] Support signal detection
- [ ] Handle plain value interpolation

**Validation**:
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

## Best Practices

1. **Let workflow coordinate** - Don't call directly
2. **Follow plan.md** - Implement what's specified
3. **Write tests immediately** - Don't batch them
4. **Run all validation** - Don't skip commands
5. **Commit incrementally** - Small atomic commits

## Design Rationale

### Why `user-invocable: false`?

**Internal coordination**:

- Primarily called by `/workflow`
- User can still invoke by describing intent
- Not shown in `/` menu
- Reduces clutter

### Why `type: prompt` for Stop hook?

**Context awareness needed**:

- Must understand task completion
- Verify validation passed
- Check all subtasks done
- More flexible than bash

### Why no strict file scope validation?

**Flexibility**:

- Implementation may need related files
- Trust Claude to follow plan
- PreToolUse validation too restrictive
- User can override if needed

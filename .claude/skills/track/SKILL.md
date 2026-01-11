---
name: track
description: Update progress tracking - records task completion, blockers, metrics in implementation progress.md files
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash(git:*)
user-invocable: false
hooks:
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          timeout: 30
          prompt: |
            If you just updated a progress.md file in docs/implementation/*/, commit it immediately.

            Generate an appropriate commit message based on what was updated:
            - Task group completed → "chore(impl): complete task group N - <impl-name>"
            - Blocker logged → "chore(impl): blocker logged - <impl-name>"
            - Task group started → "chore(impl): start task group N - <impl-name>"
            - Metrics updated → "chore(impl): metrics updated - <impl-name>"
            - Validation results → "chore(impl): validation results - <impl-name>"

            Use git add and commit with --no-verify flag.
            Keep commit messages concise and descriptive.
---

# Progress Tracker

Update `progress.md` files with structured progress information: task completion, blockers, metrics, and status changes.

## Purpose

This skill provides a structured way to update progress tracking, ensuring:
- Consistent formatting across all implementations
- Automatic git commits for audit trail
- Real-time progress visibility

**Note**: This is an internal skill, primarily called by `/workflow` and `/implement`. You can also invoke it directly for manual updates.

## Usage

This skill works by **reading your intent from context** and updating progress.md accordingly. Simply describe what you want to update:

```
Update progress to mark task group 3 as complete with 94% coverage

Log a blocker for task group 4: TypeScript error in dependencies

Start task group 5

Update metrics: bundle size 12KB, coverage 91%

Show current implementation status
```

The skill will:
1. Read the active implementation's progress.md
2. Update the appropriate section
3. Auto-commit the change

## How It Works

### Automatic Updates

When you describe an update, the skill:

1. **Identifies the Implementation**
   - Finds active implementation in `docs/implementation/*/`
   - Reads current `progress.md`

2. **Updates Appropriate Section**
   - **Complete**: Moves task group to "Completed Task Groups"
   - **Block**: Adds entry to "Blocked" section
   - **Start**: Updates "Current Focus"
   - **Metrics**: Updates "Metrics Achieved" section
   - **Status**: Displays current state (read-only)

3. **Auto-Commits**
   - PostToolUse hook detects progress.md changes
   - Generates contextual commit message
   - Commits with `--no-verify` flag

### Hook: Auto-Commit Progress

**Type**: `prompt` (LLM-based, context-aware)

**Why prompt instead of command?**
- Progress updates vary in context
- Commit messages should reflect intent
- Claude understands what was changed better than regex

**What it does**:
- Detects when progress.md was modified
- Reads the changes to understand context
- Generates appropriate commit message
- Executes git commit

## Update Patterns

### Mark Task Group Complete

**Intent**: "Mark task group 3 complete with 94% coverage"

**Updates**:
```markdown
## Completed Task Groups

- ✅ Task Group 3: rule() Implementation
  - Validation: ✅ All passed
  - Coverage: 94% (target: ≥90%)
  - Completed: 2026-01-11
```

**Commit**: `chore(impl): complete task group 3 - style-system`

---

### Log Blocker

**Intent**: "Log blocker for task group 4: TypeScript error in @types/node"

**Updates**:
```markdown
## Blocked

- 🚫 Task Group 4: TypeScript error in @types/node
  - Logged: 2026-01-11T14:30:00Z
  - Status: Investigating
```

**Commit**: `chore(impl): blocker logged - style-system`

---

### Start Task Group

**Intent**: "Start task group 5"

**Updates**:
```markdown
## Current Session: 2026-01-11

**Current Focus**: Task Group 5 - Theme Support

## In Progress

- 🚧 Task Group 5: Theme Support
  - Started: 2026-01-11
  - Priority: P0
  - Complexity: Medium
```

**Commit**: `chore(impl): start task group 5 - style-system`

---

### Update Metrics

**Intent**: "Update metrics: bundle size 12KB, coverage 91%, build time 1.2s"

**Updates**:
```markdown
## Metrics Achieved

- Bundle size: 12KB (target: ≤15KB) ✅
- Build time: 1.2s (target: <5s) ✅
- Coverage: 91% (target: ≥80%) ✅
```

**Commit**: `chore(impl): metrics updated - style-system`

---

### Show Status

**Intent**: "Show current implementation status"

**Output** (read-only, no file changes):
```
📊 Implementation Status

Name: Style System (001-style-system)
Progress: 4/7 task groups (57%)

✅ Completed:
  - Task Group 1: Foundation Setup (coverage: 100%)
  - Task Group 2: classes() Implementation (coverage: 92%)
  - Task Group 3: rule() Implementation (coverage: 94%)
  - Task Group 4: rules() Combinator (coverage: 88%)

🚧 In Progress:
  - Task Group 5: Theme Support

📋 Pending:
  - Task Group 6: Media Queries
  - Task Group 7: Server-Side Rendering

🚫 Blockers: None

📝 Last Update: 2026-01-11T14:30:00Z
```

## Template Formats

The skill follows these standard formats when updating progress.md:

### Completed Task Group

```markdown
- ✅ Task Group N: [Name]
  - Validation: ✅ All passed
  - Coverage: XX% (target: ≥XX%)
  - Metrics: [Additional metrics]
  - Completed: YYYY-MM-DD
```

### Blocker Entry

```markdown
- 🚫 Task Group N: [Reason]
  - Logged: YYYY-MM-DDTHH:MM:SSZ
  - Status: Investigating | Waiting | Blocked
  - Details: [Additional context]
```

### Current Focus

```markdown
**Current Focus**: Task Group N - [Name]

## In Progress

- 🚧 Task Group N: [Name]
  - Started: YYYY-MM-DD
  - Priority: P0 | P1 | P2
  - Complexity: Low | Medium | High
```

### Metrics

```markdown
**Metrics Achieved**:

- [Metric 1]: [Value] (target: [Target]) ✅ | ❌
- [Metric 2]: [Value] (target: [Target]) ✅ | ❌
```

## Integration

### Called by `/workflow`

```
/workflow
  ↓
  Detects next task group: 4
  ↓
  Updates: "Start task group 4"
  ↓
  progress.md updated + auto-committed
```

### Called by `/implement`

```
/implement 3
  ↓
  Task group 3 execution complete
  ↓
  Validation passed (coverage: 94%)
  ↓
  Updates: "Mark task group 3 complete with 94% coverage"
  ↓
  progress.md updated + auto-committed
```

### Direct invocation

```
User: "Log a blocker: waiting for upstream API"
  ↓
  /track invoked automatically
  ↓
  progress.md updated with blocker entry
  ↓
  Auto-committed: chore(impl): blocker logged
```

## File Structure

**Reads**:
- `docs/implementation/*/progress.md` - Current state
- `docs/implementation/*/plan.md` - Task group names/details

**Writes**:
- `docs/implementation/*/progress.md` - All sections

**Commits**:
- `chore(impl): [action] - [impl-name]`

**Allowed Tools**:
- `Read` - Read progress.md and plan.md
- `Write` / `Edit` - Update progress.md
- `Bash(git:*)` - Git operations only

## Examples

### Example 1: Completing Task Group

```
User: Mark task group 2 complete with 92% coverage, all validation passed

[Skill reads progress.md and plan.md]
[Skill updates progress.md]

Before:
**In Progress**:
- 🚧 Task Group 2: classes() Implementation

After:
**Completed Task Groups**:
- ✅ Task Group 2: classes() Implementation
  - Validation: ✅ All passed
  - Coverage: 92% (target: ≥90%)
  - Completed: 2026-01-11

[PostToolUse hook triggers]
[Auto-commits: chore(impl): complete task group 2 - style-system]

✅ Task Group 2 marked complete and committed
```

### Example 2: Logging Blocker

```
User: Log blocker for task group 4: dependency issue with @types/react@19

[Skill updates progress.md]

Added:
**Blocked**:
- 🚫 Task Group 4: Dependency issue with @types/react@19
  - Logged: 2026-01-11T15:20:00Z
  - Status: Investigating

[Auto-commits: chore(impl): blocker logged - style-system]

✅ Blocker logged and committed
```

### Example 3: Starting Task Group

```
User: Start task group 5

[Skill reads plan.md for task group 5 details]
[Skill updates progress.md]

Updated:
**Current Focus**: Task Group 5 - Theme Support

**In Progress**:
- 🚧 Task Group 5: Theme Support
  - Started: 2026-01-11
  - Priority: P1
  - Complexity: Medium

[Auto-commits: chore(impl): start task group 5 - style-system]

✅ Task Group 5 started and committed
```

### Example 4: Updating Metrics

```
User: Update metrics: bundle size 12.3KB, build time 1.1s, coverage 94%

[Skill reads plan.md for targets]
[Skill updates progress.md]

Updated:
**Metrics Achieved**:
- Bundle size: 12.3KB (target: ≤15KB) ✅
- Build time: 1.1s (target: <5s) ✅
- Coverage: 94% (target: ≥80%) ✅

[Auto-commits: chore(impl): metrics updated - style-system]

✅ Metrics updated and committed
```

### Example 5: Checking Status

```
User: What's the current implementation status?

[Skill reads progress.md]

📊 Implementation Status

**Implementation**: Style System (001-style-system)
**Current Focus**: Task Group 5 - Theme Support
**Progress**: 4/7 task groups (57%)

## Completed (4)

- ✅ Task Group 1: Foundation Setup (coverage: 100%, completed: 2026-01-08)
- ✅ Task Group 2: classes() Implementation (coverage: 92%, completed: 2026-01-09)
- ✅ Task Group 3: rule() Implementation (coverage: 94%, completed: 2026-01-10)
- ✅ Task Group 4: rules() Combinator (coverage: 88%, completed: 2026-01-11)

## In Progress (1)

- 🚧 Task Group 5: Theme Support (started: 2026-01-11, complexity: Medium)

## Pending (2)

- ⏳ Task Group 6: Media Queries (priority: P2, complexity: Low)
- ⏳ Task Group 7: Server-Side Rendering (priority: P1, complexity: High)

## Blockers

None

## Metrics

- Bundle size: 12.3KB (target: ≤15KB) ✅
- Build time: 1.1s (target: <5s) ✅
- Coverage: 94% (target: ≥80%) ✅

📝 Last Activity: 2026-01-11T15:30:00Z
🌿 Branch: feature/style-system

[No file changes - read-only display]
```

## Best Practices

1. **Update immediately** - Don't batch progress updates
2. **Include context** - Add coverage %, metrics when completing
3. **Be specific in blockers** - Describe issue clearly
4. **Trust auto-commit** - Hook handles commit messages
5. **Check status often** - Use status check to verify state

## Troubleshooting

### Issue: Hook not committing

**Check**:
```bash
git status
```

**If progress.md uncommitted**:
- Hook may have failed
- Manually commit:
  ```bash
  git add docs/implementation/*/progress.md
  git commit -m "chore(impl): progress updated"
  ```

### Issue: Wrong section updated

**Cause**: Ambiguous update description

**Solution**:
- Be specific: "Mark task group 3 **complete**" not just "update task group 3"
- Specify section: "Log **blocker**", "Update **metrics**"

### Issue: Format doesn't match template

**Cause**: Manual edits broke structure

**Solution**:
- Use this skill for all updates
- If manual edit needed, follow templates exactly
- Regenerate from plan.md if corrupted

## Design Rationale

### Why `type: prompt` for PostToolUse?

**Considered alternatives**:
1. ❌ Complex bash script parsing commit type
2. ❌ Regex matching file changes
3. ✅ LLM-based context understanding

**Chosen**: `type: prompt` because:
- Claude understands **what** changed (completed vs blocked vs started)
- Can read change content and generate **appropriate** commit message
- More maintainable than regex parsing
- Handles edge cases naturally

### Why `user-invocable: false`?

This skill is primarily an **internal helper**:
- Called by `/workflow` and `/implement`
- Can still be invoked directly by describing intent
- Not shown in `/` menu to reduce clutter
- Auto-discoverable when user mentions "progress" or "track"

### Why restrict to `Bash(git:*)`?

**Security**: Only git operations needed
- Can't accidentally run destructive commands
- Can't modify files outside progress.md
- Clear audit trail of what skill can do

### Why no `args` in frontmatter?

**Best practice**: Skills receive context through markdown body and conversation, not structured args
- More flexible (user can describe intent naturally)
- Claude parses intent from context
- No rigid parameter structure

---
name: workflow
description: Orchestrate SemaJSX development workflow - auto-resume implementations, manage task groups, coordinate validation
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - Bash(git:*)
user-invocable: true
hooks:
  PostToolUse:
    - matcher: "Bash"
      hooks:
        - type: prompt
          timeout: 30
          prompt: |
            If you just ran a validation command (build, test, typecheck, lint),
            check if you should update progress.md with the results.

            Look for validation commands like:
            - bun run build
            - bun run test
            - bun run test:coverage
            - bun run typecheck
            - bun run lint

            If validation was run, update progress.md with results and commit:
            ```bash
            git add docs/implementation/*/progress.md
            git commit -m "chore(impl): validation results - <impl-name>" --no-verify
            ```
  Stop:
    - hooks:
        - type: prompt
          timeout: 30
          prompt: |
            Before stopping workflow execution, verify:

            1. If validation was run, did it pass?
            2. If working on a task group, is it complete?
            3. Are there uncommitted changes that should be committed?

            If anything is incomplete:
            - Report what needs to be done
            - Continue working
            - Do not stop

            If all complete or at a good stopping point:
            - Ensure everything committed
            - Reply: "Safe to stop. Work saved."
---

# Workflow Orchestrator

Orchestrate the SemaJSX development workflow: auto-resume implementations, manage task group execution, coordinate validation, and track progress.

## Purpose

This skill provides the main entry point for workflow management:

- **Auto-resume** active implementations from git state
- **Coordinate** task group execution via `/implement`
- **Manage** validation via `/verify`
- **Track** progress via `/track`
- **Ensure** completeness before stopping

**See also**: [examples.md](examples.md) for detailed usage examples

## Usage

Simply describe what you want to do:

```
Continue the current implementation
Start working on style system
Show implementation status
Verify everything is ready
What's next?
```

The skill will:

1. Detect active implementation (if any)
2. Load context from progress.md and plan.md
3. Determine what to do next
4. Execute or prompt for guidance

## How It Works

### Auto-Resume

When invoked, the skill:

1. **Scans for Active Implementations**
   - Finds `docs/implementation/*/` with progress.md status ≠ "Complete"

2. **Loads Context**
   - Reads `plan.md` for task groups
   - Reads `progress.md` for current state
   - Checks `git log` for last activity

3. **Determines Resume Point**
   - Current task group in progress → Continue
   - Last task group complete → Start next
   - Blocker exists → Report blocker
   - All complete → Suggest `/archive`

4. **Presents Context**
   - Shows progress summary
   - Lists completed/pending task groups
   - Prompts for next action

### Hooks

**PostToolUse Hook** (Auto-Update Progress):

- Detects validation commands in bash output
- Extracts results (pass/fail, coverage %, error count)
- Updates progress.md if validation was run
- Commits changes automatically

**Stop Hook** (Verification Before Exit):

- Checks if validation passed (if run)
- Checks if task group complete
- Checks for uncommitted changes
- Prevents premature stopping

## Commands

### Auto-Resume (Default)

**Intent**: "Continue implementation" / "Resume work" / "What's next?"

**Behavior**:

1. Find active implementation
2. Load context
3. Display status
4. Prompt for next action

### Start New Implementation

**Intent**: "Start implementing context API" / "Begin style system work"

**Prerequisites**: Plan must exist at `docs/implementation/NNN-<name>/plan.md`

**Behavior**:

1. Validate plan.md exists
2. Create progress.md, decisions.md, retrospective.md
3. Commit initial state
4. Start Task Group 1

### Show Status

**Intent**: "Show status" / "Where are we?" / "What's the progress?"

**Behavior**:

1. Find active implementation
2. Display progress summary
3. Show metrics
4. List blockers (if any)

### Verify Readiness

**Intent**: "Verify everything" / "Check if ready" / "Run validation"

**Behavior**:

1. Calls `/verify` in forked context
2. Displays verification report
3. Suggests next steps

## Integration

### With `/implement`

```
/workflow → Determines Task Group N ready → Execute Task Group N work
  → Validation runs → PostToolUse hook updates progress
  → Task Group N complete → "Continue to Task Group N+1?"
```

### With `/verify`

```
/workflow → User: "Verify everything" → Calls /verify
  → Forked context runs validation → Returns report
  → Displays results → Suggests next steps
```

### With `/track`

```
/workflow → Validation passed → "Mark task group complete"
  → /track updates progress.md → Auto-committed
```

### With `/decide`

```
/workflow (during implementation) → Design choice needed
  → "Need to decide on X" → /decide logs decision
  → Continue implementation
```

## File Structure

**Reads**:

- `docs/implementation/*/plan.md` - Task structure
- `docs/implementation/*/progress.md` - Current state
- `git log` - Activity history

**Writes**:

- `docs/implementation/*/progress.md` - Progress updates
- Initial setup files (when starting new impl)

**Commits**:

- `chore(impl): start implementation - <name>`
- `chore(impl): validation results - <name>`
- Various via delegated skills

**Allowed Tools**:

- `Read`, `Grep`, `Glob` - Read files
- `Write`, `Edit` - Update progress
- `Bash(git:*)` - Git operations only

## Examples

### Example 1: Auto-Resume

```
User: Continue work

📊 Resuming: Style System (001-style-system)
Last Activity: Yesterday at 16:45

Progress: 3/7 task groups (43%)

✅ Completed:
  - Task Group 1: Foundation (coverage: 100%)
  - Task Group 2: classes() (coverage: 92%)
  - Task Group 3: rule() (coverage: 94%)

🚧 Next:
  - Task Group 4: rules() Combinator

Continue Task Group 4? [Yes]
```

### Example 2: Starting New

```
User: Start component library implementation

📋 Starting: Component Library (003-component-library)

✅ progress.md created
✅ decisions.md created
✅ retrospective.md created

📝 Committed: chore(impl): start implementation - component-library

Starting Task Group 1: Foundation Setup...
```

### Example 3: Ready for Archive

```
User: What's next?

📊 Implementation Status

All task groups complete ✅

✅ Completed (5/5):
  - Task Group 1: Foundation (coverage: 95%)
  - Task Group 2: Button (coverage: 88%)
  - Task Group 3: Input (coverage: 91%)
  - Task Group 4: Select (coverage: 85%)
  - Task Group 5: Form Validation (coverage: 92%)

🎯 All metrics achieved:
  - Coverage: 90% (target: ≥80%) ✅
  - Bundle: 12KB (target: ≤15KB) ✅

🎉 Implementation complete!

Next step: Run `/archive` to generate retrospective and mark complete.
```

## Best Practices

1. **Always use workflow as entry point** - Don't jump directly to `/implement`
2. **Trust auto-resume** - It knows where you left off
3. **Commit frequently** - Hooks auto-commit, but commit your code too
4. **Check status often** - Use "show status" to verify progress
5. **Don't bypass workflow** - It ensures proper coordination

## Troubleshooting

### Can't find active implementation

**Solution**: Check `docs/implementation/` for progress.md files with status ≠ "Complete"

### Hook not updating progress

**Solution**: Hook uses Claude to parse output. If failing, manually update progress.md

### Stop hook preventing exit

**Solution**: Review what Stop hook says is incomplete, complete the work, then try stopping again

## Git Memory System

Every workflow action persists to git:

```bash
# Starting
chore(impl): start implementation - <name>

# Progress
chore(impl): validation results - <name>
chore(impl): start task group N - <name>

# Completion (via delegated skills)
feat(impl): complete task group N - <name>
docs(impl): decision NNN - <title>
docs(impl): add retrospective - <name>
```

**Resume capability**:

- `git log --grep="chore(impl)"` shows history
- `progress.md` shows current state
- Can resume from any commit point

## Context Recovery Algorithm

```javascript
async function resumeWorkflow() {
  // 1. Find active implementations
  const active = implDirs.filter((dir) => {
    const progress = readFile(`${dir}/progress.md`);
    return !progress.includes("Status: Complete");
  });

  if (active.length === 0) return { status: "no_active" };
  if (active.length > 1) return { status: "multiple_active", implementations: active };

  const implDir = active[0];

  // 2. Load context
  const plan = parseMarkdown(`${implDir}/plan.md`);
  const progress = parseMarkdown(`${implDir}/progress.md`);
  const lastCommit = exec('git log -1 --grep="chore(impl)"');

  // 3. Determine state
  const currentGroup = extractCurrentFocus(progress);
  const completedGroups = extractCompleted(progress);
  const blockers = extractBlockers(progress);

  // 4. Determine action
  if (blockers.length > 0) return { status: "blocked", blocker: blockers[0] };
  if (currentGroup) return { status: "continue", taskGroup: currentGroup };

  const nextGroup = findNextPendingGroup(plan, completedGroups);
  if (nextGroup) return { status: "start_next", taskGroup: nextGroup };

  return { status: "complete", message: "Run /archive" };
}
```

## Design Rationale

**Why `type: prompt` for hooks?**

- Validation output varies by tool
- Claude understands context better
- Can extract metrics intelligently
- More maintainable than regex

**Why `user-invocable: true`?**

- Main entry point for workflow
- Users start here
- Should be in `/` menu

**Why restrict to `Bash(git:*)`?**

- Only git operations needed
- Can't run arbitrary commands
- Clear audit trail

**Why delegate to other skills?**

- Separation of concerns
- Each skill has clear responsibility
- Easier to maintain and test

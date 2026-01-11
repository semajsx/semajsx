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
   ```
   docs/implementation/
   ├── 001-style-system/
   │   ├── plan.md
   │   └── progress.md (Status: not "Complete")
   ├── 002-react-adapter/
   │   └── progress.md (Status: Complete) ← Skip
   └── 003-component-library/
       └── progress.md (Status: not "Complete") ← Active
   ```

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
   ```
   📊 Resuming: Component Library (003-component-library)
   📅 Last Activity: 2 hours ago
   📝 Last Commit: feat(impl): complete task group 2

   Progress: 2/5 task groups (40%)

   ✅ Completed:
     - Task Group 1: Foundation (coverage: 95%)
     - Task Group 2: Button Component (coverage: 88%)

   🚧 Next:
     - Task Group 3: Input Component

   Continue Task Group 3? [Yes]
   ```

### Hook: Auto-Update Progress

**Type**: `prompt` (LLM-based)

**Why prompt instead of command?**
- Validation output varies widely
- Claude understands context better
- Can extract metrics intelligently
- Handles edge cases naturally

**What it does**:
- Detects validation commands in bash output
- Extracts results (pass/fail, coverage %, error count)
- Updates progress.md if validation was run
- Commits changes automatically

### Hook: Stop Verification

**Type**: `prompt` (LLM-based)

**Why prompt?**
- Needs to understand work context
- Determines if stopping is appropriate
- Ensures no lost work

**What it does**:
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

**Example**:
```
User: Continue implementation

📊 Resuming: Style System (001-style-system)

Progress: 3/7 task groups (43%)

✅ Completed:
  - Task Group 1: Foundation
  - Task Group 2: classes()
  - Task Group 3: rule()

🚧 Next:
  - Task Group 4: rules() Combinator

Continue Task Group 4? [Yes]

[Proceeds to execute Task Group 4]
```

### Start New Implementation

**Intent**: "Start implementing context API" / "Begin style system work"

**Prerequisites**:
- Plan must exist at `docs/implementation/NNN-<name>/plan.md`

**Behavior**:
1. Validate plan.md exists
2. Create progress.md, decisions.md, retrospective.md
3. Commit initial state
4. Start Task Group 1

**Example**:
```
User: Start implementing style system

📋 Starting: Style System (001-style-system)
📁 Plan: docs/implementation/001-style-system/plan.md

Task Groups:
  1. Foundation Setup (P0, Low)
  2. classes() Implementation (P0, Medium)
  3. rule() Implementation (P0, Medium)
  ... (7 total)

Initializing tracking files...
✅ Created: progress.md, decisions.md, retrospective.md
📝 Committed: chore(impl): start implementation - style-system

Starting Task Group 1: Foundation Setup...
```

### Show Status

**Intent**: "Show status" / "Where are we?" / "What's the progress?"

**Behavior**:
1. Find active implementation
2. Display progress summary
3. Show metrics
4. List blockers (if any)

**Example**:
```
User: Show implementation status

📊 Implementation Status

Name: Component Library (003-component-library)
Progress: 2/5 task groups (40%)

✅ Completed (2):
  - Task Group 1: Foundation (coverage: 95%)
  - Task Group 2: Button Component (coverage: 88%)

🚧 Current:
  - Task Group 3: Input Component

📋 Pending (2):
  - Task Group 4: Select Component
  - Task Group 5: Form Validation

🚫 Blockers: None

📈 Metrics:
  - Coverage: 91% (target: ≥80%) ✅
  - Bundle: 8KB (target: ≤15KB) ✅

📝 Last Activity: 2 hours ago
```

### Verify Readiness

**Intent**: "Verify everything" / "Check if ready" / "Run validation"

**Behavior**:
1. Calls `/verify` in forked context
2. Displays verification report
3. Suggests next steps

**Example**:
```
User: Verify everything is ready

🔍 Running verification...

[/verify executes in forked context]

# Verification Report

✅ All validation passed
✅ All metrics within targets

Ready for task group completion.
```

## Integration

### With `/implement`

```
/workflow
  ↓
  Determines: Task Group 3 ready
  ↓
  "Continue Task Group 3?"
  ↓
  User: Yes
  ↓
  Executes Task Group 3 work
  ↓
  [Code implementation]
  ↓
  Validation runs
  ↓
  [PostToolUse hook updates progress]
  ↓
  Task Group 3 complete
  ↓
  "Continue to Task Group 4?"
```

### With `/verify`

```
/workflow
  ↓
  User: "Verify everything"
  ↓
  Calls /verify
  ↓
  [Forked context runs validation]
  ↓
  Returns report
  ↓
  Displays results
  ↓
  Suggests next steps
```

### With `/track`

```
/workflow
  ↓
  Validation passed
  ↓
  Updates: "Mark task group complete"
  ↓
  /track updates progress.md
  ↓
  Auto-committed
```

### With `/decide`

```
/workflow (during implementation)
  ↓
  Design choice needed
  ↓
  "Need to decide on X"
  ↓
  /decide logs decision
  ↓
  Continue implementation
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

📊 Resuming workflow...

**Implementation**: Style System (001-style-system)
**Last Activity**: Yesterday at 16:45
**Last Commit**: feat(impl): complete task group 3

Progress: 3/7 task groups (43%)

✅ Completed:
  - Task Group 1: Foundation (coverage: 100%)
  - Task Group 2: classes() (coverage: 92%)
  - Task Group 3: rule() (coverage: 94%)

🚧 Next:
  - Task Group 4: rules() Combinator

Continue Task Group 4? [Yes]

[Loads plan for Task Group 4]
[Begins implementation]
```

### Example 2: Starting New

```
User: Start component library implementation

📋 Starting: Component Library (003-component-library)

Validating plan.md... ✅
Creating tracking files...

✅ progress.md created
✅ decisions.md created
✅ retrospective.md created

📝 Committed: chore(impl): start implementation - component-library

Task Groups:
  1. Foundation Setup (P0, Low)
  2. Button Component (P0, Medium)
  3. Input Component (P0, Medium)
  4. Select Component (P1, Medium)
  5. Form Validation (P1, High)

Starting Task Group 1: Foundation Setup...
```

### Example 3: Handling Blocker

```
User: Continue implementation

📊 Resuming: Component Library

🚫 **Blocker Detected**

Task Group 3 blocked:
- Reason: Dependency @types/react@19 incompatible
- Logged: 2 hours ago
- Status: Investigating

Before continuing, this blocker must be resolved.

Options:
1. Resolve blocker now
2. Skip to next non-blocked task group
3. View blocker details

What would you like to do? [1]
```

### Example 4: Validation During Work

```
[Working on Task Group 4]

User: (implicitly runs bun run test:coverage)

$ bun run test:coverage
[test output...]
Coverage: 88%

[PostToolUse hook triggers]

Updating progress.md with validation results...

**Validation Results**:
- `bun run test:coverage`: ✅ 88% (target: ≥80%)

📝 Auto-committed: chore(impl): validation results - component-library

Continuing Task Group 4...
```

### Example 5: Ready for Archive

```
User: What's next?

📊 Implementation Status

**All task groups complete** ✅

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

### Issue: Can't find active implementation

**Cause**: No implementation with status ≠ "Complete"

**Solution**:
- Check `docs/implementation/` for progress.md files
- Ensure progress.md doesn't say "Status: Complete"
- Create new implementation if needed

### Issue: Hook not updating progress

**Cause**: Validation command output unexpected

**Solution**:
- Hook uses Claude to parse output
- If failing, manually update progress.md
- Report issue for investigation

### Issue: Stop hook preventing exit

**Cause**: Work incomplete or validation failed

**Solution**:
- Review what Stop hook says is incomplete
- Complete the work
- Commit changes
- Try stopping again

## Design Rationale

### Why `type: prompt` for hooks?

**Considered alternatives**:
1. ❌ Complex bash parsing validation output
2. ❌ Regex matching progress updates
3. ✅ LLM-based understanding

**Chosen**: `type: prompt` because:
- Validation output varies by tool
- Claude understands context
- Can extract metrics intelligently
- Handles edge cases
- More maintainable

### Why `user-invocable: true`?

This is a **primary user-facing skill**:
- Main entry point for workflow
- Users start here
- Should be in `/` menu
- Frequently used

### Why restrict to `Bash(git:*)`?

**Security**:
- Only git operations needed for workflow
- Can't run arbitrary commands
- Clear audit trail
- Prevents accidents

### Why delegate to other skills?

**Separation of concerns**:
- `/workflow` orchestrates
- `/implement` executes tasks
- `/verify` validates
- `/track` updates progress
- `/decide` logs decisions
- `/archive` completes

Each skill has clear responsibility, easier to maintain and test.

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
  const implDirs = glob('docs/implementation/*/')
  const active = implDirs.filter(dir => {
    const progress = readFile(`${dir}/progress.md`)
    return !progress.includes('Status: Complete')
  })

  if (active.length === 0) {
    return { status: 'no_active' }
  }

  if (active.length > 1) {
    // Multiple active - let user choose
    return { status: 'multiple_active', implementations: active }
  }

  const implDir = active[0]

  // 2. Load context
  const plan = parseMarkdown(`${implDir}/plan.md`)
  const progress = parseMarkdown(`${implDir}/progress.md`)
  const lastCommit = exec('git log -1 --grep="chore(impl)" --format="%ar %s"')

  // 3. Determine state
  const currentGroup = extractCurrentFocus(progress)
  const completedGroups = extractCompleted(progress)
  const blockers = extractBlockers(progress)

  // 4. Determine action
  if (blockers.length > 0) {
    return {
      status: 'blocked',
      blocker: blockers[0],
      message: 'Blocker must be resolved'
    }
  }

  if (currentGroup) {
    return {
      status: 'continue',
      taskGroup: currentGroup,
      message: `Continue Task Group ${currentGroup.number}`
    }
  }

  const nextGroup = findNextPendingGroup(plan, completedGroups)
  if (nextGroup) {
    return {
      status: 'start_next',
      taskGroup: nextGroup,
      message: `Start Task Group ${nextGroup.number}`
    }
  }

  return {
    status: 'complete',
    message: 'All task groups complete. Run /archive'
  }
}
```

## Advanced: Multi-Implementation Support

If multiple implementations active:

```
User: Continue work

⚠️ Multiple Active Implementations

1. Style System (001-style-system)
   - Progress: 3/7 (43%)
   - Last activity: 2 hours ago

2. Component Library (003-component-library)
   - Progress: 2/5 (40%)
   - Last activity: yesterday

Which implementation do you want to work on? [1]
```

User selects, workflow resumes that implementation.

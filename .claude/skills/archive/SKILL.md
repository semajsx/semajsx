---
name: archive
description: Complete implementation and generate retrospective - verifies completion, analyzes metrics, writes retrospective
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Edit
  - Bash(git:*)
user-invocable: true
hooks:
  PreToolUse:
    - matcher: "*"
      hooks:
        - type: prompt
          timeout: 30
          prompt: |
            Before archiving, verify ALL of these:

            1. **All task groups complete** - count in progress.md equals total in plan.md
            2. **All validation passed** - no ❌ in progress.md
            3. **No blockers** - Blocked section empty
            4. **Git clean** - no uncommitted changes

            If ANY incomplete:
            - Report what's incomplete
            - Abort archiving
            - Do NOT proceed

            If all complete:
            - Allow archiving
            - Reply: "Pre-archive verification passed."
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: prompt
          timeout: 30
          prompt: |
            If you just wrote retrospective.md or updated progress.md with "Status: Complete", commit immediately.

            For retrospective.md:
            - Commit: "docs(impl): add retrospective - <impl-name>"

            For progress.md (Status: Complete):
            - Commit: "chore(impl): complete implementation - <impl-name>"

            For CHANGELOG.md:
            - Commit: "docs: update CHANGELOG"

            Use git add and commit with --no-verify flag.
---

# Archive Skill

Complete implementation by generating retrospective, updating CHANGELOG, and marking complete.

## Purpose

This skill finalizes implementations:
- **Verify all task groups complete**
- **Generate retrospective** with metrics analysis
- **Update CHANGELOG** with release notes
- **Mark implementation complete**
- **Clean up** temporary files

**Note**: User-facing skill, run when all task groups done.

## Usage

```
Archive the implementation

Complete the current implementation

Generate retrospective
```

The skill will:
1. Verify completion readiness
2. Generate retrospective from data
3. Update CHANGELOG
4. Mark complete
5. Clean up

## How It Works

### Pre-Archive Verification

PreToolUse hook verifies readiness:

1. **All task groups complete** - progress.md shows all ✅
2. **All validation passed** - no ❌ status
3. **No blockers** - Blocked section empty
4. **Git clean** - no uncommitted work

If any fail → Abort archiving

### Retrospective Generation

Analyzes implementation data:

1. **Metrics**
   - Final coverage vs target
   - Bundle size vs target
   - Build time vs target

2. **Complexity Accuracy**
   - Planned vs actual complexity per task group
   - Calculate accuracy %

3. **Blocker Analysis**
   - List blockers encountered
   - Resolution methods
   - Time to resolve

4. **Lessons Learned**
   - What went well
   - What went wrong
   - Surprises
   - Recommendations

### CHANGELOG Update

Adds entry:

```markdown
## [Unreleased]

### Added

- **Style System** (packages/style)
  - Atomic CSS-in-JS with signal reactivity
  - Bundle: 12KB (minified + gzipped)
  - Coverage: 94%
```

### Completion Marker

Updates progress.md:

```markdown
**Status**: Complete
**Completion Date**: YYYY-MM-DD
**Final Metrics**: Coverage 94%, Bundle 12KB
```

## Hook: Pre-Archive Verification

**Type**: `prompt` (LLM-based)

**Why prompt?**
- Needs to understand completion state
- Check multiple conditions
- Read from multiple files
- More flexible than bash

**What it does**:
- Reads plan.md and progress.md
- Counts completed task groups
- Checks validation status
- Verifies no blockers
- Checks git state

## Hook: Auto-Commit Archives

**Type**: `prompt` (LLM-based)

**Why prompt?**
- Context-aware commit messages
- Handles different file types
- Extracts implementation name
- More maintainable

**What it does**:
- Detects retrospective.md writes
- Detects progress.md completion marker
- Detects CHANGELOG updates
- Generates appropriate commit
- Executes git commit

## Integration

### Called by `/workflow`

```
/workflow
  ↓
  All task groups complete
  ↓
  "Run /archive to complete"
  ↓
  User: /archive
  ↓
  [Verification]
  ↓
  [Retrospective generation]
  ↓
  [CHANGELOG update]
  ↓
  [Mark complete]
  ↓
  Implementation complete
```

### Direct invocation

```
User: "Archive implementation"
  ↓
  /archive runs
  ↓
  [Full process]
  ↓
  Complete
```

## File Structure

**Reads**:
- `docs/implementation/*/plan.md` - Targets
- `docs/implementation/*/progress.md` - State
- `docs/implementation/*/decisions.md` - Count
- `git log` - History

**Writes**:
- `docs/implementation/*/retrospective.md` - Retrospective
- `docs/implementation/*/progress.md` - Completion marker
- `CHANGELOG.md` - Release notes

**Deletes**:
- `.workspace/drafts/*` - Temp files

**Commits**:
- `docs(impl): add retrospective - <name>`
- `chore(impl): complete implementation - <name>`
- `docs: update CHANGELOG`

**Allowed Tools**:
- `Read`, `Grep`, `Glob` - Read files
- `Write`, `Edit` - Update files
- `Bash(git:*)` - Git only

## Examples

### Example: Full Archive

```
User: Archive implementation

🎯 Archiving implementation...

## Pre-Archive Verification

✅ All task groups complete (7/7)
✅ All validation passed
✅ No blockers
✅ Git state: clean

Proceeding with archiving...

## Generating Retrospective

Analyzing implementation data...

Metrics:
- Coverage: 94% (target: ≥80%) ✅ +14%
- Bundle: 12KB (target: ≤15KB) ✅ -3KB
- Build time: 1.2s ✅

Complexity accuracy: 86% (6/7 correct)

Writing retrospective.md...
📝 Committed: docs(impl): add retrospective - style-system

## Updating CHANGELOG

Adding implementation entry...
📝 Committed: docs: update CHANGELOG

## Marking Complete

Updating progress.md...
**Status**: Complete
**Completion Date**: 2026-01-21

📝 Committed: chore(impl): complete implementation - style-system

🎉 Implementation Complete: Style System

Summary:
- Task Groups: 7/7
- Coverage: 94%
- Bundle: 12KB
- Duration: 14 days

Ready for release!
```

## Best Practices

1. **Run only when fully complete** - All task groups done
2. **Review retrospective** - Edit if needed
3. **Check CHANGELOG** - Ensure accurate
4. **Celebrate** - Implementation done!

## Troubleshooting

### Issue: PreToolUse blocking archive

**Cause**: Something incomplete

**Solution**:
- Check what PreToolUse reports
- Complete missing work
- Re-run /archive

### Issue: Retrospective missing data

**Cause**: progress.md format unexpected

**Solution**:
- Manually review retrospective.md
- Edit to add missing info
- Recommit

## Design Rationale

### Why `type: prompt` for both hooks?

**Context awareness**:
- PreToolUse needs to check multiple conditions
- PostToolUse needs to generate commit messages
- More flexible than bash
- Easier to maintain

### Why `user-invocable: true`?

**User-facing operation**:
- Users explicitly complete implementations
- Should be in `/` menu
- Milestone action
- Celebration moment

### Why verify before proceeding?

**Data integrity**:
- Ensure nothing missed
- Prevent incomplete archives
- Maintain quality
- Trust but verify

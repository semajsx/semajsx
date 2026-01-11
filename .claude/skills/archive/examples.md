# Archive Skill Examples

Examples showing implementation completion with the `/archive` skill.

## Example 1: Full Archive Process

```
User: Archive implementation

[PreToolUse hook triggers - verification]

🎯 Pre-Archive Verification

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

[PostToolUse hook triggers]
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

---

## Example 2: PreToolUse Blocks Incomplete Archive

```
User: Archive implementation

[PreToolUse verification]

⚠️ Pre-Archive Verification Failed

❌ Task Group 6 incomplete
❌ Validation not run for Task Group 6
⚠️ Blocker exists: TypeScript error

**Cannot archive yet**

Complete these first:
1. Finish Task Group 6
2. Run validation
3. Resolve blocker

Aborting archive. Continue implementation.
```

**What it prevents**:
- Archiving incomplete implementations
- Missing validation runs
- Unresolved blockers
- Dirty git state

---

## Example 3: Retrospective Generated

```markdown
# Retrospective - Style System

**Completion Date**: 2026-01-21

## Metrics

| Metric       | Target | Actual | Status |
|--------------|--------|--------|--------|
| Coverage     | ≥80%   | 94%    | ✅     |
| Bundle Size  | ≤15KB  | 12KB   | ✅     |
| Task Groups  | 7      | 7      | ✅     |

## Complexity Assessment Accuracy

| Task Group | Planned | Actual | Accurate? |
|------------|---------|--------|-----------|
| Group 1    | Low     | Low    | ✅        |
| Group 3    | Medium  | High   | ❌        |

**Accuracy**: 86% (6/7 correct)

## Blockers Encountered

- TypeScript error in deps (resolved: upgraded @types/node)

## Lessons Learned

- rule() complexity underestimated - signal detection more complex than planned
- Validation criteria effective - caught issues early

## Recommendations

- Add integration testing task group earlier
- Use complexity: High for features involving signals
```

---

## Example 4: CHANGELOG Update

```markdown
## [Unreleased]

### Added

- **Style System** (packages/style)
  - Atomic CSS-in-JS with signal reactivity
  - Bundle: 12KB (minified + gzipped)
  - Coverage: 94%
  - Features: classes(), rule(), rules() combinator
```

---

## Example 5: PostToolUse Auto-Commits

```
[Writes retrospective.md]

[PostToolUse hook triggers]

Detected retrospective.md write
Extracting implementation name: "style-system"

📝 Auto-committed: docs(impl): add retrospective - style-system

[Writes progress.md Status: Complete]

[PostToolUse hook triggers]

Detected progress.md completion marker

📝 Auto-committed: chore(impl): complete implementation - style-system

[Updates CHANGELOG.md]

[PostToolUse hook triggers]

📝 Auto-committed: docs: update CHANGELOG
```

**Hook behavior**:
- Detects retrospective.md creation
- Detects progress.md completion
- Detects CHANGELOG updates
- Generates appropriate commit messages
- Auto-commits each file

---

## When to Archive

```
✅ Ready:
- All task groups validated ✅
- All metrics met ✅
- No blockers ✅
- Git clean ✅

❌ Not ready:
- Task groups incomplete
- Validation failed
- Blockers exist
- Uncommitted changes
```

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/workflow examples](../workflow/examples.md) - Workflow integration

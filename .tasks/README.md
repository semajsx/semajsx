# Project Tasks

This directory tracks project-level tasks, features, and planning documents.

## Purpose

The `.tasks/` directory manages:

- **Active Tasks**: Currently being worked on
- **Backlog**: Planned but not started
- **Completed**: Finished tasks (archived)
- **Templates**: Task document templates

## Directory Structure

```
.tasks/
├── README.md                    # This file
├── active/                      # Current work
├── backlog/                     # Planned work
├── completed/                   # Finished work
└── templates/                   # Document templates
```

## Task Types

### Feature Task

New functionality or capability

**Example**: Implement DevTools, Add Suspense support

**Template**: `templates/feature-task.md`

### Bug Fix Task

Resolving defects or issues

**Example**: Fix hydration bug, Resolve memory leak

**Template**: `templates/bug-task.md`

### Refactor Task

Improving code structure without changing behavior

**Example**: Refactor signal internals, Optimize rendering pipeline

**Template**: `templates/refactor-task.md`

### Documentation Task

Writing or updating documentation

**Example**: Complete package READMEs, Write migration guide

**Template**: `templates/docs-task.md`

## Task Status

| Status          | Description                    | Location                       |
| --------------- | ------------------------------ | ------------------------------ |
| **Planning**    | Requirements gathering, design | `active/`                      |
| **In Progress** | Active development             | `active/`                      |
| **Review**      | Code review, testing           | `active/`                      |
| **Blocked**     | Waiting on dependency          | `active/` (with blocker noted) |
| **Completed**   | Done and merged                | `completed/`                   |

## Task Priority

- **P0 (Critical)**: Blocking releases, security issues, critical bugs
- **P1 (High)**: Important features, major bugs
- **P2 (Medium)**: Nice-to-have features, minor bugs
- **P3 (Low)**: Future enhancements, optimizations

## Task Lifecycle

```
Idea/Proposal
    ↓
Backlog (planning)
    ↓
Active (in progress)
    ↓
Review (PR created)
    ↓
Completed (merged & archived)
```

### Creating a Task

1. **Copy template**: Use appropriate template from `templates/`
2. **Fill in details**:
   - Clear description
   - Requirements
   - Acceptance criteria
   - Implementation plan
3. **Place in backlog**: Start in `backlog/`
4. **Assign priority**: P0-P3
5. **Estimate effort**: S/M/L/XL

### Starting a Task

1. **Move to active**: `mv backlog/task.md active/`
2. **Update status**: Change to "In Progress"
3. **Assign owner**: Who's working on it
4. **Create branch**: Follow git workflow
5. **Track progress**: Update task doc as you work

### Completing a Task

1. **Verify acceptance criteria**: All checked off
2. **Update task doc**:
   - Status: "Completed"
   - Completion date
   - PR link
   - Summary of changes
3. **Move to completed**: `mv active/task.md completed/`
4. **Update related docs**: Architecture docs, ADRs if needed

## Task Templates

### Feature Task Template

See: `templates/feature-task.md`

**Key Sections**:

- Description & Goals
- Requirements & Acceptance Criteria
- Design Considerations
- Implementation Plan
- Testing Strategy
- Documentation Needs

### Bug Task Template

See: `templates/bug-task.md`

**Key Sections**:

- Bug Description
- Steps to Reproduce
- Expected vs Actual Behavior
- Root Cause Analysis
- Fix Approach
- Regression Test Plan

### Refactor Task Template

See: `templates/refactor-task.md`

**Key Sections**:

- Current State & Problems
- Proposed Changes
- Migration Plan
- Performance Impact
- Testing Strategy

## Naming Conventions

Use descriptive kebab-case names:

```
feature-name.md
bug-description.md
refactor-area.md
```

**Good Examples**:

- `devtools-implementation.md`
- `fix-hydration-memory-leak.md`
- `refactor-signal-batching.md`

**Bad Examples**:

- `task1.md` (not descriptive)
- `Fix Bug.md` (spaces, not specific)
- `NEW_FEATURE.md` (wrong case)

## Active Tasks

_Check `active/` directory for current work_

## Backlog Highlights

_Check `backlog/` directory for planned work_

**High Priority (P1)**:

- Complete missing package READMEs
- Implement DevTools
- Suspense support refinement

**Medium Priority (P2)**:

- Streaming SSR
- Testing utilities
- Enhanced error messages

**Low Priority (P3)**:

- Performance profiling tools
- Additional examples
- Video tutorials

## Completed Tasks

Recent completions:

- TypeScript Native (tsgo) integration
- Oxlint migration
- Context API implementation
- Logger package
- SSG with collections

_See `completed/` for full history_

## Relationship with Other Docs

### Task → Design

Complex tasks often need design documents:

1. **Start with task**: Define what needs to be done
2. **Create design doc**: If architecture/API design needed (`.design/features/`)
3. **Reference in task**: Link to design doc
4. **Update task**: Track implementation progress

### Task → ADR

Significant decisions should be captured:

1. **Make decision**: During task planning/implementation
2. **Write ADR**: Document decision (`.design/decisions/`)
3. **Reference in task**: Link ADR from task doc
4. **Complete task**: Implement per ADR

### Task → Public Docs

After completion, update user-facing docs:

1. **Complete task**: Feature implemented
2. **Update docs**: Add to appropriate public docs
3. **Write guide**: If new feature, create guide
4. **Announce**: Changelog, blog post if major

## Best Practices

### 1. Keep Tasks Focused

Each task should:

- Have clear, achievable scope
- Be completable in 1-4 weeks
- Have measurable acceptance criteria
- Focus on one feature/bug/refactor

If too large, split into multiple tasks.

### 2. Update Regularly

- **Daily**: Update progress section
- **Weekly**: Review all active tasks
- **Monthly**: Review backlog priorities

### 3. Track Blockers

If blocked:

- Mark status as "Blocked"
- Document blocker clearly
- Link to blocking task/issue
- Estimate unblock date

### 4. Cross-Reference

Link related documents:

- Design docs (`.design/`)
- ADRs (`.design/decisions/`)
- Issues (GitHub)
- PRs (GitHub)
- Other tasks

### 5. Document Decisions

Capture important decisions made during task:

- Why approach X over Y?
- Trade-offs considered
- Future improvements identified

### 6. Archive When Done

Don't delete completed tasks:

- Move to `completed/`
- Keep historical record
- Reference in future tasks

## Tips for Task Management

### For Individual Contributors

- **Pick one task**: Focus on single task until done
- **Update progress**: Keep task doc current
- **Ask for help**: Update if blocked
- **Document learnings**: Add notes section

### For Team Leads

- **Review active tasks**: Weekly status check
- **Adjust priorities**: Based on roadmap changes
- **Unblock team**: Address blockers quickly
- **Balance backlog**: Keep 3-6 months planned

### For Project Managers

- **Track velocity**: Monitor completion rate
- **Adjust estimates**: Learn from actuals
- **Plan releases**: Group tasks into milestones
- **Communicate status**: Weekly updates

## Integrations

### With GitHub Issues

Tasks can reference GitHub issues:

```markdown
## Related Issues

- #123 - User request for feature
- #456 - Related bug report
```

Issues can reference tasks:

```markdown
See `.tasks/active/feature-name.md` for implementation plan
```

### With Pull Requests

PRs should reference tasks:

```markdown
Implements `.tasks/active/feature-name.md`

Closes #123
```

Tasks should link to PRs:

```markdown
## Implementation

- PR: #789 - Initial implementation
- PR: #790 - Bug fixes
```

## Questions?

- **What to track?** → Features, bugs, refactors, doc tasks
- **When to create task?** → When work is planned or started
- **Who manages tasks?** → Owner (assigned developer) + Project Manager
- **How long to keep?** → Completed tasks stay in `completed/` indefinitely

---

**Last Updated**: 2026-01-08

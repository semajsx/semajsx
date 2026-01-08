# Task: [Feature Name]

**Type**: Feature
**Status**: Planning | In Progress | Review | Completed | Blocked
**Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Created**: YYYY-MM-DD
**Started**: YYYY-MM-DD
**Completed**: YYYY-MM-DD
**Owner**: [Name]
**Estimated Effort**: S (1-3 days) | M (3-7 days) | L (1-2 weeks) | XL (2-4 weeks)
**Target Version**: vX.Y.Z

## Description

Clear description of what needs to be built and why.

### Background

Context and motivation for this feature.

### User Story

As a [user type], I want to [action], so that [benefit].

## Goals

What this feature aims to achieve:

- Goal 1
- Goal 2
- Goal 3

## Non-Goals

What is explicitly out of scope:

- Non-goal 1
- Non-goal 2

## Requirements

Functional and non-functional requirements:

### Functional Requirements

- [ ] FR1: [Description]
- [ ] FR2: [Description]
- [ ] FR3: [Description]

### Non-Functional Requirements

- [ ] NFR1: Performance - [Target metric]
- [ ] NFR2: Bundle size - [Max increase]
- [ ] NFR3: Type safety - Full TypeScript coverage
- [ ] NFR4: Documentation - API docs and examples

## Acceptance Criteria

Conditions that must be met for completion:

- [ ] AC1: [Testable criterion]
- [ ] AC2: [Testable criterion]
- [ ] AC3: [Testable criterion]
- [ ] AC4: All tests passing
- [ ] AC5: Documentation complete
- [ ] AC6: Examples provided

## Design Considerations

### API Design

Proposed API (if applicable):

```typescript
// Example API usage
const result = newFeature(options);
```

**Design Principles**:

- Simple and intuitive
- Type-safe
- Consistent with existing API
- Backward compatible (if needed)

### Architecture

How this fits into the existing architecture:

- Affected packages: `@semajsx/...`
- New dependencies: None | [List]
- Breaking changes: None | [Description]

### Alternatives Considered

| Alternative | Pros               | Cons               | Decision    |
| ----------- | ------------------ | ------------------ | ----------- |
| Option A    | - Pro 1<br>- Pro 2 | - Con 1<br>- Con 2 | ✅ Chosen   |
| Option B    | - Pro 1            | - Con 1<br>- Con 2 | ❌ Rejected |

### Trade-offs

Explicit trade-offs made:

- Trade-off 1: [Description and rationale]
- Trade-off 2: [Description and rationale]

## Implementation Plan

Step-by-step implementation approach:

### Phase 1: Foundation (Effort: X days)

1. [ ] Step 1: [Description]
2. [ ] Step 2: [Description]
3. [ ] Step 3: [Description]

### Phase 2: Core Implementation (Effort: X days)

1. [ ] Step 1: [Description]
2. [ ] Step 2: [Description]

### Phase 3: Polish & Documentation (Effort: X days)

1. [ ] Step 1: [Description]
2. [ ] Step 2: [Description]

### Files to Modify

- `packages/.../src/file1.ts` - [Changes]
- `packages/.../src/file2.ts` - [Changes]
- `packages/.../src/file3.ts` - New file

### New Files to Create

- `packages/.../src/new-file.ts` - [Purpose]
- `packages/.../src/new-file.test.ts` - Tests

## Testing Strategy

How to verify correctness:

### Unit Tests

- [ ] Test scenario 1
- [ ] Test scenario 2
- [ ] Test edge case 1
- [ ] Test edge case 2

### Integration Tests

- [ ] Integration test 1
- [ ] Integration test 2

### Manual Testing

1. Test step 1
2. Test step 2
3. Verify expected outcome

### Performance Tests

- [ ] Benchmark baseline
- [ ] Measure after implementation
- [ ] Ensure within target: [Metric]

## Documentation Needs

Documentation to create/update:

- [ ] Package README update
- [ ] API reference documentation
- [ ] Usage examples (at least 2)
- [ ] Architecture doc update (if needed)
- [ ] ADR if significant decision
- [ ] Migration guide (if breaking change)
- [ ] Changelog entry

## Dependencies

### Depends On

This task depends on:

- [ ] Task: [Task name] - [Reason]
- [ ] Issue: #123 - [Reason]

### Blocks

This task blocks:

- Task: [Task name]
- Issue: #456

## Migration Strategy

If this introduces breaking changes:

### Breaking Changes

- Change 1: [Description]
- Change 2: [Description]

### Migration Guide

Steps for users to migrate:

1. Step 1
2. Step 2
3. Step 3

### Deprecation Plan

If deprecating old API:

- **Timeline**: Deprecate in vX.Y, remove in vX+1.Y
- **Warnings**: Add console warnings
- **Documentation**: Mark as deprecated

## Progress

### Completed

- [x] YYYY-MM-DD: Initial task creation
- [x] YYYY-MM-DD: Design doc written
- [x] YYYY-MM-DD: API design reviewed

### In Progress

- [ ] Core implementation
- [ ] Tests

### Pending

- [ ] Documentation
- [ ] Examples

## Blockers

Current blockers (if any):

- **None** | [Description of blocker]
- **Blocked by**: [Task/Issue/Person]
- **Expected resolution**: [Date]
- **Workaround**: [If available]

## Notes

Additional context, learnings, decisions:

### YYYY-MM-DD

- Note 1
- Note 2

### YYYY-MM-DD

- Decision: [Decision made and why]
- Learning: [Something learned during implementation]

## Related Documents

- Design Doc: `.design/features/[feature-name].md`
- ADR: `.design/decisions/NNNN-[decision].md`
- Discussion: `.design/discussions/YYYY-MM-[topic].md`

## Related Issues/PRs

- Issue: #123 - User request
- PR: #456 - Implementation
- PR: #457 - Bug fixes

## Success Metrics

How to measure success:

- Metric 1: [Target]
- Metric 2: [Target]
- User feedback: [Target]

## Post-Launch

After completion:

- [ ] Monitor for issues
- [ ] Gather user feedback
- [ ] Document lessons learned
- [ ] Identify future improvements

## Completion Summary

_Fill in when completed_

**Completed**: YYYY-MM-DD
**Final Status**: Shipped in vX.Y.Z
**Actual Effort**: X days (vs estimate of Y days)

### What Went Well

- Item 1
- Item 2

### What Could Be Improved

- Item 1
- Item 2

### Lessons Learned

- Lesson 1
- Lesson 2

### Follow-up Tasks

- [ ] Follow-up task 1
- [ ] Follow-up task 2

---

**Template Version**: 1.0
**Last Updated**: 2026-01-08

# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) documenting significant architectural and design decisions made for SemaJSX.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences.

**Key Principle**: ADRs are **never deleted**, only superseded. This preserves the historical context of why decisions were made.

## Naming Convention

ADRs are numbered sequentially:

```
NNNN-title-in-kebab-case.md
```

Examples:

- `0001-use-bun-workspaces.md`
- `0002-signal-based-reactivity.md`
- `0003-dual-rendering-targets.md`

## Template

```markdown
# ADR-NNNN: [Title]

**Status**: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
**Date**: YYYY-MM-DD
**Deciders**: [Names]
**Tags**: #architecture #performance #api

## Context

What is the issue/problem we're addressing?

## Decision

What decision did we make?

## Rationale

Why did we choose this approach?

## Consequences

What are the implications (positive and negative)?

## Alternatives Considered

What other options did we evaluate?

## References

- Links to discussions
- Related ADRs
- External resources
```

## Index of ADRs

### Planned ADRs

The following ADRs need to be written to document existing decisions:

- [ ] **ADR-0001**: Use Bun Workspaces for Monorepo
- [ ] **ADR-0002**: Signal-Based Reactivity Over Virtual DOM
- [ ] **ADR-0003**: Dual Rendering Targets (DOM + Terminal)
- [ ] **ADR-0004**: TypeScript Native (tsgo) as Default Type Checker
- [ ] **ADR-0005**: Symbol-Based Context API
- [ ] **ADR-0006**: Microtask-Based Batching for Signal Updates
- [ ] **ADR-0007**: Collocated Tests Strategy
- [ ] **ADR-0008**: Island Architecture for SSR

### Active ADRs

_None yet - ADRs in progress will be listed here_

### Superseded ADRs

_None yet - superseded ADRs will be listed here with links to replacements_

## Status Definitions

- **Proposed**: Under discussion, not yet accepted
- **Accepted**: Decision approved and implemented
- **Superseded**: Replaced by a newer ADR (with link)
- **Deprecated**: No longer relevant but kept for history

## Creating a New ADR

1. **Determine next number**: Check existing ADRs and use next sequential number
2. **Copy template**: Use template from DOCUMENTATION_PLAN.md
3. **Fill in details**: Context, decision, rationale, consequences
4. **List alternatives**: What else was considered?
5. **Get review**: Requires 2 approvals from core team
6. **Update this index**: Add to appropriate section

## Superseding an ADR

When a decision is replaced:

1. **Create new ADR**: Document the new decision
2. **Update old ADR**: Change status to "Superseded by ADR-XXXX"
3. **Cross-link**: Link both ways between old and new
4. **Update index**: Move old ADR to "Superseded" section
5. **Never delete**: Keep for historical context

## Best Practices

1. **Write ADRs before implementation** when possible
2. **One decision per ADR**: Keep focused
3. **Explain context**: Why was this decision needed?
4. **List alternatives**: Show what was considered
5. **Document consequences**: Both positive and negative
6. **Use tags**: Make ADRs searchable (#architecture, #performance, etc.)
7. **Link related docs**: Reference discussions, issues, PRs

## Questions?

- What to document? → Significant architectural decisions that affect multiple packages or long-term direction
- When to write? → Before implementation (proposed) or after (accepted)
- Who approves? → 2 core team members for architecture ADRs

---

**Last Updated**: 2026-01-08

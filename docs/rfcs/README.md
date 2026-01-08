# RFCs (Request for Comments)

This directory contains **RFC documents** - formal proposals for new features or significant changes to SemaJSX.

---

## Purpose

RFCs are used to:
- **Propose major features** before implementation
- **Gather feedback** from team and community
- **Document requirements** and success criteria
- **Make informed decisions** about what to build

---

## When to Create an RFC

Create an RFC when:
- ✅ Adding a **major feature** that affects users or architecture
- ✅ Making **breaking changes** to existing APIs
- ✅ Introducing **new concepts** or paradigms
- ✅ Requiring **stakeholder approval** before investing time
- ✅ The **scope is unclear** and needs discussion

Don't create an RFC for:
- ❌ Simple bug fixes
- ❌ Minor enhancements
- ❌ Documentation updates
- ❌ Internal refactoring (use design doc instead)

---

## RFC Process

```
1. Draft → 2. Discussion → 3. Review → 4. Decision (Accept/Reject) → 5. Design Phase
```

### 1. Draft RFC
- Use [template.md](./template.md)
- Write clear problem statement
- Research alternatives
- Estimate effort

### 2. Discussion
- Share with team
- Gather feedback
- Iterate on proposal
- Document open questions

### 3. Review
- Present to stakeholders
- Address concerns
- Refine scope

### 4. Decision
- Accept: Move to design phase
- Reject: Document rationale
- Defer: Table for future consideration

### 5. Design Phase
- Create detailed design document in `../designs/`
- Link back to this RFC

---

## Naming Convention

```
YYYY-MM-DD-feature-name.md
```

**Examples**:
- `2026-01-15-context-api.md`
- `2026-02-01-ssr-streaming.md`
- `2026-03-10-typescript-native.md`

---

## RFC Status

RFCs can have the following statuses:

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress, not ready for review |
| **In Review** | Ready for team feedback |
| **Accepted** | Approved for implementation |
| **Rejected** | Not moving forward (with rationale) |
| **Superseded** | Replaced by newer RFC |

---

## Template

Use [template.md](./template.md) to create new RFCs. The template includes:

- Summary
- Motivation & Problem Statement
- Goals & Non-Goals
- Research & Alternatives
- High-Level Proposal
- Risks & Dependencies
- Open Questions
- Decision

---

## Examples

### Good RFC Titles
- "RFC: Add Context API for Component Communication"
- "RFC: Implement Server-Side Rendering with Island Architecture"
- "RFC: Adopt TypeScript Native for 10x Faster Type Checking"

### Poor RFC Titles
- "RFC: Fix Bug" (too vague, not RFC-worthy)
- "RFC: Update Documentation" (not a feature proposal)
- "RFC: Refactor Code" (internal change, use design doc)

---

## Related Documentation

- **After RFC is accepted**: Create [Design Document](../designs/)
- **For architectural decisions**: Create [ADR](../adrs/)
- **For implementation details**: See [Workflow Guide](../guides/workflow.md)

---

## Getting Started

1. Copy [template.md](./template.md) to `YYYY-MM-DD-your-feature.md`
2. Fill in all sections
3. Share with team for feedback
4. Iterate until decision is made
5. Update status in the document

**Questions?** See [DOCS.md](../../DOCS.md) for the complete documentation index.

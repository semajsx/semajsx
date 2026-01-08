# ADRs (Architecture Decision Records)

This directory contains **Architecture Decision Records** - lightweight documents that capture important architectural decisions made in the SemaJSX project.

---

## Purpose

ADRs document:
- **Why** we made specific architectural choices
- **What alternatives** were considered
- **What consequences** result from decisions
- **When and by whom** decisions were made

---

## What is an ADR?

An ADR is a **short document** (1-2 pages) that records:

1. **Context** - The situation requiring a decision
2. **Decision** - What we decided to do
3. **Rationale** - Why we made this choice
4. **Consequences** - Impact of the decision (positive and negative)
5. **Alternatives** - Other options we considered

ADRs are:
- ✅ **Immutable** - Once accepted, not edited (create new ADR to supersede)
- ✅ **Lightweight** - Quick to write, easy to read
- ✅ **Numbered** - Sequential for easy reference
- ✅ **Historical** - Preserve context for future developers

---

## When to Create an ADR

Create an ADR when:
- ✅ Making **significant architectural decisions**
- ✅ Choosing between **multiple viable alternatives**
- ✅ Decision will have **long-term impact**
- ✅ Need to **explain rationale** to future developers
- ✅ Decision affects **system design**, not implementation details

### Examples of ADR-Worthy Decisions
- "Use signals for reactivity instead of virtual DOM"
- "Adopt monorepo structure with Bun workspaces"
- "Use TypeScript Native (tsgo) as default type checker"
- "Implement Context API with function parameters instead of hooks"

### Not ADR-Worthy
- ❌ "Use prettier for formatting" (tooling choice, not architecture)
- ❌ "Fix bug in render function" (implementation detail)
- ❌ "Update dependencies" (maintenance task)

---

## ADR Process

```
1. Identify Decision → 2. Draft ADR → 3. Review → 4. Accept → 5. Implement
```

### 1. Identify Decision Point
- A choice needs to be made
- Multiple options exist
- Impact is significant

### 2. Draft ADR
- Use [template.md](./template.md)
- Document context and alternatives
- Explain rationale

### 3. Review
- Share with team
- Discuss trade-offs
- Refine if needed

### 4. Accept
- Update status to "Accepted"
- Commit to repository

### 5. Implement
- Follow the decision in code
- Reference ADR in relevant places

---

## Naming and Numbering

ADRs use sequential numbering:

```
NNNN-decision-title.md
```

**Examples**:
- `0001-use-signals-for-reactivity.md`
- `0002-monorepo-with-bun-workspaces.md`
- `0003-typescript-native-type-checker.md`

**Rules**:
- Use 4-digit numbers: `0001`, `0002`, `0003`, etc.
- Never reuse numbers
- Keep chronological order
- Use lowercase-with-hyphens for titles

---

## ADR Status

ADRs have a lifecycle status:

| Status | Meaning |
|--------|---------|
| **Proposed** | Initial draft, under discussion |
| **Accepted** | Decision made and approved |
| **Deprecated** | No longer recommended but not replaced |
| **Superseded** | Replaced by a newer decision (link to new ADR) |

### Status Changes

- **Proposed → Accepted**: Decision is made
- **Accepted → Deprecated**: Decision is outdated but no replacement
- **Accepted → Superseded**: New ADR replaces this one

**Important**: Once accepted, ADRs are **immutable**. Don't edit them. Create a new ADR to supersede instead.

---

## ADR Template

Use [template.md](./template.md) to create new ADRs. The template includes:

- **Context** - Why this decision is needed
- **Decision** - What we decided
- **Rationale** - Why we made this choice
- **Consequences** - Positive, negative, and neutral impacts
- **Alternatives** - What we didn't choose and why

---

## Existing ADRs

| ADR | Decision | Status |
|-----|----------|--------|
| [template.md](./template.md) | Template | Template |

_No ADRs yet. Create the first one!_

---

## ADR Best Practices

### Writing ADRs

1. **Be concise** - 1-2 pages is ideal
2. **Be specific** - Avoid vague language
3. **Be honest** - Document trade-offs, not just benefits
4. **Think future** - Write for people reading 2 years from now
5. **Link context** - Reference RFCs, design docs, issues

### Example Structure

```markdown
# ADR-0001: Use Signals for Reactivity

Date: 2024-01-15
Status: Accepted

## Context
We need a reactivity system for SemaJSX. Options include:
- Virtual DOM (React approach)
- Signals (Solid approach)
- Observables (MobX approach)

## Decision
We will use fine-grained reactivity with signals.

## Rationale
1. Performance: No VDOM diffing overhead
2. Simplicity: Direct updates to DOM
3. Predictability: Clear dependency tracking

## Consequences
Positive:
- Faster updates
- Smaller bundle size

Negative:
- Different mental model than React
- Less mature ecosystem

## Alternatives
- Virtual DOM: Rejected due to performance overhead
- Observables: Rejected due to complexity
```

---

## Relationship to Other Documents

| Document Type | Purpose | Relationship to ADR |
|--------------|---------|---------------------|
| **RFC** | Propose feature | ADR may reference RFC |
| **Design Doc** | Detail implementation | ADR captures architectural choices from design |
| **ADR** | Record decision | Standalone decision record |

**Example Flow**:
1. RFC proposes Context API
2. Design doc details implementation
3. ADR records: "Use function parameters instead of hooks for context injection"

---

## Getting Started

### Creating Your First ADR

1. **Identify a decision**: "We need to choose X"

2. **Copy template**:
   ```bash
   cp template.md 0001-your-decision-title.md
   ```

3. **Fill in sections**:
   - Context: Why this decision?
   - Decision: What we chose
   - Rationale: Why this choice?
   - Consequences: What happens?
   - Alternatives: What we didn't choose

4. **Review**: Share with team

5. **Accept**: Update status, commit

6. **Reference**: Link from code, design docs

---

## Tips for Maintainers

### When to Create vs Reference

- **Create new ADR**: For new architectural decisions
- **Reference existing ADR**: When implementing something covered by existing ADR
- **Supersede ADR**: When reversing or significantly changing a decision

### Keeping ADRs Useful

- ✅ Write clearly for future readers
- ✅ Include enough context
- ✅ Link to related documents
- ✅ Update index when adding new ADRs
- ❌ Don't delete or edit accepted ADRs
- ❌ Don't create ADRs for every small decision

---

## Further Reading

- [Architecture Decision Records](https://adr.github.io/) - Original ADR concept
- [Workflow Guide](../guides/workflow.md) - Complete development process
- [DOCS.md](../../DOCS.md) - Documentation index

---

**Questions?** See [DOCS.md](../../DOCS.md) for the complete documentation index.

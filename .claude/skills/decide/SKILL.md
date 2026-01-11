---
name: decide
description: Log technical decisions during implementation - captures context, options, rationale, and consequences in decisions.md
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
            If you just updated a decisions.md file in docs/implementation/*/, commit it immediately.

            Count the decision entries to determine decision number.
            Generate commit message: "docs(impl): decision NNN - <title>"

            Use git add and commit with --no-verify flag.
---

# Decision Logger

Log technical decisions during implementation with structured format including context, options, rationale, and consequences.

## Purpose

This skill ensures technical decisions are:
- **Documented immediately** when made (not remembered later)
- **Consistently formatted** for easy reference
- **Linked to commits** for traceability
- **Searchable** across all implementations

**Note**: This is an internal skill, primarily called during `/implement` execution when Claude faces design choices. Can also be invoked directly.

## Usage

Describe the decision you need to log:

```
Log decision: Use nanoid for class hash generation

Record decision to use Proxy-based reactivity instead of getters

Document choice: Function params for context API vs React.createContext
```

The skill will:
1. Prompt for decision details (context, options, rationale, consequences)
2. Append to `decisions.md` with proper formatting
3. Auto-commit with decision number

## How It Works

### Interactive Decision Capture

When you describe a decision, the skill guides you through:

1. **Context**: Why was this decision needed?
2. **Options Considered**: What alternatives were evaluated?
3. **Decision**: What was chosen?
4. **Rationale**: Why this option?
5. **Consequences**: Trade-offs and implications?

Each answer is captured and formatted into a structured decision entry.

### Decision Format

```markdown
## Decision NNN: [Title]

**Date**: YYYY-MM-DD
**Status**: Accepted | Proposed | Rejected | Superseded

**Context**: [Why was this decision needed?]

**Options Considered**:
1. [Option 1] - [Brief description + key pro/con]
2. [Option 2] - [Brief description + key pro/con]
3. [Option 3] - [Brief description + key pro/con]

**Decision**: [What was decided?]

**Rationale**:
- [Reason 1]
- [Reason 2]
- [Reason 3]

**Consequences**:

Positive:
- [Benefit 1]
- [Benefit 2]

Negative:
- [Drawback 1]
- [Drawback 2]

Neutral/Trade-offs:
- [Trade-off 1]
```

### Auto-Commit

PostToolUse hook automatically commits:
```bash
git commit -m "docs(impl): decision 003 - use nanoid for class hash generation"
```

## Hook: Auto-Commit Decisions

**Type**: `prompt` (LLM-based)

**Why prompt instead of command?**
- Decision titles vary in length and format
- Claude can extract decision number by counting
- Claude can generate descriptive commit message
- More maintainable than bash parsing

**What it does**:
1. Detects when decisions.md was modified
2. Counts decision entries to get number
3. Extracts decision title
4. Generates commit message
5. Executes git commit

## Interactive Prompts

The skill walks you through each field:

### 1. Context

```
Why was this decision needed?

Example:
"Need to generate unique class names with low collision risk and short length for optimal bundle size"

Your answer:
>
```

### 2. Options Considered

```
What alternatives were evaluated? List them:

Example:
1. UUID v4 - Standard, but 36 chars too long
2. MD5 hash - Content-based, but 32 chars still too long
3. nanoid - Configurable length, wide adoption

Your answer:
>
```

### 3. Decision

```
What was decided?

Example:
"Use nanoid with 8-character length"

Your answer:
>
```

### 4. Rationale

```
Why this option? List key reasons:

Example:
- Collision probability ~1M years at 8 chars
- Smaller bundle size (nanoid ~1KB vs uuid ~9KB)
- URL-safe alphabet by default

Your answer:
>
```

### 5. Consequences

```
What are the trade-offs and implications?

Format as:
Positive:
- [Benefit]

Negative:
- [Drawback]

Example:
Positive:
- Short class names (.rule-a1b2c3d4)
- Minimal bundle impact

Negative:
- Adds dependency
- Not semantic names

Your answer:
>
```

## Decision Status

Decisions can have different statuses:

- **Proposed**: Suggested but not yet approved
- **Accepted**: Approved and being implemented (default)
- **Rejected**: Considered but ultimately rejected
- **Superseded**: Replaced by later decision

**Default**: "Accepted" (when logging during implementation)

To update status later, manually edit decisions.md and commit.

## Integration

### Called during `/implement`

```
/implement 3
  ↓
  [Implementing rule() template parsing]
  ↓
  Design choice: How to detect signals?
  ↓
  "Need to decide on signal detection approach"
  ↓
  /decide invoked
  ↓
  [Interactive prompts]
  ↓
  Decision logged and committed
  ↓
  [Continue implementation]
```

### Direct invocation

```
User: "Log decision to use nanoid for class hashing"
  ↓
  /decide invoked
  ↓
  [Interactive prompts]
  ↓
  Decision appended to decisions.md
  ↓
  Auto-committed: docs(impl): decision 003 - use nanoid
```

## File Structure

**Reads**:
- `docs/implementation/*/decisions.md` - Existing decisions (to count)

**Appends**:
- `docs/implementation/*/decisions.md` - New decision entry

**Commits**:
- `docs(impl): decision NNN - [title]`

**Allowed Tools**:
- `Read` - Read existing decisions
- `Write` / `Edit` - Append new decision
- `Bash(git:*)` - Git operations only

## Examples

### Example 1: Architecture Decision

```
User: Log decision to use function params for context API

🤔 Logging technical decision...

1️⃣ **Context**: Why was this decision needed?
> Designing SemaJSX context API - choose between React.createContext or function parameters

2️⃣ **Options Considered**: List alternatives
> 1. React.createContext clone - Familiar, implicit context
> 2. Solid.js function params - Explicit passing, better DX
> 3. Global registry - Singleton-based
> 4. Hybrid approach - Allow both

3️⃣ **Decision**: What was decided?
> Use function parameters (Solid.js style)

4️⃣ **Rationale**: Why this option?
> - More explicit data flow
> - Better TypeScript inference
> - Aligns with signal philosophy
> - Simpler implementation
> - Easier to test

5️⃣ **Consequences**: Trade-offs?
> Positive:
> - Explicit context passing clarifies data flow
> - TypeScript infers types automatically
> - Easier to test (no Provider)
>
> Negative:
> - More verbose than React
> - No React.createContext compatibility
>
> Neutral:
> - Different from React (learning curve)

📝 Writing to decisions.md...

## Decision 004: Use Function Params for Context API

**Date**: 2026-01-11
**Status**: Accepted

**Context**: Designing SemaJSX context API - choose between React.createContext or function parameters

**Options Considered**:
1. React.createContext clone - Familiar, implicit context
2. Solid.js function params - Explicit passing, better DX
3. Global registry - Singleton-based
4. Hybrid approach - Allow both

**Decision**: Use function parameters (Solid.js style)

**Rationale**:
- More explicit data flow
- Better TypeScript inference
- Aligns with signal philosophy
- Simpler implementation
- Easier to test

**Consequences**:

Positive:
- Explicit context passing clarifies data flow
- TypeScript infers types automatically
- Easier to test (no Provider)

Negative:
- More verbose than React
- No React.createContext compatibility

Neutral:
- Different from React (learning curve)

[PostToolUse hook triggers]
[Auto-commits: docs(impl): decision 004 - use function params for context API]

✅ Decision 004 logged and committed
```

### Example 2: Performance Decision

```
User: Record decision on memoization strategy for computed signals

🤔 Logging technical decision...

1️⃣ **Context**:
> Computed signals recalculating unnecessarily - need caching strategy

2️⃣ **Options Considered**:
> 1. No memoization - Recalculate every access
> 2. WeakMap cache - Cache per instance
> 3. LRU cache - Bounded memory
> 4. Dependency tracking - Recalc only when deps change

3️⃣ **Decision**:
> Use dependency tracking (option 4)

4️⃣ **Rationale**:
> - Most efficient (only recalc when needed)
> - Proven approach (Solid.js, Vue)
> - Automatic dependency collection
> - No memory leaks

5️⃣ **Consequences**:
> Positive:
> - Optimal performance
> - No manual invalidation
>
> Negative:
> - More complex implementation
> - Edge cases with conditional deps
>
> Trade-offs:
> - Bundle size +2KB for dep tracking
> - Runtime overhead <0.1ms per computed

📝 Writing to decisions.md...

## Decision 007: Use Dependency Tracking for Computed Memoization

[... formatted decision ...]

[Auto-committed: docs(impl): decision 007 - use dependency tracking]

✅ Decision 007 logged
```

### Example 3: Simple Tool Choice

```
User: Log decision to use nanoid for class hashing

🤔 Logging technical decision...

1️⃣ **Context**:
> Need unique class names, short length, low collision risk

2️⃣ **Options**:
> 1. UUID v4 - Too long (36 chars)
> 2. MD5 hash - Still long (32 chars)
> 3. nanoid - Configurable (8 chars)

3️⃣ **Decision**:
> Use nanoid with 8-character length

4️⃣ **Rationale**:
> - Collision probability: ~1M years at 8 chars
> - Small bundle (1KB vs 9KB for uuid)
> - Wide adoption

5️⃣ **Consequences**:
> Positive:
> - Short class names
> - Minimal bundle impact
>
> Negative:
> - Adds dependency
> - Not semantic names

📝 Writing to decisions.md...

[Decision formatted and appended]
[Auto-committed: docs(impl): decision 003 - use nanoid for class hashing]

✅ Decision 003 logged
```

## Linking Decisions to Code

### In Commit Messages

Reference decision in implementation commits:

```bash
git commit -m "feat: implement rule() with signal detection

Implements Decision 005: Use typeof check for signal detection.
See: docs/implementation/001-style-system/decisions.md#decision-005"
```

### In Code Comments

```typescript
// Use nanoid for hash generation (Decision 003)
// Rationale: Balance between uniqueness and bundle size
import { nanoid } from 'nanoid'

function generateClassName(): string {
  return `rule-${nanoid(8)}`
}
```

### In decisions.md

After implementation, update decision with links:

```markdown
## Decision 003: Use nanoid for Class Hash Generation

[... decision content ...]

**Implementation**:
- Implemented in: packages/style/src/hash.ts (commit: a1b2c3d)
- Tests: packages/style/src/hash.test.ts (commit: b2c3d4e)
```

## Best Practices

1. **Log immediately** - Don't wait until later
2. **Be specific in context** - Explain the problem clearly
3. **List ALL options** - Even rejected ones (shows due diligence)
4. **Explain rationale fully** - Future readers need to understand why
5. **Document consequences** - Both positive and negative
6. **Link to code** - Connect decisions to implementations
7. **Update status** - Mark as Superseded if decision changes

## Troubleshooting

### Issue: Decision number incorrect

**Cause**: Manual edit broke numbering

**Solution**:
- Hook counts decisions automatically
- If numbering off, manually renumber in decisions.md
- Recommit with corrected message

### Issue: Hook not committing

**Check**:
```bash
git status
```

**If decisions.md uncommitted**:
- Hook may have failed
- Manually commit:
  ```bash
  git add docs/implementation/*/decisions.md
  git commit -m "docs(impl): decision NNN - <title>"
  ```

### Issue: Lost context during prompts

**Solution**:
- Prepare decision notes beforehand
- Copy/paste into prompts
- Or manually write to decisions.md as fallback

## Design Rationale

### Why `type: prompt` for PostToolUse?

**Considered alternatives**:
1. ❌ Bash script counting decisions with grep
2. ❌ Regex extracting title from file
3. ✅ LLM-based understanding

**Chosen**: `type: prompt` because:
- Claude can count decision entries accurately
- Claude can extract title from decision content
- Claude generates descriptive commit messages
- Handles edge cases (formatting variations)
- More maintainable

### Why `user-invocable: false`?

This skill is primarily **internal**:
- Called during `/implement` when design choices arise
- Can still be invoked by describing intent
- Not shown in `/` menu
- Auto-discoverable when mentioning "decision" or "decide"

### Why restrict to `Bash(git:*)`?

**Security**: Only git operations needed
- Can't run other commands
- Can't modify files beyond decisions.md
- Clear audit trail

### Why interactive prompts?

**Better than structured args**:
- Natural conversation flow
- Claude can ask follow-up questions
- Users can provide context freely
- Catches missing information

## Template Reference

```markdown
## Decision NNN: [Title]

**Date**: YYYY-MM-DD
**Status**: Accepted | Proposed | Rejected | Superseded

**Context**: [1-2 sentences describing the problem]

**Options Considered**:
1. [Option 1] - [Brief description + key trade-offs]
2. [Option 2] - [Brief description + key trade-offs]
3. [Option 3] - [Brief description + key trade-offs]

**Decision**: [What was chosen? 1 sentence]

**Rationale**:
- [Key reason 1]
- [Key reason 2]
- [Key reason 3]

**Consequences**:

Positive:
- [Benefit 1]
- [Benefit 2]

Negative:
- [Drawback 1]
- [Drawback 2]

Neutral/Trade-offs:
- [Trade-off 1]

**References** (optional):
- [RFC link]
- [External docs]

**Implementation** (added after coding):
- Implemented in: [file paths]
- Related commits: [hashes]
```

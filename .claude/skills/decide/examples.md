# Decide Skill Examples

Examples showing technical decision logging with the `/decide` skill.

## Example 1: Architecture Decision

```
User: Log decision to use function params for context API

🤔 Recording technical decision...

**Context**: Designing SemaJSX context API - choose between React.createContext or function parameters

**Options Considered**:
1. React.createContext clone - Familiar, implicit context
2. Solid.js function params - Explicit passing, better DX
3. Global registry - Singleton-based

**Decision**: Use function parameters (Solid.js style)

**Rationale**:
- More explicit data flow
- Better TypeScript inference
- Aligns with signal philosophy
- Simpler implementation

**Consequences**:
Positive:
- Explicit context passing
- Automatic type inference

Negative:
- More verbose than React
- No createContext compatibility

📝 Writing to decisions.md...

## Decision 004: Use Function Params for Context API

[... formatted decision ...]

[PostToolUse hook triggers]
📝 Auto-committed: docs(impl): decision 004 - use function params for context
```

---

## Example 2: Tool Choice Decision

```
User: Record decision to use nanoid for class hashing

**Context**: Need unique class names, short length, low collision risk

**Options**:
1. UUID v4 - Too long (36 chars)
2. MD5 hash - Still long (32 chars)
3. nanoid - Configurable (8 chars)

**Decision**: Use nanoid with 8-character length

**Rationale**:
- Collision probability: ~1M years
- Small bundle (1KB vs 9KB)
- Wide adoption

**Consequences**:
Positive:
- Short class names
- Minimal bundle impact

Negative:
- Adds dependency
- Not semantic names

📝 Auto-committed: docs(impl): decision 003 - use nanoid for class hashing
```

---

## Example 3: Interactive Prompts

```
User: Log decision about signal detection

1️⃣ **Context**: Why was this decision needed?
> Need to detect signals in rule() template strings

2️⃣ **Options Considered**: List alternatives
> 1. typeof check for .value property
> 2. Symbol.for() marker
> 3. instanceof Signal class

3️⃣ **Decision**: What was decided?
> Use typeof check for .value property

4️⃣ **Rationale**: Why this option?
> - Simple and fast
> - No runtime overhead
> - Duck typing approach

5️⃣ **Consequences**: Trade-offs?
> Positive:
> - Fast runtime check
> Negative:
> - Could false-positive on objects with .value

✅ Decision 005 logged
```

---

## Example 4: PostToolUse Auto-Commit

```
[Skill writes to decisions.md]

[PostToolUse hook triggers]

Detected decisions.md update
Counting decision entries... Found: 7
Extracting decision title: "use dependency tracking"

📝 Auto-committed: docs(impl): decision 007 - use dependency tracking
```

**Hook behavior**:
- Detects decisions.md modification
- Counts entries for decision number
- Extracts title from content
- Generates commit message
- Auto-commits immediately

---

## Decision Format

```markdown
## Decision NNN: [Title]

**Date**: YYYY-MM-DD
**Status**: Accepted

**Context**: [Why needed?]

**Options Considered**:
1. [Option 1] - [Pro/con]
2. [Option 2] - [Pro/con]

**Decision**: [What was chosen?]

**Rationale**:
- [Reason 1]
- [Reason 2]

**Consequences**:
Positive:
- [Benefit 1]

Negative:
- [Drawback 1]
```

---

## See Also

- [SKILL.md](SKILL.md) - Complete documentation
- [/workflow examples](../workflow/examples.md) - Integration

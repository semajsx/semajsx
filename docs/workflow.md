# Development Workflow (AI Agent Execution Model)

Standard development workflow for SemaJSX, optimized for **AI Agent execution**.

---

## Overview

```
Discovery → Design → Implementation → Verification → Archive
```

**Purpose**: Flexible but structured approach ensuring quality, traceability, and knowledge preservation.

**Agent-Oriented**: Workflow emphasizes automated validation, dependency tracking, and task-based execution rather than time-based planning.

**Adapt to scale**: Use full process for major features, simplified for minor changes.

---

## Stages

### 1. Discovery 📋

**Goal**: Clarify what problem to solve and why.

**Output**:

- RFC document (`rfcs/YYYY-MM-DD-feature.md`)
- Research materials (`.workspace/research/`)

**When**: Major features, breaking changes, unclear scope.

**Template**: [rfcs/template.md](./rfcs/template.md)

---

### 2. Design 🎨

**Goal**: Determine how to implement and why this design.

**Output**:

- Design document (`designs/feature-design.md`)
- ADRs for key decisions (`adrs/NNNN-decision.md`)
- Drafts (`.workspace/drafts/`)

**When**: After RFC approval, or directly for smaller features.

**Templates**: [designs/template.md](./designs/template.md), [adrs/template.md](./adrs/template.md)

---

### 3. Implementation 💻

**Goal**: Turn design into code via task-based execution.

**Agent Execution**:

1. Create implementation plan in `docs/implementation/{number}-{name}/plan.md`
   - Task dependency graph (visual representation)
   - Task groups (numbered by dependency order, not time)
   - Complexity ratings (Low/Medium/High)
   - Validation criteria (automated commands)
   - Blocking relationships

2. Execute task groups sequentially by dependency order:

   ```
   While (incomplete task groups exist):
     - Select next task group (check dependencies met)
     - Execute all tasks in group
     - Run validation criteria
     - If validation passes: Mark complete, move to next
     - If validation fails: Log blocker, investigate, fix
   ```

3. Track progress in `progress.md`:
   - Task group completion status
   - Validation results
   - Metrics achieved
   - Current blockers

**Output**:

- Source code (`packages/*/src/`)
- Tests (`*.test.ts`) with ≥80% coverage
- Examples (`packages/*/examples/`)
- Implementation tracking (`docs/implementation/*/`)

**Git**: Small atomic commits, reference implementation plan in commits.

**See**: [Implementation Tracking Guide](./implementation/README.md)

---

### 4. Verification ✅

**Goal**: Ensure quality and design goals achieved via automated validation.

**Agent Validation Commands**:

```bash
# Core validation (must all pass)
bun run build                # ✅ Exit code: 0
bun run test                 # ✅ All tests pass
bun run test:coverage        # ✅ Coverage ≥ target (usually ≥80%)
bun run typecheck            # ✅ TypeScript strict mode passes
bun run lint                 # ✅ No lint errors

# Performance validation (if applicable)
bun run test:perf            # ✅ Performance targets met
bun run test:memory          # ✅ No memory leaks

# Build metrics
du -h dist/index.js          # ✅ Bundle size ≤ target
```

**Automated Checklist**:

- ✅ All validation commands return exit code 0
- ✅ Code coverage ≥ target percentage
- ✅ Performance metrics meet targets
- ✅ Bundle size within limits
- ✅ No blockers in `progress.md`
- ✅ Implementation matches design (verify against plan.md)
- ✅ Documentation complete (API reference, examples)

**Agent Behavior**:

- Run validation after each task group completion
- Do NOT proceed to next task group if validation fails
- Log validation failures in `progress.md` immediately
- Create retrospective in `retrospective.md` after all validation passes

---

### 5. Archive 📦

**Goal**: Clean up, document, release.

**Tasks**:

- Update CHANGELOG.md
- Move final designs from `.workspace/` to `docs/`
- Delete temporary drafts
- Release version

---

## When to Use

| Change Type   | RFC      | Design | ADR              | Example       |
| ------------- | -------- | ------ | ---------------- | ------------- |
| Major feature | ✅       | ✅     | If needed        | New engine    |
| Minor feature | Optional | ✅     | If needed        | New helper    |
| Bug fix       | ❌       | ❌     | ❌               | Fix error     |
| Refactor      | Optional | ✅     | If architectural | Restructure   |
| Docs          | ❌       | ❌     | ❌               | Update README |
| Breaking      | ✅       | ✅     | ✅               | Change API    |

**Rule of thumb**:

- **Simple change?** Direct PR
- **Need to think through design?** Create design doc
- **Major feature or breaking?** Full workflow (RFC + Design + ADR)

---

## Directory Structure

```
docs/
├── workflow.md          # This file
├── rfcs/                # Feature proposals (permanent)
├── designs/             # Technical designs (permanent)
├── adrs/                # Architecture decisions (permanent)
└── implementation/      # 🆕 Implementation tracking (active during development)
    ├── README.md        # AI Agent execution guide
    ├── 001-style-system/
    │   ├── plan.md           # Task groups, dependencies, validation
    │   ├── progress.md       # Real-time progress tracking
    │   ├── decisions.md      # Technical decisions log
    │   └── retrospective.md  # Post-completion review
    ├── 002-react-adapter/
    └── ...

.workspace/              # Temporary (git-ignored)
├── research/            # Investigation materials
├── drafts/              # Design iterations
├── discussions/         # Meeting notes
└── experiments/         # Prototype code
```

---

## Information Lifecycle

| Type                | Location                                 | Lifecycle                              | Updated By  |
| ------------------- | ---------------------------------------- | -------------------------------------- | ----------- |
| Research            | `.workspace/research/`                   | Temporary, archive or delete           | Agent/Human |
| Drafts              | `.workspace/drafts/`                     | Temporary, final → `docs/designs/`     | Agent/Human |
| Discussions         | `.workspace/discussions/`                | Temporary, extract → RFC/ADR           | Agent/Human |
| Experiments         | `.workspace/experiments/`                | Temporary, delete after validation     | Agent/Human |
| RFC                 | `docs/rfcs/`                             | Permanent (read-only after acceptance) | Agent/Human |
| Design              | `docs/designs/`                          | Permanent (read-only after acceptance) | Agent/Human |
| ADR                 | `docs/adrs/`                             | Permanent (append-only)                | Agent/Human |
| Implementation Plan | `docs/implementation/*/plan.md`          | Permanent (static after creation)      | Agent       |
| Progress Tracking   | `docs/implementation/*/progress.md`      | Active during implementation           | Agent       |
| Decisions Log       | `docs/implementation/*/decisions.md`     | Active (append-only)                   | Agent       |
| Retrospective       | `docs/implementation/*/retrospective.md` | Written once after completion          | Agent       |

---

## Quick Reference

**Proposing feature**: Create [RFC](./rfcs/template.md)
**Designing implementation**: Create [Design Doc](./designs/template.md)
**Recording decision**: Create [ADR](./adrs/template.md)
**Planning implementation**: Create plan in `docs/implementation/{number}-{name}/plan.md`
**Tracking progress**: Update `docs/implementation/{number}-{name}/progress.md`
**Logging decisions**: Append to `docs/implementation/{number}-{name}/decisions.md`
**Drafting design**: Use `.workspace/drafts/`
**Researching**: Use `.workspace/research/`

**For AI Agents**:

- Read [Implementation Tracking Guide](./implementation/README.md) first
- Focus on automated validation, not time estimates
- Execute task groups by dependency order
- Update progress after each task group completion

---

## Example Flow (AI Agent Execution)

```
1. User requests: "Add Context API"

2. Discovery (Agent):
   - Research existing patterns: .workspace/research/react-vs-solid-context.md
   - Draft RFC: docs/rfcs/2026-01-15-context-api.md
   - Assess feasibility: ⭐⭐⭐⭐ (Highly Feasible)

3. Design (Agent):
   - Generate drafts: .workspace/drafts/context-v1.md, context-v2.md
   - Finalize design: docs/designs/context-api-design.md
   - Record decision: docs/adrs/0001-use-function-params-for-context.md

4. Implementation Planning (Agent):
   - Create: docs/implementation/004-context-api/plan.md
     * Task dependency graph
     * Task Group 1: Core API (Priority: P0, Complexity: Medium)
     * Task Group 2: Integration tests (Priority: P0, Complexity: Low)
     * Validation criteria for each group
   - Create: docs/implementation/004-context-api/progress.md (initial)
   - Create: docs/implementation/004-context-api/decisions.md (empty)

5. Implementation Execution (Agent):
   - Execute Task Group 1:
     * Write: packages/core/src/context.ts
     * Write: packages/core/src/context.test.ts
     * Run validation: bun run build && bun run test:coverage
     * ✅ Validation passed (coverage: 87%)
     * Update: progress.md (Task Group 1 complete)

   - Execute Task Group 2:
     * Write: packages/dom/examples/context-demo/
     * Run validation: bun run test
     * ✅ Validation passed
     * Update: progress.md (Task Group 2 complete)

6. Verification (Agent):
   - Run full validation suite:
     * bun run build ✅
     * bun run test ✅
     * bun run test:coverage ✅ (87% > 80% target)
     * bun run typecheck ✅
     * bun run lint ✅
   - Verify implementation matches design ✅
   - All task groups complete ✅

7. Archive (Agent):
   - Write: docs/implementation/004-context-api/retrospective.md
     * Complexity assessment accuracy: Medium (correct)
     * Blockers: None
     * Metrics: Coverage 87% (target 80%), Bundle +2KB
   - Update: CHANGELOG.md
   - Delete: .workspace/drafts/context-*.md
   - Git commit & push
   - Mark implementation complete
```

**Key Differences from Human Workflow**:

- ❌ No time estimates (Week 1, Day 2, etc.)
- ✅ Task groups with dependency order
- ✅ Automated validation after each step
- ✅ Real-time progress tracking
- ✅ Agent handles blockers autonomously

---

## AI Agent Execution

**This project is designed for AI Agent-driven development.** AI Agents are the primary executors, not assistants.

### Agent Capabilities by Stage

**Discovery**:

- Research existing solutions and patterns
- Draft RFC based on requirements
- Analyze feasibility of proposed features

**Design**:

- Generate design document drafts
- Suggest architectural alternatives
- Create task dependency graphs
- Assess complexity ratings

**Implementation**:

- **Primary executor** - Write code, tests, and documentation
- Execute task groups in dependency order
- Run automated validation after each task group
- Track progress in real-time
- Handle blockers autonomously (investigate, fix, re-validate)

**Verification**:

- Run all automated validation commands
- Verify metrics against targets
- Generate performance benchmarks
- Create test coverage reports

**Archive**:

- Generate CHANGELOG entries
- Write retrospectives
- Organize documentation
- Clean up temporary files

### Agent Instructions

**Critical Rules**:

1. ✅ Always validate after each task group
2. ✅ Update `progress.md` after task group completion
3. ✅ Log blockers immediately when validation fails
4. ❌ Never skip validation steps
5. ❌ Never proceed if dependencies not met
6. ❌ Never use time estimates (weeks/days) - use complexity ratings

**Context Awareness**:

- Reference RFCs, design docs, and implementation plans
- Check `CLAUDE.md` / `AGENTS.md` for project-specific guidelines
- Review existing code patterns before implementing new code
- Follow testing conventions in `TESTING.md`

---

## Questions?

- **"Do I need an RFC?"** → Only for major features or breaking changes
- **"Do I need a design doc?"** → If you need to think through the design, yes
- **"Do I need an ADR?"** → Only for significant architectural decisions
- **"Can I skip stages?"** → Yes! Use the decision matrix above

See [DOCS.md](../DOCS.md) for complete documentation index.

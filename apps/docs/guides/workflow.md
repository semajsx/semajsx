# Development Workflow Guide

**Version**: 1.0
**Last Updated**: 2026-01-08

---

## Overview

This document describes the standard development workflow for this project. The workflow provides a **flexible but structured** approach to software development, ensuring quality, traceability, and knowledge preservation.

## Core Principles

1. **Progressive Clarity** - Move from ambiguity to clarity through exploration and iteration
2. **Documentation-First** - Think before coding to avoid rework
3. **Layered Storage** - Different types of information live in different places
4. **Traceability** - Decision processes are traceable for review and learning
5. **Adaptability** - Scale the process based on change size and complexity

---

## Workflow Stages

```
Discovery (发现/探索)
    ↓
Design (设计)
    ↓
Implementation (实现)
    ↓
Verification (验证)
    ↓
Archive (归档)
```

Each stage has:
- **Input**: Artifacts from the previous stage
- **Process**: What to do in this stage
- **Output**: Documents and code produced
- **Acceptance Criteria**: When you can proceed to the next stage

---

## Directory Structure

```
project-root/
│
├── apps/docs/                   # 📚 Official Documentation (Permanent)
│   ├── rfcs/                    # RFC - Requirements Confirmation
│   ├── designs/                 # Design Documents
│   ├── adrs/                    # Architecture Decision Records
│   └── guides/                  # Development Guides
│       └── workflow.md          # This document
│
├── .workspace/                  # 🚧 Workspace (Temporary)
│   ├── research/                # Research Materials
│   ├── drafts/                  # Design Drafts (Multiple Versions)
│   ├── discussions/             # Meeting Notes, Discussions
│   └── experiments/             # Prototype Code, Experiments
│
├── packages/*/                  # 💻 Source Code
│   ├── src/
│   ├── docs/                    # Package-level Documentation
│   └── examples/
│
├── CHANGELOG.md                 # 📝 Change Log
└── README.md                    # 📖 Project Main Documentation
```

**Important Notes**:
- `.workspace/` - Temporary working area (git-ignored)
- `apps/docs/` - Official documentation (committed to git)
- Package-level docs go in `packages/*/docs/`

---

## Stage 1: Discovery 📋

**Goal**: Clarify "What problem to solve and why"

### Input
- User feedback
- Bug reports
- Product requirements
- Technical debt

### Process
1. **Problem Definition**
   - What's the current state?
   - Where are the pain points?
   - Who are the target users?

2. **Requirements Gathering**
   - Functional requirements
   - Non-functional requirements (Performance, Security, UX)
   - Constraints (Time, Technology, Compatibility)

3. **Research**
   - Competitive analysis
   - Technical solution comparison
   - Feasibility assessment

4. **Decision**
   - Do we proceed? (Go/No-Go)
   - Priority? (P0/P1/P2)
   - Scope? (MVP vs Full)

### Output
- **RFC Document** (`apps/docs/rfcs/YYYY-MM-DD-feature.md`)
- **Research Reports** (`.workspace/research/`)
- **Meeting Notes** (`.workspace/discussions/`)

### Acceptance Criteria
- [ ] Problem clearly defined
- [ ] Goals and non-goals are clear
- [ ] Key risks identified
- [ ] Decision makers have approved (Accept/Reject)

**Template**: See `apps/docs/rfcs/template.md`

---

## Stage 2: Design 🎨

**Goal**: Determine "How to implement and why this design"

### Input
- Approved RFC
- Technical constraints
- System current state

### Process
1. **Solution Exploration**
   - Brainstorming
   - Multiple design draft versions
   - Prototype validation (POC)

2. **API Design**
   - Interface definition
   - Usage examples
   - Edge cases

3. **Architecture Design**
   - Module breakdown
   - Data flow
   - Dependencies

4. **Trade-off Decisions**
   - Solution comparison
   - Technology selection
   - Record ADRs

### Output
- **Design Document** (`apps/docs/designs/feature-design.md`)
- **Design Drafts** (`.workspace/drafts/feature-v1/v2/v3.md`)
- **ADR** (`apps/docs/adrs/NNNN-decision.md`)
- **Prototype Code** (`.workspace/experiments/poc-feature/`)

### Acceptance Criteria
- [ ] API design complete
- [ ] Solution comparison clear
- [ ] Key technical decisions recorded in ADRs
- [ ] Peer review passed

**Templates**:
- Design: `apps/docs/designs/template.md`
- ADR: `apps/docs/adrs/template.md`

---

## Stage 3: Implementation 💻

**Goal**: Turn design into runnable code

### Input
- Approved design document
- ADRs

### Process
1. **Code Implementation**
   - Write code following design document
   - Follow code style guidelines
   - Small, atomic commits

2. **Unit Testing**
   - TDD (optional)
   - Coverage > 80%
   - Edge case testing

3. **Documentation**
   - Code comments
   - API documentation
   - Usage examples

4. **Code Review**
   - PR Review
   - Design validation (Does implementation match design?)

### Output
- **Source Code** (`packages/*/src/`)
- **Test Code** (`*.test.ts`)
- **Module Documentation** (`packages/*/docs/`)
- **Example Code** (`packages/*/examples/`)

### Acceptance Criteria
- [ ] All tests pass
- [ ] Code coverage meets target
- [ ] Lint/format checks pass
- [ ] Code review passed
- [ ] Implementation matches design document

**Git Workflow**:
```bash
# Create feature branch
git checkout -b feat/feature-name

# Small, atomic commits
git commit -m "feat: add core interface"
git commit -m "test: add unit tests"
git commit -m "docs: add API documentation"

# PR with context
# Link to design doc and RFC in PR description
```

---

## Stage 4: Verification ✅

**Goal**: Ensure quality and verify design goals achieved

### Input
- Implemented code
- Test code

### Process
1. **Functional Verification**
   - Is the functionality complete?
   - Does it meet RFC requirements?

2. **Quality Verification**
   - Unit tests
   - Integration tests
   - E2E tests (if applicable)

3. **Performance Verification**
   - Benchmarks
   - Load testing (if needed)
   - Compare with design targets

4. **Documentation Verification**
   - API documentation accuracy
   - Examples are runnable
   - Tutorials are complete

5. **Design Review**
   - Does implementation deviate from design?
   - Does design need updates?
   - Any new technical debt created?

### Verification Checklist

```markdown
## Functional Verification
- [ ] All RFC requirements implemented
- [ ] Edge cases handled correctly
- [ ] Error handling complete

## Code Quality
- [ ] Unit tests pass (100%)
- [ ] Integration tests pass
- [ ] Code coverage > 80%
- [ ] Lint checks pass
- [ ] Type checks pass

## Performance
- [ ] Benchmarks meet targets
- [ ] No significant performance regression
- [ ] Memory usage reasonable

## Documentation
- [ ] API documentation complete
- [ ] Usage examples runnable
- [ ] Migration guide (if breaking changes)
- [ ] CHANGELOG updated

## Design Validation
- [ ] Implementation matches design document
- [ ] ADR decisions followed
- [ ] No major architectural deviations
```

### Acceptance Criteria
- [ ] Verification checklist 100% complete
- [ ] QA sign-off (if applicable)
- [ ] Stakeholder acceptance

---

## Stage 5: Archive 📦

**Goal**: Organize knowledge, clean up temporary files, facilitate future review

### Input
- Verified code and documentation

### Process
1. **Update Main Documentation**
   - README.md
   - CHANGELOG.md
   - Project main documentation

2. **Clean Up Workspace**
   - Delete/archive `.workspace/drafts/`
   - Keep valuable research materials
   - Organize discussion notes

3. **Knowledge Preservation**
   - Organize implementation notes into official docs
   - Update development guides (if new patterns)
   - Record lessons learned

4. **Release and Communication**
   - Release version
   - Write Release Notes
   - Internal sharing (if applicable)

### Archival Operations

```bash
# 1. Move final design to official directory
mv .workspace/drafts/feature-v3-final.md apps/docs/designs/feature-design.md

# 2. Archive or delete drafts
rm -rf .workspace/drafts/feature-v1.md
rm -rf .workspace/drafts/feature-v2.md

# 3. Archive valuable research
mv .workspace/research/valuable-research.md apps/docs/research/

# 4. Clean up experiment code
rm -rf .workspace/experiments/poc-feature/

# 5. Commit archival
git add apps/docs/
git commit -m "docs: archive feature design and cleanup workspace"
```

### Acceptance Criteria
- [ ] CHANGELOG updated
- [ ] Temporary files cleaned
- [ ] Official documentation updated
- [ ] Version released (if applicable)

---

## Information Lifecycle Management

| Information Type | Storage Location | Lifecycle | Example |
|-----------------|------------------|-----------|---------|
| **Temporary Research** | `.workspace/research/` | Phase-based, can archive or delete | Tech comparison docs |
| **Design Drafts** | `.workspace/drafts/` | Temporary, final version becomes official | feature-v1/v2/v3.md |
| **Discussion Notes** | `.workspace/discussions/` | Temporary, extract key conclusions to RFC/ADR | Weekly meeting notes |
| **Experiment Code** | `.workspace/experiments/` | Temporary, delete or promote after validation | POC prototypes |
| **RFC** | `apps/docs/rfcs/` | Permanent | Requirements documents |
| **Design Docs** | `apps/docs/designs/` | Permanent | Design documents |
| **ADR** | `apps/docs/adrs/` | Permanent | Architecture decisions |
| **Source Code** | `packages/*/src/` | Permanent | Production code |
| **Changelog** | `CHANGELOG.md` | Permanent | Version history |

---

## When to Use This Workflow

### Full Workflow (All Stages)
Use for:
- New major features
- Breaking changes
- Architectural changes
- Complex refactoring

### Simplified Workflow
For smaller changes, you can simplify:

**Minor Features/Enhancements:**
- Skip RFC, go straight to Design Document
- Create ADR only if new architectural decisions are made

**Bug Fixes:**
- Skip RFC and Design
- Document fix in PR description
- Add regression tests

**Documentation Updates:**
- No RFC or Design needed
- Direct PR with changes

**Quick Fixes/Typos:**
- Direct commit to main (if policy allows) or quick PR
- No formal documentation

### Decision Matrix

| Change Type | RFC | Design Doc | ADR | Example |
|------------|-----|------------|-----|---------|
| Major Feature | ✅ | ✅ | If needed | New rendering engine |
| Minor Feature | Optional | ✅ | If needed | Add new helper function |
| Bug Fix | ❌ | ❌ | ❌ | Fix off-by-one error |
| Refactoring | Optional | ✅ | If architectural | Restructure modules |
| Documentation | ❌ | ❌ | ❌ | Update README |
| Breaking Change | ✅ | ✅ | ✅ | Change core API |

---

## Working with AI

This workflow is designed to be AI-friendly:

### AI Can Help With:

**Discovery Stage:**
- Research and competitive analysis
- Draft RFC documents
- Identify requirements

**Design Stage:**
- Generate design document drafts
- Suggest alternative solutions
- Create architecture diagrams

**Implementation Stage:**
- Write code following design
- Generate tests
- Write documentation

**Verification Stage:**
- Review code quality
- Suggest test cases
- Check documentation completeness

**Archive Stage:**
- Generate CHANGELOG entries
- Organize documentation
- Clean up files

### Best Practices for AI Collaboration:

1. **Provide Clear Context**
   - Reference relevant RFCs and design docs
   - Point to related ADRs
   - Share project conventions

2. **Use Templates**
   - Templates help AI generate consistent documents
   - Easier to review and iterate

3. **Iterative Refinement**
   - Start with AI draft
   - Human reviews and provides feedback
   - AI refines based on feedback

4. **Explicit Instructions**
   ```
   "Create an RFC for [feature] using the template in apps/docs/rfcs/template.md"
   "Generate a design document following our design template"
   "Review this code against the design doc in apps/docs/designs/..."
   ```

---

## FAQs

### When do I need an RFC?
- For any **major feature** that affects users or system architecture
- For **breaking changes** that impact existing APIs
- When you need **stakeholder approval** before investing time
- When the problem scope is unclear and needs discussion

### When do I need an ADR?
- When making **significant architectural decisions**
- When choosing between **multiple viable alternatives**
- When a decision will have **long-term impact**
- When you need to **explain rationale** to future developers

### Do small changes need the full workflow?
No. Use the [Decision Matrix](#decision-matrix) to determine the appropriate level of documentation.

### What if I'm prototyping and unsure of the direction?
- Use `.workspace/experiments/` for throwaway code
- Create multiple design drafts in `.workspace/drafts/`
- Once direction is clear, formalize in official design doc

### Can I skip the Design stage?
For simple bug fixes and minor changes, yes. For anything that requires architectural thinking, no.

### How do I handle urgent hotfixes?
- Fix the issue first (safety > process)
- Document the fix in a PR
- Consider creating a post-mortem ADR to prevent future issues

### What if the implementation deviates from the design?
This is normal! Either:
1. Update the design document to reflect reality
2. Refactor the implementation to match design
3. Create an ADR explaining why deviation was necessary

### How long should documents be?
- **RFC**: 1-3 pages
- **Design Doc**: 3-10 pages depending on complexity
- **ADR**: 1 page (concise decision record)

---

## Templates

All templates are available in their respective directories:

- **RFC Template**: `apps/docs/rfcs/template.md`
- **Design Document Template**: `apps/docs/designs/template.md`
- **ADR Template**: `apps/docs/adrs/template.md`

---

## Adapting This Workflow

This workflow is a guideline, not a rigid process. Adapt it to your needs:

- **Small team?** Simplify documentation requirements
- **Large project?** Add more review stages
- **Open source?** Add community RFC review process
- **Fast-moving?** Shorten feedback loops, but keep traceability

**The key is**: Always know why you're building something, how it should work, and be able to explain decisions to future maintainers.

---

## Conclusion

This workflow balances:
- **Structure** (clear stages and documentation)
- **Flexibility** (scale based on change size)
- **Traceability** (preserve decision rationale)
- **Velocity** (don't over-document small changes)

When in doubt, err on the side of more documentation for big changes, less for small ones.

Happy building! 🚀

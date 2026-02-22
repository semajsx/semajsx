# Architecture Review - Project Introspection

**Focus**:
**Context**: Full project diagnostics

---

## Project Structure

```
total 520
drwxr-xr-x@  37 lidessen  staff    1184 Feb 22 18:17 .
drwxr-xr-x@   8 lidessen  staff     256 Feb 21 16:05 ..
drwxr-xr-x@   3 lidessen  staff      96 Feb 14 04:32 .claude
drwxr-xr-x@   3 lidessen  staff      96 Feb 14 04:32 .cursor
-rw-r--r--@   1 lidessen  staff     706 Feb 14 04:32 .editorconfig
drwxr-xr-x@  15 lidessen  staff     480 Feb 22 19:45 .git
drwxr-xr-x@   4 lidessen  staff     128 Feb 14 04:32 .github
-rw-r--r--@   1 lidessen  staff    2394 Feb 14 04:32 .gitignore
drwxr-xr-x@   6 lidessen  staff     192 Feb 21 22:00 .husky
-rw-r--r--@   1 lidessen  staff      90 Feb 14 04:32 .lintstagedrc.json
-rw-r--r--@   1 lidessen  staff     120 Feb 14 04:32 .oxfmtignore
drwxr-xr-x@   3 lidessen  staff      96 Feb 14 04:32 .oxlint
drwxr-xr-x@   3 lidessen  staff      96 Feb 14 04:32 .vscode
drwxr-xr-x@   5 lidessen  staff     160 Feb 22 20:14 .workflows
lrwxr-xr-x@   1 lidessen  staff       9 Feb 14 04:32 AGENTS.md -> CLAUDE.md
-rw-r--r--@   1 lidessen  staff    2651 Feb 14 04:32 CHANGELOG.md
-rw-r--r--@   1 lidessen  staff   15153 Feb 14 04:32 CLAUDE.md
-rw-r--r--@   1 lidessen  staff    5497 Feb 14 04:32 CODE_OF_CONDUCT.md
-rw-r--r--@   1 lidessen  staff    6069 Feb 14 04:32 CONTRIBUTING.md
-rw-r--r--@   1 lidessen  staff   10517 Feb 14 04:32 DOCUMENTING.md
-rw-r--r--@   1 lidessen  staff    1064 Feb 14 04:32 LICENSE
-rw-r--r--@   1 lidessen  staff   14982 Feb 14 04:32 MONOREPO_ARCHITECTURE.md
-rw-r--r--@   1 lidessen  staff    8858 Feb 14 04:32 README.md
-rw-r--r--@   1 lidessen  staff    7798 Feb 14 04:32 TESTING.md
-rw-r--r--@   1 lidessen  staff    6185 Feb 14 04:32 WORKFLOW.md
drwxr-xr-x@   3 lidessen  staff      96 Feb 14 04:32 apps
-rw-r--r--@   1 lidessen  staff  126551 Feb 22 18:17 bun.lock
-rw-r--r--@   1 lidessen  staff    1267 Feb 14 04:32 commitlint.config.js
drwxr-xr-x@   7 lidessen  staff     224 Feb 14 04:32 docs
drwxr-xr-x@ 339 lidessen  staff   10848 Feb 21 22:00 node_modules
-rw-r--r--@   1 lidessen  staff     650 Feb 14 04:32 oxlint.json
-rw-r--r--@   1 lidessen  staff    1501 Feb 14 04:32 package.json
drwxr-xr-x@  14 lidessen  staff     448 Feb 14 04:32 packages
drwxr-xr-x@   4 lidessen  staff     128 Feb 14 04:32 tasks
-rw-r--r--@   1 lidessen  staff    1080 Feb 14 04:32 tsconfig.json
-rw-r--r--@   1 lidessen  staff     126 Feb 14 04:32 vitest.config.ts
-rw-r--r--@   1 lidessen  staff     390 Feb 14 04:32 vitest.unit.config.ts
```

---

## Diagnostic Process

### Phase 1: Quick Scan (@deepseek)

Scan the project for:

- Directory structure anomalies
- Missing files/configurations
- Obvious anti-patterns
- Dependency issues
- Naming convention violations

**Output**: Brief scan report in `#phase1`

---

### Phase 2: Deep Analysis (@cursor)

Analyze code for:

- Edge cases and error handling gaps
- Type safety issues
- Performance concerns
- Testing coverage
- API design quality

**Output**: Detailed analysis in `#phase2`

---

### Phase 3: Architecture Review (@minimax-claude)

Evaluate:

- Design coherence with project goals
- Trade-offs made
- Long-term maintainability
- Technical debt assessment
- Missing considerations

**Output**: Architectural assessment in `#phase3`

---

### Phase 4: Synthesis (@deepseek)

Synthesize findings into:

- Prioritized issue list
- Actionable recommendations
- Risk assessment
- Overall project health score

**Output**: Final diagnostic report in `#summary`

---

## Instructions

**@deepseek**: Start with a broad quick scan. What's the overall project structure? Any obvious issues?

**@cursor**: After quick scan, dive deep into code quality. What problems can you find?

**@minimax-claude**: Provide architectural context. Is the project heading in the right direction?

**@deepseek**: Synthesize all findings into a diagnostic report. What's the verdict?

Reply in the channel. Use `@agentname` to address specific agents.

# Task Workspaces

This directory contains per-feature/per-task working documents.

## Structure

Each task gets its own directory:

```
tasks/
├── signal-system/
│   ├── README.md       # Final design (authoritative)
│   ├── EVOLUTION.md    # Evolution record
│   └── research/       # Research materials (optional)
│
├── context-api/
│   ├── README.md
│   ├── EVOLUTION.md
│   └── adr-provider-pattern.md
│
└── ssr-islands/
    └── ...
```

## Files

| File           | Purpose                                                            | When to Create                      |
| -------------- | ------------------------------------------------------------------ | ----------------------------------- |
| `EVOLUTION.md` | Document the journey (requirement → research → design → learnings) | Always, start immediately           |
| `README.md`    | Final design document (API, architecture, usage)                   | When design is stable               |
| `adr-*.md`     | Task-specific architecture decisions                               | When significant decisions are made |
| `research/`    | Detailed research materials worth preserving                       | Optional, for valuable analysis     |

## Workflow

1. **Start**: Create `tasks/feature-name/` and begin `EVOLUTION.md`
2. **Work**: Update `EVOLUTION.md` as you research and design
3. **Stabilize**: Write `README.md` when design is finalized
4. **Complete**: Add Learnings section to `EVOLUTION.md`

## Naming Convention

Use kebab-case for directory names:

- `signal-system` (not `signalSystem` or `signal_system`)
- `context-api`
- `ssr-islands`

## See Also

- [WORKFLOW.md](../WORKFLOW.md) - Development workflow stages
- [DOCUMENTING.md](../DOCUMENTING.md) - Documentation system design

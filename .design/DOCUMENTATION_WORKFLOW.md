# Documentation Workflow & Decision Trees

Visual guides for navigating the SemaJSX documentation system.

---

## 🌳 Decision Tree: Where Should This Go?

```mermaid
flowchart TD
    Start([I need to document something]) --> Q1{What am I doing?}

    Q1 -->|Making a decision| Decision[Is it significant?]
    Q1 -->|Designing a feature| Feature[Feature Design]
    Q1 -->|Working on a task| Task[Task Document]
    Q1 -->|Quick notes| Temp[Temporary Notes]
    Q1 -->|Discussing options| Discuss[Discussion]
    Q1 -->|Researching| Research[Research Notes]

    Decision -->|Yes, affects architecture| ADR[".design/decisions/<br/>NNNN-title.md<br/>(ADR)"]
    Decision -->|No, minor| Skip[Document in code<br/>or PR description]

    Feature --> FeatureLoc[".design/features/<br/>feature-name.md"]

    Task --> TaskQ{Is it active?}
    TaskQ -->|Yes| ActiveTask[".tasks/active/<br/>task-name.md"]
    TaskQ -->|No, planning| Backlog[".tasks/backlog/<br/>task-name.md"]
    TaskQ -->|Done| Completed[".tasks/completed/<br/>task-name.md"]

    Temp --> TempQ{Will I share it?}
    TempQ -->|No, personal| TempDir[".temp/scratch/<br/>(gitignored)"]
    TempQ -->|Yes, later| TempFirst[".temp/ first<br/>then move to proper location"]

    Discuss --> DiscussLoc[".design/discussions/<br/>YYYY-MM-topic.md"]

    Research --> ResearchQ{Is it personal?}
    ResearchQ -->|Yes| TempInv[".temp/investigations/"]
    ResearchQ -->|No, shareable| ResearchLoc[".design/research/<br/>topic.md"]

    style ADR fill:#e1f5e1
    style FeatureLoc fill:#e1f5e1
    style ActiveTask fill:#fff3cd
    style TempDir fill:#f8d7da
    style DiscussLoc fill:#d1ecf1
```

---

## 📊 Document Lifecycle Flow

```mermaid
flowchart LR
    Idea[💡 Idea] --> Temp[📝 .temp/<br/>Personal Notes]
    Temp --> Share{Share?}
    Share -->|No| Delete[🗑️ Delete<br/>when done]
    Share -->|Yes| Discuss

    Discuss[💬 Discussion<br/>.design/discussions/] --> Decide{Decision<br/>made?}
    Decide -->|Yes| ADR[📋 ADR<br/>.design/decisions/]
    Decide -->|No consensus| Archive1[🗄️ Archive]

    ADR --> Design[🏗️ Feature Design<br/>.design/features/]
    Design --> Task[📌 Task<br/>.tasks/active/]

    Task --> Impl[⚙️ Implementation]
    Impl --> Done{Complete?}
    Done -->|Yes| Archive2[✅ .tasks/completed/]
    Done -->|No| Task

    Archive2 --> Docs[📖 Update<br/>public docs]

    style Temp fill:#f8d7da
    style Discuss fill:#d1ecf1
    style ADR fill:#e1f5e1
    style Design fill:#e1f5e1
    style Task fill:#fff3cd
    style Archive2 fill:#d6d8db
```

---

## 🎭 Role-Based Navigation

### For Developers

```mermaid
flowchart TD
    Dev[👨‍💻 Developer] --> Action{What to do?}

    Action -->|Start work| CheckTask[Check .tasks/active/]
    Action -->|Found bug| BugFlow[1. Notes in .temp/<br/>2. Create task if non-trivial<br/>3. Fix and document]
    Action -->|Need decision| AskTeam[Discuss in<br/>.design/discussions/]
    Action -->|Quick question| CheckDocs[Read .design/<br/>or DOC_GUIDE.md]

    CheckTask --> WorkTask[Work on task]
    WorkTask --> UpdateTask[Update progress in task doc]
    UpdateTask --> Complete[Complete & move to<br/>.tasks/completed/]

    style Dev fill:#d1ecf1
    style CheckTask fill:#fff3cd
    style Complete fill:#e1f5e1
```

### For Contributors (New)

```mermaid
flowchart LR
    New[🆕 New Contributor] --> Read1[1. Read<br/>ARCHITECTURE_SUMMARY]
    Read1 --> Read2[2. Check<br/>.design/decisions/]
    Read2 --> Read3[3. Review<br/>.tasks/active/]
    Read3 --> Pick[4. Pick a task<br/>or ask for assignment]

    style New fill:#d1ecf1
    style Pick fill:#e1f5e1
```

### For Core Team

```mermaid
flowchart TD
    Core[⭐ Core Team] --> Type{What to create?}

    Type -->|Major decision| ADRFlow[1. Discuss<br/>2. Write ADR<br/>3. Implement]
    Type -->|New feature| FeatureFlow[1. Design doc<br/>2. Create task<br/>3. Implement]
    Type -->|Planning| TaskFlow[1. Create tasks<br/>2. Prioritize<br/>3. Assign]

    ADRFlow --> ADRLoc[".design/decisions/"]
    FeatureFlow --> FeatureLoc[".design/features/"]
    TaskFlow --> TaskLoc[".tasks/active/"]

    style Core fill:#d1ecf1
    style ADRLoc fill:#e1f5e1
    style FeatureLoc fill:#e1f5e1
    style TaskLoc fill:#fff3cd
```

---

## 🔄 Task Status Transitions

```mermaid
stateDiagram-v2
    [*] --> Backlog: Task created
    Backlog --> Active: Start work
    Active --> Review: Submit PR
    Review --> Active: Changes requested
    Review --> Completed: Approved & merged
    Active --> Blocked: Dependency issue
    Blocked --> Active: Issue resolved
    Completed --> [*]: Archive to .tasks/completed/

    note right of Backlog
        .tasks/backlog/
    end note

    note right of Active
        .tasks/active/
        Status: In Progress
    end note

    note right of Review
        .tasks/active/
        Status: Review
    end note

    note right of Completed
        .tasks/completed/
        With summary
    end note
```

---

## 📁 Directory Structure Decision

```mermaid
flowchart TD
    Root[Where to put this?] --> Permanent{Permanent?}

    Permanent -->|Yes| Type1{What type?}
    Permanent -->|No| Type2{Temporary or Transitional?}

    Type1 -->|Decision| ADRDir[".design/decisions/"]
    Type1 -->|Architecture| ArchDir[".design/architecture/"]
    Type1 -->|Feature design| FeatureDir[".design/features/"]
    Type1 -->|Research| ResearchDir[".design/research/"]
    Type1 -->|Public docs| PublicDir["docs/ or packages/*/"]

    Type2 -->|Temporary| TempDir[".temp/<br/>(gitignored)"]
    Type2 -->|Transitional| Type3{What kind?}

    Type3 -->|Task| TaskDir[".tasks/active/"]
    Type3 -->|Discussion| DiscussDir[".design/discussions/"]

    style ADRDir fill:#e1f5e1
    style TempDir fill:#f8d7da
    style TaskDir fill:#fff3cd
    style DiscussDir fill:#d1ecf1
```

---

## 🎯 Quick Reference Matrix

| Scenario                                    | Location                                  | Lifespan       | Template                                                                     |
| ------------------------------------------- | ----------------------------------------- | -------------- | ---------------------------------------------------------------------------- |
| 💡 **Significant architectural decision**   | `.design/decisions/`                      | Permanent      | [ADR Template](../DOCUMENTATION_PLAN.md#1-architectural-decision-record-adr) |
| 🏗️ **Feature design before implementation** | `.design/features/`                       | Permanent      | [Feature Template](../DOCUMENTATION_PLAN.md#2-feature-design-document)       |
| 📋 **Active work tracking**                 | `.tasks/active/`                          | Until done     | [Task Template](../../.tasks/templates/feature-task.md)                      |
| 💬 **Design discussion/proposal**           | `.design/discussions/`                    | Until resolved | [Discussion Template](../DOCUMENTATION_PLAN.md#4-discussion-document)        |
| 🔍 **Research findings (shareable)**        | `.design/research/`                       | Reference      | Markdown                                                                     |
| 📝 **Personal notes/investigation**         | `.temp/investigations/`                   | Hours/days     | Freeform                                                                     |
| ✏️ **Quick scratch work**                   | `.temp/scratch/`                          | Hours          | Freeform                                                                     |
| 🗄️ **Completed work**                       | `.tasks/completed/` or `.design/archive/` | Historical     | N/A                                                                          |

---

## 🚦 Priority Guide for Documentation

```mermaid
flowchart TD
    Start[Something to document] --> Impact{Impact level?}

    Impact -->|Critical| P0[P0: Document NOW<br/>- Breaking changes<br/>- Security decisions<br/>- API changes]
    Impact -->|High| P1[P1: Document soon<br/>- New features<br/>- Architecture changes<br/>- Major refactors]
    Impact -->|Medium| P2[P2: Document when done<br/>- Bug fixes<br/>- Minor features<br/>- Improvements]
    Impact -->|Low| P3[P3: Optional<br/>- Code comments<br/>- PR description]

    P0 --> ADR1[Write ADR]
    P1 --> Design1[Write design doc]
    P2 --> Task1[Update task doc]
    P3 --> Code1[Document in code/PR]

    style P0 fill:#dc3545,color:#fff
    style P1 fill:#ffc107
    style P2 fill:#17a2b8,color:#fff
    style P3 fill:#d6d8db
```

---

## 💡 Tips for Navigation

### 1. Start with DOC_GUIDE.md

- One-page overview
- Decision tree
- Quick commands

### 2. Use Directory READMEs

- Each directory has its own guide
- Specific instructions for that area
- Templates and examples

### 3. Follow the Flow

- Idea → .temp/ → Discussion → ADR → Design → Task → Done
- Not all steps required
- Skip if not needed

### 4. When in Doubt

- Start in `.temp/` (personal, gitignored)
- Graduate to proper location when ready
- Ask in discussions if unsure

---

**See Also**:

- [DOC_GUIDE.md](../../DOC_GUIDE.md) - Quick reference
- [DOCUMENTATION_PLAN.md](../DOCUMENTATION_PLAN.md) - Full strategy
- [ARCHITECTURE_SUMMARY.md](../ARCHITECTURE_SUMMARY.md) - System overview

**Last Updated**: 2026-01-08

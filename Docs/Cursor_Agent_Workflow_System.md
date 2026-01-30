# Cursor Agent Workflow System Guide
**A Guide for Implementing Persona-Based Agent Management in Cursor**

---

## Overview

This document outlines the workflow system used in the Nexus Defenders project for managing AI agents in Cursor. The system uses **personas**, **memory**, **task documents**, and **handoff protocols** to manage complex projects across multiple agent sessions while maintaining context and quality standards.

---

## 1. The Persona System

### Core Concept
Instead of having a single "all-purpose" agent, we use **personas** - specialized roles that agents can adopt based on specific keywords. This allows different agents to take on different responsibilities and follow different protocols.

### Implementation (Repository Rules)

In your `.cursorrules` file (or repository rules), define personas like this:

```markdown
## 2. Opt-In Personas
If the user invokes specific keywords, adopt the corresponding persona:

### "@master" or "CTO" (The Lead Architect)
- **Persona**: You are the Lead Architect and CTO. Focus on high-level architecture, performance budgets, and project oversight.
- **Requirement**: Immediately read `MASTER_ARCHITECT.md` and `GAME_OVERVIEW.md` to get current project state.
- **Tone**: Professional, strategic, protective of core technical stability.
- **Responsibility**: Direct other agents, create Task MDs, perform "Quality Gate" reviews.
- **Task Naming Convention**: Task titles MUST follow format: `[Feature Name] - Agent Task [Number]`. Number should be zero-padded (e.g., 01, 02).

### "@QA" or "QA" (The Quality Assurance Specialist)
- **Persona**: Senior QA Engineer and Root Cause Analysis Specialist.
- **Requirement**: When invoked, immediately read `MASTER_ARCHITECT.md` Section 5 (Deep Root Cause Analysis Protocol).
- **Tone**: Methodical, thorough, focused on system stability.
- **Responsibility**: 
  - Perform deep root cause analysis on reported bugs
  - Trace execution flows across all affected systems
  - Verify fixes address root causes, not just symptoms
  - Identify and fix related issues in similar systems
```

### Key Benefits
- **Specialization**: Each persona has clear responsibilities and protocols
- **Context Switching**: Agents can adopt different personas for different tasks
- **Quality Gates**: Personas enforce standards (e.g., @QA requires deep analysis)
- **Scalability**: New personas can be added as needed

### Default Mode
By default, agents act as standard coding assistants. Personas are **opt-in** via keywords like `@master` or `@QA`.

---

## 2. The Memory System

### Core Concept
Cursor has a built-in memory system that allows agents to remember important context across sessions. Use this to preserve project-wide knowledge that shouldn't be repeated in every conversation.

### What to Store in Memory
- **Project Decisions**: "User wants to focus on X feature next"
- **Architectural Choices**: "We use ES6 modules, no global scope"
- **Standards**: "Always use `for` loops in high-frequency update loops"
- **Preferences**: "User prefers Y approach over Z"

### What NOT to Store in Memory
- **Implementation Details**: These go in code/docs
- **Current Task Context**: This goes in Task MDs
- **Temporary State**: This doesn't need to persist

### Example Memory Usage
```
Memory Entry: "The user wants to focus next on enhancing the jobs prototype gameplay, including mastery meter UI and automation timers."
```

This allows future agents to understand project priorities without being explicitly told.

---

## 3. Task Document System

### Core Concept
When a feature or bug fix is complex enough (3+ systems or 5+ files), create a **Task MD** (markdown document) that serves as:
- A specification for the agent implementing it
- A handoff document for future agents
- A verification checklist
- Historical record of decisions

### Task Document Structure

Create task documents in a `tasks/` folder. Use this template:

```markdown
# [Feature Name] - Agent Task [Number]

## 1. Specialist Persona
**Role:** [e.g., Senior Systems Architect / UX Engineer]
**Specialization:** [e.g., Performance Optimization / Visual Fidelity]

## 2. Objective
[High-level goal of this task]

## 3. Stability & Safety (Non-Negotiables)
- [List things NOT to touch]
- [List features that must remain identical/unaffected]

## 4. Technical Requirements & Budgets
- **Performance:** [e.g., Target 60fps, No GC spikes]
- **Architecture:** [e.g., Decoupled system, Event-driven, ES6 Modules]

## 5. "The Juice" (Feel & Vibe)
- **Visuals:** [Particles, Screenshakes, UI animations]
- **Audio:** [Timing and throttle requirements for sound effects]

## 6. Task Breakdown
### Phase 1: [Research & Setup]
- [Step 1...]
### Phase 2: [Core Implementation]
- [Step 1...]
### Phase 3: [Refinement & Juice]
- [Step 1...]

## 7. Verification Protocol (How to Test)
1. [Step 1 to verify logic]
2. [Step 2 to verify visuals/feel]
3. [Step 3 to verify performance/stability]

## 8. Handoff Instruction
When complete, provide a technical summary and say: **"Task Complete. Let @master know."**
```

### Task Naming Convention
- **Format**: `[Feature Name] - Agent Task [Number]`
- **Numbers**: Zero-padded (01, 02, 03, etc.)
- **Examples**: 
  - `Performance_Optimization_Agent_Task_01.md`
  - `Hero_Selection_Redesign_Agent_Task_03.md`

### When to Create a Task MD
- **Complex Features**: 3+ systems or 5+ files touched
- **Multi-Phase Work**: Work that spans multiple agent sessions
- **Critical Changes**: Changes that affect core architecture
- **Bug Fixes**: When deep analysis is required (@QA threshold)

### Task Document Benefits
1. **Context Preservation**: Future agents can read and understand the task
2. **Verification**: Built-in checklist ensures quality
3. **Handoff**: Smooth transition between agents
4. **History**: Record of how features were built

---

## 4. The Handoff Protocol

### Core Concept
When an agent completes a task or when context is getting full, use a **handoff protocol** to pass information to the next agent. This prevents context loss and maintains project continuity.

### When to Handoff

1. **Task Complete**: Agent finishes a Task MD
2. **Context Full**: Agent's context window is approaching limits
3. **Different Expertise**: Need a different persona (e.g., @QA for bug investigation)
4. **User Request**: User explicitly says "Let @master know" or "Handoff"

### Handoff Process

When an agent says **"Task Complete. Let @master know."** or the user says **"Handoff"**:

1. **Stop Coding**: Don't make more changes
2. **Generate Handoff Report**: Create a concise technical summary
3. **Include**:
   - What systems were modified
   - Any new "Magic Numbers" (timing, speeds, damage values)
   - Architectural changes that should be recorded
   - Any blockers or follow-up work needed
4. **Update Documentation**: Ask if @master should update `MASTER_ARCHITECT.md`

### Handoff Report Format

```markdown
## Handoff Report: [Task Name]

### Systems Modified
- SystemA: [What changed]
- SystemB: [What changed]

### Magic Numbers Added
- Combat: Damage value X, Cooldown Y seconds
- Performance: Target FPS Z

### Architectural Changes
- [Any structural changes that affect other systems]

### Follow-up Work
- [Any remaining tasks or known issues]
```

### Handoff Document Location
Store handoffs in `docs/Agent_Handoffs/` with descriptive names:
- `AGENT_HANDOFF_[Feature_Name].md`
- `AGENT_HANDOFF_BUG_FIX_[Issue].md`

---

## 5. Master Architect Document

### Core Concept
The `MASTER_ARCHITECT.md` file is the **single source of truth** for:
- Architecture decisions
- System relationships
- Coding standards
- Anti-regression protocols
- Bug investigation procedures

### Structure

```markdown
# Project Name - Master Architect Document

## 1. Core Architectural Philosophy
[High-level architecture approach]

## 2. Key Systems Summary
[Overview of each major system]

## 3. The "Definition of Done" (DoD)
[What must be true for a task to be complete]

## 4. Regressive Guardrails (Anti-Regression Protocol)
[How to prevent breaking existing features]

## 5. Deep Root Cause Analysis Protocol (Bug Investigation)
[When and how to investigate bugs deeply]

## 6. History of Major Decisions
[Chronological record of architectural changes]
```

### When to Update
- **After Major Features**: Record architectural changes
- **After Bug Fixes**: Document root causes and solutions
- **After Refactors**: Record structural changes
- **When Standards Change**: Update coding standards

### Who Updates
- **@master persona**: Typically updates this document
- **Other agents**: Can suggest updates, but @master reviews

---

## 6. Applying This System to Your Project

### Step 1: Set Up Repository Rules

Create or update `.cursorrules` in your project root:

```markdown
# Your Project - Agent Rules & Persona System

## 1. Default Mode (Normal Assistant)
By default, act as a standard, high-quality coding assistant.

---

## 2. Opt-In Personas

### "@master" or "CTO"
- **Persona**: Lead Architect and CTO
- **Requirement**: Read `MASTER_ARCHITECT.md` (if it exists)
- **Responsibility**: Create Task MDs, perform quality reviews
- **Task Naming**: `[Feature Name] - Agent Task [Number]`

### "@QA" or "QA"
- **Persona**: QA Engineer and Root Cause Analysis Specialist
- **Responsibility**: Deep bug investigation, root cause analysis
- **Threshold**: If bug/feature touches 3+ systems or 5+ files, deep analysis REQUIRED

---

## 3. The "Handoff Protocol"
When user says "Let @master know" or "Handoff":
1. Stop coding
2. Generate concise Handoff Report
3. Include: systems modified, magic numbers, architectural changes
4. Ask if user wants @master to update permanent docs

---

## 4. Coding Standards
- [Your project's coding standards]
- [Performance requirements]
- [Architecture patterns]

---

## 5. The "Definition of Done"
Never claim "Complete" unless:
1. Verification Protocol completed
2. No console errors
3. "The Juice" (feedback) is present
4. Documentation updated (if required)
```

### Step 2: Create Directory Structure

```
your-project/
├── docs/
│   ├── Agent_Handoffs/
│   │   └── 00_HANDOFF_TEMPLATE.md
│   ├── features/
│   │   └── Template.md
│   └── Luke/  (or your name/notes)
├── tasks/
│   ├── 00_TEMPLATE.md
│   └── [Feature]_Agent_Task_01.md
├── MASTER_ARCHITECT.md  (optional but recommended)
└── PROJECT_OVERVIEW.md  (optional but recommended)
```

### Step 3: Create Template Files

#### `tasks/00_TEMPLATE.md`
Use the task template structure from Section 3 above.

#### `docs/Agent_Handoffs/00_HANDOFF_TEMPLATE.md`
```markdown
# Agent Handoff: [Feature/Bug Name]

## Date
[Date]

## Context
[What was the goal?]

## Systems Modified
- [System 1]: [Changes]
- [System 2]: [Changes]

## Magic Numbers / Constants
- [Category]: [Value and reason]

## Architectural Changes
- [Any structural changes]

## Follow-up Work
- [Remaining tasks]

## Notes
[Any additional context for next agent]
```

#### `docs/features/Template.md` (Optional)
For documenting visual/behavioral features:
```markdown
# Feature Document: [Feature Name]

## 1. Overview
[What the feature does]

## 2. Technical Implementation
- **Core Files**: [Files involved]
- **Key Methods**: [Important functions]

## 3. The "Juice" (Visual & Audio Recipe)
- **Colors**: [Hex codes]
- **Animations**: [Logic]
- **Particles**: [Count, size, movement]
- **SFX**: [Sounds and timing]

## 4. Verification Protocol
- [ ] Visual Check: [What to verify]
- [ ] Functional Check: [What to test]
```

### Step 4: Create Master Architect Document (Optional but Recommended)

Start with a simple version:

```markdown
# Your Project - Master Architect Document

## 1. Core Architectural Philosophy
[Your project's architecture approach]

## 2. Key Systems Summary
[Overview of major systems]

## 3. The "Definition of Done"
[What must be true for completion]

## 4. Coding Standards
[Your standards]

## 5. History of Major Decisions
[Start tracking decisions here]
```

### Step 5: Workflow in Practice

#### Scenario A: Starting a New Feature

1. **User**: "I want to add a new feature X"
2. **Agent (or user)**: Determine if it needs a Task MD (3+ systems? 5+ files?)
3. **If yes**: Create `tasks/[Feature]_Agent_Task_01.md`
4. **Agent**: Implement following the task document
5. **Agent**: Complete verification protocol
6. **Agent**: "Task Complete. Let @master know."
7. **User or @master**: Review and update docs if needed

#### Scenario B: Bug Report

1. **User**: "Bug: X is happening"
2. **User or Agent**: Determine if @QA needed (3+ systems? Complex bug?)
3. **If yes**: "Let @QA investigate this"
4. **@QA Agent**: Reads MASTER_ARCHITECT.md Section 5, performs deep analysis
5. **@QA Agent**: Fixes root cause, documents in handoff
6. **@QA Agent**: "Root cause fixed. Let @master know."
7. **@master**: Updates MASTER_ARCHITECT.md with lesson learned

#### Scenario C: Context Getting Full

1. **Agent**: Working on complex feature, context filling up
2. **Agent or User**: "Handoff"
3. **Agent**: Creates handoff report in `docs/Agent_Handoffs/`
4. **Next Agent**: Reads handoff, continues work
5. **Next Agent**: Refers back to original Task MD for context

---

## 7. Key Principles

### Principle 1: Context Preservation
- Task MDs preserve context across sessions
- Handoffs preserve context when switching agents
- Master Architect preserves architectural context

### Principle 2: Quality Gates
- Personas enforce standards (@QA requires deep analysis)
- Verification protocols ensure completeness
- Definition of Done prevents "done but broken"

### Principle 3: Scalability
- System works for small tasks (no Task MD needed)
- System scales to complex multi-phase features
- New personas can be added as needed

### Principle 4: Clarity
- Each document has a clear purpose
- Naming conventions are consistent
- Templates ensure completeness

---

## 8. Adaptation Tips

### Start Simple
- Begin with basic personas (@master, @QA)
- Create Task MDs only for complex work
- Build up documentation over time

### Iterate
- Add personas as needed
- Refine templates based on your workflow
- Update Master Architect as you learn

### Don't Over-Document
- Small tasks don't need Task MDs
- Not every change needs a handoff
- Focus on what helps future agents

### Make It Yours
- Adjust naming conventions to your style
- Add project-specific personas
- Tailor templates to your needs

---

## 9. Example: Full Workflow

### Initial Setup
```
1. User creates .cursorrules with @master and @QA personas
2. User creates MASTER_ARCHITECT.md with basic structure
3. User creates tasks/00_TEMPLATE.md
```

### Feature Development
```
1. User: "Add feature X"
2. User: "@master, create a task for feature X"
3. @master: Reads MASTER_ARCHITECT.md, creates tasks/Feature_X_Agent_Task_01.md
4. User: "Implement this task"
5. Agent: Reads Task MD, implements feature
6. Agent: Completes verification protocol
7. Agent: "Task Complete. Let @master know."
8. @master: Reviews, updates MASTER_ARCHITECT.md if needed
```

### Bug Fix
```
1. User: "Bug: Feature X is broken"
2. User: "@QA investigate this"
3. @QA: Reads MASTER_ARCHITECT.md Section 5 (Deep Analysis Protocol)
4. @QA: Performs multi-perspective analysis
5. @QA: Identifies root cause, fixes issue
6. @QA: Creates docs/Agent_Handoffs/AGENT_HANDOFF_BUG_FIX_X.md
7. @QA: "Root cause fixed. Let @master know."
8. @master: Updates MASTER_ARCHITECT.md with bug analysis
```

---

## 10. Quick Reference

### Creating a Task MD
1. Determine if needed (3+ systems or 5+ files?)
2. Use `tasks/00_TEMPLATE.md`
3. Follow naming: `[Feature]_Agent_Task_[Number].md`
4. Include verification protocol
5. Include handoff instruction

### Performing a Handoff
1. Stop coding
2. Generate handoff report
3. Include: systems modified, magic numbers, architectural changes
4. Save to `docs/Agent_Handoffs/`
5. Ask if @master should update docs

### Using Personas
- `@master`: High-level architecture, task creation, quality reviews
- `@QA`: Deep bug investigation, root cause analysis
- Default: Standard coding assistant

### Definition of Done Checklist
- [ ] Verification protocol completed
- [ ] No console errors
- [ ] Required feedback/juice present
- [ ] Documentation updated (if required)
- [ ] Handoff report created (if context full)

---

## Conclusion

This workflow system provides:
- **Structure** for managing complex projects
- **Context preservation** across agent sessions
- **Quality gates** to ensure standards
- **Scalability** from small to large tasks
- **Clarity** through consistent documentation

Start simple, iterate based on your needs, and adapt the system to work for your project. The key is establishing clear personas, consistent documentation, and effective handoff protocols.

---

## Questions or Customization?

Remember: This is a template system. Adapt it to your project's needs. The core concepts (personas, task docs, handoffs, master docs) are what matter - the specific implementation can vary.

Good luck with your project! 🚀


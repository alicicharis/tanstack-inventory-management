---
description: 'Break a PRD phase into agent-sized tasks with dependency ordering'
argument-hint: <phase-name-or-number>
---

# Plan Phase: Break a PRD Phase into Agent-Sized Tasks

## Phase: $ARGUMENTS

## Mission

Transform a PRD implementation phase into a **sequenced list of agent-sized tasks**, each suitable for a single `/plan-feature` + `/execute` pass. This command does NOT plan implementation details — it produces the task breakdown that feeds into `/plan-feature`.

**Core Principle**: A phase is too big for one agent. A task is the right size. This command finds the seam lines.

## Inputs

Before starting, locate and read:

1. **The PRD** — Check `.claude/PRD.md`, or ask the user for the path
2. **The target phase** — Identify the phase section matching `$ARGUMENTS`
3. **CLAUDE.md** — Project conventions and structure
4. **Current codebase state** — What already exists from prior phases

## Process

### Step 1: Extract Phase Scope

From the PRD phase section, list every concrete deliverable:

- Files to create or modify
- Server functions, components, pages, schemas, tests
- Business logic and workflows

Group them into **functional units** — things that work together to produce one testable outcome.

### Step 2: Classify Each Unit

For each functional unit, assess:

- **Pattern type**: Is this repetitive/boilerplate (CRUD, validators) or unique logic (transactions, state machines, aggregations)?
- **Complexity**: Low (follow existing pattern), Medium (new pattern, straightforward), High (subtle logic, edge cases, race conditions)
- **Estimated new lines of code**: Rough order of magnitude

### Step 3: Apply Splitting Rules

Use these rules to decide what becomes a single task vs. gets split further:

**Rule 1: One task = one testable outcome.**
If you can't describe "done" in one sentence, split it.

**Rule 2: Split at I/O boundaries.**
Don't mix layers — validators, server functions, and UI pages are separate tasks unless trivially small.

**Rule 3: Group by complexity, not by entity.**
4 simple CRUD server functions = 1 task. 1 complex transactional workflow = 1 task. Don't group simple + complex together.

**Rule 4: Template + replicate for repetitive work.**
If 4+ files follow the same pattern, the first one is its own task (establishes the pattern). The rest are a second task ("replicate pattern for X, Y, Z").

**Rule 5: ~300 lines of new code per task.**
Not a hard limit, but a smell test. If a task would produce significantly more, consider splitting.

**Rule 6: Hard-to-review logic gets its own task.**
Transactional logic, state machines, race-condition-prone code — isolate these so the review is focused.

### Step 4: Map Dependencies

For each task, determine:

- **Depends on**: Which other tasks must complete first
- **Blocks**: Which tasks cannot start until this one is done
- **Parallel group**: Tasks with no dependencies on each other that can run concurrently

Build a dependency graph and assign a linear execution order that respects it.

### Step 5: Validate the Breakdown

Check each task against:

- [ ] Can be described in one sentence
- [ ] Has a clear, testable "done" state
- [ ] Stays within one layer (validators, server, UI) or has a strong reason to cross
- [ ] Does not exceed ~300 lines of new code
- [ ] Complex logic is isolated, not bundled with boilerplate
- [ ] Another agent could execute it with only the `/plan-feature` output

Check the overall breakdown against:

- [ ] All PRD deliverables for this phase are covered
- [ ] No circular dependencies
- [ ] Parallel opportunities are identified
- [ ] The dependency order is correct — no task references something that hasn't been built yet

## Output Format

Write the phase plan to: `.claude/plans/phase-{phase-number}-breakdown.md`

Create `.claude/plans/` if it doesn't exist.

Use this structure:

```markdown
# Phase {N} Breakdown: {Phase Title}

## Source

- **PRD**: {path to PRD file}
- **Phase**: {phase number and title from PRD}
- **Phase Goal**: {goal statement from PRD}

## Prerequisites

{What must already exist before this phase begins — prior phase outputs, dependencies, etc.}

## Task Dependency Graph

{ASCII or text representation showing which tasks depend on which}
```

Task 1 (validators)
|
v
Task 2 (simple CRUD) ----+
| |
v v
Task 3 (core logic) Task 4 (independent feature)
|
v
Task 5 (workflows depending on core logic)

```

## Parallel Groups

- **Group A** (can run in parallel): Task X, Task Y
- **Group B** (after Group A): Task Z

---

## Task 1: {Short descriptive title}

**Done when**: {One sentence describing the testable outcome}
**Complexity**: Low / Medium / High
**Pattern**: Repetitive / Unique / Template-first
**Estimated scope**: ~{N} lines across {N} files
**Depends on**: {Task numbers or "none"}
**Layer**: Validators / Server / UI / Mixed (with justification)

**Deliverables:**

- {Specific file or function 1}
- {Specific file or function 2}

**Plan command**: `/plan-feature {concise feature description for this task}`

**Validation**: {How to verify this task is complete — command to run, behavior to check}

---

## Task 2: {title}

{Same structure as Task 1}

---

{Continue for all tasks...}

---

## Summary

| # | Task | Complexity | Depends On | Layer | Est. Lines |
|---|------|-----------|------------|-------|------------|
| 1 | ...  | ...       | ...        | ...   | ...        |

**Total tasks**: {N}
**Critical path**: Task 1 -> Task 3 -> Task 5 (longest dependency chain)
**Parallel opportunities**: {describe}
**Estimated confidence for one-pass execution**: {N}/10 per task (with `/plan-feature` planning each)
```

## Quality Criteria

### Task Sizing

- [ ] No task exceeds ~300 lines of new code
- [ ] No task mixes simple CRUD with complex logic
- [ ] Repetitive work uses template-first pattern
- [ ] Hard-to-review logic is isolated

### Dependency Correctness

- [ ] No circular dependencies
- [ ] Linear order respects all dependency edges
- [ ] Parallel groups have zero inter-dependencies

### Coverage

- [ ] Every PRD deliverable for this phase maps to at least one task
- [ ] No deliverable is split across tasks without clear justification
- [ ] Validation step exists for every task

### Actionability

- [ ] Each task has a `/plan-feature` command ready to run
- [ ] "Done when" statements are specific and testable
- [ ] Layer boundaries are respected

## Output Confirmation

After creating the breakdown:

1. Confirm the file path where it was written
2. List the tasks in execution order with their one-line "done when" descriptions
3. Highlight the critical path (longest dependency chain)
4. Flag any tasks rated High complexity — these are the riskiest
5. Suggest which tasks to start with

## Notes

- This command produces a breakdown, not implementation plans. Run `/plan-feature` for each task before executing.
- If the phase scope is ambiguous in the PRD, ask the user to clarify before proceeding.
- If a phase has fewer than 3 deliverables and low complexity, it may not need splitting — say so and suggest running `/plan-feature` directly on the whole phase.
- Re-read the codebase to understand what already exists. Don't create tasks for work that's already done.

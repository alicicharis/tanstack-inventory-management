---
description: 'Break a single PRD phase into execution-ready agent tasks'
argument-hint: <phase-name-or-number>
---

# Plan Phase: Break a Single PRD Phase into Execution-Ready Tasks

## Phase: $ARGUMENTS

## Mission

Transform **one specific PRD phase** into a sequenced list of **execution-ready tasks**, each suitable for a single `/execute` pass. Each task contains all the context an agent needs to implement it — files to read, patterns to follow, step-by-step instructions, and validation commands.

**Core Principle**: A phase is too big for one agent. A task is the right size. This command finds the seam lines AND fills in the implementation details so tasks go straight to execution.

**Scope Rule**: Plan ONLY the phase matching `$ARGUMENTS`. Do not plan other phases. If the phase identifier is ambiguous, ask the user to clarify before proceeding.

## Inputs

Before starting, locate and read:

1. **The PRD** — Check `.claude/PRD.md`, or ask the user for the path
2. **The target phase** — Identify the **single** phase section matching `$ARGUMENTS`. Ignore all other phases.
3. **CLAUDE.md** — Project conventions and structure
4. **Current codebase state** — What already exists from prior phases. Use this to understand available patterns, existing files, and what can be referenced.

## Process

### Step 1: Codebase Intelligence (done once, shared across all tasks)

Analyze the current codebase to build shared context that every task will reference:

**Pattern Recognition:**

- Search for similar implementations already in the codebase
- Identify coding conventions (naming, file organization, error handling)
- Find reusable patterns — existing CRUD server functions, component structures, validator shapes
- Note the specific files that establish these patterns (with line numbers)

**Dependency & Integration Analysis:**

- Catalog external libraries relevant to this phase
- Map integration points — routers, registrations, config files that need updates
- Identify existing types, utils, and models that tasks should import from

**Testing Patterns:**

- Identify test framework, structure, and existing examples
- Note validation commands that work (`npm run build`, `npm run lint`, `npm test`, etc.)

Record this as a **Shared Context** section in the output — tasks will reference it instead of repeating it.

### Step 2: Extract Phase Scope

From the PRD phase section, list every concrete deliverable:

- Files to create or modify
- Server functions, components, pages, schemas, tests
- Business logic and workflows

Group them into **functional units** — things that work together to produce one testable outcome.

### Step 3: Classify Each Unit

For each functional unit, assess:

- **Pattern type**: Is this repetitive/boilerplate (CRUD, validators) or unique logic (transactions, state machines, aggregations)?
- **Complexity**: Low (follow existing pattern), Medium (new pattern, straightforward), High (subtle logic, edge cases, race conditions)
- **Estimated new lines of code**: Rough order of magnitude

### Step 4: Apply Splitting Rules

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

### Step 5: Map Dependencies

For each task, determine:

- **Depends on**: Which other tasks must complete first
- **Blocks**: Which tasks cannot start until this one is done
- **Parallel group**: Tasks with no dependencies on each other that can run concurrently

Build a dependency graph and assign a linear execution order that respects it.

### Step 6: Fill In Execution Details Per Task

For each task, using the shared context from Step 1, add:

- **Files to read first** — Specific existing files (with line ranges) the agent must read before implementing. These are the pattern references.
- **Files to create/modify** — Exact file paths for deliverables.
- **Implementation steps** — Ordered list using action keywords (CREATE, UPDATE, ADD, MIRROR). Each step is concrete: what to do, what pattern to follow, what to import from where.
- **Gotchas** — Known pitfalls from codebase analysis (e.g., "use `#/` path alias not `@/`", "wrap stock mutations in `db.transaction()`").
- **Validation commands** — Executable commands to verify the task is complete.
- **Acceptance criteria** — Specific, testable conditions for "done".

### Step 7: Validate the Breakdown

Check each task against:

- [ ] Can be described in one sentence
- [ ] Has a clear, testable "done" state
- [ ] Stays within one layer (validators, server, UI) or has a strong reason to cross
- [ ] Does not exceed ~300 lines of new code
- [ ] Complex logic is isolated, not bundled with boilerplate
- [ ] Contains enough detail for an agent to execute without additional research

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

## Shared Context

### Patterns to Follow

{Extracted from codebase — specific files with line numbers that establish patterns tasks should mirror}

- `path/to/file.ts` (lines X-Y) — {what pattern it demonstrates}
- `path/to/other.ts` (lines X-Y) — {what pattern it demonstrates}

### Naming Conventions

{Project-specific conventions discovered from codebase analysis}

### Key Imports & Utils

{Existing types, utilities, and modules that tasks should reuse}

### Gotchas

{Project-wide pitfalls that apply to multiple tasks — path aliases, transaction requirements, etc.}

### Validation Commands

{Commands that work for this project — build, lint, test, etc.}

## Task Dependency Graph

{ASCII or text representation showing which tasks depend on which}
```
Task 1 (validators)
|
v
Task 2 (simple CRUD) ----+
|                         |
v                         v
Task 3 (core logic)  Task 4 (independent feature)
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

### Files to Read First

- `path/to/pattern.ts` (lines X-Y) — {why: what pattern to extract}

### Files to Create/Modify

- `path/to/new-file.ts` — {purpose}
- `path/to/existing-file.ts` — {what changes}

### Implementation Steps

1. **CREATE** `path/to/file.ts`
   - IMPLEMENT: {specific implementation detail}
   - MIRROR: pattern from `path/to/reference.ts:lines`
   - IMPORTS: {key imports needed}

2. **UPDATE** `path/to/existing.ts`
   - ADD: {what to add and where}

3. **VALIDATE**: `{executable command}`

### Gotchas

- {Task-specific pitfalls}

### Acceptance Criteria

- [ ] {Specific testable condition}
- [ ] {Specific testable condition}
- [ ] Validation commands pass: `{commands}`

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
**Estimated confidence for one-pass execution**: {N}/10 per task
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

### Execution Readiness

- [ ] Each task has concrete implementation steps (not just descriptions)
- [ ] Pattern references include specific file paths and line numbers
- [ ] Files to create/modify are listed with exact paths
- [ ] "Done when" statements are specific and testable
- [ ] An agent can run `/execute` on any task without needing `/plan-feature` first

## Output Confirmation

After creating the breakdown:

1. Confirm the file path where it was written
2. List the tasks in execution order with their one-line "done when" descriptions
3. Highlight the critical path (longest dependency chain)
4. Flag any tasks rated High complexity — these are the riskiest
5. Suggest which tasks to start with

## Notes

- This command produces execution-ready task plans. Run `/execute` directly on each task — no intermediate planning step needed.
- Only plan the **single phase** specified in `$ARGUMENTS`. If the user wants multiple phases planned, they should run this command once per phase.
- If the phase scope is ambiguous in the PRD, ask the user to clarify before proceeding.
- If a phase has fewer than 3 deliverables and low complexity, it may not need splitting — say so and suggest running `/execute` directly on the whole phase.
- Re-read the codebase to understand what already exists. Don't create tasks for work that's already done.

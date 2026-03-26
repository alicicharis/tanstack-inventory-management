---
description: Capture knowledge from completed work into the project knowledge base
argument-hint: [optional: topic hint]
---

# Capture Knowledge

After completing implementation work, extract and persist valuable knowledge so future conversations have full context.

## 1. Analyze What Was Done

Review the current conversation to identify:

- **Decisions made** — choices between alternatives and *why* one was picked
- **Patterns established** — new conventions, reusable approaches, architectural patterns
- **Gotchas discovered** — things that broke, framework quirks, non-obvious behaviors
- **Conventions that emerged** — coding patterns that should be followed going forward

## 2. Categorize Knowledge by Topic

Group everything you found into **domain topics**, not phases or time periods. Common topics include:

- Stock operations (transfers, adjustments, upserts, movement ledger)
- Order workflows (PO receiving, SO shipping, status transitions)
- Auth and roles (middleware, permissions, session handling)
- Dashboard and aggregations (queries, chart data shapes)
- UI conventions (component patterns, form handling, data tables)
- Schema and data model (table design, constraints, indexes)

If `$ARGUMENTS` is provided, use it as a hint for which topic(s) to focus on. Otherwise, categorize all knowledge from the conversation.

## 3. Write or Update Reference Documents

For each topic with meaningful knowledge, check `.claude/references/` for an **existing file on the same topic**.

- **If a file exists for that topic**: Update it — merge new decisions, patterns, and gotchas into the existing sections. Don't duplicate what's already there.
- **If no file exists**: Create a new one in `.claude/references/` with a descriptive kebab-case name (e.g., `stock-operations.md`, `order-workflows.md`, `ui-conventions.md`).

**IMPORTANT**: Never name files after phases, sprints, or time periods (e.g., ~~`phase-3-notes.md`~~). Name them after the domain topic they cover. A file named `stock-operations.md` will be found and updated naturally as stock logic evolves; a file named `phase-2-backend.md` will be orphaned and duplicated.

**Structure each doc like this:**

```markdown
# [Topic Title]

## Overview
Brief summary of the approach and core design.

## Key Decisions
- **Decision**: What was chosen
  - **Why**: The reasoning
  - **Alternatives considered**: What was rejected and why

## Patterns & Conventions
- Pattern name: how it works, when to use it

## Gotchas & Pitfalls
- What went wrong or was non-obvious, and how to avoid it

## Key Files
- `path/to/file.ts` — what it does and why it matters
```

Only include sections that have meaningful content — skip empty ones.

## 4. Update CLAUDE.md

**Conventions**: Check if any new conventions should be added to `CLAUDE.md`. Only add things that are:
- Applicable to **all future work** in this project (not topic-specific)
- Not already covered by existing conventions
- Genuinely useful as a rule (not just documentation)

If nothing qualifies, skip this.

**References table**: If you created or renamed any reference docs, update the References table in `CLAUDE.md` to match. Remove entries for deleted/renamed files and add entries for new ones.

## 5. Summary

Tell the user:
- What reference doc(s) were created or updated (and whether it was a create vs update)
- What (if anything) was added to CLAUDE.md
- A brief list of the most important knowledge captured

---
description: Generate an AI-agent-optimized requirements.md for a new project
argument-hint: [project-name]
---

# Generate Requirements: AI-Optimized requirements.md

## Overview

Generate a comprehensive, AI-agent-optimized requirements.md that can be fed directly to an AI coding agent to build the project. The output prioritizes field-level specificity, transactional step-numbered journeys, and explicit constraints over vague prose.

## Output File

Write the requirements to: `requirements.md`

## Gather Project Details

Before generating, ask the user for these details if not already provided in the conversation. Do NOT proceed until you have at least the first 5:

1. **Project Name:** $ARGUMENTS (or ask)
2. **One-line Description:** What does it do?
3. **Architectural Invariant:** The single rule that must NEVER be violated (e.g., "every stock change must go through the movement ledger")
4. **MVP Goal:** What does "done" look like for v1?
5. **Tech Stack:** All technologies with their roles
6. **Domain:** (e.g., e-commerce, healthcare, fintech, logistics)
7. **User Roles:** (e.g., Admin, Manager, Operator)
8. **Core Entities:** Main data objects
9. **Key Workflows:** 3-5 core user journeys
10. **Known Constraints:** Existing code, legacy systems, compliance rules

## Required Document Structure

Generate the requirements.md with ALL of the following sections:

### 1. Project Brief
- Project name and one-line description
- The architectural invariant stated prominently
- MVP goal in 1-2 sentences

### 2. Tech Stack
- Every technology as a bullet with its role
- Format: `- **Role:** Technology`
- Be explicit — this prevents the AI agent from introducing unwanted dependencies

### 3. Core Data Entities & Relationships
For EACH entity:
- Entity name and purpose
- Every field with type and constraints (nullable, unique, default, enum values)
- Relationships (FK, junction tables)
- Derived/computed fields

Format:
```
- **EntityName:** Purpose
  - Fields: `field_name` (type, constraints), ...
  - Relations: belongs_to X, has_many Y
```

CRITICAL: Every status/type/enum value defined here MUST have a corresponding user journey in section 4 that produces it. No orphaned types.

### 4. User Journeys (Step-Numbered, Transactional)
For EACH core workflow:
- Journey name and which user role performs it
- Preconditions
- Numbered steps describing EXACT database/system operations (not UI clicks)
- Error/edge cases and how they are handled
- Postconditions

Write transactional steps like: "1. Check warehouse A has sufficient stock. 2. Decrement A. 3. Increment B. 4. Log TRANSFER in movement ledger. 5. Wrap steps 2-4 in a database transaction."

Do NOT write UI-level steps like "User clicks the transfer button."

### 5. API Surface & Route Design
For each feature area:
- Server functions / API endpoints (method, path, request shape, response shape)
- Query vs mutation
- Auth requirements per endpoint

### 6. Validation Rules & Business Constraints
- Field-level validation (formats, ranges, required)
- Cross-entity constraints
- Capacity limits, thresholds
- What happens when a constraint is violated

### 7. Auth & Authorization
- User roles and permissions matrix
- Which journeys/endpoints are restricted to which roles
- Session/token strategy

### 8. UI/UX Requirements
For each page/view:
- Page name and URL pattern
- Component hierarchy (parent > child)
- Key interactions and state changes
- Data source for each component

### 9. Non-Functional Requirements
- Performance targets (measurable, e.g., "page load < 2s at P95")
- Concurrent access strategy
- Pagination strategy for large datasets
- Error handling patterns (toast, inline, redirect)

### 10. Scope Boundaries
- **In scope (MVP):** Checklist of what ships first
- **Out of scope:** Explicitly excluded features with brief reason
- **Future considerations:** Parking lot for v2

### 11. Rules of Engagement for the AI Agent
- Build order (e.g., schema first, then API, then UI)
- Transaction requirements
- Type safety expectations
- Testing expectations
- Negative constraints ("Do NOT...")

### 12. Glossary
Domain-specific terms the AI must use consistently in code (variable names, types, comments).

## Writing Rules

Follow these rules strictly when generating the document:

- **No vague language.** Never use "simple", "basic", "appropriate", "as needed", or "etc."
- **Field-level specificity.** Every entity must list every field with its type.
- **Transactional steps.** Journeys describe database operations, not UI interactions.
- **Negative constraints are required.** Each major section should include at least one "Do NOT..." rule.
- **Every enum value must have a journey.** If the data model has a `SHIP` type, there must be a journey that creates it.
- **Name things.** Specify component names, file paths, and function names where possible.
- **State the "why" for counterintuitive choices.** One line is enough.

## Quality Checks

Before finalizing, verify:
- [ ] Every entity has field-level detail
- [ ] Every status/type/enum has a journey that produces it
- [ ] Every journey has error cases defined
- [ ] Auth roles are mapped to specific endpoints/journeys
- [ ] No vague language ("simple", "basic", "appropriate")
- [ ] At least one negative constraint per major section
- [ ] Tech stack is explicit enough to prevent unwanted library imports
- [ ] Validation rules cover all user-facing inputs
- [ ] Scope boundaries clearly separate MVP from future work

## Output Confirmation

After creating the file:
1. Confirm the file path
2. List any assumptions made due to missing information
3. Flag any entity types/statuses that lack a user journey
4. Suggest the implementation order based on the dependency graph

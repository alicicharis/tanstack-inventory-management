# Prompt: Generate a requirements.md for any project

Copy and fill in the `[PLACEHOLDERS]` below, then feed this prompt to an AI assistant.

---

## The Prompt

```
I need you to generate a comprehensive requirements.md for my project. Use the structure below. I will provide my project details after the template.

## Required Structure

### 1. Project Brief
- Project name and one-line description
- The single architectural invariant that must NEVER be violated (e.g., "every stock change must go through the movement ledger", "every payment must have a journal entry")
- MVP goal in 1-2 sentences

### 2. Tech Stack
List every technology choice as a bullet with its role. Be explicit — this prevents the AI from introducing unwanted dependencies.
Format: `- **Role:** Technology (version if pinned)`

### 3. Core Data Entities & Relationships
For EACH entity, list:
- Entity name and purpose
- Every field with its type and constraints (nullable, unique, default, enum values)
- Relationships to other entities (FK, junction tables)
- Any derived/computed fields

Use this format:
- **EntityName:** Purpose
  - Fields: `field_name` (type, constraints), ...
  - Relations: belongs_to X, has_many Y

### 4. User Journeys (Step-Numbered, Transactional)
For EACH core workflow, write:
- Journey name and which user role performs it
- Preconditions
- Numbered steps describing the EXACT database/system operations (not just UI clicks)
- Error/edge cases and how they are handled
- Postconditions

Cover ALL entity lifecycle operations. If a type/status exists in the data model, it must have a journey that produces it.

### 5. API Surface & Route Design
For each feature area, specify:
- Server functions / API endpoints (method, path, request shape, response shape)
- Whether it's a query or mutation
- Auth requirements per endpoint

### 6. Validation Rules & Business Constraints
- Field-level validation rules (formats, ranges, required fields)
- Cross-field and cross-entity constraints
- Capacity limits, rate limits, or threshold behaviors
- What happens when a constraint is violated (error message, fallback)

### 7. Auth & Authorization
- User roles and what each role can do
- Which journeys/endpoints are restricted to which roles
- Session/token strategy (if relevant)

### 8. UI/UX Requirements
For each page/view:
- Page name and URL pattern
- Component hierarchy (parent > child, not visual layout)
- Key interactions and state changes
- Which data it displays and where it comes from

### 9. Non-Functional Requirements
- Performance targets (e.g., "page load < 2s at P95")
- Concurrent access strategy (optimistic locking, row locks, etc.)
- Pagination/infinite scroll for large datasets
- Accessibility requirements
- Error handling patterns (toast, inline, redirect)

### 10. Scope Boundaries
- **In scope (MVP):** Checklist of what ships first
- **Out of scope:** Explicitly excluded features (with brief reason)
- **Future considerations:** Parking lot for v2 ideas

### 11. Rules of Engagement for the AI Agent
Process constraints for the AI implementing this:
1. Build order (e.g., schema first, then API, then UI)
2. Transaction requirements (e.g., "all stock changes must use db.$transaction")
3. Type safety expectations
4. Testing expectations
5. What NOT to do (negative constraints)

### 12. Glossary
Define domain-specific terms so the AI uses them consistently throughout the codebase.

---

## My Project Details

- **Project Name:** [YOUR PROJECT NAME]
- **One-line Description:** [WHAT DOES IT DO]
- **Architectural Invariant:** [THE ONE RULE THAT MUST NEVER BE VIOLATED]
- **MVP Goal:** [WHAT DOES "DONE" LOOK LIKE FOR V1]
- **Tech Stack:** [LIST YOUR TECHNOLOGIES]
- **Domain:** [e.g., e-commerce, healthcare, fintech, logistics]
- **User Roles:** [LIST ROLES, e.g., Admin, Manager, Operator]
- **Core Entities:** [LIST YOUR MAIN DATA OBJECTS]
- **Key Workflows:** [LIST 3-5 CORE USER JOURNEYS]
- **Known Constraints:** [ANYTHING THE AI MUST KNOW — existing code, legacy systems, compliance rules]

Generate the full requirements.md now. Be specific at the field level for entities. Write step-numbered transactional flows for every journey. Include error cases. Do not use vague words like "simple", "basic", or "appropriate".
```

---

## Why This Structure Works

This template was designed by synthesizing:

| Source | Key Insight |
|---|---|
| **PRD best practices** (Atlassian, HashiCorp RFC, Shape Up) | Goals/non-goals, phased scope, measurable success criteria |
| **AI-agent optimization research** | Field-level specificity, negative constraints, named file paths, step-numbered operations |
| **Analysis of a real requirements.md** (TitanWMS) | Architectural invariant up front, transactional journeys, explicit agent rules |
| **Common failure modes** | Missing auth, orphaned types with no journey, unspecified error handling, no UI requirements |

### Key Principles

1. **Explicit > Implicit.** AI agents have no institutional memory. Every assumption must be stated.
2. **Every type/status needs a journey.** If your data model has a `SHIP` movement type, there must be a user journey that creates it.
3. **Negative constraints are high-value.** "Do NOT use client-side state for X" prevents common AI missteps.
4. **Transactional steps, not UI steps.** "Decrement warehouse A, increment warehouse B, log transfer" is directly implementable. "User clicks transfer button" is not.
5. **Schema before UI.** Always finalize the data model before generating interface code.
6. **Name things in advance.** If you specify component names and file paths, the AI will follow them. If you don't, it will invent inconsistent names.

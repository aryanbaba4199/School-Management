# School Management System — Global AI Rules

## Directory Router (MANDATORY)

At the start of every conversation, the agent MUST read and apply the directory router skill:

```
.agent/skills/directory_router/SKILL.md
```

When working with any files, identify their root directory and apply the corresponding skill:

| Directory   | Skill to Apply                           |
| ----------- | ---------------------------------------- |
| `frontend/` | `.agent/skills/frontend_rules/SKILL.md`  |
| `backend/`  | `.agent/skills/backend_rules/SKILL.md`   |
| `app/`      | `.agent/skills/app_rules/SKILL.md`       |

---

## Global Rules (All Directories)

- **Strict Typesafety**:
  - ❌ NEVER use the `any` type in TypeScript files.
  - ✅ Define descriptive interfaces/types. Use `unknown` if the type cannot be determined immediately.
- **Shared Code Extraction (DRY)**:
  - ✅ If any function, utility, middleware, type, schema, or component is used more than once across different features, modules, or pages, it MUST be extracted into the corresponding `src/common/` directory (`frontend/src/common/` or `backend/src/common/`).
- **File Complexity Limit**:
  - ❌ NO file in any project (frontend, backend, or app) can exceed **200 lines of code**.
  - ✅ Break down components, functions, and services into smaller modular files if they exceed 200 lines.
- **Comment Style**:
  - ✅ Use `/*------------- section_name -------------*/` format for major section headers in code.
  - ❌ Do not write redundant inline comments; write self-documenting code.
- **Session/Turn Logging**:
  - ✅ At the end of every request/chat session, update the history in [.agent/development_log.md](file:///Users/aryandubey/project/personal-/School%20Management/.agent/development_log.md) outlining what was done, architecture decisions, and current state. This provides trace history for future agent interactions.
- **Architecture over Speed**:
  - Prioritize clean structures, modularity, and testability over quick and dirty setups.

---

## SaaS Core Product Modules (MVP Scope)

When building or modifying components, ensure they map directly to these 14 core SaaS functional modules:
1. **schools** — Multi-tenant registration, subscription plans, and master profiles.
2. **users** — Role-based accounts, authentication, JWT tokens, and login flows.
3. **students** — Registrations, profiles, section mappings, and guardian links.
4. **teachers** — Profiles, class assignments, and subject mappings.
5. **classes** — Class creation and section allocations.
6. **sections** — Section structures (e.g. A, B, C) per class.
7. **subjects** — Subject registry, syllabus, and module links.
8. **attendance** — RFID records, check-ins, monthly summaries, and alerts.
9. **exams** — Exam schedules, weekly tests, test templates, and papers.
10. **marks** — Grade entries, marks sheets, and performance metrics.
11. **homeworks** — Assignments creation, submissions tracker, and attachments.
12. **notifications** — Push notifications, SMS updates, and email newsletters.
13. **fees** — Structures, due dates, discounts, and custom invoicing.
14. **payments** — Online transactions, UPI invoices, and receipt generators.

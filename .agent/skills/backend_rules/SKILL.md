---
description: Backend (Node.js + Express + MongoDB + Zod + JWT) — AI Engineering Constitution. Apply all rules in this file when working on any file inside the `backend/` directory.
---

# BACKEND — AI ENGINEERING CONSTITUTION

## Project Stack
- **Runtime & Language**: Node.js + TypeScript
- **Framework**: Express.js
- **Database / ODM**: MongoDB + Mongoose
- **Request Validation**: Zod
- **Authentication**: JSON Web Token (JWT)
- **Unit & Integration Testing**: Jest + Supertest

---

## 1. Modular Architecture (NestJS-style)

- **Module Structure**:
  - The backend is organized into domain modules inside `backend/src/modules/<module-name>/`.
  - Each module MUST be structured as follows:
    - `<module-name>.module.ts` - Entry point/dependency linker for the module (connects routes to controllers).
    - `<module-name>.controller.ts` - Handles HTTP requests, parses headers/parameters, calls service methods, and returns JSON responses.
    - `<module-name>.service.ts` - Contains the business logic, transaction management, and direct database queries/Mongoose model calls.
    - `<module-name>.routes.ts` - Maps endpoints to controller actions and registers middleware.
    - `dto/` - Zod schemas and TypeScript types representing request bodies, parameters, and query shapes.
  - **DRY Principle**: If any code element (middleware, Zod schema, utility, helper, error handler, types) is referenced in more than one module, it MUST be extracted into `backend/src/common/` rather than duplicated.
  - **Master Directory (`master/`)**: General reference datasets (like States, Districts, etc.) must reside inside a dedicated `backend/src/modules/master/` folder, separating their models into `models/state.model.ts` and `models/district.model.ts`, but keeping service, routes, and controllers unified within the module.
  - **Core Modules MVP List**: Ensure new modules are built within `src/modules/` under these names: `school`, `user`, `student`, `teacher`, `class`, `section`, `subject`, `attendance`, `exam`, `marks`, `homework`, `notification`, `fees`, `payment`.

- **Strict Controller/Service Decoupling**:
  - ❌ Controllers must NEVER run direct database queries, Mongoose model methods, or aggregate pipelines.
  - ✅ All database operations must be isolated in the Service layer.

- **Request Validation**:
  - ✅ Every input (body, query, params) must be validated via Zod schemas before reaching the controller logic. Use validation middleware.

---

## 2. Coding Constraints

- **Strict Typesafety**:
  - ❌ NEVER use the `any` type. Define interfaces or Zod-inferred types for all request payloads, database documents, and function signatures.
- **File Length Limits**:
  - ❌ No single backend file can exceed **200 lines of code**.
  - If a file exceeds this limit, extract helper functions, refactor queries, or split the router/validation files.
- **Error Handling**:
  - ✅ Always catch asynchronous errors using a wrapper (e.g. `express-async-handler`) or try/catch blocks that forward errors to the express error-handling middleware using `next(error)`.
  - ❌ Do not return raw DB errors or stack traces to the client.

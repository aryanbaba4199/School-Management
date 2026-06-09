---
description: Web Frontend (React + TS + MUI + Tailwind + RTK Query) — AI Engineering Constitution. Apply all rules in this file when working on any file inside the `frontend/` directory.
---

# FRONTEND — AI ENGINEERING CONSTITUTION

## Project Stack
- **Framework**: React (Vite) + TypeScript
- **UI & Styling**: Material UI (MUI), Tailwind CSS, React Icons
- **CSS-in-JS**: Styled Components (`styled-components`) for feature-specific styles
- **State Management**: Redux Toolkit (RTK) + RTK Query for server state
- **Form Handling**: React Hook Form + Yup (schema validation)
- **Unit Testing**: Vitest + React Testing Library

---

## 1. Architectural Principles

- **Feature-Based Modular Architecture**:
  - Any user-facing or data feature must reside inside a dedicated feature directory: `frontend/src/features/<feature-name>/`.
  - A feature directory MUST contain exactly these folders if needed:
    1. `components/` - Reusable UI widgets/elements specific to this feature.
    2. `pages/` - High-level router pages.
    3. `forms/` - React Hook Form definitions, inputs, and Yup validation schemas.
    4. `types/` - Dedicated TypeScript interfaces and types.
    5. `styles/` - Styled Component definitions and theme extensions.
    6. `hooks/` - Feature-specific React hooks (e.g. data fetching, pagination, form bindings).
  - Common components, styles, utility functions, and global store configs should reside in `frontend/src/common/` or `frontend/src/app/`.
  - **DRY Principle**: If any code element (styled component, hook, type, schema, utility) is referenced in more than one feature or page, it MUST be defined in `frontend/src/common/` rather than duplicated.

- **Strict Typesafety**:
  - ❌ NEVER use `any`. Banned entirely.
  - ✅ Explicitly type all component props, custom hooks parameters, API response payloads, and form values.
  - If a type is dynamically loaded and unknown, type it as `unknown` and use type guards/assertions.

- **File Complexity & Lines of Code**:
  - ❌ No file can exceed **200 lines of code** (including comments and styles).
  - If a component or file approaches 200 lines:
    - Extract sub-components into separate files under `components/`.
    - Extract logic into custom hooks under `hooks/`.
    - Extract styled-components into separate files under `styles/`.

---

## 2. Performance & Memoization

- **Re-render Optimization**:
  - ✅ Wrap all callback functions passed down to children in `useCallback()`.
  - ✅ Wrap expensive calculations in `useMemo()`.
  - ✅ Wrap child components that receive objects, arrays, or callbacks as props in `React.memo()`.
- **Lazy Loading**:
  - ✅ Use dynamic imports with `React.lazy()` and `Suspense` for all page-level router components to enable code splitting.

---

## 3. Forms & Styling Rules

- **Forms Architecture**:
  - Always separate the form configuration and validation logic (Yup schema) from the UI layout.
  - Keep Yup schemas in `forms/schema.ts` and wrap form rendering inside specific components.
- **Styling Discipline**:
  - Combine Tailwind for quick utility layouts and Styled Components for semantic or complex components.
  - Use MUI component themes or Styled Components to avoid inline style objects.

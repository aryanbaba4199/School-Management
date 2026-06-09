---
description: Mobile App (React Native + TypeScript) — AI Engineering Constitution. Apply all rules in this file when working on any file inside the `app/` directory.
---

# MOBILE APP — AI ENGINEERING CONSTITUTION

## Project Stack
- **Framework**: React Native + TypeScript
- **State Management**: Redux Toolkit (RTK)
- **Unit & Integration Testing**: Jest + React Native Testing Library
- **Architecture**: Modular feature-based

---

## 1. Test-Driven Development (TDD) Discipline

- **Red-Green-Refactor Cycle**:
  - ✅ **Write a failing test first**: Define the expected behavior of your component, utility, or hook in a test file before writing any functional implementation.
  - ✅ **Write the minimal code to pass**: Implement the bare minimum to make the test turn green.
  - ✅ **Refactor**: Clean up the code, optimize performance, and ensure line counts are under constraints.
- **Test Coverage**:
  - Every component must have a corresponding `.test.tsx` file checking visual rendering, user interactions (press/inputs), and edge cases.
  - Every custom hook must have tests checking state updates and return values.

---

## 2. Coding Constraints

- **Strict Typesafety**:
  - ❌ NEVER use the `any` type.
  - ✅ Define interface types for all component props, network models, and navigation route parameters.
- **File Length Limits**:
  - ❌ No single mobile app file can exceed **200 lines of code**.
  - Extract sub-components, styling sheets, or custom hooks into separate files to stay under the 200-line threshold.
- **Styling Discipline**:
  - Use `StyleSheet.create` for styling React Native elements.
  - Do not write inline style objects in JSX unless styling animated values.

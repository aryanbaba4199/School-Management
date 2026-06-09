---
description: Analyzes the current file path or directory context to determine and apply the appropriate application-specific rules and skills.
---

# Directory Router & System Context

This workspace contains the complete AI-Powered School Management & Learning Platform ecosystem.

## System Context & Ecosystem Architecture

- **Web Admin Panel (`frontend/`)**:
  - React + TypeScript + Vite + Tailwind CSS + Material UI (MUI).
  - Uses RTK Query for state management and API integration.
  - Test runner: Vitest.
  - Structure: Modular, feature-based.
- **Backend API (`backend/`)**:
  - Node.js + Express + TypeScript + MongoDB (Mongoose) + Zod + JWT.
  - Test runner: Jest.
  - Structure: Modular NestJS-like architecture containing 14 domain modules (schools, users, students, etc.) and a dedicated `master/` folder for base query lists like States and Districts.
- **Mobile Application (`app/`)**:
  - React Native + TypeScript.
  - Focus: Test-Driven Development (TDD).

## Directory Mapping

When working with files in this repository, identify their path and follow these rules:

1. **`frontend/`**: Web Frontend
   - **Trigger**: Files matching `frontend/**`
   - **Action**: Read and apply ALL rules from [.agent/skills/frontend_rules/SKILL.md](file:///Users/aryandubey/project/personal-/School%20Management/.agent/skills/frontend_rules/SKILL.md)

2. **`backend/`**: Express Modular Backend
   - **Trigger**: Files matching `backend/**`
   - **Action**: Read and apply ALL rules from [.agent/skills/backend_rules/SKILL.md](file:///Users/aryandubey/project/personal-/School%20Management/.agent/skills/backend_rules/SKILL.md)

3. **`app/`**: React Native Mobile App
   - **Trigger**: Files matching `app/**`
   - **Action**: Read and apply ALL rules from [.agent/skills/app_rules/SKILL.md](file:///Users/aryandubey/project/personal-/School%20Management/.agent/skills/app_rules/SKILL.md)

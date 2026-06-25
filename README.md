# AI-Powered School Management & Learning Platform

A modern School Operating System (SaaS ERP) designed for the Indian education ecosystem, combining school administration, student diagnostics, parent engagement, and AI-driven concept recommendations.

---

## 🚀 Ecosystem Architecture

* **Web Admin Panel (`frontend/`)**: React + TypeScript + Vite + Tailwind CSS + Material-UI (MUI) + Redux Toolkit/RTK Query + Vitest.
* **Backend API (`backend/`)**: Node.js + Express + TypeScript + MongoDB (Mongoose) + Zod + Jest.
* **Mobile Application (`app/`)**: React Native + TypeScript.

---

## 🔑 Database Seed Credentials

Run the database seed script inside the `fastapi-backend/` directory to initialize these accounts:
```bash
cd fastapi-backend
venv/bin/python seed.py
```

Once seeded, you can log in using these test credentials (all passwords are `123456`):

| Role | Name | Email Address | Password | User Code |
| :--- | :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | Test Super Admin | `testsuperadmin@gmail.com` | `123456` | `SEED-000` |
| **SCHOOL_ADMIN** | Test School Admin | `testadmin@gmail.com` | `123456` | `SEED-001` |
| **TEACHER** | Test Teacher | `testteacher@gmail.com` | `123456` | `SEED-002` |
| **PARENT** | Test Parent | `testparent@gmail.com` | `123456` | `SEED-003` |
| **STUDENT** | Test Student | `teststudent@gmail.com` | `123456` | `SEED-004` |

---

## ⚙️ Development Quick Start

### 1. Prerequisites
* Node.js (v18+)
* MongoDB running locally (default: `mongodb://localhost:27017/school-management`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run build
npm test           # Run Jest test suite
npm run dev        # Run server in watch mode (Port 5001)
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm test           # Run Vitest unit tests
npm run dev        # Run Vite dev server (Port 5173)
```

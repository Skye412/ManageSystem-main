# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Employment/job management system (就业管理系统) with three user roles: Admin (manage), Enterprise, and Student. Monorepo with separate `client/` (Vue 3 + Vite) and `server/` (Express + Node.js) directories.

## Commands

### Client (run from `client/`)
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (default: http://localhost:5173)
npm run build        # Production build
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting (src/ only)
```

### Server (run from `server/`)
```bash
npm install          # Install dependencies
npm run dev          # Start with nodemon (auto-restart on changes)
npm start            # Start with node (port 3000)
```

Both client and server must be running simultaneously for development. The Vite dev server proxies `/api` requests to `http://127.0.0.1:3000`.

### Prerequisites
- MySQL running locally with database `managesystem` (auto-created tables on first connection)
- Redis running locally (used for refresh token storage)
- Configure credentials in `server/src/modle/config.json`

## Architecture

### Backend (`server/`)
- **Entry point:** `index.js` → loads `src/app.js`
- **Routes:** `src/routes/` — each file maps to a top-level Express route (`/user`, `/manage`, `/student`, `/enterprise`, `/file`, `/message`)
- **Controllers:** `src/controller/` — business logic, one per domain (user, manage, student, enterprise, message)
- **Data access:** `src/modle/db.js` — MySQL connection pool; `src/utils/query.js` — generic query executor
- **Auth:** `src/utils/jwtAuth.js` — JWT middleware with automatic token refresh; refresh tokens stored in Redis keyed by `refreshToken:${username}`
- **Config:** `src/modle/config.json` — DB credentials, JWT secret keys (not env vars)
- **File uploads:** `src/utils/upload.js` — Multer-based

### Frontend (`client/`)
- **State:** Pinia stores in `src/stores/counter.js` — three stores (`studentStore`, `manageStore`, `enterpriseStore`) with localStorage persistence
- **API layer:** `src/Api/` — `AxiosConfig.js` (interceptor for token refresh on 403), `RequestHandler.js` (generic request wrapper), plus per-domain API modules
- **Routing:** `src/router/index.js` — three top-level route groups (`/manage/*`, `/student/*`, `/enterprise/*`) plus auth at `/`
- **Components:** organized by role under `src/components/{manage,student,enterprise,message}/`
- **UI:** Element Plus (auto-imported via unplugin), ECharts for data visualization
- **Path alias:** `@/` maps to `src/` (configured in both Vite and jsconfig)

### Auth Flow
1. Login returns access token (15min) + refresh token (7 days)
2. Access token stored in Pinia store, sent via `Authorization` header
3. Axios interceptor catches 403 → uses refresh token to get new access token transparently
4. Refresh token stored in Redis; logout removes it

### Database
MySQL with auto-initialized tables on startup (`CREATE TABLE IF NOT EXISTS` in `db.js`). No migration system — schema changes go directly in `db.js`. Tables: `enterprises`, `students`, `admins`, `major_classes`, `positions`, `notices`, `resume_deliveries`, `chat_messages`.

## Code Style

**Frontend (Prettier):** No semicolons, single quotes, 100 char print width. ESLint configured for Vue 3.

**Backend:** CommonJS (`require`/`module.exports`), no linter configured.

## No Test Suite

There are no automated tests. Manual API testing can be done via `server/tset.http` (REST Client format).

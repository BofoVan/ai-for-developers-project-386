# AGENTS.md — Calendar Calls (Hexlet Project 386)

Compact reference for AI agents working in this repo. If a fact is obvious from filenames or standard tooling, it is omitted.

---

## Project Overview

A booking-calendar learning project with three layers:
- **API contract**: TypeSpec (`main.tsp`) → OpenAPI 3.1
- **Backend**: Express + TypeScript + Zod, in-memory store, port `4010`
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + shadcn/ui (`base-nova` style) + TanStack Query + Playwright E2E

This is a **Hexlet course project**. The file `.github/workflows/hexlet-check.yml` is auto-generated and **must not be edited, deleted, or renamed**.

---

## Quick Start

```bash
# 1. Install root TypeSpec dependencies
npm install

# 2. Backend (terminal 1)
cd backend && npm install && npm run dev   # http://localhost:4010

# 3. Frontend (terminal 2)
cd frontend && npm install && npm run dev  # http://localhost:5173
```

For frontend-only work with mocked API, run `npm run mock:api` (Prism) instead of the real backend. **Do not run both backend and Prism simultaneously** — both bind to port `4010`.

---

## Monorepo Boundaries & Entrypoints

| Package | Directory | Entrypoint | Notes |
|---------|-----------|------------|-------|
| TypeSpec contract | root | `main.tsp` | Emits to `tsp-output/` via `tspconfig.yaml` |
| Backend | `backend/` | `src/index.ts` | Express app, in-memory `memoryStore.ts`, no DB |
| Frontend | `frontend/` | `src/main.tsx` | Vite + React + `HashRouter` |

**Frontend routing uses `HashRouter`** — URLs are `/#/`, `/#/admin`, `/#/book`. Direct links to `/admin` without the hash will 404 unless served by the dev server.

---

## Commands Reference

### Root (TypeSpec)
- `npx tsp compile` — compile `main.tsp` → OpenAPI YAML (output dir controlled by `tspconfig.yaml`)

### Backend (`cd backend`)
- `npm run dev` — nodemon + tsx, restarts on file changes
- `npm start` — one-shot `tsx src/index.ts`
- `npm test` — Jest in **ESM mode** (`NODE_OPTIONS='--experimental-vm-modules'`)
- `npm run test:coverage` — Jest with coverage

### Frontend (`cd frontend`)
- `npm run dev` — Vite dev server
- `npm run build` — **typecheck first** (`tsc -b`) then Vite build
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- `npm run generate-types` — `openapi-typescript schema/openapi.yaml -o src/api/generated/types.ts`
- `npm run mock:api` — Prism mock server from `schema/openapi.yaml` on port `4010`
- `npm run e2e` — Playwright (auto-starts mock API + dev server, sequential)
- `npm run e2e:ui` — Playwright with UI mode

---

## Testing

### Backend
- **Framework**: Jest + ts-jest + supertest
- **Config**: `jest.config.js` uses `ts-jest/presets/default-esm`
- **Test location**: `src/__tests__/**/*.test.ts`
- **ESM requirement**: tests must run with `--experimental-vm-modules`
- **Coverage**: collects from `src/**/*.ts`, excludes `src/index.ts` and `src/__tests__`

### Frontend E2E
- **Framework**: Playwright
- **Local dev config**: `playwright.config.ts` — auto-starts Prism mock API + Vite dev server
- **CI config**: `playwright.config.ci.ts` — auto-starts **real backend** + Vite dev server
- **Critical**: `workers: 1`, `fullyParallel: false` — tests run **sequentially**, do not change this
- **Base URL**: `http://localhost:5173`
- **Test dir**: `e2e/`
- **Global setup**: `e2e/globalSetup.ts` prepares deterministic backend state via REST API (seed event types + bookings)

### CI E2E vs Mock E2E
- **Local development**: `cd frontend && npm run e2e` runs against Prism (stateless mocks). Fast but mutations do not persist.
- **CI / real integration**: `cd frontend && npx playwright test --config=playwright.config.ci.ts` runs against the real Express backend with seeded data. This is the authoritative integration check.

---

## Constraints & Gotchas

1. **Port collision**: Backend and Prism both use `4010`. Only one can run at a time.
2. **Hardcoded CORS**: Backend allows only `http://localhost:5173` (`backend/src/index.ts`).
3. **In-memory store**: No database; all data is lost when the backend process restarts.
4. **Different TypeScript versions**: Backend uses `^5.6.2`, Frontend uses `~5.7.0`. Do not unify them blindly.
5. **Module resolution mismatch**: Backend `tsconfig.json` uses `Node16`; Frontend uses `bundler`.
6. **shadcn/ui style**: `base-nova` with `neutral` base color and CSS variables. Adding components via `npx shadcn@latest add <name>`.
7. **Known React hydration bug**: `console-errors.md` documents a nested `<button>` inside `<button>` in `AdminPage` (AlertDialogTrigger wrapping a shadcn Button). Fix: ensure trigger renders a single clickable element.
8. **Frontend env**: `frontend/.env.local` sets `VITE_API_BASE_URL=http://localhost:4010`. Vite requires `VITE_` prefix for env vars exposed to client code.

---

## TypeSpec / OpenAPI Change Flow

When the API contract changes, follow this order:

1. Edit `main.tsp` (root)
2. Run `npx tsp compile` → generates OpenAPI YAML
3. Copy the generated YAML into `frontend/schema/openapi.yaml`
4. Run `cd frontend && npm run generate-types` → updates `src/api/generated/types.ts`
5. Update backend Zod schemas and route handlers manually (no auto-generation)
6. Run `cd backend && npm test` to verify backend contract compliance

The frontend `openapi-fetch` client (`src/api/client.ts`) is typed from `generated/types.ts`. Methods are uppercase: `client.GET(...)`, `client.POST(...)`, etc.

---

## Commit Convention

This project uses **Conventional Commits** enforced by `husky` + `@commitlint/cli`.

- **Format**: `type(scope): description`
- **Allowed types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- **Scope**: `frontend`, `backend`, `e2e`, `ci`, or omitted for root changes
- **Examples**:
  - `feat(frontend): add slot picker to booking page`
  - `fix(backend): handle 409 conflict for double booking`
  - `test(e2e): cover admin event type deletion`
  - `ci: add Playwright integration workflow`

A commit that does not follow the format will be rejected by the local hook. When working with AI agents, explicitly request the commit format in the prompt.

---

## CI / CD

GitHub Actions workflows live in `.github/workflows/`:

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | push / PR to `main` | `commitlint`, `backend-unit-tests`, `e2e-integration` |
| `hexlet-check.yml` | push / tags | Hexlet auto-check (**do not edit**) |
| `release-please.yml` | push to `main` | Generates release PRs |

### E2E in CI
- Runs against the **real Express backend** (not Prism)
- Backend state is seeded automatically by `e2e/globalSetup.ts`
- `TZ=Europe/Moscow` is set so calendar slots align with test assertions
- Playwright artifacts (screenshots, traces) are uploaded on failure and kept for **1 day**

---

## Releases

Releases are automated with **release-please** (`googleapis/release-please-action@v4`).

- **Separate packages**: `frontend/` and `backend/` each get their own semver version and changelog
- **Configuration**: `release-please-config.json` + `.release-please-manifest.json`
- **How it works**:
  1. Every push to `main` triggers the action
  2. It scans Conventional Commits since the last release
  3. It opens (or updates) a **release PR** with changelog bumps and version updates in `package.json`
  4. Merging the release PR creates a GitHub Release and tag

---

## References

- `FRONTEND_PLAN.md` — detailed implementation plan and architecture decisions
- `tspconfig.yaml` — TypeSpec emitter configuration
- `frontend/components.json` — shadcn/ui registry and alias configuration

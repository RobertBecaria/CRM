# Psycho Kinesiology CRM — Plan

## 1) Objectives
- Build a private, one-way CRM for a single admin (wife) with simple email/password login
- Manage Clients (First Name, Last Name, DOB) and full Visit history (Date, Topic, Notes)
- Provide fast search, filtering (name, topic, date range/year), and year-end summaries/statistics
- Clean, calming, professional UI; fully responsive across desktop/tablet/mobile
- Use FARM stack: FastAPI + MongoDB + React; JWT auth; all backend routes under /api

## Scope & Assumptions
- Single admin user only (no multi-tenant/multi-role)
- No external integrations; all data stored locally in MongoDB
- JWT stored client-side (localStorage) for simplicity in a trusted, single-user context
- Date handling in ISO 8601 (UTC); backend validates and normalizes

## Phase 1: Core POC (Isolation)
- Level 2 (CRUD + simple auth) → POC SKIPPED by design. We’ll implement directly and test end-to-end.

## Phase 2: Main App Development

### Data Model (MongoDB)
- users: { _id, email (unique), password_hash, created_at }
- clients: { _id, first_name, last_name, dob (date), created_at, updated_at }
- visits: { _id, client_id (ref clients._id), date (date), topic (string), notes (string), created_at, updated_at }
- Indexes: clients(last_name, first_name), visits(client_id, date), visits(topic)

### Backend (FastAPI)
- Auth (JWT):
  - POST /api/auth/register (seed or first-run only), POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
- Clients CRUD:
  - GET /api/clients?search=&page=&page_size=&sort=
  - POST /api/clients
  - GET /api/clients/{id}
  - PUT /api/clients/{id}
  - DELETE /api/clients/{id}
- Visits CRUD:
  - GET /api/clients/{id}/visits?date_from=&date_to=&topic=&page=&page_size=
  - POST /api/clients/{id}/visits
  - PUT /api/visits/{visit_id}
  - DELETE /api/visits/{visit_id}
- Statistics:
  - GET /api/stats/overview?range=ytd|last_30|custom&date_from=&date_to=
  - GET /api/stats/client/{id}?year=YYYY&date_from=&date_to=
  - GET /api/stats/topics?date_from=&date_to=
- Implementation Notes:
  - Use Pydantic models for validation; helper serialize_doc for ObjectId/Date
  - Guard all CRUD under auth dependency; hash passwords (bcrypt) and issue JWTs

### Frontend (React)
- Routes/Pages:
  - /login: email/password login
  - /dashboard: KPIs (total clients, total visits YTD, visits last 30 days, top topics), quick filters
  - /clients: list with search by name, filter by DOB range (optional), add/edit/delete client
  - /clients/:id: client profile + visits tab (list + add/edit/delete visit, filter by date range/topic)
  - /statistics: advanced filters (date range, topic), client-wise summary table, topic distribution
  - Global header with search, user menu (logout)
- UI/UX:
  - Calming wellness palette (soft greens/teals, lavender accents), high-contrast text, accessible forms
  - Use shadcn/ui components; responsive layout (cards on mobile, grid on desktop)
  - Loading/empty/error states, confirm dialogs for destructive actions
  - All interactive elements include data-testid attributes for testing

### Filtering & Search
- Search clients by first/last name (prefix/substring match)
- Filter visits by date range and topic (server-side pagination)
- Year-end: filter by year to generate per-client summaries and topic counts

### User Stories (Phase 2)
1. As the admin, I can log in and stay signed in until I log out.
2. As the admin, I can add a new client with first name, last name, and DOB.
3. As the admin, I can edit or delete a client when needed.
4. As the admin, I can record multiple visits per client with date, topic, and notes.
5. As the admin, I can search clients by name to find records quickly.
6. As the admin, I can filter a client’s visits by date range and topic.
7. As the admin, I can see dashboard KPIs: total clients, visits YTD, last 30 days, top topics.
8. As the admin, I can view year-end summaries for each client (visit count, topics) for a selected year.
9. As the admin, I can see a statistics page with topic distribution and filters.
10. As the admin, I receive clear feedback (loading, success, error) for all actions.

## 2) Implementation Steps (Sequenced)
1. Call design_agent to generate UI guidelines (colors, spacing, components) and apply globally.
2. Backend scaffolding: FastAPI app with /api prefix, Mongo connection via MONGO_URL, JWT utils, password hashing.
3. Implement Auth endpoints; seed first admin (guard register after first run).
4. Implement Clients CRUD with validation, indexes, and pagination; write serialize helpers.
5. Implement Visits CRUD; ensure referential integrity (client exists) and date parsing.
6. Implement Statistics endpoints (overview, per-client, topics) with efficient aggregations.
7. Frontend scaffolding: routes, auth context, protected routes, API client using REACT_APP_BACKEND_URL.
8. Build pages: Login → Dashboard → Clients List → Client Detail/Visits → Statistics; add filters/search.
9. Polish UI/UX using shadcn/ui; responsive styles; loading/empty/error states; data-testid attributes.
10. Testing: run ruff/ESLint; call testing_agent_v3 for end-to-end flows (skip camera/drag-and-drop), fix issues.

## 3) Next Actions (Immediate)
- Generate design guidelines with design_agent (calming wellness theme, responsive system)
- Implement backend (auth, clients, visits, stats) and frontend pages in parallel using bulk_file_writer
- Run one round of end-to-end testing and address findings

## 4) Success Criteria
- All endpoints functional behind JWT; frontend matches backend; no hardcoded URLs (uses env vars)
- Can add/edit/delete clients and visits; search/filter works; pagination responsive
- Dashboard and statistics produce correct counts for YTD, last 30, and selected ranges
- UI is clean, calming, and fully responsive; no red-screen errors; accessibility basics met
- Testing agent scenarios pass; logs clean; images and dates serialize correctly (no JSON errors)

## Risks & Mitigations (Concise)
- Date/time inconsistencies → Normalize to UTC, validate formats, consistent parsing on client
- Large visit lists → Server-side pagination + indexes on client_id/date/topic
- Single-admin credential safety → Allow password change; store JWT securely; simple lockout on repeated failures

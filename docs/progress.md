# Progress Tracker: Animita MVP

This file tracks the real-time progress of the Animita preservation platform development.

## 🟢 Status Legend
- ⚪ **Not Started**
- 🟡 **In Progress**
- 🔴 **Blocked**
- ✅ **Done**
- 🏁 **Phase Gate** (Review Required)

---

## 🗺️ Phase 1: Foundation & Data Sync
- [x] ✅ Refactor `UserContext` & `types/roles.ts` to `default`/`editor`/`superadmin`.
- [x] ✅ Create `/assets` route and public directory for portfolio.
- [x] ✅ Define SQL schema for `profiles`, `heritage_sites` (was `ich_items`), `revisions`.
- [x] ✅ Migrate `SEED_HERITAGE_SITES` to Supabase.
- [x] 🏁 **Phase Gate**: Roles aligned and Database seeded.

## 🏗️ Phase 2: Creation & Logic
- [x] ✅ Connect `/add` form to Supabase INSERT.
- [x] ✅ Implement RLS: Editors vs Default policies.
- [x] ✅ Refactor `/add` page to follow premium mobile-style UI.
- [x] ✅ Automatic geolocation & Structured data visual analysis preview.
- [x] ✅ Backend logic for Wikipedia-style snapshotting on update (`frontend/app/[kind]/[slug]/edit`).
- [x] ✅ `/api/heritage-sites` route validates auth + PostGIS payloads before inserting (2026-02-03).
- [x] 🏁 **Phase Gate**: User can create/edit with history tracking and premium UI.

## 🤖 Phase 3: Extras (AI / Street View)
- [x] ✅ Create `/tools/street-view-detect` page.
- [x] ✅ Implement YOLO/Mapbox-inspired mock logic with deterministic detections.
- [x] 🏁 **Phase Gate**: Tool detects "Animita" from coordinates.

## 🔐 Phase 5: Auth & Security
- [x] ✅ Supabase Auth integration (Login/Signup).
- [x] ✅ Middleware session management.
- [x] ✅ Profiles & Roles trigger implementation.
- [x] ✅ Real-time UserContext synchronization.
- [ ] ⚪ Verification: Test signup flow with real email.
- [ ] ⚠️ RLS Permission Fix: Requires Docker Desktop to run `supabase db reset`.

## 🔍 Phase 4: Polish & Research Mode
- [x] ✅ Implement "Research Mode" toggle.
- [x] ✅ Verify Map "Insights" layer visibility.
- [x] ✅ Revision history UI integration.
- [x] 🏁 **Phase Gate**: Final MVP ship.

---

## 🧪 Quality Assurance (QA) Status
- [x] **Unit Testing**: `UserContext`, `AssetsPage`, and payload validators covered.
- [x] **Integration Testing**: `/api/heritage-sites` server route & validator exercised via Jest (2026-02-03).
- [x] **Visual Review**: `researchMode` toggle implemented in header.
- [x] **Data Consistency**: SQL Seed matches `SEED_HERITAGE_SITES`.
- [x] **QA Checklist**: See `docs/testing-playbook.md` for end-to-end manual/automated flow validation (2026-02-03).
- [x] **Code Quality**: All TypeScript errors fixed, ESLint errors resolved (2026-02-12).
- [x] **Production Build**: Successfully builds with 21 static/dynamic routes (2026-02-12).

---

## 📜 Changelog
| Date | Change | Author |
| :--- | :--- | :--- |
| 2026-01-28 | Updated plan to align with `frontend` codebase and added Extras/Assets. | Antigravity |
| 2026-01-28 | Initial Project Plan & Progress tracking initialized. | Antigravity |
| 2026-02-03 | Added `/api/heritage-sites` validation + Jest integration coverage for creation flow. | Codex |
| 2026-02-12 | Fixed all TypeScript errors (4/4) and ESLint errors (4/4). Production build verified. | Antigravity |

---

## 📝 Decisions Log (ADR Lite)
### ADR-001: JSONB vs Translation Tables for Multilingual
- **Decision**: Use JSONB fields (`{"en": "...", "es": "..."}`).
- **Rationale**: Minimal complexity for MVP.

### ADR-002: Editor Conflict Rule
- **Decision**: Editors cannot edit their own entries (peer review enforcement).
- **Rationale**: Enforce verifiability.

### ADR-003: Asset Storage
- **Decision**: Use local `/frontend/public/assets` for stable portfolio assets.
- **Rationale**: Avoids Supabase bandwidth dependency for header videos/demos.

---

## ⚠️ Open Questions / Risks
1. **Automation Accuracy**: How accurate is Yolo at detecting small roadside shrines?
2. **Supabase Limits**: Will storing full JSON snapshots of history hit DB limits? (Unlikely for MVP scale).

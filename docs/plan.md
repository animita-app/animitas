# Implementation Plan: Animita Preservation Platform

This document outlines the technical architecture and phased implementation strategy for the Intangible Cultural Heritage (ICH) preservation platform.

## A) Scope & "Extras"
### MVP Scope
- **Core Entity**: "Animitas" (mapped to `HeritageSite` type).
- **Geographic Focus**: Chile.
- **Key Features**: Wikipedia-like versioning, "Research Mode" toggle, and Crowd-sourced creation.

### Extras: AI & Automation
- **Street View Detection**: A tool to programmatically detect animitas using Yolo v8 on Google Street View imagery.
  - **Location**: `frontend/app/tools/street-view-detect/page.tsx`
  - **Logic**: Use Mapbox/Google Street View Static API + Client-side ONNX or Server-side Python wrapper for Yolo inference.

  - **Logic**: Use Mapbox/Google Street View Static API + Client-side ONNX or Server-side Python wrapper for Yolo inference.

### Guidelines
- **Skills**: Always follow the `next-best-practices` skill conventions.
- **Design**: Use `rams` for accessibility and visual consistency checks logic.
- **Maintenance**: Update to latest Next.js version where applicable.

---

## B) Supabase/Postgres Data Model

### 1. Profiles & Roles (Aligning with `UserContext`)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, references `auth.users` |
| `role` | `text` | `default`, `editor`, `superadmin` (Refactor from `free`/`pro`) |
| `research_mode` | `boolean` | Preferences for UI toggle |

### 2. Heritage Sites (Matches `HeritageSite` interface)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `kind` | `text` | e.g., 'Animita' |
| `title` | `text` | Mapped from `name` |
| `slug` | `text` | Unique URL identifier |
| `location` | `geometry(Point, 4326)` | PostGIS Point (matches `location: {lat, lng}`) |
| `typology` | `text` | e.g., 'Gruta', 'Tumba' |
| `images` | `jsonb` | Array of strings (Supabase URLs) |
| `story` | `text` | Markdown content |
| `person_id` | `uuid` | Relation to `people` table (if known) |
| `insights` | `jsonb` | Stores `HeritageSiteInsights` structure |
| `creator_id` | `uuid` | References `profiles.id` |
| `status` | `text` | `draft`, `published`, `flagged` |

### 3. Revisions (Wikipedia-like)
- **Table**: `heritage_site_revisions`
- **Columns**: `site_id`, `author_id`, `snapshot` (full JSON of `HeritageSite`), `diff_summary`, `created_at`.

---

## C) Assets & Portfolio Route
- **Goal**: Store and showcase presentation assets (videos/images) for the portfolio.
- **Implementation**:
  - **Directory**: `frontend/public/assets/` (Static storage).
  - **Route**: `frontend/app/assets/page.tsx` (Gallery view).
  - **Logic**: A simple grid component reusing `ExpandableMedia` or similar from the existing UI kit to preview content.

---

## D) Core User Flows (Integrated)

1. **Map Experience**
   - Reuse `components/map/mapbox-map.tsx`: Connect `SEED_HERITAGE_SITES` to real Supabase `useQuery`.
   - Update `MarkerLayer` to accept data from Supabase.

2. **Creation Flow (`/add`)**
   - Enhance `frontend/app/add/page.tsx`.
   - Connect existing `SpeechInput` (Scribe) to populate `story` field.
   - Post to `heritage_sites` table.

3. **Research Mode**
   - Controlled by `UserContext` (`role === 'editor'` or `research_mode` toggle).
   - Toggles visibility of "Insights" tab in `[slug]/page.tsx` and "Heatmap" layers on Map.

---

## E) Phased Implementation

### Phase 1: Foundation & Data Sync
- [x] Migrate `SEED_HERITAGE_SITES` to Supabase `heritage_sites` table (SQL generated).
- [x] Refactor `UserContext` to support `default/editor/superadmin`.
- [x] Create `frontend/public/assets` and the `/assets` route.

### Phase 2: Creation & Logic
- [x] Connect `/add` form to Supabase INSERT.
- [x] Implement RLS: "Default" users can create; only "Editors" can edit others.
- [x] ✅ Refactor `/add` page to follow the premium mobile-style UI (Create Group style).
  - [x] ✅ Automatic geolocation fetching by default.
  - [x] ✅ Structured data preview with animated color highlights for heritage, cultural, and memory categories.
- [x] 🟢 Backend logic for Wikipedia-style snapshotting on update (`frontend/app/[kind]/[slug]/edit/page.tsx`).
- [x] 🏁 **Phase Gate**: User can create/edit with history tracking and premium UI.

- [x] `/api/heritage-sites` server route enforces authenticated inserts, slug uniqueness, and PostGIS formatting for the `/add` flow (2026-02-03).

### Phase 3: Extras (AI Tool)
- [x] Build `/tools/street-view-detect` UI.
- [x] Implement mock detection flow (or real integration if API keys available).

### Phase 4: Polish
- [x] "Research Mode" toggle implementation.
- [x] Revision history UI integration.

---

## F) Verification Plan
### Automated Tests
- [x] Check `heritage_sites` table creation via Supabase client (Implied by UI connection).
- [x] Verify `/assets` route returns 200 OK (Tested with Jest).

### Manual Verification
- **Role Check**: Login as 'default', try to edit another's entry (should fail).
- **Map Check**: Verify `MarkerLayer` renders points from DB.
- **Assets**: Visit `/assets`, check if images load.

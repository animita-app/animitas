po# Architecture & Decision Log

This document explains the technical decisions, data models, and AI strategies adopted for the Animita Preservation Platform.

## 1. Data Models (Supabase/Postgres)

### Heritage Sites (`heritage_sites`)
- **Decision**: Used PostGIS `geometry(Point, 4326)` for the location column.
- **Rationale**: While simple objects `{lat, lng}` work for basic maps, PostGIS is required for "Research Mode" operations like:
  - Finding animitas within a 50m buffer of a highway.
  - Heatmap generation (Fast server-side aggregation).
  - Spatial joins with context layers (Cemeteries, Critical Points).
- **Future Potential**: Enabling "Spatial Alerts" (e.g., notifying researchers when a new animita is detected in a high-risk traffic zone).

### Profiles & Roles
- **Decision**: Refactored from a simple Subscription model to a Role-based Access Control (RBAC) with `default`, `editor`, and `superadmin`.
- **Rationale**: The platform serves two distinct types of users:
  1. **The Public (Default)**: Looking for memorialized stories and community interaction.
  2. **Researchers (Editor)**: Requiring analytical tools, GIS filters, and verify/edit capabilities.
- **Implementation**: Managed via `UserContext` with JWT-based Supabase Auth (or mock for MVP).

---

## 2. AI Strategy: Street View Detection

### Model Selection: YOLO v8/v11
- **Decision**: Chose the YOLO family for object detection.
- **Rationale**: YOLO provides the best balance between inference speed and accuracy for small, diverse objects like roadside shrines.
- **Architecture**:
  - **Inference**: Planned for either a Python/FastAPI wrapper (for heavy batch processing) or Client-side ONNX (for real-time verification in the browser while "driving" on the map).
- **Future Potential**:
  - **Auto-tagging**: Automatically detecting the "Typology" (Gruta vs. Tumba) based on visual features.
  - **Temporal Analysis**: Comparing historical Street View images to detect if a shrine has been moved or destroyed.

---

## 3. UI/UX Decisions

### Research Mode
- **Decision**: A global UI toggle that fundamentally shifts the interface.
- **Rationale**: Prevents "Data Clutter" for the casual user while providing deep insights for experts.
- **Implementation**:
  - Toggles visibility of PostGIS-driven analysis in `SpatialContext`.
  - Filters the Info Sidebar in the Detail View.

### Wikipedia-style Versioning
- **Decision**: Snapshotting full JSON states in a `heritage_site_revisions` table.
- **Rationale**: Preserves the "Intangible" part of the heritage. As stories change or are corrected, no data is lost.
- **Future Potential**: A "Time-slider" on the map to see the evolution of memory in Chille over decades.

---

## 4. Testing & Reliability
- **Framework**: Jest + React Testing Library.
- **Strategy**:
  - **Context Isolation**: Testing `UserContext` and `SpatialContext` independently through mocked providers.
  - **Regression Testing**: Ensuring that refactoring for Supabase doesn't break the existing GIS clipping engine.
- **QA Standards**: Every new feature added (like the Street View UI) includes an accessibility review via the `rams` standard.

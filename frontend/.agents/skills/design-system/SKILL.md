---
name: design-system
description: Systematic hierarchy for Animita UI patterns, tokens, and components. Always read this before writing or refactoring UI code.
---

# Animita Design System

This document serves as the source of truth for all UI decisions. Follow this systematic hierarchy to ensure consistency.

## 1. Fundamental Tokens

### Colors
- **Semantic Tokens Only**: Never use raw Tailwind colors (e.g., `bg-white`, `text-black`, `bg-gray-50`) or raw hex values.
- **Backgrounds**:
  - `bg-background`: Main page background (`#FCFCFC`).
  - `bg-background-weak`: Lateral panels, sidebars, secondary sections (`#F2F2F2`).
  - `bg-background-weaker`: Tertiary backgrounds, disabled states (`#E8E8E8`).
- **Text**:
  - `text-text-strong`: Headings, primary labels (`black`).
  - `text-text`: Main body copy (`#656364`).
  - `text-text-weak`: Secondary info, descriptions (`#8D8B8C`).
- **Borders**:
  - `border-border`: Primary borders.
  - `border-border-weak`: Subtle separators, secondary containers.
- **Accent**:
  - `#00e` (Primary action/highlight).
  - Use `text-accent`, `bg-accent`, `border-accent`.
  - **Deprecated**: Do not use the orange primary scale.

### Typography
- **Sans (Default)**: `Geist Sans`. Use for all UI elements and body copy.
- **Mono**: `IBM Plex Mono`. Reserved for:
  - Brand name: `[ÁNIMA]`
  - Technical IDs, coordinates, or system data.
  - Uppercase utility labels (e.g., "EDICIÓN", "VISTAS").
- **Font Sizing**: Standardize on `text-sm` for body, `text-xs` for labels, `text-xl` to `text-3xl` for headings.

### Spacing & Layout
- **Container Padding**:
  - Main Pages: `p-6` or `px-6`.
  - Sidebars: `p-6 md:p-8`.
- **Vertical Spacing**: Standardize on `space-y-8` for sections, `space-y-4` for internal groups.
- **Layout Patterns**:
  - **Split View**: `flex-row h-svh` with a fixed-width sidebar (`max-w-md`) and flexible main content.
  - **Full-bleed Map**: Absolute inset Mapbox container.
  - **Centered Forms**: `max-w-sm` or `max-w-md` centered on screen.

---

## 2. Atomic Components

### Buttons
- **Primary**: `variant="default"` (resolves to black/accent).
- **Secondary/Ghost**: `variant="ghost"` for destructive or secondary actions in sidebars.
- **Consistency**: Use `size="sm"` for sidebar actions. Navigation back buttons use `variant="ghost"` with `ChevronLeft`.

### Forms/Inputs
- **Field Wrapper**: Always use the `Field`, `FieldLabel`, and `FieldError` components from `@/components/ui/field`.
- **Labels**: Standardize as `text-xs font-bold uppercase tracking-tight text-text-weak`.

### Badges
- Used for metadata tags and reactions.
- Use `variant="outline"`, `h-6`, `font-normal`.

---

## 3. Compound Patterns

### Forms
- **Single-step**: Standard centered layout. Use `react-hook-form` + `zod`.
- **Multi-step**: Route-based steps with persistent `CreationFooter`. Common in registration/addition flows.

### Sidebars & Panels
- **Site Details**: `InfoSidebar` pattern with `Scroller` and `space-y-8`.
- **Floating Overlays**: `absolute top-4 right-4 w-80` for GIS tools and minor stats. Use `Card` with subtle shadows.

---

## 4. Interaction Systems

### Navigation
- **Header**: Use `variant="gis"` for map views, `variant="default"` for landing/pricing pages.
- **Monospace Brand**: Always wrap brand name in monospace treatment: `<span className="font-ibm-plex-mono">[ÁNIMA]</span>`.

### States
- **Empty States**: Use `Empty` hierarchy (`EmptyHeader` -> `EmptyMedia` -> `EmptyTitle`).
- **Loading**: Use `Loader2` for small spinners and `animate-pulse` or `Skeleton` for larger content blocks.
- **Inline Editing**: Prefer "Click-to-Edit" or "Read/Edit" toggle patterns in site details to avoid full-page reloads for minor metadata.

---

## Explicit Do's and Don'ts
- **DON'T**: Use `bg-white`, `text-black`, `bg-neutral-*`, or `border-neutral-*`.
- **DO**: Use `bg-background`, `text-text-strong`, `border-border`, and `border-border-weak`.
- **DON'T**: Hardcode hex colors like `#FF5A5F`.
- **DO**: Use semantic `accent` tokens.
- **DON'T**: Use large icons in small buttons.
- **DO**: Add `[&_svg]:size-3.5` or similar utilities to maintain atomic icon sizing.

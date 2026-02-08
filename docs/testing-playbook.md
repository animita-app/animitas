# ÁNIMA Frontend – QA & Flow Validation Playbook

_Updated: 2026-02-03_

This playbook documents how we verify core features (Auth, Map, Detail, Editor) and secondary UI shells before releasing.

## 1. Environment Prep
1. `supabase start` and `supabase db reset` to load migrations + seeds.
2. Ensure `.env` contains:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `ELEVENLABS_API_KEY`
3. Seed QA users via `npm run seed:users` (requires `SUPABASE_SERVICE_ROLE_KEY`).
4. `cd frontend && npm install` (first run) then `npm run dev`.

## 2. Automated Gates
| Command | Purpose |
| --- | --- |
| `npm run lint` | Static analysis |
| `npm run type-check` | TypeScript coverage |
| `npm run test -- --watchman=false` | Jest suites (contexts, validators, API route) |

All must pass before manual QA.

## 3. Manual Feature Flows
### 3.1 Auth
1. Visit `/login`.
2. Signup new email → toast “Revisa tu correo…”.
3. Sign in (default, editor, superadmin accounts).
4. Reload `/` and `/add`; session persists.
5. Confirm role gating:
   - Default: no edit CTA, no research toggle.
   - Editor: edit CTA + research toggle.
   - Superadmin: admin link visible.
6. Wrong password shows Supabase error toast.

### 3.2 Map (`/map`)
1. Map renders with markers (>0).  
2. Click marker → router navigates to `/[kind]/[slug]`.  
3. Research toggle hidden for default; active for editor (overlays + insights).  
4. Accept geolocation → map recenters; deny shows fallback.  
5. Hit refresh button → spinner during data refetch.

### 3.3 Detail (`/[kind]/[slug]`)
- Hero + highlight chips visible.  
- Research-only sections hidden for default role.  
- Audio button streams MP3 if present; shows disabled state when missing.  
- “Volver al mapa” returns to previous bbox.

### 3.4 Editor Flow
1. Editor clicks “Editar”.  
2. Save changes → toast success + Supabase revision row.  
3. Default user cannot access edit (CTA hidden, direct URL 403).  
4. Rename to existing slug → API appends `-1`.

## 4. Secondary Surfaces (Smoke)
- Profile dropdown → toggle research mode persists.  
- Collections page shows grouped cards + “Optimized route” placeholder.  
- Superadmin dashboard accessible only to `superadmin@test.dev`.  
- `/pricing` & paywall modals open/close; command palette works.

## 5. Scenario Matrix
| Scenario | Role | Expected |
| --- | --- | --- |
| Auth happy path | default | Toast + redirect `/` |
| Map research gating | default/editor | Toggle hidden vs overlays |
| Marker to detail | any | Router push works |
| Editor revision | editor | Revision row saved |
| Unauthorized edit | default | 403 or redirect |
| Audio fallback | any | Disabled button tooltip |
| Collections skeleton | superadmin | Cards + “Próximamente” CTA |

## 6. Sign-off Checklist
- [ ] Lint, type-check, Jest all green.  
- [ ] Auth → Map → Detail → Editor flows pass.  
- [ ] Secondary surfaces spot-checked.  
- [ ] Date + initials logged here: `2026-__-__ – ___`.

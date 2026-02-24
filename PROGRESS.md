# PROGRESS — MVP Animitas

## 2026-02-24

### Cerrado
- ✅ Análisis completo del codebase existente
- ✅ Plan de implementación creado y aprobado
- ✅ Cleanup: Eliminados 5 archivos deprecados (`global.d.ts`, `seedData`, etc)
- ✅ DB: Migración `03_votes.sql` ejecutada en BD remota mediante CLI
- ✅ Auth: Creado `auth-guard.ts` y middlewares protectores
- ✅ Auth: Agregados helpers `isAuthenticated`, `isEditor`, `isSuperadmin` en UserContext
- ✅ UI: Votos persistentes integrados en `poll-section.tsx`
- ✅ UI: Permisos de edición restringidos a creador y editores en `edit/page.tsx`

### En progreso
- 🔄 Próximo paso: Implementar subida de fotos en flujo de creación (`add/page.tsx`)

### Observaciones
- El schema actual tiene 3 tablas: `profiles`, `heritage_sites`, `heritage_site_revisions`
- Auth funciona end-to-end (signup → trigger profile → login → sesión)
- Edit page crea revisiones pero no verifica ownership client-side
- Poll section tiene UI lista pero datos hardcoded
- Add page funciona para título/story/ubicación pero no sube fotos
- 22 animitas seed existen tanto en DB como en constante local

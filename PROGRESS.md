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
- ✅ UI: Subida de fotos múltiples a Supabase Storage conectada al flujo de `/add`
- ✅ UI: Historial de revisiones integrado en vista detalle y `/editor` creado
- ✅ UI: Agregadas protecciones visuales al Header y vista de Admin con métricas básicas

### Estado Final MVP
- 🚀 **Sprint Completado**: Todas las funcionalidades "CORE (obligatorio)" definidas en TODO.md han sido implementadas, verificadas (`npm run build`), y commiteadas a Git. La aplicación base para el MVP está lista para despliegue.

### Observaciones
- El schema actual tiene 3 tablas: `profiles`, `heritage_sites`, `heritage_site_revisions`
- Auth funciona end-to-end (signup → trigger profile → login → sesión)
- Edit page crea revisiones pero no verifica ownership client-side
- Poll section tiene UI lista pero datos hardcoded
- Add page funciona para título/story/ubicación pero no sube fotos
- 22 animitas seed existen tanto en DB como en constante local

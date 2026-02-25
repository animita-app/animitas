# TODO — MVP Animitas (24 feb → 14 mar 2026)

## CORE (obligatorio)

- [x] **Cleanup: eliminar código deprecated/unused**
- [x] **DB: Migración tabla `heritage_site_votes`**
- [x] **Auth: `auth-guard.ts` helper server-side**
- [x] **Auth: Protección de rutas en middleware**
- [x] **Crear animita con fotos** (conectar upload a Supabase Storage)
- [x] **Editar animita propia** (fix permisos creator_id)
- [x] **Sistema de votos persistente** (poll-section → DB)
- [x] **Sistema de revisiones visible** (historial en detalle)
- [x] **Vista de revisión para editores** (`/editor`)
- [x] **Métricas básicas `/admin`** (conteos + bar chart)
- [x] **Permisos coherentes por rol** (guards UI en todas las vistas)
- [x] **UserContext helpers** (`isEditor`, `isSuperadmin`, `isAuthenticated`)

## Plan diario (24 feb → 14 mar)

| Día | Fecha | Foco |
|-----|-------|------|
| 1 | 24 feb (lun) | Cleanup deprecated code ✅ · DB migration votes · `auth-guard.ts` |
| 2 | 25 feb (mar) | Middleware route protection · UserContext helpers |
| 3 | 26 feb (mié) | Upload fotos en add flow (Supabase Storage) |
| 4 | 27 feb (jue) | Fix permisos edit page (creator check) · UI guards |
| 5 | 28 feb (vie) | Sistema de votos persistente (poll → DB) |
| 6 | 3 mar (lun) | Votos: polish + tests manuales |
| 7 | 4 mar (mar) | Editor review queue (`/editor` page) |
| 8 | 5 mar (mié) | Editor review: filtros por status + acciones rápidas |
| 9 | 6 mar (jue) | Admin dashboard (`/admin` page con conteos) |
| 10 | 7 mar (vie) | Admin: bar chart por tipología · revisiones visibles en detalle |
| 11 | 10 mar (lun) | Permisos coherentes: guardia en nav, botones, rutas |
| 12 | 11 mar (mar) | Integración completa: test por rol (unauth/user/editor/admin) |
| 13 | 12 mar (mié) | Fix bugs encontrados en testing |
| 14 | 13 mar (jue) | UX polish (secundario si hay tiempo) |
| 15 | 14 mar (vie) | Verificación final · deploy · cierre |

## Secundario (si hay tiempo)

- [ ] **Vista "Lista" (`/list`)**: Implementar carruseles (`ui/carousel.tsx`) con tarjetas `heritage-site-card` categorizadas
- [ ] Ajustes de UX en flujo de creación
- [ ] Señales visuales de prioridad editorial en review queue
- [ ] Mejoras menores en filtros del mapa
- [ ] Mejorar auto-generación de `diff_summary` en revisiones

## Nice-to-have (fuera de foco)

- [ ] **Recorridos (Rutas)**: Permitir agregar múltiples animitas y generar rutas desde la ubicación del usuario, con opción de incluir descripción e imágenes sobre el propósito del viaje.
- [ ] IA para extraer datos desde historia/imágenes
- [ ] Exportaciones o herramientas analíticas

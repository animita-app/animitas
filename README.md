# Animitas Mapper

Plataforma web para documentar y vivir memoriales digitales inspirados en las animitas chilenas.

## Visión

- **Hipótesis:** La tecnología puede acompañar la espiritualidad popular si captura lo intangible de estas prácticas.
- **Objetivo:** Diseñar experiencias digitales que preserven patrimonio y memoria desde las animitas como piloto.
- **Contexto:** Las animitas son altares comunitarios levantados donde ocurrió una muerte. Buscamos registrar su ubicación y relatos; permitir velas digitales temporales; y abrir espacio a la colaboración autogestionada.

## Núcleo Funcional

- Mapa de animitas en Mapbox, enfocado en Chile.
- Velas digitales de 24h, 3 días o 7 días con límite de 3 por semana en plan gratuito.
- Posibilidad de re-prender velas apagadas como gesto comunitario.
- Testimonios con o sin vela asociada.
- Modelo freemium simple para extender capacidades.

## Arquitectura Actual

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS v4. Desarrollo con `next dev --turbopack` (sin Docker).
- **Backend:** Node.js + Express + PostgreSQL/PostGIS (sin contenedores). Uso de Sequelize para modelos y migraciones.
- **Mobile:** React Native + Expo (WIP).
- **Datos compartidos:** Prisma en el frontend para consultar la base relacional.

## Estructura del Repositorio

```
animitas/
├── backend/      # API REST y workers (Node + Express)
├── frontend/     # Aplicación web (Next.js + Turbopack)
├── mobile/       # Experimentos móviles (Expo)
└── README.md     # Este documento
```

## Requisitos Previos

- Node.js 18+
- PostgreSQL 15+ con extensión PostGIS (`CREATE EXTENSION postgis;`)
- Mapbox access token y credenciales de Cloudinary (opcional para fotos)

## Configuración Rápida

### 1. Variables de entorno

```bash
cp .env.example .env               # Variables raíz compartidas
cp frontend/.env.example frontend/.env
```

Completar al menos:

- `DATABASE_URL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXTAUTH_SECRET`
- `CLOUDINARY_URL` (si se subirán imágenes)

### 2. Base de datos

```bash
# Crear estructura desde Prisma (usa la cadena de DATABASE_URL)
cd frontend
npm install
npx prisma migrate dev
npx prisma db seed            # Poblado rápido con animitas de ejemplo
```

> El comando de seed requiere que PostgreSQL esté corriendo localmente.

### 3. Backend (API)

```bash
cd backend
npm install
npm run dev                   # Levanta Express en modo desarrollo
```

Los modelos Sequelize están en `backend/src/models` y los seeders base en `backend/src/seeders`. Ejecuta los scripts desde `backend/package.json` si necesitas poblar datos adicionales.

### 4. Frontend (Web)

```bash
cd frontend
npm run dev                   # Usa Turbopack por defecto
```

Visita `http://localhost:3000` para ver el mapa y las animitas cargadas desde el seed.

## Modelos Principales

- **Memorial:** id, tipo, nombre, ubicación (lat/lng), historia, estado, metadata.
- **User:** id, email, tipo de cuenta, velas disponibles.
- **Candle:** id, memorial_id, user_id, duración, mensaje, expires_at.
- **Testimony:** id, memorial_id, contenido, `has_candle`.

## Estado del Proyecto

- El mapa se centra automáticamente en Chile y oculta capas ajenas al país.
- Seed de Prisma incluye usuarios, memoriales, velas y testimonios de referencia.
- Backend Express cuenta con modelos y seeders iniciales; pendiente consolidar scripts de migración automatizados.
- Mobile app en etapa de exploración.

## Próximos Pasos

- Conectar el backend Express con el schema actual de Prisma o definir un solo origen de verdad.
- Formalizar un flujo CLI para migraciones/seedings de Sequelize.
- Completar features de velas (expiración automática, re-prender) y testimonios colaborativos.

---

Con cariño para preservar la memoria y la espiritualidad popular en Chile. 🇨🇱

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const seedUsers = [
  {
    id: 'seed-user-equipo',
    email: 'equipo@animitas.cl',
    name: 'Equipo Animita',
    role: 'ADMIN',
    image: 'https://example.org/images/equipo-animitas.jpg'
  },
  {
    id: 'seed-user-investigadora',
    email: 'investigadora@animitas.cl',
    name: 'Investigadora Patrimonial',
    role: 'PREMIUM',
    image: 'https://example.org/images/investigadora.jpg'
  }
]

const seedMemorials = [
  {
    id: 'seed-memorial-santiago-mercedes-rojas',
    name: 'Animita de Mercedes Rojas',
    lat: -33.4691,
    lng: -70.641,
    story:
      'Altar comunitario levantado tras un accidente en 1998. Vecinos mantienen flores frescas cada semana y piden protección para los viajeros.',
    images: ['https://example.org/images/animita-mercedes-rojas.webp'],
    isPublic: true,
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-valparaiso-ruta68',
    name: 'Animita Ruta 68 Quebrada Verde',
    lat: -33.0454,
    lng: -71.5992,
    story:
      'Animita situada en la curva de la Quebrada Verde. Transportistas dejan cintas reflectantes y pequeños faroles para recordar a quienes partieron.',
    images: ['https://example.org/images/animita-ruta68.webp'],
    isPublic: true,
    createdById: 'seed-user-investigadora'
  },
  {
    id: 'seed-memorial-antofagasta-costanera',
    name: 'Animita Costanera Antofagasta',
    lat: -23.6524,
    lng: -70.3954,
    story:
      'Pequeña animita costera con caracoles y piedras pintadas por pescadores artesanales. Es punto de encuentro para agradecer retornos seguros.',
    images: ['https://example.org/images/animita-antofagasta.webp'],
    isPublic: true,
    createdById: 'seed-user-equipo'
  },
  {
    id: 'seed-memorial-punta-arenas-km7',
    name: 'Animita Camino al Sur Km 7',
    lat: -53.1636,
    lng: -70.9171,
    story:
      'Estructura protegida con vidrio para resistir el viento magallánico. Familias dejan cartas plastificadas y pañuelos trenzados.',
    images: ['https://example.org/images/animita-punta-arenas.webp'],
    isPublic: true,
    createdById: 'seed-user-investigadora'
  }
]

const seedCandles = [
  {
    id: 'seed-candle-santiago-1',
    memorialId: 'seed-memorial-santiago-mercedes-rojas',
    userId: 'seed-user-equipo',
    duration: 'THREE_DAYS',
    message: 'Gracias por acompañar a quienes transitan por Providencia.',
    isActive: true,
    litAtOffsetHours: -6,
    expiresAtOffsetHours: 48
  },
  {
    id: 'seed-candle-valparaiso-1',
    memorialId: 'seed-memorial-valparaiso-ruta68',
    userId: 'seed-user-investigadora',
    duration: 'SEVEN_DAYS',
    message: 'Por los viajes seguros de todo el puerto.',
    isActive: true,
    litAtOffsetHours: -24,
    expiresAtOffsetHours: 120
  },
  {
    id: 'seed-candle-antofagasta-1',
    memorialId: 'seed-memorial-antofagasta-costanera',
    userId: 'seed-user-equipo',
    duration: 'ONE_DAY',
    message: 'Gracias por cuidar las mareas del norte.',
    isActive: false,
    litAtOffsetHours: -72,
    expiresAtOffsetHours: -4
  }
]

const seedTestimonies = [
  {
    id: 'seed-testimony-mercedes-rojas',
    memorialId: 'seed-memorial-santiago-mercedes-rojas',
    userId: 'seed-user-investigadora',
    content:
      'Cada vez que paso camino a la universidad, dejo una flor pequeña para Mercedes. Siento que sigue cuidando nuestro barrio.',
    isPublic: true
  },
  {
    id: 'seed-testimony-ruta-68',
    memorialId: 'seed-memorial-valparaiso-ruta68',
    userId: 'seed-user-equipo',
    content:
      'En invierno encendemos velas y dejamos mantas para los camioneros que se detienen en la ruta. Siempre regresamos con una historia nueva.',
    isPublic: true
  },
  {
    id: 'seed-testimony-punta-arenas',
    memorialId: 'seed-memorial-punta-arenas-km7',
    userId: 'seed-user-investigadora',
    content:
      'Mi familia viaja cada año a dejar un pañuelo. Es nuestra forma de agradecer los regresos con buen clima en la Patagonia.',
    isPublic: true
  }
]

async function main() {
  const now = new Date()

  const userIds = seedUsers.map((user) => user.id)
  const memorialIds = seedMemorials.map((memorial) => memorial.id)
  const candleIds = seedCandles.map((candle) => candle.id)
  const testimonyIds = seedTestimonies.map((testimony) => testimony.id)

  await prisma.testimony.deleteMany({ where: { id: { in: testimonyIds } } })
  await prisma.candle.deleteMany({ where: { id: { in: candleIds } } })
  await prisma.memorial.deleteMany({ where: { id: { in: memorialIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })

  for (const user of seedUsers) {
    const { id, ...data } = user
    await prisma.user.create({
      data: {
        id,
        ...data
      }
    })
  }

  for (const memorial of seedMemorials) {
    const { id, ...data } = memorial
    await prisma.memorial.create({
      data: {
        id,
        ...data
      }
    })
  }

  for (const candle of seedCandles) {
    const { id, litAtOffsetHours, expiresAtOffsetHours, ...data } = candle
    const litAt = new Date(now.getTime() + litAtOffsetHours * 60 * 60 * 1000)
    const expiresAt = new Date(now.getTime() + expiresAtOffsetHours * 60 * 60 * 1000)

    await prisma.candle.create({
      data: {
        id,
        ...data,
        litAt,
        expiresAt
      }
    })
  }

  for (const testimony of seedTestimonies) {
    const { id, ...data } = testimony
    await prisma.testimony.create({
      data: {
        id,
        ...data
      }
    })
  }

  console.log('Database seeded with sample animitas for Chile 🇨🇱')
}

main()
  .catch((error) => {
    console.error('Error during Prisma seed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

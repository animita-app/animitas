import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const defaultMemorialImages = [
  'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585241307979-d19e1f836b57?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1525257450953-65ea266cacc0?auto=format&fit=crop&w=800&q=80',
]

const memorialsData = [
  {
    name: "Animita del Cabo Gómez",
    city: "Arica",
    coordinates: [-70.2988, -18.4861],
    people: [
      {
        name: "Cabo Gómez",
        birthPlace: "Arica",
        deathPlace: "Arica",
      }
    ],
    story: "Memorial dedicado a Cabo Gómez, víctima de la injusticia."
  },
  {
    name: "Animita de Hermógenes San Martín",
    city: "Iquique",
    coordinates: [-70.1425, -20.2208],
    people: [
      {
        name: "Hermógenes San Martín",
        birthPlace: "Iquique",
        deathPlace: "Iquique",
      }
    ],
    story: "Recordamos a Hermógenes San Martín."
  },
  {
    name: "Animita de Evaristo Montt",
    city: "Antofagasta",
    coordinates: [-70.4025, -23.6345],
    people: [
      {
        name: "Evaristo Montt",
        birthPlace: "Antofagasta",
        deathPlace: "Antofagasta",
      }
    ],
    story: "Memorial para Evaristo Montt."
  },
  {
    name: "Animita de Elvirita Guillén",
    city: "Antofagasta",
    coordinates: [-70.4050, -23.6360],
    people: [
      {
        name: "Elvirita Guillén",
        birthPlace: "Antofagasta",
        deathPlace: "Antofagasta",
      }
    ],
    story: "En memoria de Elvirita Guillén."
  },
  {
    name: "Animita de las Adrianitas",
    city: "Copiapó",
    coordinates: [-70.3344, -27.3627],
    people: [
      {
        name: "Adriana",
        birthPlace: "Copiapó",
        deathPlace: "Copiapó",
      }
    ],
    story: "Recordamos a las Adrianitas."
  },
  {
    name: "Animita de el Quisco",
    city: "Coquimbo",
    coordinates: [-71.3388, -29.9533],
    people: [
      {
        name: "El Quisco",
        birthPlace: "Coquimbo",
        deathPlace: "Coquimbo",
      }
    ],
    story: "Memorial dedicado al Quisco."
  },
  {
    name: "Animita de Luis Castillo",
    city: "Ovalle",
    coordinates: [-71.1994, -30.6037],
    people: [
      {
        name: "Luis Castillo",
        birthPlace: "Ovalle",
        deathPlace: "Ovalle",
      }
    ],
    story: "En memoria de Luis Castillo."
  },
  {
    name: "Animita de Emile Dubois",
    city: "Valparaíso",
    coordinates: [-71.6270, -33.0472],
    people: [
      {
        name: "Emile Dubois",
        birthPlace: "Valparaíso",
        deathPlace: "Valparaíso",
      }
    ],
    story: "Recordamos a Emile Dubois."
  },
  {
    name: "Animita de la calle Borja",
    city: "Santiago",
    coordinates: [-70.6694, -33.4372],
    people: [
      {
        name: "Desconocido",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      }
    ],
    story: "Animita ubicada en la calle Borja."
  },
  {
    name: "Animita de Luis Mesa Bell",
    city: "Santiago",
    coordinates: [-70.6750, -33.4400],
    people: [
      {
        name: "Luis Mesa Bell",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      }
    ],
    story: "Memorial para Luis Mesa Bell."
  },
  {
    name: "Animita de Alicia Bon",
    city: "Santiago",
    coordinates: [-70.6800, -33.4450],
    people: [
      {
        name: "Alicia Bon",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      }
    ],
    story: "En memoria de Alicia Bon."
  },
  {
    name: "Animita de la Marinita",
    city: "Santiago",
    coordinates: [-70.6850, -33.4500],
    people: [
      {
        name: "Marinita",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      }
    ],
    story: "Recordamos a Marinita."
  },
  {
    name: "Animita de Cuadra y Osorio",
    city: "Santiago",
    coordinates: [-70.6900, -33.4550],
    people: [
      {
        name: "Cuadra",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      },
      {
        name: "Osorio",
        birthPlace: "Santiago",
        deathPlace: "Santiago",
      }
    ],
    story: "Memorial dedicado a Cuadra y Osorio."
  },
  {
    name: "Animita de la Malvina",
    city: "San Bernardo",
    coordinates: [-70.7060, -33.7392],
    people: [
      {
        name: "Malvina",
        birthPlace: "San Bernardo",
        deathPlace: "San Bernardo",
      }
    ],
    story: "En memoria de Malvina."
  },
  {
    name: "Animita de Lucrecia",
    city: "Doñihue",
    coordinates: [-70.9744, -34.3892],
    people: [
      {
        name: "Lucrecia",
        birthPlace: "Doñihue",
        deathPlace: "Doñihue",
      }
    ],
    story: "Recordamos a Lucrecia."
  },
  {
    name: "Animita de Felipe",
    city: "Curicó",
    coordinates: [-71.2389, -34.9756],
    people: [
      {
        name: "Felipe",
        birthPlace: "Curicó",
        deathPlace: "Curicó",
      }
    ],
    story: "Memorial para Felipe."
  },
  {
    name: "Animita de El Pepe",
    city: "San Fernando",
    coordinates: [-71.0080, -34.5889],
    people: [
      {
        name: "El Pepe",
        birthPlace: "San Fernando",
        deathPlace: "San Fernando",
      }
    ],
    story: "En memoria de El Pepe."
  },
  {
    name: "Animita de Juanita Ibáñez",
    city: "Linares",
    coordinates: [-71.5975, -35.8458],
    people: [
      {
        name: "Juanita Ibáñez",
        birthPlace: "Linares",
        deathPlace: "Linares",
      }
    ],
    story: "Recordamos a Juanita Ibáñez."
  },
  {
    name: "Animita de Servandito",
    city: "Linares",
    coordinates: [-71.6000, -35.8480],
    people: [
      {
        name: "Servandito",
        birthPlace: "Linares",
        deathPlace: "Linares",
      }
    ],
    story: "Memorial dedicado a Servandito."
  },
  {
    name: "Animita de Manríquez",
    city: "Talca",
    coordinates: [-71.6556, -35.4264],
    people: [
      {
        name: "Manríquez",
        birthPlace: "Talca",
        deathPlace: "Talca",
      }
    ],
    story: "En memoria de Manríquez."
  },
  {
    name: "Animita de Raimundo",
    city: "Chillán",
    coordinates: [-72.0984, -36.6063],
    people: [
      {
        name: "Raimundo",
        birthPlace: "Chillán",
        deathPlace: "Chillán",
      }
    ],
    story: "Recordamos a Raimundo."
  },
  {
    name: "Animita del Canaquita",
    city: "San Carlos",
    coordinates: [-71.9722, -36.4225],
    people: [
      {
        name: "Canaquita",
        birthPlace: "San Carlos",
        deathPlace: "San Carlos",
      }
    ],
    story: "Memorial para Canaquita."
  },
  {
    name: "Animita de Estudiantes",
    city: "Chillán",
    coordinates: [-72.1000, -36.6100],
    people: [
      {
        name: "Estudiante Desconocido",
        birthPlace: "Chillán",
        deathPlace: "Chillán",
      }
    ],
    story: "En memoria de los estudiantes."
  },
  {
    name: "Animita de Petronila Neira",
    city: "Concepción",
    coordinates: [-72.1546, -36.8201],
    people: [
      {
        name: "Petronila Neira",
        birthPlace: "Concepción",
        deathPlace: "Concepción",
      }
    ],
    story: "Recordamos a Petronila Neira."
  },
  {
    name: "Animita de Ferrada y Mardones",
    city: "Concepción",
    coordinates: [-72.1570, -36.8220],
    people: [
      {
        name: "Ferrada",
        birthPlace: "Concepción",
        deathPlace: "Concepción",
      },
      {
        name: "Mardones",
        birthPlace: "Concepción",
        deathPlace: "Concepción",
      }
    ],
    story: "Memorial dedicado a Ferrada y Mardones."
  },
  {
    name: "Animita de Serafín Rodríguez",
    city: "Valdivia",
    coordinates: [-73.2382, -39.8142],
    people: [
      {
        name: "Serafín Rodríguez",
        birthPlace: "Valdivia",
        deathPlace: "Valdivia",
      }
    ],
    story: "En memoria de Serafín Rodríguez."
  },
  {
    name: "Animita de Emilio Inostroza",
    city: "Temuco",
    coordinates: [-72.5898, -38.7362],
    people: [
      {
        name: "Emilio Inostroza",
        birthPlace: "Temuco",
        deathPlace: "Temuco",
      }
    ],
    story: "Recordamos a Emilio Inostroza."
  },
  {
    name: "Animita de Palma",
    city: "Osorno",
    coordinates: [-72.5301, -40.5795],
    people: [
      {
        name: "Palma",
        birthPlace: "Osorno",
        deathPlace: "Osorno",
      }
    ],
    story: "Memorial para Palma."
  },
  {
    name: "Animita de La Pampa",
    city: "Osorno",
    coordinates: [-72.5330, -40.5820],
    people: [
      {
        name: "Pampino",
        birthPlace: "Osorno",
        deathPlace: "Osorno",
      }
    ],
    story: "En memoria de los de La Pampa."
  },
  {
    name: "Animita de los Quemaítocs",
    city: "Osorno",
    coordinates: [-72.5360, -40.5850],
    people: [
      {
        name: "Quemaítoc",
        birthPlace: "Osorno",
        deathPlace: "Osorno",
      }
    ],
    story: "Recordamos a los Quemaítocs."
  },
  {
    name: "Animita de Fructuoso Soto",
    city: "Puerto Montt",
    coordinates: [-72.4433, -41.3281],
    people: [
      {
        name: "Fructuoso Soto",
        birthPlace: "Puerto Montt",
        deathPlace: "Puerto Montt",
      }
    ],
    story: "Memorial dedicado a Fructuoso Soto."
  },
  {
    name: "Animita de Valeriano",
    city: "Chiloé",
    coordinates: [-73.8008, -42.5800],
    people: [
      {
        name: "Valeriano",
        birthPlace: "Chiloé",
        deathPlace: "Chiloé",
      }
    ],
    story: "En memoria de Valeriano."
  },
  {
    name: "Animita de El Indio Desconocido",
    city: "Punta Arenas",
    coordinates: [-70.3309, -53.1638],
    people: [
      {
        name: "Indio Desconocido",
        birthPlace: "Punta Arenas",
        deathPlace: "Punta Arenas",
      }
    ],
    story: "Recordamos al Indio Desconocido."
  }
]

async function main() {
  const hashedPassword = await bcrypt.hash('testpassword123', 10)
  const icarus = await prisma.user.upsert({
    where: { username: 'icarus' },
    update: {},
    create: {
      phone: '+56956784477',
      username: 'icarus',
      displayName: 'Felipe Mandiola',
      email: 'icarus@example.com',
    }
  })

  for (let index = 0; index < memorialsData.length; index++) {
    const memorialData = memorialsData[index]
    const existing = await prisma.memorial.findFirst({
      where: { name: memorialData.name }
    })

    if (existing) continue

    const memorial = await prisma.memorial.create({
      data: {
        name: memorialData.name,
        lat: memorialData.coordinates[1],
        lng: memorialData.coordinates[0],
        story: memorialData.story,
        isPublic: true,
        createdById: icarus.id,
      }
    })

    // Add memorial images (1-3 per memorial, cycling through default images)
    const numImages = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numImages; i++) {
      const imageUrl = defaultMemorialImages[(index + i) % defaultMemorialImages.length]
      await prisma.memorialImage.create({
        data: {
          memorialId: memorial.id,
          url: imageUrl,
        }
      })
    }

    for (const person of memorialData.people) {
      const personRecord = await prisma.person.create({
        data: {
          name: person.name,
          birthPlace: person.birthPlace,
          deathPlace: person.deathPlace,
        }
      })

      await prisma.memorialPerson.create({
        data: {
          memorialId: memorial.id,
          personId: personRecord.id,
        }
      })
    }
  }
}

main()
  .catch(() => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

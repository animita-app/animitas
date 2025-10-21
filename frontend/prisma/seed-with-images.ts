import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const memorialsWithImages = [
  {
    name: "Animita del Cabo Gómez",
    coordinates: [-70.2988, -18.4861],
    people: [{ name: "Cabo Gómez", birthPlace: "Arica", deathPlace: "Arica" }],
    story: "Memorial dedicado a Cabo Gómez, víctima de la injusticia.",
    images: [
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Hermógenes San Martín",
    coordinates: [-70.1425, -20.2208],
    people: [{ name: "Hermógenes San Martín", birthPlace: "Iquique", deathPlace: "Iquique" }],
    story: "Recordamos a Hermógenes San Martín.",
    images: [
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Evaristo Montt",
    coordinates: [-70.4025, -23.6345],
    people: [{ name: "Evaristo Montt", birthPlace: "Antofagasta", deathPlace: "Antofagasta" }],
    story: "Memorial para Evaristo Montt.",
    images: [
      'https://images.unsplash.com/photo-1585241307979-d19e1f836b57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514903991192-caa3b3b21b87?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Elvirita Guillén",
    coordinates: [-70.4050, -23.6360],
    people: [{ name: "Elvirita Guillén", birthPlace: "Antofagasta", deathPlace: "Antofagasta" }],
    story: "En memoria de Elvirita Guillén.",
    images: [
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525257450953-65ea266cacc0?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de las Adrianitas",
    coordinates: [-70.3344, -27.3627],
    people: [{ name: "Adriana", birthPlace: "Copiapó", deathPlace: "Copiapó" }],
    story: "Recordamos a las Adrianitas.",
    images: [
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de el Quisco",
    coordinates: [-71.3388, -29.9533],
    people: [{ name: "El Quisco", birthPlace: "Coquimbo", deathPlace: "Coquimbo" }],
    story: "Memorial dedicado al Quisco.",
    images: [
      'https://images.unsplash.com/photo-1500595046891-1dac0f82f0e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Luis Castillo",
    coordinates: [-71.1994, -30.6037],
    people: [{ name: "Luis Castillo", birthPlace: "Ovalle", deathPlace: "Ovalle" }],
    story: "En memoria de Luis Castillo.",
    images: [
      'https://images.unsplash.com/photo-1493514789991-586cb221d7d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496867594519-2c55fb83c665?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Emile Dubois",
    coordinates: [-71.6270, -33.0472],
    people: [{ name: "Emile Dubois", birthPlace: "Valparaíso", deathPlace: "Valparaíso" }],
    story: "Recordamos a Emile Dubois.",
    images: [
      'https://images.unsplash.com/photo-1504711331084-f26051221c3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de la calle Borja",
    coordinates: [-70.6694, -33.4372],
    people: [{ name: "Desconocido", birthPlace: "Santiago", deathPlace: "Santiago" }],
    story: "Animita ubicada en la calle Borja.",
    images: [
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504681869696-d977e3b33640?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    name: "Animita de Luis Mesa Bell",
    coordinates: [-70.6750, -33.4400],
    people: [{ name: "Luis Mesa Bell", birthPlace: "Santiago", deathPlace: "Santiago" }],
    story: "Memorial para Luis Mesa Bell.",
    images: [
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
    ]
  },
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

  for (const memorialData of memorialsWithImages) {
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

    for (const imageUrl of memorialData.images) {
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

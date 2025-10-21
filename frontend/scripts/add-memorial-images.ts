import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const memorialImages: Array<{ memorialName: string; imageUrl: string }> = [
  // Add your Cloudinary image URLs here
  // Example:
  // { memorialName: "Animita del Cabo Gómez", imageUrl: "https://res.cloudinary.com/..." },
  // { memorialName: "Animita de Hermógenes San Martín", imageUrl: "https://res.cloudinary.com/..." },
]

async function addMemorialImages() {
  for (const { memorialName, imageUrl } of memorialImages) {
    const memorial = await prisma.memorial.findFirst({
      where: { name: memorialName }
    })

    if (!memorial) {
      console.log(`❌ Memorial not found: ${memorialName}`)
      continue
    }

    await prisma.memorialImage.create({
      data: {
        memorialId: memorial.id,
        url: imageUrl
      }
    })

    console.log(`✅ Added image to: ${memorialName}`)
  }

  console.log('Done!')
}

addMemorialImages()
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

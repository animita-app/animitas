const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seed skipped - no data to seed')
}

main()
  .catch((error) => {
    console.error('Error during Prisma seed', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

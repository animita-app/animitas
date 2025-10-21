# Memorial Images & Seeding Guide

## Current Status ✅

- ✅ **33 Memorials seeded** from across Chile
- ✅ `/api/memorials` endpoint working
- ✅ `/api/users/icarus` endpoint working
- ✅ All memorials linked to "icarus" user (Felipe Mandiola)

## Memorial Data Seeded

All memorials have been created with:
- **Location data**: Latitude/Longitude coordinates
- **People data**: Names, birthplaces, deathplaces
- **Stories**: Brief descriptions for each memorial
- **Multiple people**: Some memorials (e.g., Cuadra y Osorio, Ferrada y Mardones) have multiple people attached

## How to Add Real Images from Cloudinary

### Option 1: Manual Upload & Update (Recommended for Testing)

1. **Upload images to Cloudinary**:
   - Go to https://cloudinary.com/console
   - Upload your memorial images
   - Copy the secure URL (e.g., `https://res.cloudinary.com/...`)

2. **Update memorial images in database**:
   ```bash
   # Option A: Use the MemorialImage model
   # Add an image to a memorial via Prisma:

   npx prisma studio  # Opens Prisma Studio UI
   # Navigate to memorial_images table
   # Add new row with memorial ID and image URL
   ```

3. **Or use the API** (if you create an endpoint):
   ```typescript
   // POST /api/memorials/:id/images
   await prisma.memorialImage.create({
     data: {
       memorialId: "memorial-id",
       url: "https://res.cloudinary.com/your-image-url"
     }
   })
   ```

### Option 2: Bulk Upload Script

Create a file at `scripts/seed-memorial-images.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const memorialImages = [
  {
    name: "Animita del Cabo Gómez",
    imageUrl: "https://res.cloudinary.com/your-image-1"
  },
  // ... more memorials
]

async function main() {
  for (const memorial of memorialImages) {
    const mem = await prisma.memorial.findFirst({
      where: { name: memorial.name }
    })

    if (mem) {
      await prisma.memorialImage.create({
        data: {
          memorialId: mem.id,
          url: memorial.imageUrl
        }
      })
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
```

Run it with:
```bash
npx ts-node scripts/seed-memorial-images.ts
```

### Option 3: Upload via Frontend Component

The `uploadToCloudinary` function already exists in `lib/cloudinary.ts`. You can:

1. Create an admin page to upload images
2. Link images to memorials
3. Save the URLs to the database

## Database Schema

### Memorial Structure
```typescript
{
  id: string
  name: string
  lat: number
  lng: number
  story: string (nullable)
  isPublic: boolean
  createdById: string
  people: MemorialPerson[]
  images: MemorialImage[]
  candles: Candle[]
  testimonies: Testimony[]
}
```

### MemorialImage Structure
```typescript
{
  id: string
  memorialId: string
  url: string  // Cloudinary URL
  uploadedAt: DateTime
}
```

### People Attached to Memorials
```typescript
{
  memorialId: string
  personId: string
  person: {
    id: string
    name: string
    image: string (nullable)
    birthDate: DateTime (nullable)
    deathDate: DateTime (nullable)
    birthPlace: string (nullable)
    deathPlace: string (nullable)
  }
}
```

## API Endpoints

### Get All Memorials
```
GET /api/memorials
Response: { memorials: Memorial[] }
```

### Get Single Memorial
```
GET /api/memorials/:id
```

### Get User by Username
```
GET /api/users/icarus
Response: {
  id: string
  username: string
  displayName: string
  image: string (nullable)
  stats: {
    memorialsCreated: 33
    listsCreated: 0
    candles: 0
  }
}
```

## Next Steps

1. **Upload memorial images to Cloudinary**
2. **Add images to MemorialImage table** using one of the methods above
3. **Update Person images** (optional, for primary person photos)
4. **Test map display** to see all memorials with their images

## Example: Seed Memorial with Images

```typescript
const memorial = await prisma.memorial.create({
  data: {
    name: "Animita Example",
    lat: -33.4372,
    lng: -70.6694,
    story: "Memorial story",
    isPublic: true,
    createdById: icarusId,
    images: {
      create: [
        { url: "https://res.cloudinary.com/image1" },
        { url: "https://res.cloudinary.com/image2" }
      ]
    }
  }
})
```

## Cloudinary Setup

If you haven't configured Cloudinary yet:

1. Sign up at https://cloudinary.com
2. Get your API credentials from the console
3. Add to `.env`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
   ```

The upload function in `lib/cloudinary.ts` handles the rest!

# Memorial Slug System

## Overview

Memorial slugs are URL-friendly identifiers for memorials. They are auto-generated based on the memorial name and person name, ensuring readability and uniqueness.

## Slug Format

Slugs follow the pattern: `{memorial-name}-{person-name}`

### Examples

1. **With custom memorial name and person name:**
   - Memorial name: `Animita de María`
   - Person name: `Juan Pérez`
   - **Slug:** `animita-de-maria-juan-perez`

2. **Without custom memorial name (defaults to "animita"):**
   - Memorial name: `Animita` (empty or default)
   - Person name: `Rosa García`
   - **Slug:** `animita-rosa-garcia`

3. **With special characters:**
   - Memorial name: `🕯️ María's Place`
   - Person name: `José María`
   - **Slug:** `marias-place-jose-maria` (special chars removed)

4. **Duplicate slugs (auto-incrementing):**
   - First memorial: `animita-juan-perez`
   - Second memorial: `animita-juan-perez-1`
   - Third memorial: `animita-juan-perez-2`

## Slug Generation Process

1. **Sanitize inputs:**
   - Convert to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keeping only alphanumeric and hyphens)
   - Remove leading/trailing hyphens

2. **Combine parts:**
   - Memorial slug + Person slug = Base slug
   - Fallback to `animita-memorial` if both parts are empty

3. **Ensure uniqueness:**
   - Check if slug already exists in database
   - If exists, append counter (e.g., `-1`, `-2`, etc.)
   - Increment counter until unique slug is found

## Implementation

### Utility Functions

Located in `lib/slug.ts`:

```typescript
// Sanitize a single text part
sanitizeSlugPart(text: string): string

// Create slug from multiple parts
createSlugFromParts(...parts: string[]): string

// Generate full URL preview for memorial (frontend use)
generateMemorialSlugPreview(memorialName: string, personName: string): string
// Returns: "/animita/animita-de-maria-juan-perez"
```

### Backend - Creating a Memorial

```typescript
// app/api/memorials/create/route.ts
import { createSlugFromParts } from '@/lib/slug'

const baseSlug = createSlugFromParts(memorialName, personName)
const slug = await generateUniqueSlug(baseSlug)

const memorial = await prisma.memorial.create({
  data: {
    slug,
    // ... other fields
  }
})
```

### Frontend - Preview Slug While Editing

```typescript
// Show live slug preview in form
import { generateMemorialSlugPreview } from '@/lib/slug'

const memorialName = 'Animita de María' // or custom name from form
const personName = 'Juan Pérez'

const previewUrl = generateMemorialSlugPreview(memorialName, personName)
// Result: "/animita/animita-de-maria-juan-perez"

// Display to user:
<p>Tu animita será accesible en: <strong>{previewUrl}</strong></p>
```

## URL Usage

Memorials are accessed via their slug in the URL pattern:

```
/animita/{slug}

Examples:
- /animita/animita-de-maria-juan-perez
- /animita/animita-rosa-garcia
- /animita/animita-juan-perez-1
```

## Reusability

The slug utilities are exported from `lib/slug.ts` and can be used in:

- Memorial creation endpoints
- Memorial update/edit endpoints
- URL generation utilities
- SEO optimization
- Search and filtering features

### Import Example

```typescript
import { createSlugFromParts, sanitizeSlugPart } from '@/lib/slug'
```

## Best Practices

1. **Always use `createSlugFromParts()`** - Ensures consistent sanitization
2. **Check for uniqueness** - Always verify slug doesn't exist before saving
3. **Handle edge cases** - Empty strings, special characters, etc.
4. **Never modify manually** - Slugs should be auto-generated only
5. **Preserve for history** - Don't change existing slugs (would break URLs)

## Performance Considerations

- Slug generation happens at memorial creation time (one-time cost)
- Slug lookups use database index on the `slug` field
- Uniqueness check is O(n) worst-case, but rare in practice

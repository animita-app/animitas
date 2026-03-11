import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const VALID_CATEGORIES = [
  'Tradiciones y expresiones orales',
  'Artes del espectáculo',
  'Usos sociales, rituales y actos festivos',
  'Conocimientos sobre la naturaleza',
  'Artesanías',
]

const VALID_KINDS = [
  'Lenguas',
  'Lugares míticos',
  'Gastronomía',
  'Teatro',
  'Danza',
  'Música',
  'Santuarios',
  'Peregrinaciones',
  'Fiestas',
  'Funerales',
  'Rituales',
  'Agricultura',
  'Agua',
  'Territorio',
  'Arquitectura',
  'Cerámica',
  'Textilería',
]

async function cleanup() {
  console.log('Starting heritage taxonomy cleanup...\n')

  try {
    const { data: currentCategories } = await supabase
      .from('heritage_categories')
      .select('*')
    console.log('Current categories:', currentCategories?.length)

    const { data: currentKinds } = await supabase
      .from('heritage_kinds')
      .select('*')
    console.log('Current kinds:', currentKinds?.length)

    const { data: sitesWithCategories } = await supabase
      .from('heritage_site_categories')
      .select('*')
    console.log('Current site-category relationships:', sitesWithCategories?.length)

    const categoriesToDelete = currentCategories?.filter(
      (cat) => !VALID_CATEGORIES.includes(cat.name)
    ) || []

    const kindsToDelete = currentKinds?.filter(
      (kind) => !VALID_KINDS.includes(kind.name)
    ) || []

    console.log('\nCategories to delete:', categoriesToDelete.length)
    categoriesToDelete.forEach((cat) => console.log(`  - ${cat.name}`))

    console.log('\nKinds to delete:', kindsToDelete.length)
    kindsToDelete.forEach((kind) => console.log(`  - ${kind.name}`))

    if (categoriesToDelete.length === 0 && kindsToDelete.length === 0) {
      console.log('\n✓ No cleanup needed!')
      return
    }

    console.log('\n--- Starting deletion ---\n')

    const kindsToDeleteIds = kindsToDelete.map((k) => k.id)

    if (kindsToDeleteIds.length > 0) {
      console.log('Deleting kinds...')
      const { error: kindsError } = await supabase
        .from('heritage_kinds')
        .delete()
        .in('id', kindsToDeleteIds)

      if (kindsError) throw kindsError
      console.log(`✓ Deleted ${kindsToDeleteIds.length} kinds\n`)
    }

    const categoriesToDeleteIds = categoriesToDelete.map((c) => c.id)

    if (categoriesToDeleteIds.length > 0) {
      console.log('Deleting site-category relationships...')
      const { error: siteCatError } = await supabase
        .from('heritage_site_categories')
        .delete()
        .in('category_id', categoriesToDeleteIds)

      if (siteCatError) throw siteCatError
      console.log(`✓ Deleted site-category relationships\n`)

      console.log('Deleting categories...')
      const { error: catError } = await supabase
        .from('heritage_categories')
        .delete()
        .in('id', categoriesToDeleteIds)

      if (catError) throw catError
      console.log(`✓ Deleted ${categoriesToDeleteIds.length} categories\n`)
    }

    console.log('--- Cleanup complete ---')
    console.log('\nFinal state:')

    const { data: finalCategories } = await supabase
      .from('heritage_categories')
      .select('*')
    console.log(`Categories: ${finalCategories?.length}`)
    finalCategories?.forEach((cat) => console.log(`  - ${cat.name}`))

    const { data: finalKinds } = await supabase
      .from('heritage_kinds')
      .select('*')
    console.log(`\nKinds: ${finalKinds?.length}`)
    finalKinds?.forEach((kind) => console.log(`  - ${kind.name}`))
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  }
}

cleanup()

-- Cleanup Heritage Taxonomy
-- This script safely deletes invalid categories and kinds while respecting foreign key constraints

-- Step 1: Update heritage_sites with invalid kinds to use "Santuarios"
UPDATE heritage_sites
SET kind_id = (SELECT id FROM heritage_kinds WHERE name = 'Santuarios' LIMIT 1)
WHERE kind_id IN (
  SELECT id FROM heritage_kinds
  WHERE name NOT IN (
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
    'Textilería'
  )
);

-- Step 1b: Link those updated sites to "Usos sociales, rituales y actos festivos" category
INSERT INTO heritage_site_categories (site_id, category_id)
SELECT DISTINCT hs.id, hc.id
FROM heritage_sites hs
JOIN heritage_kinds hk ON hs.kind_id = hk.id
JOIN heritage_categories hc ON hc.name = 'Usos sociales, rituales y actos festivos'
WHERE hk.name = 'Santuarios'
AND NOT EXISTS (
  SELECT 1 FROM heritage_site_categories hsc
  WHERE hsc.site_id = hs.id AND hsc.category_id = hc.id
);

-- Step 2: Delete kinds that are NOT in the valid list
DELETE FROM heritage_kinds
WHERE name NOT IN (
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
  'Textilería'
);

-- Step 3: Get IDs of categories to delete
-- (Categories NOT in the valid list)
WITH categories_to_delete AS (
  SELECT id FROM heritage_categories
  WHERE name NOT IN (
    'Tradiciones y expresiones orales',
    'Artes del espectáculo',
    'Usos sociales, rituales y actos festivos',
    'Conocimientos sobre la naturaleza',
    'Artesanías'
  )
)
-- Step 4: Delete site-category relationships for those categories
DELETE FROM heritage_site_categories
WHERE category_id IN (SELECT id FROM categories_to_delete);

-- Step 5: Delete the invalid categories
DELETE FROM heritage_categories
WHERE name NOT IN (
  'Tradiciones y expresiones orales',
  'Artes del espectáculo',
  'Usos sociales, rituales y actos festivos',
  'Conocimientos sobre la naturaleza',
  'Artesanías'
);

-- Verify the cleanup
SELECT
  'Categories' as type,
  COUNT(*) as count
FROM heritage_categories
UNION ALL
SELECT
  'Kinds' as type,
  COUNT(*) as count
FROM heritage_kinds
UNION ALL
SELECT
  'Site-Category Relationships' as type,
  COUNT(*) as count
FROM heritage_site_categories;

-- Show remaining data
SELECT 'Categories:' as section;
SELECT id, name, slug FROM heritage_categories ORDER BY name;

SELECT 'Kinds:' as section;
SELECT id, name, slug FROM heritage_kinds ORDER BY name;

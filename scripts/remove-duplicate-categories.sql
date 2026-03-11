-- Find duplicate categories
SELECT name, COUNT(*) as count, array_agg(id) as ids
FROM heritage_categories
GROUP BY name
HAVING COUNT(*) > 1;

-- Step 1: Delete kinds that reference the duplicate category
DELETE FROM heritage_kinds
WHERE category_id IN (
  SELECT id FROM heritage_categories
  WHERE name = 'Tradiciones y expresiones orales'
  AND id NOT IN (
    SELECT id FROM heritage_categories
    WHERE name = 'Tradiciones y expresiones orales'
    ORDER BY id
    LIMIT 1
  )
);

-- Step 2: Delete site-category relationships for the duplicate
DELETE FROM heritage_site_categories
WHERE category_id IN (
  SELECT id FROM heritage_categories
  WHERE name = 'Tradiciones y expresiones orales'
  AND id NOT IN (
    SELECT id FROM heritage_categories
    WHERE name = 'Tradiciones y expresiones orales'
    ORDER BY id
    LIMIT 1
  )
);

-- Step 3: Delete duplicate "Tradiciones y expresiones orales" entries
-- Keep the first one, delete the rest
DELETE FROM heritage_categories
WHERE name = 'Tradiciones y expresiones orales'
AND id NOT IN (
  SELECT id FROM heritage_categories
  WHERE name = 'Tradiciones y expresiones orales'
  ORDER BY id
  LIMIT 1
);

-- Verify all duplicates are gone
SELECT name, COUNT(*) as count
FROM heritage_categories
GROUP BY name
ORDER BY name;

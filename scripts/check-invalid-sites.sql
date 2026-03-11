-- Check which sites have invalid kinds
SELECT
  hs.id,
  hs.name,
  hk.name as kind_name,
  hk.id as kind_id
FROM heritage_sites hs
LEFT JOIN heritage_kinds hk ON hs.kind_id = hk.id
WHERE hk.name NOT IN (
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
) OR hk.id IS NULL
ORDER BY hs.name;

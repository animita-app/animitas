ALTER TABLE insight_presets ADD COLUMN insight_category TEXT;

UPDATE insight_presets SET insight_category = 'patrimonial' WHERE category IN ('Material', 'Tipo de evento', 'Condiciones');
UPDATE insight_presets SET insight_category = 'spiritual' WHERE category IN ('Tipo de evento', 'Condiciones');
UPDATE insight_presets SET insight_category = 'memorial' WHERE category IN ('Rol de víctima', 'Condiciones', 'Tipo de evento');

ALTER TABLE insight_presets ALTER COLUMN insight_category SET NOT NULL;

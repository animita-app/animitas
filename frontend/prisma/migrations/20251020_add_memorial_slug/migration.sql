ALTER TABLE "memorials" ADD COLUMN "slug" TEXT;

UPDATE "memorials" SET "slug" = LOWER(REPLACE(REGEXP_REPLACE(TRIM("name"), '\s+', '-', 'g'), '--', '-')) || '-' || SUBSTRING("id", 1, 8);

ALTER TABLE "memorials" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "memorials" ADD CONSTRAINT "memorials_slug_key" UNIQUE ("slug");

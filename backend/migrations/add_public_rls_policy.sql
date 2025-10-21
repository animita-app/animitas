-- Add public RLS policies to allow reading public memorials and related data
-- This allows the app to query memorials and related tables

-- Enable RLS on tables if not already enabled
ALTER TABLE memorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE memorial_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read public memorials
CREATE POLICY "Allow public read on public memorials"
  ON memorials
  FOR SELECT
  USING (isPublic = true OR auth.role() = 'service_role');

-- Allow service_role to read all memorials
CREATE POLICY "Allow service_role full access to memorials"
  ON memorials
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Allow anyone to read memorial images for public memorials
CREATE POLICY "Allow public read on memorial images"
  ON memorial_images
  FOR SELECT
  USING (
    memorialId IN (
      SELECT id FROM memorials WHERE isPublic = true
    )
    OR auth.role() = 'service_role'
  );

-- Allow anyone to read memorial people associations
CREATE POLICY "Allow public read on memorial_people"
  ON memorial_people
  FOR SELECT
  USING (
    memorialId IN (
      SELECT id FROM memorials WHERE isPublic = true
    )
    OR auth.role() = 'service_role'
  );

-- Allow anyone to read people data
CREATE POLICY "Allow public read on people"
  ON people
  FOR SELECT
  USING (true);

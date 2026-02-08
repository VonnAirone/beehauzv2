-- Add coordinates for existing properties in Sibalom, Antique
-- These are approximate coordinates based on the addresses

-- Update properties with approximate coordinates in Sibalom area
-- Note: These are placeholder coordinates. Replace with actual coordinates once available.

-- Sibalom, Antique center coordinates
UPDATE public.properties
SET
  latitude = 10.8009 + (random() * 0.01 - 0.005),
  longitude = 122.0119 + (random() * 0.01 - 0.005),
  geocoded_at = now()
WHERE latitude IS NULL OR longitude IS NULL;

-- You can add specific coordinates for known properties:
-- UPDATE public.properties
-- SET latitude = 10.8009, longitude = 122.0119, geocoded_at = now()
-- WHERE name = 'Property Name';

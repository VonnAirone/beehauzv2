-- Add latitude and longitude columns to properties table for map functionality

alter table public.properties
  add column if not exists latitude numeric(10, 8),
  add column if not exists longitude numeric(11, 8),
  add column if not exists geocoded_at timestamptz,
  add column if not exists description text;

-- Add index for spatial queries (optional but recommended for performance)
create index if not exists properties_coordinates_idx
  on public.properties (latitude, longitude)
  where latitude is not null and longitude is not null;

-- Add comment
comment on column public.properties.latitude is 'Latitude coordinate for map display';
comment on column public.properties.longitude is 'Longitude coordinate for map display';
comment on column public.properties.geocoded_at is 'Timestamp when address was last geocoded';
comment on column public.properties.description is 'Property description for listings';

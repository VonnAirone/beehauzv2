-- Add image_url and price columns to properties table for map markers

alter table public.properties
  add column if not exists image_url text,
  add column if not exists price numeric(10, 2);

-- Add comments
comment on column public.properties.image_url is 'Primary image URL for property display on map and listings';
comment on column public.properties.price is 'Monthly rent price for the property';

-- Add university accreditation flag to properties
ALTER TABLE public.properties
ADD COLUMN is_accredited BOOLEAN NOT NULL DEFAULT false;

-- Update properties.owner_id to link to the owner's profile
-- This connects each property to its owner's user account

UPDATE public.properties p
SET owner_id = o.user_id
FROM public.owners o
WHERE o.property_id = p.id
  AND o.user_id IS NOT NULL;

-- Add Nate & Nicky Boarding House property and link to Nicolas Baylon

DO $$
DECLARE
  owner_user_id uuid;
  new_prop_id uuid;
BEGIN
  -- Find Nicolas Baylon's user_id from profiles
  SELECT id INTO owner_user_id 
  FROM public.profiles 
  WHERE email = 'nicolas.baylon@beehauz.com' 
  LIMIT 1;
  
  IF owner_user_id IS NULL THEN
    RAISE NOTICE 'Owner Nicolas Baylon not found';
    RETURN;
  END IF;
  
  -- Check if property already exists
  IF EXISTS (SELECT 1 FROM public.properties WHERE name = 'Nate & Nicky Boarding House') THEN
    RAISE NOTICE 'Property Nate & Nicky Boarding House already exists';
    RETURN;
  END IF;
  
  -- Create the property
  INSERT INTO public.properties (id, owner_id, name, address, created_at)
  VALUES (
    gen_random_uuid(),
    owner_user_id,
    'Nate & Nicky Boarding House',
    'Purok 7, Brgy District 1, Sibalom, Antique',
    now()
  )
  RETURNING id INTO new_prop_id;
  
  -- Create owners entry linking to this property
  INSERT INTO public.owners (user_id, property_id, full_name, phone)
  VALUES (owner_user_id, new_prop_id, 'Nicolas Baylon', '09759082447')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Created Nate & Nicky Boarding House and linked to Nicolas Baylon';
END $$;

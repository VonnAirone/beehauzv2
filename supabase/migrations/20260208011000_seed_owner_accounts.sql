-- Seed owner accounts with their details from sample boarding houses data
-- Creates: auth.users → profiles (user_type='owner') → owners table
-- Default password for all owners: Owner123!

-- Insert owner data: auth.users → profiles → owners
DO $$
DECLARE
  owner_password text := 'Owner123!';
  owner_record record;
  new_user_id uuid;
  prop_id uuid;
  existing_id uuid;
  hashed_password text;
BEGIN
  -- Hash password using extensions schema (Supabase's pgcrypto location)
  hashed_password := extensions.crypt(owner_password, extensions.gen_salt('bf'));
  -- Create a temporary table with owner data
  CREATE TEMP TABLE temp_owners (
    full_name text,
    phone text,
    email text,
    property_name text
  ) ON COMMIT DROP;

  -- Insert owner data
  INSERT INTO temp_owners (full_name, phone, email, property_name) VALUES
    ('Grace L Enson', '09977314896', 'grace.enson@beehauz.com', 'A and G Boarding House'),
    ('Nanette M. Marcaliñas', '09753051353', 'nanette.marcalinas@beehauz.com', 'Nanette''s Boarding House'),
    ('Franz Josef Lotilla', '09217203551', 'franz.lotilla@beehauz.com', 'Ligaya''s Dormitory'),
    ('Elcar Management', '09369221419', 'elcar.management@beehauz.com', 'Elcar Boarding House'),
    ('Mary Pearl Questorio', '09279247024', 'marypearl.questorio@beehauz.com', 'Casa de Lex Boarding House'),
    ('Nicolas Baylon', '09759082447', 'nicolas.baylon@beehauz.com', 'Nate & Nicky Boarding House'),
    ('Pette Galicia', '09661569857', 'pette.galicia@beehauz.com', 'Galician360 Dormitory'),
    ('Nemie Morales', '09956532349', 'nemie.morales@beehauz.com', 'LMN Boarding House'),
    ('Boyet Panaligan', '09560158468', 'boyet.panaligan@beehauz.com', 'Panaligan Boarding House'),
    ('Lenie A. Aduana', '09063952638', 'lenie.aduana@beehauz.com', 'Brickstone Hostel'),
    ('Jessie Baldone', '09277628998', 'jessie.baldone@beehauz.com', 'J and A Boarding House'),
    ('Rezaleen Magbanua', '09692440957', 'rezaleen.magbanua@beehauz.com', 'CDK Apartment Rentals'),
    ('Roderick Moreno', '09085356977', 'roderick.moreno@beehauz.com', 'R & L Boarding House'),
    ('Seymon Bolivar', '09055919859', 'seymon.bolivar@beehauz.com', 'Israelohim Dormitory');

  -- Loop through each owner and create full account chain
  FOR owner_record IN SELECT * FROM temp_owners LOOP
    -- Find the property_id by name
    SELECT id INTO prop_id FROM public.properties WHERE name = owner_record.property_name LIMIT 1;
    
    IF prop_id IS NULL THEN
      RAISE NOTICE 'Property not found: %', owner_record.property_name;
      CONTINUE;
    END IF;
    
    -- Check if user already exists
    SELECT id INTO existing_id FROM auth.users WHERE email = owner_record.email;
    
    IF existing_id IS NULL THEN
      new_user_id := gen_random_uuid();
      
      -- 1. Create auth.users entry
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        owner_record.email,
        hashed_password,
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object(
          'user_type', 'owner',
          'full_name', owner_record.full_name,
          'phone', owner_record.phone
        ),
        now(),
        now()
      );

      -- Create auth.identities entry
      INSERT INTO auth.identities (
        id,
        user_id,
        provider,
        provider_id,
        identity_data,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        new_user_id,
        'email',
        new_user_id::text,
        jsonb_build_object('sub', new_user_id::text, 'email', owner_record.email),
        now(),
        now()
      );
      
      -- 2. Create profile entry with user_type = 'owner'
      INSERT INTO public.profiles (id, email, full_name, user_type, phone)
      VALUES (new_user_id, owner_record.email, owner_record.full_name, 'owner', owner_record.phone)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          user_type = 'owner',
          phone = EXCLUDED.phone;
      
      -- 3. Create owners entry linked to profile and property
      INSERT INTO public.owners (user_id, property_id, full_name, phone)
      VALUES (new_user_id, prop_id, owner_record.full_name, owner_record.phone);
      
      RAISE NOTICE 'Created owner account: % (%)', owner_record.full_name, owner_record.email;
    ELSE
      -- User exists, update profile and create owners entry if needed
      INSERT INTO public.profiles (id, email, full_name, user_type, phone)
      VALUES (existing_id, owner_record.email, owner_record.full_name, 'owner', owner_record.phone)
      ON CONFLICT (id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          user_type = 'owner',
          phone = EXCLUDED.phone;
      
      -- Create owners entry if not exists
      IF NOT EXISTS (SELECT 1 FROM public.owners WHERE property_id = prop_id) THEN
        INSERT INTO public.owners (user_id, property_id, full_name, phone)
        VALUES (existing_id, prop_id, owner_record.full_name, owner_record.phone);
      END IF;
      
      RAISE NOTICE 'Owner already exists, updated: % (%)', owner_record.full_name, owner_record.email;
    END IF;
  END LOOP;
END $$;

-- Summary: Created 14 owner accounts
-- Chain: auth.users → profiles (user_type='owner') → owners
-- Default password: Owner123!

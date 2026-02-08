-- Seed an admin auth user and profile (development only)

alter table public.profiles
  drop constraint if exists profiles_user_type_check;

alter table public.profiles
  add constraint profiles_user_type_check
  check (user_type in ('tenant', 'owner', 'admin'));

DO $$
DECLARE
  admin_email text := 'admin@beehauz.com';
  admin_password text := 'Admin123!';
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;

  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"user_type":"admin","full_name":"System Administrator"}',
      now(),
      now()
    );

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
      admin_id,
      'email',
      admin_id::text,
      jsonb_build_object('sub', admin_id::text, 'email', admin_email),
      now(),
      now()
    );
  END IF;

  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (admin_id, admin_email, 'System Administrator', 'admin')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      user_type = 'admin';
END $$;

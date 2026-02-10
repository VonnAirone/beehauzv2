import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OWNER_PASSWORD = 'Owner123!';

async function main() {
  // Fetch all owner profiles (these survive the auth deletion)
  const { data: owners, error: fetchError } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone')
    .eq('user_type', 'owner');

  if (fetchError) {
    console.error('Failed to fetch owner profiles:', fetchError.message);
    process.exit(1);
  }

  if (!owners.length) {
    console.log('No owner profiles found. Nothing to do.');
    return;
  }

  console.log(`Found ${owners.length} owner profiles to recreate auth for\n`);

  let success = 0;
  let failed = 0;

  for (const owner of owners) {
    console.log(`--- ${owner.full_name} (${owner.email}) ---`);

    try {
      // Create auth user via Admin API with the same UUID
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        id: owner.id,
        email: owner.email,
        password: OWNER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: owner.full_name,
          user_type: 'owner',
          phone: owner.phone,
        },
      });

      if (createError) {
        console.error(`  FAIL: ${createError.message}`);
        failed++;
        continue;
      }

      console.log(`  Created auth user (id: ${newUser.user.id})`);

      // Verify profile linkage
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('id', owner.id)
        .single();

      if (!profile) {
        // Profile was cascade-deleted, restore it
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: owner.id,
            email: owner.email,
            full_name: owner.full_name,
            user_type: 'owner',
            phone: owner.phone,
          }, { onConflict: 'id' });

        if (profileErr) {
          console.error(`  WARNING: failed to restore profile: ${profileErr.message}`);
        } else {
          console.log('  Restored profile');
        }
      } else {
        console.log('  Profile intact');
      }

      // Verify owners table linkage
      const { data: ownerEntry } = await supabase
        .from('owners')
        .select('id, property_id')
        .eq('user_id', owner.id);

      if (ownerEntry?.length) {
        console.log(`  Owners entries intact (${ownerEntry.length} properties)`);
      } else {
        console.log('  WARNING: no owners entries found — property linkage may need manual fix');
      }

      success++;
      console.log('  OK\n');
    } catch (err) {
      console.error(`  UNEXPECTED ERROR: ${err.message}\n`);
      failed++;
    }
  }

  console.log('========================================');
  console.log(`Done. ${success} succeeded, ${failed} failed.`);
  console.log(`Owner login password: ${OWNER_PASSWORD}`);
}

main();

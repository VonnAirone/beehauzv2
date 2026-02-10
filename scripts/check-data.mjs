import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: profiles, count: profileCount } = await supabase
    .from('profiles').select('*', { count: 'exact' });
  console.log(`Profiles: ${profileCount}`, profiles?.map(p => `${p.email} (${p.user_type})`));

  const { data: properties, count: propCount } = await supabase
    .from('properties').select('id, name, owner_id', { count: 'exact' });
  console.log(`\nProperties: ${propCount}`, properties?.map(p => `${p.name} (owner: ${p.owner_id})`));

  const { data: owners, count: ownerCount } = await supabase
    .from('owners').select('*', { count: 'exact' });
  console.log(`\nOwners table: ${ownerCount}`, owners?.map(o => `${o.full_name} (user: ${o.user_id}, prop: ${o.property_id})`));
}

main();

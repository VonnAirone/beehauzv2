import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const OWNER_PASSWORD = 'Owner123!';

// All owner data from the original seed migration
const OWNERS = [
  { fullName: 'Grace L Enson', phone: '09977314896', email: 'grace.enson@beehauz.com', property: 'A and G Boarding House', address: 'Purok 7, Mang Juan, District 1, Sibalom, Antique' },
  { fullName: 'Nanette M. Marcaliñas', phone: '09753051353', email: 'nanette.marcalinas@beehauz.com', property: "Nanette's Boarding House", address: 'Purok 6, District 1, Sibalom, Antique' },
  { fullName: 'Franz Josef Lotilla', phone: '09217203551', email: 'franz.lotilla@beehauz.com', property: "Ligaya's Dormitory", address: 'Purok 5 (Boulevard), District 1, Sibalom, Antique' },
  { fullName: 'Elcar Management', phone: '09369221419', email: 'elcar.management@beehauz.com', property: 'Elcar Boarding House', address: 'S. Lotilla St., along U.A. Main Street, Sibalom, Antique' },
  { fullName: 'Mary Pearl Questorio', phone: '09279247024', email: 'marypearl.questorio@beehauz.com', property: 'Casa de Lex Boarding House', address: 'Villa Caridad Compound, District 1, Sibalom, Antique' },
  { fullName: 'Nicolas Baylon', phone: '09759082447', email: 'nicolas.baylon@beehauz.com', property: 'Nate & Nicky Boarding House', address: 'Purok 7, Brgy District 1, Sibalom, Antique' },
  { fullName: 'Pette Galicia', phone: '09661569857', email: 'pette.galicia@beehauz.com', property: 'Galician360 Dormitory', address: 'Purok 5, District 1 (Boulevard Near New Road), Sibalom, Antique' },
  { fullName: 'Nemie Morales', phone: '09956532349', email: 'nemie.morales@beehauz.com', property: 'LMN Boarding House', address: 'Villa Caridad Compound, Purok 7, District 1, Sibalom, Antique' },
  { fullName: 'Boyet Panaligan', phone: '09560158468', email: 'boyet.panaligan@beehauz.com', property: 'Panaligan Boarding House', address: 'Hoffelinia Subdivision, near Gate 1 and Gate 3, District 1, Sibalom, Antique' },
  { fullName: 'Lenie A. Aduana', phone: '09063952638', email: 'lenie.aduana@beehauz.com', property: 'Brickstone Hostel', address: 'Lotilla St., District 1, Sibalom, Antique' },
  { fullName: 'Jessie Baldone', phone: '09277628998', email: 'jessie.baldone@beehauz.com', property: 'J and A Boarding House', address: 'Purok 5, District 1 (Boulevard Area), Sibalom, Antique' },
  { fullName: 'Rezaleen Magbanua', phone: '09692440957', email: 'rezaleen.magbanua@beehauz.com', property: 'CDK Apartment Rentals', address: 'Near Fill Oil Gasoline Station, Purok 7, District 1, Sibalom, Antique' },
  { fullName: 'Roderick Moreno', phone: '09085356977', email: 'roderick.moreno@beehauz.com', property: 'R & L Boarding House', address: 'Purok 7, Brgy District 1, Sibalom, Antique' },
  { fullName: 'Seymon Bolivar', phone: '09055919859', email: 'seymon.bolivar@beehauz.com', property: 'Israelohim Dormitory', address: 'Purok 5, District 1, Sibalom, Antique' },
];

// Deterministic coordinates around Sibalom, Antique (10.8009, 122.0119)
function getCoords(index) {
  const offsets = [
    [0.0021, -0.0018], [-0.0015, 0.0023], [0.0035, 0.0011],
    [-0.0028, -0.0032], [0.0008, 0.0041], [-0.0042, 0.0005],
    [0.0019, -0.0039], [-0.0011, 0.0027], [0.0044, -0.0008],
    [-0.0033, 0.0016], [0.0006, -0.0044], [0.0029, 0.0033],
    [-0.0022, -0.0014], [0.0038, 0.0020],
  ];
  const [latOff, lonOff] = offsets[index % offsets.length];
  return {
    latitude: 10.8009 + latOff,
    longitude: 122.0119 + lonOff,
  };
}

async function main() {
  console.log('=== Rebuilding owner data ===\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < OWNERS.length; i++) {
    const owner = OWNERS[i];
    console.log(`[${i + 1}/${OWNERS.length}] ${owner.fullName} (${owner.email})`);

    try {
      // Step 1: Create auth user via Admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: owner.email,
        password: OWNER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: owner.fullName,
          user_type: 'owner',
          phone: owner.phone,
        },
      });

      if (authError) {
        console.error(`  FAIL auth: ${authError.message}`);
        failed++;
        continue;
      }

      const userId = authData.user.id;
      console.log(`  Auth user created (${userId})`);

      // Step 2: Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: owner.email,
          full_name: owner.fullName,
          user_type: 'owner',
          phone: owner.phone,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error(`  FAIL profile: ${profileError.message}`);
        failed++;
        continue;
      }
      console.log('  Profile created');

      // Step 3: Create property
      const coords = getCoords(i);
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .insert({
          owner_id: userId,
          name: owner.property,
          address: owner.address,
          latitude: coords.latitude,
          longitude: coords.longitude,
          geocoded_at: new Date().toISOString(),
          is_accredited: false,
        })
        .select('id')
        .single();

      if (propError) {
        console.error(`  FAIL property: ${propError.message}`);
        failed++;
        continue;
      }
      console.log(`  Property created: ${owner.property} (${propData.id})`);

      // Step 4: Create owners entry
      const { error: ownerError } = await supabase
        .from('owners')
        .insert({
          user_id: userId,
          property_id: propData.id,
          full_name: owner.fullName,
          phone: owner.phone,
        });

      if (ownerError) {
        console.error(`  FAIL owners entry: ${ownerError.message}`);
        failed++;
        continue;
      }
      console.log('  Owners entry created');

      success++;
      console.log('  OK\n');
    } catch (err) {
      console.error(`  UNEXPECTED: ${err.message}\n`);
      failed++;
    }
  }

  console.log('========================================');
  console.log(`Done. ${success} succeeded, ${failed} failed out of ${OWNERS.length}.`);
  console.log(`Owner login password: ${OWNER_PASSWORD}`);

  // Final verification
  const { count: profileCount } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'owner');
  const { count: propCount } = await supabase
    .from('properties').select('*', { count: 'exact', head: true });
  const { count: ownerCount } = await supabase
    .from('owners').select('*', { count: 'exact', head: true });

  console.log(`\nVerification: ${profileCount} owner profiles, ${propCount} properties, ${ownerCount} owners entries`);
}

main();

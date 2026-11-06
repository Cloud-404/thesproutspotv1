const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const env = {};
dotenv.split('\n').forEach(line => {
  const c = line.trim();
  if (c && !c.startsWith('#')) {
    const idx = c.indexOf('=');
    if (idx !== -1) env[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
  }
});

const { createClient } = require('@supabase/supabase-js');
const adminClient = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);
const client = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function verifyAll() {
  console.log("=================================================");
  console.log("THE SPROUTS SPOT — POST-FIX VERIFICATION TEST");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(title, condition, details = "") {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title} ${details ? "- " + details : ""}`);
    }
  }

  // 1. Admin Authentication Test
  console.log("1. Testing Admin Authentication (Username: 'admin')...");
  const { data: adminProf } = await adminClient
    .from('profiles')
    .select('*')
    .eq('username', 'admin')
    .single();

  assert("Admin profile found in database", adminProf && adminProf.role === 'admin');

  const { data: adminAuth, error: aErr } = await client.auth.signInWithPassword({
    email: adminProf.email,
    password: "Admin@Sprouts2026",
  });
  assert("Admin logs in successfully with Admin@Sprouts2026", !aErr && adminAuth?.user !== null, aErr?.message);

  // 2. Delivery Partner Authentication & Role Test
  console.log("\n2. Testing Delivery Partner (Username: 'raju_delivery')...");
  const { data: delivProf } = await adminClient
    .from('profiles')
    .select('*')
    .eq('username', 'raju_delivery')
    .single();

  assert("Delivery partner profile found", delivProf && delivProf.role === 'delivery');

  const { data: delivAuth, error: dErr } = await client.auth.signInWithPassword({
    email: delivProf.email,
    password: "Raju@Delivery2026",
  });
  assert("Delivery partner logs in successfully", !dErr && delivAuth?.user !== null, dErr?.message);
  assert("Delivery partner role is 'delivery' (triggers /delivery redirect)", delivProf.role === 'delivery');

  // 3. Customer Authentication & Role Test
  console.log("\n3. Testing Customer Authentication (Username: 'priya_sharma')...");
  const { data: custProf } = await adminClient
    .from('profiles')
    .select('*')
    .eq('username', 'priya_sharma')
    .single();

  assert("Customer profile found", custProf && custProf.role === 'customer');

  const { data: custAuth, error: cErr } = await client.auth.signInWithPassword({
    email: custProf.email,
    password: "Priya@Customer2026",
  });
  assert("Customer logs in successfully", !cErr && custAuth?.user !== null, cErr?.message);

  // 4. Store Settings in Supabase
  console.log("\n4. Checking Store Settings in Supabase...");
  const { data: storeSettings, error: sErr } = await adminClient
    .from('store_settings')
    .select('*')
    .eq('id', 'store-main')
    .single();

  assert("Store settings fetched", !sErr && storeSettings !== null);
  assert(
    "Kitchen address is Nimbahera, Rajasthan",
    storeSettings?.kitchen_address === "Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan, India.",
    `Got: ${storeSettings?.kitchen_address}`
  );
  assert(
    "Kitchen phone is +91 7878794401",
    storeSettings?.business_phone === "+91 7878794401",
    `Got: ${storeSettings?.business_phone}`
  );
  assert(
    "WhatsApp number is 917878794401",
    storeSettings?.whatsapp_number === "917878794401",
    `Got: ${storeSettings?.whatsapp_number}`
  );
  assert(
    "Serviceable areas include Nimbahera localities",
    storeSettings?.serviceable_areas?.includes("Maheshwari Mohalla") &&
    storeSettings?.serviceable_areas?.includes("Station Road")
  );

  console.log("\n=================================================");
  console.log(`VERIFICATION SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("=================================================");

  if (passed === total) {
    console.log("🎉 ALL PRODUCTION CHECKS COMPLETED SUCCESSFULLY!");
  } else {
    process.exit(1);
  }
}

verifyAll().catch(e => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});


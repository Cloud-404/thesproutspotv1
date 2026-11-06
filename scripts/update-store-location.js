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

async function updateStoreSettingsInSupabase() {
  console.log("Updating store_settings in Supabase for Nimbahera, Rajasthan...");

  const payload = {
    kitchen_address: "Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan, India.",
    business_phone: "+91 7878794401",
    whatsapp_number: "917878794401",
    serviceable_areas: [
      "Maheshwari Mohalla",
      "Near Lakhara Gali",
      "Station Road",
      "Mandi Road",
      "Jawahar Nagar",
      "Adarsh Nagar",
      "Kailash Nagar",
      "Bus Stand Area"
    ],
    updated_at: new Date().toISOString()
  };

  const { data, error } = await adminClient
    .from('store_settings')
    .update(payload)
    .eq('id', 'store-main')
    .select();

  if (error) {
    console.error("Error updating store_settings:", error);
  } else {
    console.log("SUCCESS! store_settings updated:", JSON.stringify(data, null, 2));
  }
}

updateStoreSettingsInSupabase().catch(console.error);


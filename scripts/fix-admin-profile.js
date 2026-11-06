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

async function fixAdminProfile() {
  console.log("Restoring admin profile email to 'admin@sproutsspot.com'...");
  const { data, error } = await adminClient
    .from('profiles')
    .update({ email: 'admin@sproutsspot.com' })
    .eq('username', 'admin')
    .select();

  if (error) {
    console.error("Error updating admin profile:", error);
  } else {
    console.log("Admin profile updated successfully:", data);
  }
}

fixAdminProfile().catch(console.error);


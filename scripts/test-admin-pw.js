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
const client = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function testPasswords() {
  const passwordsToTest = [
    "Admin@Sprouts2026",
    "admin@123",
    "Admin@123",
    "admin123",
    "Admin123",
    "admin",
    "Admin",
    "Priya@Customer2026"
  ];

  for (const pw of passwordsToTest) {
    const { data, error } = await client.auth.signInWithPassword({
      email: "admin@sproutsspot.com",
      password: pw,
    });
    if (!error && data.user) {
      console.log(`FOUND WORKING PASSWORD for admin@sproutsspot.com: "${pw}"`);
      return;
    } else {
      console.log(`Tested "${pw}": ${error.message}`);
    }
  }
}

testPasswords().catch(console.error);


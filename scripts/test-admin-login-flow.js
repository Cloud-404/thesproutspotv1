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

async function testAdminLoginFlow() {
  console.log("Simulating Login API with username 'admin' and password 'Admin@Sprouts2026'...");

  // 1. Resolve username in profiles
  const { data: profile, error: pErr } = await adminClient
    .from('profiles')
    .select('id, username, name, email, phone, role, is_active')
    .eq('username', 'admin')
    .maybeSingle();

  if (pErr || !profile) {
    console.error("Profile not found:", pErr);
    return;
  }
  console.log("Found profile:", profile);

  // 2. Fetch auth user
  const { data: authUserObj } = await adminClient.auth.admin.getUserById(profile.id);
  const targetEmail = authUserObj?.user?.email || profile.email;
  console.log("Resolved target email:", targetEmail);

  // 3. Sign in with password
  const { data: authData, error: authErr } = await client.auth.signInWithPassword({
    email: targetEmail,
    password: "Admin@Sprouts2026",
  });

  if (authErr) {
    console.error("Sign-in error:", authErr.message);
  } else {
    console.log("SUCCESS! Admin signed in. Session user ID:", authData.user.id);
    console.log("User role:", profile.role);
  }
}

testAdminLoginFlow().catch(console.error);


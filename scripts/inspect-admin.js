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
const adminClient = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false },
});
const client = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function inspectAdmin() {
  console.log("=== INSPECTING AUTH USERS ===");
  const { data: authUsers, error: aErr } = await adminClient.auth.admin.listUsers();
  if (aErr) console.error("listUsers error:", aErr);
  else {
    authUsers.users.forEach(u => {
      console.log(`Auth user: id=${u.id}, email=${u.email}, email_confirmed_at=${u.email_confirmed_at}, banned_until=${u.banned_until}`);
      console.log(`  user_metadata:`, JSON.stringify(u.user_metadata));
      console.log(`  app_metadata:`, JSON.stringify(u.app_metadata));
    });
  }

  console.log("\n=== INSPECTING PROFILES TABLE ===");
  const { data: profiles, error: pErr } = await adminClient.from('profiles').select('*');
  if (pErr) console.error("profiles error:", pErr);
  else {
    profiles.forEach(p => {
      console.log(`Profile: id=${p.id}, username=${p.username}, email=${p.email}, role=${p.role}, is_active=${p.is_active}`);
    });
  }

  console.log("\n=== TESTING ADMIN SIGN-IN WITH 'Admin@Sprouts2026' ===");
  const adminProfile = profiles?.find(p => p.role === 'admin' || p.username === 'admin');
  if (adminProfile) {
    const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
      email: adminProfile.email,
      password: "Admin@Sprouts2026",
    });
    if (signInErr) {
      console.log("Sign-in with Admin@Sprouts2026 failed:", signInErr.message, signInErr.status);
    } else {
      console.log("Sign-in with Admin@Sprouts2026 SUCCEEDED! User ID:", signInData.user.id);
    }
  }
}

inspectAdmin().catch(console.error);


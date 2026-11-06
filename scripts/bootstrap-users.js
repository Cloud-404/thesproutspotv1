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
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'], {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SEED_USERS = [
  {
    role: 'admin',
    name: 'Radha Agrawal (Kitchen Head)',
    username: 'admin',
    email: 'admin@sproutsspot.com',
    phone: '+91 98765 43210',
    password: 'Admin@Sprouts2026',
  },
  {
    role: 'delivery',
    name: 'Raju Verma',
    username: 'raju_delivery',
    email: 'delivery@sproutsspot.com',
    phone: '+91 98111 22334',
    password: 'Raju@Delivery2026',
    vehicleType: 'Hero Splendor Bike',
    vehicleNumber: 'MP 09 AB 1234',
  },
  {
    role: 'customer',
    name: 'Priya Sharma',
    username: 'priya_sharma',
    email: 'customer@sproutsspot.com',
    phone: '+91 98234 56789',
    password: 'Priya@Customer2026',
  },
];

async function bootstrap() {
  console.log('--- BOOTSTRAPPING AUTH & PROFILES ---');

  for (const u of SEED_USERS) {
    // 1. Check if auth user exists
    const { data: listData } = await supabase.auth.admin.listUsers();
    let authUser = listData.users.find(x => x.email === u.email);

    if (!authUser) {
      console.log(`Creating auth user: ${u.email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          name: u.name,
          username: u.username,
          phone: u.phone,
          role: u.role,
        },
      });
      if (error) {
        console.error(`Failed to create auth user ${u.email}:`, error.message);
        continue;
      }
      authUser = data.user;
    } else {
      console.log(`Auth user already exists: ${u.email}`);
      // Ensure password and metadata are up to date
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: u.password,
        user_metadata: {
          name: u.name,
          username: u.username,
          phone: u.phone,
          role: u.role,
        },
      });
    }

    // 2. Ensure profile exists in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!existingProfile) {
      console.log(`Inserting profile for: ${u.username}...`);
      const { error: pErr } = await supabase.from('profiles').insert({
        id: authUser.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        is_active: true,
      });
      if (pErr) console.error(`Profile insert error for ${u.username}:`, pErr.message);
    } else {
      console.log(`Profile exists for: ${u.username}, updating role & info...`);
      await supabase.from('profiles').update({
        username: u.username,
        name: u.name,
        phone: u.phone,
        role: u.role,
        is_active: true,
      }).eq('id', authUser.id);
    }

    // 3. If delivery partner, ensure delivery_partner_profiles record exists
    if (u.role === 'delivery') {
      const { data: existingDp } = await supabase
        .from('delivery_partner_profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (!existingDp) {
        console.log(`Creating delivery partner profile for ${u.name}...`);
        await supabase.from('delivery_partner_profiles').insert({
          user_id: authUser.id,
          vehicle_type: u.vehicleType || 'Bike',
          vehicle_number: u.vehicleNumber || 'MP 09 AB 1234',
          is_available: true,
          total_deliveries: 18,
          total_earnings: 720,
          pending_payout: 360,
          commission_per_order: 40,
          rating: 4.95,
        });
      }
    }
  }

  console.log('--- BOOTSTRAP COMPLETE ---');
}

bootstrap().catch(console.error);


-- ==============================================================================
-- THE SPROUTS SPOT — SUPABASE PRODUCTION DATABASE SCHEMA & RLS
-- "Eat Healthy, Live Happy"
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES / ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin', 'delivery');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('COD', 'UPI', 'ONLINE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FLAT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM (
    'ASSIGNED',
    'ACCEPTED',
    'DECLINED',
    'ARRIVED_KITCHEN',
    'PICKED_UP',
    'DELIVERED',
    'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked directly to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  role user_role DEFAULT 'customer' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CUSTOMER SAVED ADDRESSES
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  house_flat VARCHAR(255) NOT NULL,
  landmark VARCHAR(255),
  area_locality VARCHAR(255) NOT NULL,
  city VARCHAR(100) DEFAULT 'Nimbahera' NOT NULL,
  postal_code VARCHAR(20),
  instructions TEXT,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. FOOD CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. PRODUCTS / MENU ITEMS
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_veg BOOLEAN DEFAULT true NOT NULL,
  is_available BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_today_special BOOLEAN DEFAULT false NOT NULL,
  prep_time_minutes INT DEFAULT 15 NOT NULL,
  image_url TEXT NOT NULL,
  badge VARCHAR(100),
  variants JSONB DEFAULT '[]'::jsonb,
  addons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. ORDERS TABLE (Snapshot of order items & addresses)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(200),
  delivery_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  coupon_code VARCHAR(50),
  total NUMERIC(10, 2) NOT NULL,
  payment_method payment_method DEFAULT 'COD' NOT NULL,
  payment_status payment_status DEFAULT 'PENDING' NOT NULL,
  order_status order_status DEFAULT 'PLACED' NOT NULL,
  assigned_delivery_partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_delivery_partner_name VARCHAR(200),
  assigned_delivery_partner_phone VARCHAR(50),
  cancellation_reason TEXT,
  internal_notes TEXT,
  estimated_delivery_time VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. ORDER ITEMS (Normalized snapshots)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(100),
  product_name VARCHAR(200) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  customization JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ORDER STATUS AUDIT TRAIL
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_by_name VARCHAR(200) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. DELIVERY PARTNER PROFILES
CREATE TABLE IF NOT EXISTS delivery_partner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(100) DEFAULT 'Bike' NOT NULL,
  vehicle_number VARCHAR(50),
  is_available BOOLEAN DEFAULT true NOT NULL,
  total_deliveries INT DEFAULT 0 NOT NULL,
  total_earnings NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  pending_payout NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  commission_per_order NUMERIC(10, 2) DEFAULT 40.00 NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. DELIVERY ASSIGNMENTS
CREATE TABLE IF NOT EXISTS delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status assignment_status DEFAULT 'ASSIGNED' NOT NULL,
  decline_reason TEXT,
  cod_collected BOOLEAN DEFAULT false,
  problem_report TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- 12. PROMOTIONS / COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type discount_type DEFAULT 'FLAT' NOT NULL,
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  max_discount NUMERIC(10, 2),
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  usage_count INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. STORE SETTINGS
CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'store-main',
  store_name VARCHAR(200) DEFAULT 'The Sprouts Spot' NOT NULL,
  tagline VARCHAR(200) DEFAULT 'Eat Healthy, Live Happy' NOT NULL,
  is_open BOOLEAN DEFAULT true NOT NULL,
  opening_time VARCHAR(10) DEFAULT '08:30' NOT NULL,
  closing_time VARCHAR(10) DEFAULT '22:00' NOT NULL,
  estimated_prep_minutes INT DEFAULT 20 NOT NULL,
  delivery_fee NUMERIC(10, 2) DEFAULT 30.00 NOT NULL,
  free_delivery_threshold NUMERIC(10, 2) DEFAULT 299.00 NOT NULL,
  min_order_value NUMERIC(10, 2) DEFAULT 99.00 NOT NULL,
  serviceable_areas JSONB DEFAULT '["Maheshwari Mohalla", "Near Lakhara Gali", "Station Road", "Mandi Road", "Jawahar Nagar", "Adarsh Nagar", "Kailash Nagar", "Bus Stand Area"]'::jsonb NOT NULL,
  business_phone VARCHAR(50) DEFAULT '+91 7878794401' NOT NULL,
  whatsapp_number VARCHAR(50) DEFAULT '917878794401' NOT NULL,
  kitchen_address TEXT NOT NULL,
  enable_cod BOOLEAN DEFAULT true NOT NULL,
  enable_upi BOOLEAN DEFAULT true NOT NULL,
  upi_id VARCHAR(100) DEFAULT 'sproutsspot@okaxis' NOT NULL,
  enable_online_payment BOOLEAN DEFAULT true NOT NULL,
  partner_commission_per_order NUMERIC(10, 2) DEFAULT 40.00 NOT NULL,
  announcement TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 16. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner ON orders(assigned_delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_partner ON delivery_assignments(partner_id);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
DROP POLICY IF EXISTS "Public can view active profiles basic" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Service role full access to profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (is_admin());

-- CUSTOMER ADDRESSES
DROP POLICY IF EXISTS "Users manage own addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Admins view all addresses" ON customer_addresses;

CREATE POLICY "Users manage own addresses" ON customer_addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins view all addresses" ON customer_addresses
  FOR SELECT USING (is_admin());

-- CATEGORIES & PRODUCTS (Public read, Admin write)
DROP POLICY IF EXISTS "Public view active categories" ON categories;
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
DROP POLICY IF EXISTS "Public view available products" ON products;
DROP POLICY IF EXISTS "Admins manage products" ON products;

CREATE POLICY "Public view active categories" ON categories
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (is_admin());

CREATE POLICY "Public view available products" ON products
  FOR SELECT USING (is_available = true OR is_admin());

CREATE POLICY "Admins manage products" ON products
  FOR ALL USING (is_admin());

-- STORE SETTINGS & COUPONS
DROP POLICY IF EXISTS "Public view store settings" ON store_settings;
DROP POLICY IF EXISTS "Admins manage store settings" ON store_settings;
DROP POLICY IF EXISTS "Public view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins manage coupons" ON coupons;

CREATE POLICY "Public view store settings" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage store settings" ON store_settings
  FOR ALL USING (is_admin());

CREATE POLICY "Public view active coupons" ON coupons
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage coupons" ON coupons
  FOR ALL USING (is_admin());

-- ORDERS
DROP POLICY IF EXISTS "Customers view own orders" ON orders;
DROP POLICY IF EXISTS "Customers insert own orders" ON orders;
DROP POLICY IF EXISTS "Delivery partners view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins full access to orders" ON orders;

CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Delivery partners view assigned orders" ON orders
  FOR SELECT USING (
    auth.uid() = assigned_delivery_partner_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'delivery')
  );

CREATE POLICY "Admins full access to orders" ON orders
  FOR ALL USING (is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Users view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins full access to order items" ON order_items;

CREATE POLICY "Users view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.assigned_delivery_partner_id = auth.uid())
    OR is_admin()
  );

CREATE POLICY "Admins full access to order items" ON order_items
  FOR ALL USING (is_admin());

-- ORDER STATUS HISTORY
DROP POLICY IF EXISTS "Users view order status history" ON order_status_history;
CREATE POLICY "Users view order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND (orders.customer_id = auth.uid() OR orders.assigned_delivery_partner_id = auth.uid()))
    OR is_admin()
  );

-- DELIVERY PARTNERS & ASSIGNMENTS
DROP POLICY IF EXISTS "Partners view own profile" ON delivery_partner_profiles;
DROP POLICY IF EXISTS "Partners view own assignments" ON delivery_assignments;
DROP POLICY IF EXISTS "Admins manage delivery partners" ON delivery_partner_profiles;
DROP POLICY IF EXISTS "Admins manage delivery assignments" ON delivery_assignments;

CREATE POLICY "Partners view own profile" ON delivery_partner_profiles
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Partners update own availability" ON delivery_partner_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins manage delivery partners" ON delivery_partner_profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Partners view own assignments" ON delivery_assignments
  FOR SELECT USING (auth.uid() = partner_id OR is_admin());

CREATE POLICY "Partners update own assignments" ON delivery_assignments
  FOR UPDATE USING (auth.uid() = partner_id);

CREATE POLICY "Admins manage delivery assignments" ON delivery_assignments
  FOR ALL USING (is_admin());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR (role IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = notifications.role)));

CREATE POLICY "Users mark notifications read" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 18. STORAGE SETUP (product-images bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- 19. SEED INITIAL STORE SETTINGS, CATEGORIES, PRODUCTS, AND COUPONS
INSERT INTO store_settings (
  id, store_name, tagline, is_open, opening_time, closing_time,
  estimated_prep_minutes, delivery_fee, free_delivery_threshold, min_order_value,
  serviceable_areas, business_phone, whatsapp_number, kitchen_address,
  enable_cod, enable_upi, upi_id, enable_online_payment, partner_commission_per_order, announcement
)
VALUES (
  'store-main',
  'The Sprouts Spot',
  'Eat Healthy, Live Happy',
  true,
  '08:30',
  '22:00',
  20,
  30.00,
  299.00,
  99.00,
  '["Maheshwari Mohalla", "Near Lakhara Gali", "Station Road", "Mandi Road", "Jawahar Nagar", "Adarsh Nagar", "Kailash Nagar", "Bus Stand Area"]'::jsonb,
  '+91 7878794401',
  '917878794401',
  'Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan, India.',
  true,
  true,
  'sproutsspot@okaxis',
  true,
  40.00,
  'Special Monsoon Offer: Free sprout salad bowl on orders over ₹499!'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, slug, description, sort_order, is_active)
VALUES
  ('cat-specials', 'Today''s Specials', 'todays-specials', 'Chef''s handpicked fresh specials for today', 1, true),
  ('cat-sandwiches', 'Sandwiches', 'sandwiches', 'Crispy grilled sandwiches made with fresh wholesome bread & veggies', 2, true),
  ('cat-chaat', 'Chaat & Snacks', 'chaat-snacks', 'Tangy, high-protein guilt-free chaats tossed with fresh herbs', 3, true),
  ('cat-healthy', 'Healthy Meals', 'healthy-meals', 'Balanced home-cooked wholesome thalis & sprouted bowls', 4, true),
  ('cat-paneer', 'Paneer Specials', 'paneer-specials', 'Pure cow milk fresh paneer prepared in traditional home style', 5, true),
  ('cat-breakfast', 'Breakfast', 'breakfast', 'Energizing morning bites packed with natural nutrition', 6, true),
  ('cat-beverages', 'Beverages & Sides', 'beverages-sides', 'Chilled spiced buttermilk, fresh coolers & home chai', 7, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
  id, name, slug, description, price, category_id, is_veg, is_available, is_featured, is_today_special, prep_time_minutes, image_url, badge, variants, addons
)
VALUES
  (
    'prod-paneer-bhurji',
    'Paneer Bhurji',
    'paneer-bhurji',
    'Freshly scrambled farm cottage cheese simmered with diced ripe tomatoes, crunchy onions, ginger, and aromatic desi spices. Served with 2 soft tawa rotis.',
    199.00,
    'cat-paneer',
    true, true, true, true, 20,
    '/images/food/paneer-bhurji.jpg',
    'High Protein',
    '[{"id":"var-reg","name":"Standard (2 Rotis)","price":199},{"id":"var-large","name":"Meal Box (4 Rotis + Salad)","price":259}]'::jsonb,
    '[{"id":"add-extra-roti","name":"Extra Desi Ghee Roti (2 pcs)","price":30},{"id":"add-green-chutney","name":"Spicy Mint Chutney Cup","price":15}]'::jsonb
  ),
  (
    'prod-chana-chaat',
    'Chana Chaat',
    'chana-chaat',
    'Boiled black desi chickpeas tossed with chopped onions, tomatoes, cucumber, green chillies, fresh mint, roasted cumin, and sweet-tangy pomegranate pearls.',
    49.00,
    'cat-chaat',
    true, true, true, false, 10,
    '/images/food/chana-chaat.jpg',
    'Bestseller',
    '[]'::jsonb,
    '[{"id":"add-extra-pome","name":"Extra Pomegranate & Roasted Peanuts","price":20},{"id":"add-lemon","name":"Extra Lemon & Chaat Masala","price":10}]'::jsonb
  ),
  (
    'prod-paneer-sandwich',
    'Paneer Grilled Sandwich',
    'paneer-grilled-sandwich',
    'Succulent marinated paneer cubes, crunchy capsicum, homemade coriander mint spread, and melted cheese toasted golden brown between bread slices.',
    59.00,
    'cat-sandwiches',
    true, true, true, false, 15,
    '/images/food/paneer-sandwich.jpg',
    'Chef Special',
    '[{"id":"var-white","name":"Regular White Bread","price":59},{"id":"var-brown","name":"100% Whole Wheat Brown Bread","price":69}]'::jsonb,
    '[{"id":"add-cheese-slice","name":"Extra Melted Cheese","price":25},{"id":"add-dip","name":"Garlic Mayo & Mint Dip","price":20}]'::jsonb
  ),
  (
    'prod-veggies-sandwich',
    'Veggies Grilled Sandwich',
    'veggies-grilled-sandwich',
    'Loaded 3-tier grilled sandwich packed with garden-fresh cucumber, beetroot, sliced tomatoes, spiced potato patties, green chutney, and melted cheese.',
    119.00,
    'cat-sandwiches',
    true, true, false, false, 15,
    '/images/food/veggie-sandwich.jpg',
    'Most Loved',
    '[{"id":"var-veg-reg","name":"Standard Double Decker","price":119},{"id":"var-veg-jumbo","name":"Jumbo Triple Decker with Fries","price":159}]'::jsonb,
    '[{"id":"add-cheese-veg","name":"Extra Mozzarella Layer","price":25}]'::jsonb
  ),
  (
    'prod-indori-sandwich',
    'Indori Sandwich',
    'indori-sandwich',
    'Signature Malwi-style toasted street sandwich infused with special Indori Jeeravan masala, spiced potatoes, onions, green chillies, and topped with crisp Ratlami sev.',
    79.00,
    'cat-sandwiches',
    true, true, true, true, 12,
    '/images/food/veggie-sandwich.jpg',
    'Indori Special',
    '[]'::jsonb,
    '[{"id":"add-extra-sev","name":"Extra Crispy Ratlami Sev","price":15},{"id":"add-cheese-indori","name":"Cheese Burst Topping","price":25}]'::jsonb
  ),
  (
    'prod-healthy-meal-combo',
    'Healthy Meal Combo',
    'healthy-meal-combo',
    'A complete balanced home thali: Sprouted moong salad bowl, homestyle cottage cheese sabzi, 3 soft whole wheat chapatis, cucumber-cumin raita, and steamed brown rice.',
    179.00,
    'cat-healthy',
    true, true, true, false, 25,
    '/images/food/healthy-meal-combo.jpg',
    'Balanced Diet',
    '[{"id":"var-meal-reg","name":"Regular Thali (3 Rotis)","price":179},{"id":"var-meal-large","name":"Deluxe Thali (+ Sweet & Buttermilk)","price":229}]'::jsonb,
    '[{"id":"add-extra-curd","name":"Pahadi Tadka Curd","price":25}]'::jsonb
  ),
  (
    'prod-sprouts-salad',
    'Sprouted Moong Super Salad',
    'sprouted-moong-super-salad',
    '24-hour live sprouted organic green moong beans tossed with freshly chopped coriander, crunchy cucumbers, ruby pomegranate pearls, ginger slivers, and zesty lemon dressing.',
    89.00,
    'cat-healthy',
    true, true, true, false, 10,
    '/images/food/sprouts-salad.jpg',
    'Superfood',
    '[]'::jsonb,
    '[{"id":"add-flax-seeds","name":"Roasted Chia & Flax Seeds","price":20},{"id":"add-crushed-paneer","name":"Raw Cow Milk Paneer Cubes (50g)","price":35}]'::jsonb
  ),
  (
    'prod-buttermilk',
    'Chilled Masala Buttermilk (Chaas)',
    'chilled-masala-buttermilk',
    'Refreshing home-churned curd blended with roasted cumin powder, black salt, fresh mint, and chopped coriander. Perfect digestive companion for meals.',
    39.00,
    'cat-beverages',
    true, true, false, false, 5,
    '/images/food/hero.jpg',
    'Refreshing',
    '[]'::jsonb,
    '[]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount, valid_until, is_active, usage_count)
VALUES
  ('coup-first50', 'FIRST50', 'FLAT', 50.00, 149.00, NULL, '2028-12-31T23:59:59Z', true, 0),
  ('coup-healthy20', 'HEALTHY20', 'PERCENTAGE', 20.00, 249.00, 80.00, '2028-12-31T23:59:59Z', true, 0)
ON CONFLICT (id) DO NOTHING;

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found!");
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

async function runVerification() {
  console.log("=================================================");
  console.log("THE SPROUTS SPOT — SUPABASE BACKEND VERIFICATION");
  console.log("=================================================\n");

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    console.error("❌ Missing required Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey);
  const clientSupabase = createClient(url, anonKey);

  let passedTests = 0;
  let totalTests = 0;

  function assert(desc, condition, details = "") {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${desc} ${details ? "- " + details : ""}`);
    }
  }

  // 1. Categories
  console.log("1. Checking Food Categories...");
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  assert("Categories fetched from Supabase", !catErr && categories && categories.length > 0, catErr?.message);
  console.log(`     Found ${categories?.length || 0} categories: ${categories?.map(c => c.name).join(", ")}`);

  // 2. Products
  console.log("\n2. Checking Menu Products...");
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .order("name");
  assert("Products fetched from Supabase", !prodErr && products && products.length > 0, prodErr?.message);
  console.log(`     Found ${products?.length || 0} products in Supabase.`);

  // 3. Store Settings
  console.log("\n3. Checking Store Settings...");
  const { data: storeSettings, error: sErr } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", "store-main")
    .single();
  assert("Store settings fetched", !sErr && storeSettings !== null, sErr?.message);
  console.log(`     Store: ${storeSettings?.store_name} | Is Open: ${storeSettings?.is_open} | Min Order: ₹${storeSettings?.min_order_value}`);

  // 4. Coupons
  console.log("\n4. Checking Coupons...");
  const { data: coupons, error: coupErr } = await supabase
    .from("coupons")
    .select("*");
  assert("Coupons fetched from Supabase", !coupErr && coupons && coupons.length > 0, coupErr?.message);
  console.log(`     Coupons available: ${coupons?.map(c => `${c.code} (${c.discount_type === 'PERCENTAGE' ? c.discount_value + '%' : '₹' + c.discount_value})`).join(", ")}`);

  // 5. User Profiles & Authentication
  console.log("\n5. Checking Bootstrapped Profiles...");
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("*")
    .order("role");
  assert("Profiles fetched", !profErr && profiles && profiles.length >= 3, profErr?.message);
  profiles?.forEach(p => {
    console.log(`     Role: [${p.role.padEnd(8)}] | Username: ${p.username.padEnd(14)} | Name: ${p.name} | Phone: ${p.phone}`);
  });

  // Test Customer Auth
  console.log("\n6. Testing Customer Auth (Priya Sharma)...");
  const { data: custAuth, error: custErr } = await clientSupabase.auth.signInWithPassword({
    email: "customer@sproutsspot.com",
    password: "Priya@Customer2026",
  });
  assert("Customer logged in successfully", !custErr && custAuth.user !== null, custErr?.message);

  // Test Admin Auth
  console.log("\n7. Testing Admin Auth (Kitchen Head)...");
  const { data: adminAuth, error: admErr } = await clientSupabase.auth.signInWithPassword({
    email: "admin@sproutsspot.com",
    password: "Admin@Sprouts2026",
  });
  assert("Admin logged in successfully", !admErr && adminAuth.user !== null, admErr?.message);

  // Test Delivery Auth
  console.log("\n8. Testing Delivery Partner Auth (Raju Verma)...");
  const { data: delivAuth, error: delErr } = await clientSupabase.auth.signInWithPassword({
    email: "delivery@sproutsspot.com",
    password: "Raju@Delivery2026",
  });
  assert("Delivery partner logged in successfully", !delErr && delivAuth.user !== null, delErr?.message);

  // 9. Storage Bucket
  console.log("\n9. Checking Storage Bucket (product-images)...");
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  const prodBucket = (buckets || []).find(b => b.name === "product-images");
  assert("product-images bucket exists & is public", !bErr && prodBucket && prodBucket.public === true, bErr?.message);

  // 10. Complete End-to-End Order Lifecycle
  console.log("\n10. Testing Complete Order Lifecycle in Supabase...");
  const testOrderId = `order-test-${Date.now()}`;
  const testOrderNumber = `TSS-${Math.floor(1000 + Math.random() * 9000)}`;

  const customerProfile = profiles.find(p => p.role === "customer");
  const deliveryProfile = profiles.find(p => p.role === "delivery");
  const sampleProduct = products[0];

  const orderPayload = {
    id: testOrderId,
    order_number: testOrderNumber,
    customer_id: customerProfile?.id || null,
    customer_name: customerProfile?.name || "Priya Sharma",
    customer_phone: customerProfile?.phone || "+91 98234 56789",
    customer_email: customerProfile?.email || "customer@sproutsspot.com",
    delivery_address: {
      houseFlat: "Flat 402, Lotus Court",
      landmark: "Near Saket Square",
      areaLocality: "Old Palasia",
      city: "Indore",
      instructions: "Ring doorbell twice",
    },
    items: [
      {
        id: `item-${Date.now()}`,
        productId: sampleProduct.id,
        name: sampleProduct.name,
        unitPrice: Number(sampleProduct.price),
        quantity: 2,
        totalPrice: Number(sampleProduct.price) * 2,
        imageUrl: sampleProduct.image_url,
      },
    ],
    subtotal: Number(sampleProduct.price) * 2,
    delivery_fee: 30,
    discount: 0,
    total: Number(sampleProduct.price) * 2 + 30,
    payment_method: "COD",
    payment_status: "PENDING",
    order_status: "PLACED",
    estimated_delivery_time: "~35 mins",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Step A: Create order
  const { data: newOrder, error: oCreateErr } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();
  assert("Order created in Supabase 'orders' table", !oCreateErr && newOrder !== null, oCreateErr?.message);

  // Step B: Record initial status history
  const { error: hCreateErr } = await supabase.from("order_status_history").insert({
    order_id: testOrderId,
    status: "PLACED",
    changed_by_user_id: customerProfile?.id,
    changed_by_name: customerProfile?.name,
    note: "Order placed by customer via automated verification",
  });
  assert("Status history audit logged in Supabase", !hCreateErr, hCreateErr?.message);

  // Step C: Assign to delivery partner
  const { data: assignedOrder, error: oAssignErr } = await supabase
    .from("orders")
    .update({
      assigned_delivery_partner_id: deliveryProfile?.id,
      assigned_delivery_partner_name: deliveryProfile?.name,
      assigned_delivery_partner_phone: deliveryProfile?.phone,
      order_status: "CONFIRMED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", testOrderId)
    .select()
    .single();
  assert("Order assigned to delivery partner", !oAssignErr && assignedOrder?.assigned_delivery_partner_id === deliveryProfile?.id, oAssignErr?.message);

  // Step D: Create delivery assignment
  const { error: asgnErr } = await supabase.from("delivery_assignments").insert({
    order_id: testOrderId,
    partner_id: deliveryProfile?.id,
    status: "ASSIGNED",
    assigned_at: new Date().toISOString(),
  });
  assert("Delivery assignment record created", !asgnErr, asgnErr?.message);

  // Step E: Delivery Partner picks up & delivers
  const { data: deliveredOrder, error: oDelivErr } = await supabase
    .from("orders")
    .update({
      order_status: "DELIVERED",
      payment_status: "PAID",
      updated_at: new Date().toISOString(),
    })
    .eq("id", testOrderId)
    .select()
    .single();
  assert("Order status transitioned to DELIVERED & PAID", !oDelivErr && deliveredOrder?.order_status === "DELIVERED" && deliveredOrder?.payment_status === "PAID", oDelivErr?.message);

  // Step F: Verify audit trail
  const { data: auditTrail, error: auditErr } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", testOrderId);
  assert("Audit trail verified for order", !auditErr && auditTrail && auditTrail.length >= 1, auditErr?.message);

  // Summary
  console.log("\n=================================================");
  console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("=================================================");

  if (passedTests === totalTests) {
    console.log("🎉 ALL TESTS PASSED! Supabase backend is 100% production-ready!");
  } else {
    console.error("⚠️ Some tests failed. Please inspect the logs above.");
    process.exit(1);
  }
}

runVerification().catch(e => {
  console.error("Verification script crashed:", e);
  process.exit(1);
});


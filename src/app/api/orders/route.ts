import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderItem } from "@/lib/types";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOrderRow(o: any) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    customerId: o.customer_id || "",
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email || undefined,
    deliveryAddress: o.delivery_address,
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: Number(o.subtotal || 0),
    deliveryFee: Number(o.delivery_fee || 0),
    discount: Number(o.discount || 0),
    couponCode: o.coupon_code || undefined,
    total: Number(o.total || 0),
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    assignedDeliveryPartnerId: o.assigned_delivery_partner_id || undefined,
    assignedDeliveryPartnerName: o.assigned_delivery_partner_name || undefined,
    assignedDeliveryPartnerPhone: o.assigned_delivery_partner_phone || undefined,
    cancellationReason: o.cancellation_reason || undefined,
    internalNotes: o.internal_notes || undefined,
    estimatedDeliveryTime: o.estimated_delivery_time || undefined,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const orderNumber = searchParams.get("orderNumber");

    const adminClient = createAdminClient();
    let query = adminClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!session) {
      if (orderNumber) {
        query = query.eq("order_number", orderNumber.trim().toUpperCase());
        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json((data || []).map(mapOrderRow));
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "customer") {
      // Allow finding by customerId or matching phone number
      query = query.or(`customer_id.eq.${session.userId},customer_phone.eq.${session.phone}`);
    } else if (session.role === "delivery") {
      query = query.eq("assigned_delivery_partner_id", session.userId);
    }
    // Admin sees all

    if (statusFilter && statusFilter !== "ALL") {
      query = query.eq("order_status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(mapOrderRow));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching orders";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      cartItems,
      couponCode,
      paymentMethod = "COD",
    } = body;

    // 1. Validation
    if (!customerName || !customerPhone || !deliveryAddress) {
      return NextResponse.json(
        { error: "Customer name, phone, and delivery address are required." },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cannot place order with an empty cart." },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 2. Fetch store settings
    const { data: storeSettings, error: sErr } = await adminClient
      .from("store_settings")
      .select("*")
      .eq("id", "store-main")
      .maybeSingle();

    if (sErr) {
      console.error("Store settings error:", sErr);
    }

    const settings = {
      isOpen: storeSettings?.is_open ?? true,
      minOrderValue: Number(storeSettings?.min_order_value || 99),
      deliveryFee: Number(storeSettings?.delivery_fee || 30),
      freeDeliveryThreshold: Number(storeSettings?.free_delivery_threshold || 299),
      estimatedPrepMinutes: Number(storeSettings?.estimated_prep_minutes || 20),
    };

    if (!settings.isOpen) {
      return NextResponse.json(
        {
          error:
            "The Sprouts Spot kitchen is currently closed for new orders. Please check back during operating hours.",
        },
        { status: 400 }
      );
    }

    // 3. Fetch products from Supabase to validate items and prices
    const productIds = cartItems.map((ci: any) => ci.productId);
    const { data: dbProducts, error: pErr } = await adminClient
      .from("products")
      .select("*")
      .in("id", productIds);

    if (pErr) {
      return NextResponse.json({ error: "Error verifying menu items" }, { status: 500 });
    }

    const productsMap = new Map((dbProducts || []).map((p) => [p.id, p]));

    let calculatedSubtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of cartItems) {
      const dbProduct = productsMap.get(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Item "${item.name || item.productId}" is no longer available.` },
          { status: 400 }
        );
      }

      if (!dbProduct.is_available) {
        return NextResponse.json(
          { error: `"${dbProduct.name}" is currently sold out.` },
          { status: 400 }
        );
      }

      let unitPrice = Number(dbProduct.price);

      // Handle variant pricing if specified
      if (item.customization?.variant?.id && Array.isArray(dbProduct.variants)) {
        const variant = dbProduct.variants.find(
          (v: any) => v.id === item.customization.variant.id
        );
        if (variant && variant.price !== undefined) {
          unitPrice = Number(variant.price);
        }
      }

      // Handle addons pricing
      let addonsCost = 0;
      if (
        item.customization?.addons &&
        Array.isArray(item.customization.addons) &&
        Array.isArray(dbProduct.addons)
      ) {
        for (const addon of item.customization.addons) {
          const dbAddon = dbProduct.addons.find((a: any) => a.id === addon.id);
          if (dbAddon && dbAddon.price !== undefined) {
            addonsCost += Number(dbAddon.price);
          }
        }
      }

      const totalItemUnit = unitPrice + addonsCost;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const lineTotal = totalItemUnit * quantity;

      calculatedSubtotal += lineTotal;

      validatedItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: dbProduct.id,
        name: dbProduct.name,
        unitPrice: totalItemUnit,
        quantity,
        totalPrice: lineTotal,
        imageUrl: dbProduct.image_url,
        customization: item.customization,
      });
    }

    // 4. Check minimum order value
    if (calculatedSubtotal < settings.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order value for delivery is ₹${settings.minOrderValue}. Your subtotal is ₹${calculatedSubtotal}.`,
        },
        { status: 400 }
      );
    }

    // 5. Delivery fee calculation
    let deliveryFee = settings.deliveryFee;
    if (calculatedSubtotal >= settings.freeDeliveryThreshold) {
      deliveryFee = 0;
    }

    // 6. Coupon discount calculation
    let discount = 0;
    let appliedCoupon = "";
    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const { data: coupon } = await adminClient
        .from("coupons")
        .select("*")
        .eq("code", cleanCoupon)
        .eq("is_active", true)
        .maybeSingle();

      if (coupon && new Date(coupon.valid_until) >= new Date()) {
        const minOrder = Number(coupon.min_order_value || 0);
        if (calculatedSubtotal >= minOrder) {
          if (coupon.discount_type === "PERCENTAGE") {
            let disc = (calculatedSubtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount && disc > Number(coupon.max_discount)) {
              disc = Number(coupon.max_discount);
            }
            discount = Math.round(disc);
          } else {
            discount = Math.round(Number(coupon.discount_value));
          }
          discount = Math.min(discount, calculatedSubtotal);
          appliedCoupon = cleanCoupon;

          // Increment coupon usage
          await adminClient
            .from("coupons")
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    const total = Math.max(0, calculatedSubtotal + deliveryFee - discount);
    const paymentStatus = paymentMethod === "ONLINE" || paymentMethod === "UPI" ? "PAID" : "PENDING";
    const orderNumber = `TSS-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `order-${Date.now()}`;

    const customerUserId = session?.userId && UUID_REGEX.test(session.userId)
      ? session.userId
      : null;

    // 7. Insert into `orders` table
    const orderRow = {
      id: orderId,
      order_number: orderNumber,
      customer_id: customerUserId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail?.trim() || session?.email || "",
      delivery_address: {
        houseFlat: deliveryAddress.houseFlat,
        landmark: deliveryAddress.landmark || "",
        areaLocality: deliveryAddress.areaLocality,
        city: deliveryAddress.city || "Indore",
        instructions: deliveryAddress.instructions || "",
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      delivery_fee: deliveryFee,
      discount,
      coupon_code: appliedCoupon || null,
      total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: "PLACED",
      estimated_delivery_time: `~${settings.estimatedPrepMinutes + 15} mins`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: savedOrder, error: oErr } = await adminClient
      .from("orders")
      .insert(orderRow)
      .select()
      .single();

    if (oErr) {
      console.error("Error inserting order into Supabase:", oErr);
      return NextResponse.json({ error: oErr.message }, { status: 500 });
    }

    // 8. Insert normalized order_items
    const orderItemsRows = validatedItems.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      total_price: item.totalPrice,
      customization: item.customization || {},
      image_url: item.imageUrl || null,
    }));

    await adminClient.from("order_items").insert(orderItemsRows);

    // 9. Insert initial status history
    await adminClient.from("order_status_history").insert({
      order_id: orderId,
      status: "PLACED",
      changed_by_user_id: customerUserId,
      changed_by_name: customerName.trim(),
      note: "Order placed successfully by customer",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      order: mapOrderRow(savedOrder),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

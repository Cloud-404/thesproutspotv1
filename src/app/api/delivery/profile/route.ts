import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "delivery" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const adminClient = createAdminClient();

    // 1. Fetch user profile from `profiles`
    const { data: userProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle();

    // 2. Fetch delivery partner details from `delivery_partner_profiles`
    const { data: dpProfile } = await adminClient
      .from("delivery_partner_profiles")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();

    const profile = {
      id: dpProfile?.id || `dp-${session.userId}`,
      userId: session.userId,
      name: userProfile?.name || session.name,
      phone: userProfile?.phone || session.phone,
      vehicleType: dpProfile?.vehicle_type || "Motorcycle",
      vehicleNumber: dpProfile?.vehicle_number || "MP-09-SP-2026",
      isAvailable: dpProfile?.is_available ?? true,
      totalDeliveries: dpProfile?.total_deliveries ?? 0,
      totalEarnings: Number(dpProfile?.total_earnings ?? 0),
      pendingPayout: Number(dpProfile?.pending_payout ?? 0),
      commissionPerOrder: Number(dpProfile?.commission_per_order ?? 40),
      rating: Number(dpProfile?.rating ?? 5.0),
    };

    // 3. Fetch assignments
    const { data: assignmentRows } = await adminClient
      .from("delivery_assignments")
      .select("*")
      .eq("partner_id", session.userId)
      .order("assigned_at", { ascending: false });

    const assignments = (assignmentRows || []).map((a) => ({
      id: a.id,
      orderId: a.order_id,
      partnerId: a.partner_id,
      partnerName: session.name,
      partnerPhone: session.phone,
      status: a.status,
      declineReason: a.decline_reason,
      codCollected: a.cod_collected,
      problemReport: a.problem_report,
      assignedAt: a.assigned_at,
      acceptedAt: a.accepted_at,
      pickedUpAt: a.picked_up_at,
      deliveredAt: a.delivered_at,
    }));

    // 4. Fetch assigned orders
    const { data: orderRows } = await adminClient
      .from("orders")
      .select("*")
      .eq("assigned_delivery_partner_id", session.userId)
      .order("created_at", { ascending: false });

    const assignedOrders = (orderRows || []).map(mapOrderRow);

    return NextResponse.json({
      profile,
      user: {
        id: session.userId,
        name: userProfile?.name || session.name,
        email: userProfile?.email || session.email,
        phone: userProfile?.phone || session.phone,
        role: session.role,
      },
      assignments,
      assignedOrders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching delivery profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "delivery") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { isAvailable } = await req.json();
    const adminClient = createAdminClient();

    // Upsert into delivery_partner_profiles
    const { data: existing } = await adminClient
      .from("delivery_partner_profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await adminClient
        .from("delivery_partner_profiles")
        .update({ is_available: Boolean(isAvailable) })
        .eq("user_id", session.userId)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await adminClient
        .from("delivery_partner_profiles")
        .insert({
          user_id: session.userId,
          is_available: Boolean(isAvailable),
          vehicle_type: "Motorcycle",
          vehicle_number: "MP-09-SP-2026",
          commission_per_order: 40,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: result.id,
        userId: result.user_id,
        name: session.name,
        phone: session.phone,
        vehicleType: result.vehicle_type,
        vehicleNumber: result.vehicle_number,
        isAvailable: result.is_available,
        totalDeliveries: result.total_deliveries,
        totalEarnings: Number(result.total_earnings),
        pendingPayout: Number(result.pending_payout),
        commissionPerOrder: Number(result.commission_per_order),
        rating: Number(result.rating),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating delivery status";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

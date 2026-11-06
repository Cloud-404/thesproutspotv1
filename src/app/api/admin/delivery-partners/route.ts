import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const adminClient = createAdminClient();

    // 1. Fetch delivery profiles and partner details
    const { data: partnerUsers, error: uErr } = await adminClient
      .from("profiles")
      .select("*")
      .eq("role", "delivery");

    if (uErr) {
      console.error("Error fetching delivery profiles:", uErr);
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const { data: partnerProfiles, error: pErr } = await adminClient
      .from("delivery_partner_profiles")
      .select("*");

    if (pErr) {
      console.error("Error fetching delivery partner profiles:", pErr);
    }

    // 2. Fetch orders to compute active assignments
    const { data: orders, error: oErr } = await adminClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (oErr) {
      console.error("Error fetching orders for delivery partners:", oErr);
    }

    const profilesList = partnerProfiles || [];
    const ordersList = orders || [];

    const partnerList = (partnerUsers || []).map((user) => {
      const dp = profilesList.find((p) => p.user_id === user.id) || {
        id: `dp-${user.id}`,
        user_id: user.id,
        vehicle_type: "Motorcycle",
        vehicle_number: "MP-09-SP-2026",
        is_available: true,
        total_deliveries: 0,
        total_earnings: 0,
        pending_payout: 0,
        commission_per_order: 40,
        rating: 5.0,
      };

      const activeOrders = ordersList.filter(
        (o) =>
          o.assigned_delivery_partner_id === user.id &&
          o.order_status !== "DELIVERED" &&
          o.order_status !== "CANCELLED"
      );

      return {
        id: dp.id,
        userId: user.id,
        name: user.name,
        phone: user.phone,
        vehicleType: dp.vehicle_type || "Motorcycle",
        vehicleNumber: dp.vehicle_number || "MP-09-SP-2026",
        isAvailable: dp.is_available,
        totalDeliveries: dp.total_deliveries || 0,
        totalEarnings: Number(dp.total_earnings || 0),
        pendingPayout: Number(dp.pending_payout || 0),
        commissionPerOrder: Number(dp.commission_per_order || 40),
        rating: Number(dp.rating || 5.0),
        activeOrdersCount: activeOrders.length,
        activeOrders: activeOrders.map((o) => ({
          id: o.id,
          orderNumber: o.order_number,
          orderStatus: o.order_status,
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          deliveryAddress: o.delivery_address,
          total: Number(o.total),
          createdAt: o.created_at,
        })),
      };
    });

    return NextResponse.json(partnerList);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching delivery partners";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    // 1. Fetch all customer profiles
    const { data: profiles, error: pErr } = await adminClient
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (pErr) {
      console.error("Error fetching customer profiles:", pErr);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    // 2. Fetch all orders to compute stats
    const { data: orders, error: oErr } = await adminClient
      .from("orders")
      .select("id, order_number, customer_id, total, order_status, created_at")
      .order("created_at", { ascending: false });

    if (oErr) {
      console.error("Error fetching orders for customers:", oErr);
    }

    const orderList = orders || [];

    const customerRecords = (profiles || []).map((u) => {
      const customerOrders = orderList.filter((o) => o.customer_id === u.id);
      const validOrders = customerOrders.filter((o) => o.order_status !== "CANCELLED");
      const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

      const lastOrder = customerOrders[0]
        ? {
            id: customerOrders[0].id,
            orderNumber: customerOrders[0].order_number,
            total: Number(customerOrders[0].total),
            orderStatus: customerOrders[0].order_status,
            createdAt: customerOrders[0].created_at,
          }
        : null;

      return {
        id: u.id,
        username: u.username,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isActive: u.is_active,
        joinedAt: u.created_at,
        orderCount: customerOrders.length,
        totalSpent,
        lastOrder,
      };
    });

    return NextResponse.json(customerRecords);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching customers";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id, isActive } = await req.json();
    if (!id || isActive === undefined) {
      return NextResponse.json({ error: "ID and isActive are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        isActive: data.is_active,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating customer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

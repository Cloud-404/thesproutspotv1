import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const adminClient = createAdminClient();

    // Query order by id or order_number
    const { data: order, error } = await adminClient
      .from("orders")
      .select("*")
      .or(`id.eq.${id},order_number.eq.${id.toUpperCase()}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = await getSession();

    // If customer, verify ownership unless phone matches
    if (session && session.role === "customer") {
      const isOwner = order.customer_id === session.userId || order.customer_phone === session.phone;
      if (!isOwner) {
        return NextResponse.json({ error: "Access denied to this order" }, { status: 403 });
      }
    }

    // Fetch status history
    const { data: historyRows } = await adminClient
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    const history = (historyRows || []).map((h) => ({
      id: h.id,
      orderId: h.order_id,
      status: h.status,
      changedByUserId: h.changed_by_user_id,
      changedByName: h.changed_by_name,
      note: h.note,
      timestamp: h.created_at,
    }));

    return NextResponse.json({
      order: mapOrderRow(order),
      history,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await props.params;
    const body = await req.json();
    const { status, note, paymentStatus, internalNotes } = body;

    const adminClient = createAdminClient();
    const { data: order, error } = await adminClient
      .from("orders")
      .select("*")
      .or(`id.eq.${id},order_number.eq.${id.toUpperCase()}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delivery partner can only update their own assigned orders
    if (session.role === "delivery") {
      if (order.assigned_delivery_partner_id !== session.userId) {
        return NextResponse.json(
          { error: "You can only update orders assigned to you" },
          { status: 403 }
        );
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updates.order_status = status;
    }

    if (paymentStatus && session.role === "admin") {
      updates.payment_status = paymentStatus;
    }

    if (internalNotes && session.role === "admin") {
      updates.internal_notes = internalNotes;
    }

    const { data: updatedOrder, error: uErr } = await adminClient
      .from("orders")
      .update(updates)
      .eq("id", order.id)
      .select()
      .single();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    // Record history entry if status changed
    if (status) {
      const validUserId = session.userId && UUID_REGEX.test(session.userId) ? session.userId : null;
      await adminClient.from("order_status_history").insert({
        order_id: order.id,
        status,
        changed_by_user_id: validUserId,
        changed_by_name: session.name,
        note: note || `Status updated to ${status} by ${session.name}`,
        created_at: new Date().toISOString(),
      });
    }

    const { data: historyRows } = await adminClient
      .from("order_status_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    const history = (historyRows || []).map((h) => ({
      id: h.id,
      orderId: h.order_id,
      status: h.status,
      changedByUserId: h.changed_by_user_id,
      changedByName: h.changed_by_name,
      note: h.note,
      timestamp: h.created_at,
    }));

    return NextResponse.json({
      success: true,
      order: mapOrderRow(updatedOrder),
      history,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

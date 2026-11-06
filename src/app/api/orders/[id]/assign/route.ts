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

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const { id } = await props.params;
    const { partnerId } = await req.json();

    if (!partnerId) {
      return NextResponse.json({ error: "Partner ID is required." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch partner info
    const { data: partnerUser, error: pErr } = await adminClient
      .from("profiles")
      .select("id, name, phone")
      .eq("id", partnerId)
      .maybeSingle();

    if (pErr || !partnerUser) {
      return NextResponse.json({ error: "Delivery partner not found" }, { status: 404 });
    }

    // 2. Fetch order
    const { data: order, error: oErr } = await adminClient
      .from("orders")
      .select("*")
      .or(`id.eq.${id},order_number.eq.${id.toUpperCase()}`)
      .maybeSingle();

    if (oErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const partnerName = partnerUser.name || "Delivery Partner";
    const partnerPhone = partnerUser.phone || "+91 98000 00000";

    // 3. Update order
    const { data: updatedOrder, error: uErr } = await adminClient
      .from("orders")
      .update({
        assigned_delivery_partner_id: partnerUser.id,
        assigned_delivery_partner_name: partnerName,
        assigned_delivery_partner_phone: partnerPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .select()
      .single();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    // 4. Create delivery assignment
    await adminClient.from("delivery_assignments").insert({
      order_id: order.id,
      partner_id: partnerUser.id,
      status: "ASSIGNED",
      assigned_at: new Date().toISOString(),
    });

    // 5. Add status history
    const validAdminId = session.userId && UUID_REGEX.test(session.userId) ? session.userId : null;
    await adminClient.from("order_status_history").insert({
      order_id: order.id,
      status: order.order_status,
      changed_by_user_id: validAdminId,
      changed_by_name: session.name,
      note: `Delivery partner ${partnerName} assigned by ${session.name}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      order: mapOrderRow(updatedOrder),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error assigning delivery partner";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

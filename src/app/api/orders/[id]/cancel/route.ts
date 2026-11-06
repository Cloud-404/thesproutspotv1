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
  try {
    const session = await getSession();
    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Customer requested cancellation";

    const adminClient = createAdminClient();
    const { data: order, error } = await adminClient
      .from("orders")
      .select("*")
      .or(`id.eq.${id},order_number.eq.${id.toUpperCase()}`)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if already completed or cancelled
    if (order.order_status === "DELIVERED" || order.order_status === "CANCELLED") {
      return NextResponse.json(
        { error: `Order cannot be cancelled in status ${order.order_status}.` },
        { status: 400 }
      );
    }

    const isAdmin = session?.role === "admin";
    const isCustomer =
      session?.role === "customer" &&
      (order.customer_id === session.userId || order.customer_phone === session.phone);

    if (!isAdmin && isCustomer) {
      if (order.order_status !== "PLACED" && order.order_status !== "CONFIRMED") {
        return NextResponse.json(
          {
            error:
              "Food preparation has already started. Please contact our kitchen via WhatsApp to request cancellation.",
          },
          { status: 400 }
        );
      }
    } else if (!isAdmin && !isCustomer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newPaymentStatus = order.payment_status === "PAID" ? "REFUNDED" : "PENDING";

    const { data: updatedOrder, error: uErr } = await adminClient
      .from("orders")
      .update({
        order_status: "CANCELLED",
        cancellation_reason: reason,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .select()
      .single();

    if (uErr) {
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const validUserId = session?.userId && UUID_REGEX.test(session.userId) ? session.userId : null;
    await adminClient.from("order_status_history").insert({
      order_id: order.id,
      status: "CANCELLED",
      changed_by_user_id: validUserId,
      changed_by_name: session?.name || "Customer",
      note: `Cancelled: ${reason}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      order: mapOrderRow(updatedOrder),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error cancelling order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== "delivery" && session.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized. Delivery partner session required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, orderId, reason, note, codCollected } = body;

    if (!orderId || !action) {
      return NextResponse.json({ error: "orderId and action are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch order
    const { data: order, error: oErr } = await adminClient
      .from("orders")
      .select("*")
      .or(`id.eq.${orderId},order_number.eq.${orderId.toUpperCase()}`)
      .maybeSingle();

    if (oErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Fetch existing assignment for partner and order
    const { data: existingAssignment } = await adminClient
      .from("delivery_assignments")
      .select("*")
      .eq("order_id", order.id)
      .eq("partner_id", session.userId)
      .order("assigned_at", { ascending: false })
      .maybeSingle();

    const now = new Date().toISOString();
    const validUserId = session.userId && UUID_REGEX.test(session.userId) ? session.userId : null;

    switch (action) {
      case "accept": {
        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({ status: "ACCEPTED", accepted_at: now })
            .eq("id", existingAssignment.id);
        }
        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: order.order_status,
          note: `${session.name} accepted delivery request`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });
        break;
      }

      case "decline": {
        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({
              status: "DECLINED",
              decline_reason: reason || "Partner unavailable",
            })
            .eq("id", existingAssignment.id);
        }
        await adminClient
          .from("orders")
          .update({
            assigned_delivery_partner_id: null,
            assigned_delivery_partner_name: null,
            assigned_delivery_partner_phone: null,
            updated_at: now,
          })
          .eq("id", order.id);

        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: order.order_status,
          note: `Delivery declined by ${session.name}: ${reason || "Declined"}`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });
        break;
      }

      case "arrived_kitchen": {
        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({ status: "ARRIVED_KITCHEN" })
            .eq("id", existingAssignment.id);
        }
        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: order.order_status,
          note: `Delivery partner arrived at kitchen`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });
        break;
      }

      case "confirm_pickup": {
        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({ status: "PICKED_UP", picked_up_at: now })
            .eq("id", existingAssignment.id);
        }
        await adminClient
          .from("orders")
          .update({
            order_status: "OUT_FOR_DELIVERY",
            updated_at: now,
          })
          .eq("id", order.id);

        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: "OUT_FOR_DELIVERY",
          note: `Food picked up from kitchen and on the way to customer`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });
        break;
      }

      case "mark_delivered": {
        const isCod = order.payment_method === "COD";
        const wasCollected = codCollected ?? isCod;

        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({
              status: "DELIVERED",
              delivered_at: now,
              cod_collected: wasCollected,
            })
            .eq("id", existingAssignment.id);
        }

        const orderUpdates: Record<string, unknown> = {
          order_status: "DELIVERED",
          updated_at: now,
        };
        if (isCod && wasCollected) {
          orderUpdates.payment_status = "PAID";
        }

        await adminClient
          .from("orders")
          .update(orderUpdates)
          .eq("id", order.id);

        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: "DELIVERED",
          note: `Order safely delivered to customer doorstep`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });

        // Update partner payout and delivery count
        const { data: dp } = await adminClient
          .from("delivery_partner_profiles")
          .select("*")
          .eq("user_id", session.userId)
          .maybeSingle();

        if (dp) {
          const commission = Number(dp.commission_per_order || 40);
          await adminClient
            .from("delivery_partner_profiles")
            .update({
              total_deliveries: (dp.total_deliveries || 0) + 1,
              total_earnings: Number(dp.total_earnings || 0) + commission,
              pending_payout: Number(dp.pending_payout || 0) + commission,
            })
            .eq("id", dp.id);
        }
        break;
      }

      case "report_problem": {
        if (existingAssignment) {
          await adminClient
            .from("delivery_assignments")
            .update({ problem_report: note || "Delivery problem reported" })
            .eq("id", existingAssignment.id);
        }
        await adminClient.from("order_status_history").insert({
          order_id: order.id,
          status: order.order_status,
          note: `Delivery issue reported: ${note || "Issue reported"}`,
          changed_by_name: session.name,
          changed_by_user_id: validUserId,
          created_at: now,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Fetch updated order and history
    const { data: updatedOrder } = await adminClient
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .single();

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
    const msg = err instanceof Error ? err.message : "Error executing delivery action";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

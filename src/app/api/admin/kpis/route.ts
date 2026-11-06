import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const adminClient = createAdminClient();

    const [ordersResult, productsResult] = await Promise.all([
      adminClient.from("orders").select("*").order("created_at", { ascending: false }),
      adminClient.from("products").select("id, is_available"),
    ]);

    if (ordersResult.error) {
      console.error("KPI orders query error:", ordersResult.error);
      return NextResponse.json({ error: ordersResult.error.message }, { status: 500 });
    }

    const rawOrders = ordersResult.data || [];
    const products = productsResult.data || [];

    // Map to camelCase Order interface
    const orders = rawOrders.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      customerEmail: o.customer_email,
      deliveryAddress: o.delivery_address,
      items: Array.isArray(o.items) ? o.items : [],
      subtotal: Number(o.subtotal || 0),
      deliveryFee: Number(o.delivery_fee || 0),
      discount: Number(o.discount || 0),
      couponCode: o.coupon_code,
      total: Number(o.total || 0),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      assignedDeliveryPartnerId: o.assigned_delivery_partner_id,
      assignedDeliveryPartnerName: o.assigned_delivery_partner_name,
      assignedDeliveryPartnerPhone: o.assigned_delivery_partner_phone,
      cancellationReason: o.cancellation_reason,
      internalNotes: o.internal_notes,
      estimatedDeliveryTime: o.estimated_delivery_time,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    }));

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "PLACED" || o.orderStatus === "CONFIRMED"
    );
    const preparingOrders = orders.filter((o) => o.orderStatus === "PREPARING");
    const readyOrders = orders.filter((o) => o.orderStatus === "READY_FOR_PICKUP");
    const outForDeliveryOrders = orders.filter((o) => o.orderStatus === "OUT_FOR_DELIVERY");
    const deliveredOrders = orders.filter((o) => o.orderStatus === "DELIVERED");
    const cancelledOrders = orders.filter((o) => o.orderStatus === "CANCELLED");

    // Only count non-cancelled orders for sales
    const validOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
    const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);

    const validTodayOrders = todayOrders.filter((o) => o.orderStatus !== "CANCELLED");
    const todaySales = validTodayOrders.reduce((sum, o) => sum + o.total, 0);

    const averageOrderValue =
      validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;

    // Best selling products calculation
    const productSalesMap: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const order of validOrders) {
      for (const item of order.items) {
        if (!item || !item.productId) continue;
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.name || "Special Item",
            count: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].count += Number(item.quantity || 1);
        productSalesMap[item.productId].revenue += Number(item.totalPrice || 0);
      }
    }

    const bestSellers = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 7-day sales trend for chart
    const last7Days: Array<{ date: string; displayDate: string; sales: number; orders: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const displayDate = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });

      const dayOrders = orders.filter(
        (o) => o.createdAt.startsWith(dateKey) && o.orderStatus !== "CANCELLED"
      );
      const daySales = dayOrders.reduce((acc, curr) => acc + curr.total, 0);

      last7Days.push({
        date: dateKey,
        displayDate,
        sales: daySales,
        orders: dayOrders.length,
      });
    }

    return NextResponse.json({
      kpis: {
        totalOrders: orders.length,
        todayOrdersCount: todayOrders.length,
        todaySales,
        totalSales,
        averageOrderValue,
        pendingCount: pendingOrders.length,
        preparingCount: preparingOrders.length,
        readyCount: readyOrders.length,
        outForDeliveryCount: outForDeliveryOrders.length,
        deliveredCount: deliveredOrders.length,
        cancelledCount: cancelledOrders.length,
      },
      bestSellers,
      salesChart: last7Days,
      recentOrders: orders.slice(0, 10),
      totalProducts: products.length,
      availableProducts: products.filter((p) => p.is_available).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error computing KPIs";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

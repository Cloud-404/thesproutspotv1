"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { Download, Calendar, BarChart2, TrendingUp, CheckCircle2 } from "lucide-react";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const validOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
  });

  // Product sales breakdown
  const productStats: Record<string, { name: string; qty: number; revenue: number }> = {};
  validOrders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productStats[item.productId].qty += item.quantity;
      productStats[item.productId].revenue += item.totalPrice;
    });
  });

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Locality",
      "Total (INR)",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Delivery Partner",
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.areaLocality}"`,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      `"${o.assignedDeliveryPartnerName || "Unassigned"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `TheSproutsSpot_Orders_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Financial & Sales Reports
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Database-backed accounting reports, product popularity, and CSV export.
          </p>
        </div>

        <button
          onClick={exportOrdersCSV}
          disabled={orders.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders to CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Total Gross Revenue
          </span>
          <span className="text-2xl font-black text-[#263719] block mt-1">
            ₹{totalRevenue}
          </span>
          <span className="text-[10px] text-[#74776D] block mt-0.5">
            Excluding cancelled orders
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Total Orders Logged
          </span>
          <span className="text-2xl font-black text-[#263719] block mt-1">
            {orders.length}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            {statusCounts["DELIVERED"] || 0} successfully delivered
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs">
          <span className="text-[10px] uppercase font-bold text-[#74776D]">
            Average Order Value
          </span>
          <span className="text-2xl font-black text-[#34451F] block mt-1">
            ₹{validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0}
          </span>
          <span className="text-[10px] text-[#74776D] block mt-0.5">
            Per completed meal transaction
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Sales Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-[#263719] pb-3 border-b border-[#F8EBD2]">
            Product Sales Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-[#74776D] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {Object.values(productStats)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-3 px-3 font-bold text-[#26291F]">{p.name}</td>
                      <td className="py-3 px-3 text-center font-semibold text-[#74776D]">
                        {p.qty}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-[#34451F]">
                        ₹{p.revenue}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-[#263719] pb-3 border-b border-[#F8EBD2]">
            Order Status Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / orders.length) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#26291F]">
                    <span>{status}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FBF8F0] h-2 rounded-full overflow-hidden border border-[#F8EBD2]">
                    <div
                      className="bg-[#34451F] h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

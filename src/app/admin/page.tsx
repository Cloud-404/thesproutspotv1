"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Order } from "@/lib/types";
import { VegBadge } from "@/components/VegBadge";
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  ChefHat,
  Bike,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  PackageCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchKpis = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/kpis");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load KPIs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKpis();
    const interval = setInterval(() => fetchKpis(), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchKpis(true);
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-neutral-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const { kpis, bestSellers, salesChart, recentOrders } = data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Kitchen Overview
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Real-time orders, preparation queue, and revenue tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchKpis(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#F8EBD2] bg-white text-xs font-bold text-[#26291F] hover:bg-[#F8EBD2] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Manage All Orders
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Today's Sales */}
        <div className="bg-white rounded-3xl p-5 border border-[#F8EBD2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#74776D]">
              Today&apos;s Revenue
            </span>
            <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-[#26291F]">
              ₹{kpis.todaySales}
            </span>
            <span className="text-[10px] text-[#74776D] block mt-0.5">
              From {kpis.todayOrdersCount} orders placed today
            </span>
          </div>
        </div>

        {/* Pending & Kitchen Queue */}
        <div className="bg-white rounded-3xl p-5 border border-[#F8EBD2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#74776D]">
              Kitchen Queue
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-amber-800">
              {kpis.pendingCount + kpis.preparingCount}
            </span>
            <span className="text-[10px] text-[#74776D] block mt-0.5">
              {kpis.pendingCount} pending, {kpis.preparingCount} in prep
            </span>
          </div>
        </div>

        {/* Out for Delivery */}
        <div className="bg-white rounded-3xl p-5 border border-[#F8EBD2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#74776D]">
              Out for Delivery
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">
              {kpis.outForDeliveryCount}
            </span>
            <span className="text-[10px] text-[#74776D] block mt-0.5">
              Active with delivery partners
            </span>
          </div>
        </div>

        {/* Total Orders Completed */}
        <div className="bg-white rounded-3xl p-5 border border-[#F8EBD2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#74776D]">
              Completed Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {kpis.deliveredCount}
            </span>
            <span className="text-[10px] text-[#74776D] block mt-0.5">
              Avg Order Value: ₹{kpis.averageOrderValue}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#34451F]" />
              <h3 className="font-bold text-sm text-[#263719]">
                7-Day Revenue Trend (₹)
              </h3>
            </div>
            <span className="text-xs text-[#74776D] font-medium">
              Total Revenue: ₹{kpis.totalSales}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34451F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#34451F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: "#74776D" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#74776D" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${value}`, "Sales"]}
                  contentStyle={{
                    backgroundColor: "#263719",
                    color: "#F8EBD2",
                    borderRadius: "12px",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#34451F"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#263719] pb-3 border-b border-[#F8EBD2]">
            Best-Selling Products
          </h3>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-[#74776D]">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center font-extrabold text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#263719]">{item.name}</h4>
                      <span className="text-[10px] text-[#74776D]">
                        {item.count} orders sold
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-xs text-[#34451F]">
                    ₹{item.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Action Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
          <h3 className="font-bold text-sm text-[#263719]">
            Recent Orders & Quick Actions
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#34451F] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-100 text-[#74776D] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Order</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.slice(0, 5).map((order: Order) => (
                <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-extrabold text-[#34451F] hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                    <span className="text-[10px] text-[#74776D] block">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-[#26291F] block">
                      {order.customerName}
                    </span>
                    <span className="text-[10px] text-[#74776D]">
                      {order.deliveryAddress.areaLocality}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-neutral-700">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-extrabold text-[#26291F]">
                    ₹{order.total}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        order.orderStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.orderStatus === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-[#DCE8C9] text-[#263719]"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {order.orderStatus === "PLACED" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                        className="px-3 py-1 rounded-full bg-[#34451F] text-white text-[10px] font-bold hover:bg-[#263719]"
                      >
                        Confirm
                      </button>
                    )}
                    {order.orderStatus === "CONFIRMED" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                        className="px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700"
                      >
                        Start Prep
                      </button>
                    )}
                    {order.orderStatus === "PREPARING" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "READY_FOR_PICKUP")}
                        className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700"
                      >
                        Ready
                      </button>
                    )}
                    {(order.orderStatus === "READY_FOR_PICKUP" ||
                      order.orderStatus === "OUT_FOR_DELIVERY" ||
                      order.orderStatus === "DELIVERED" ||
                      order.orderStatus === "CANCELLED") && (
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-3 py-1 rounded-full border border-neutral-300 text-neutral-700 text-[10px] font-bold hover:bg-neutral-100 inline-block"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

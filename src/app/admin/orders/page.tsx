"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Order, DeliveryPartnerProfile } from "@/lib/types";
import { VegBadge } from "@/components/VegBadge";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  ChefHat,
  Package,
  Bike,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<DeliveryPartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<Order | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchOrdersAndPartners = async () => {
    try {
      const [ordersRes, partnersRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/admin/delivery-partners"),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (partnersRes.ok) setPartners(await partnersRes.json());
    } catch (err) {
      console.error("Failed to load orders/partners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndPartners();
    const interval = setInterval(() => fetchOrdersAndPartners(), 5000);
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
        fetchOrdersAndPartners();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedOrderForAssign || !selectedPartnerId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderForAssign.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: selectedPartnerId }),
      });
      if (res.ok) {
        setSelectedOrderForAssign(null);
        setSelectedPartnerId("");
        fetchOrdersAndPartners();
      }
    } catch (e) {
      console.error("Failed to assign partner:", e);
    } finally {
      setAssigning(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.orderStatus === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.deliveryAddress.areaLocality.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const statuses = [
    { label: "All Orders", value: "ALL" },
    { label: "Placed", value: "PLACED" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Preparing", value: "PREPARING" },
    { label: "Ready", value: "READY_FOR_PICKUP" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Order Management
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Real-time status transitions, kitchen preparation control, and delivery partner dispatch.
          </p>
        </div>

        <button
          onClick={() => fetchOrdersAndPartners()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F8EBD2] bg-white text-xs font-bold text-[#26291F] hover:bg-[#F8EBD2]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74776D]" />
            <input
              type="text"
              placeholder="Search by Order #, Name, Phone, Locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold placeholder-[#74776D] focus:outline-hidden focus:border-[#34451F]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {statuses.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === s.value
                    ? "bg-[#34451F] text-white shadow-xs"
                    : "bg-[#FBF8F0] text-[#74776D] hover:text-[#26291F]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F8EBD2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FBF8F0] border-b border-[#F8EBD2] text-[#74776D] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Locality</th>
                <th className="py-3 px-4">Items & Customization</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned Partner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#74776D]">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#74776D]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-[#34451F]">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#74776D]">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#26291F] block">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] text-[#74776D]">
                        {order.customerPhone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#26291F] font-medium">
                      {order.deliveryAddress.areaLocality}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        {order.items.map((i, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <VegBadge size="sm" />
                            <span className="font-semibold text-[11px]">
                              {i.quantity}x {i.name}
                            </span>
                            {i.customization?.variant && (
                              <span className="text-[9px] text-[#74776D]">
                                ({i.customization.variant.name})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-black text-sm text-[#26291F]">
                      ₹{order.total}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          order.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#DCE8C9] text-[#263719]"
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {order.assignedDeliveryPartnerName ? (
                        <div className="flex items-center gap-1.5">
                          <Bike className="w-3.5 h-3.5 text-[#34451F]" />
                          <span className="font-bold text-[#26291F]">
                            {order.assignedDeliveryPartnerName}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrderForAssign(order);
                            setSelectedPartnerId(partners[0]?.userId || "");
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#F8EBD2] hover:bg-[#DCE8C9] text-[#263719] text-[10px] font-bold transition-colors"
                        >
                          + Assign Partner
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.orderStatus === "PLACED" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                            className="px-3 py-1 rounded-full bg-[#34451F] text-white text-[10px] font-bold hover:bg-[#263719]"
                          >
                            Accept
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
                            Mark Ready
                          </button>
                        )}

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-full border border-neutral-200 text-[#26291F] hover:bg-neutral-100"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Partner Assignment Modal */}
      {selectedOrderForAssign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <h3 className="font-extrabold text-base text-[#263719] flex items-center gap-2">
              <Bike className="w-5 h-5 text-[#34451F]" />
              Assign Delivery Partner
            </h3>
            <p className="text-xs text-[#74776D]">
              Assigning partner for Order <strong>#{selectedOrderForAssign.orderNumber}</strong> ({selectedOrderForAssign.deliveryAddress.areaLocality}).
            </p>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Select Available Delivery Partner:
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden"
              >
                {partners.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name} ({p.vehicleType}) • {p.isAvailable ? "🟢 Online" : "⚪ Offline"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setSelectedOrderForAssign(null)}
                className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-bold text-[#26291F]"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPartner}
                disabled={assigning}
                className="px-5 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold"
              >
                {assigning ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

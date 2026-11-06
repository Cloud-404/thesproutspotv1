"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Order, OrderStatusHistoryItem, DeliveryPartnerProfile } from "@/lib/types";
import { VegBadge } from "@/components/VegBadge";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Package,
  Bike,
  XCircle,
  Clock,
  Phone,
  MapPin,
  RefreshCw,
  Save,
  MessageCircle,
} from "lucide-react";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusHistoryItem[]>([]);
  const [partners, setPartners] = useState<DeliveryPartnerProfile[]>([]);
  const [internalNotes, setInternalNotes] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState("");

  const fetchOrderData = async () => {
    try {
      const [orderRes, partnersRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`),
        fetch("/api/admin/delivery-partners"),
      ]);

      if (orderRes.ok) {
        const data = await orderRes.json();
        setOrder(data.order);
        setHistory(data.history || []);
        setInternalNotes(data.order.internalNotes || "");
        setSelectedPartnerId(data.order.assignedDeliveryPartnerId || "");
      }
      if (partnersRes.ok) {
        setPartners(await partnersRes.json());
      }
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: statusNote || undefined }),
      });
      if (res.ok) {
        setStatusNote("");
        fetchOrderData();
      }
    } catch (e) {
      console.error("Error updating status:", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePayment = async (paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        fetchOrderData();
      }
    } catch (e) {
      console.error("Error updating payment:", e);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: selectedPartnerId }),
      });
      if (res.ok) {
        fetchOrderData();
      }
    } catch (e) {
      console.error("Error assigning partner:", e);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes }),
      });
      if (res.ok) {
        alert("Internal notes saved successfully.");
      }
    } catch (e) {
      console.error("Error saving notes:", e);
    }
  };

  if (loading || !order) {
    return (
      <div className="py-20 text-center text-xs font-bold text-[#74776D]">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#74776D] hover:text-[#263719] flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Order #{order.orderNumber}
          </h1>
          <span className="text-xs text-[#74776D]">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              order.orderStatus === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800"
                : order.orderStatus === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-[#DCE8C9] text-[#263719]"
            }`}
          >
            {order.orderStatus.replace(/_/g, " ")}
          </span>

          <a
            href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hi ${order.customerName}! This is Chef Radha from The Sprouts Spot regarding your order #${order.orderNumber}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      {/* Action Bar for Status Transitions */}
      <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#263719]">
          Kitchen Workflow Actions
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleUpdateStatus("CONFIRMED")}
            disabled={updating || order.orderStatus !== "PLACED"}
            className="px-4 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold disabled:opacity-30 transition-colors"
          >
            1. Confirm Order
          </button>

          <button
            onClick={() => handleUpdateStatus("PREPARING")}
            disabled={
              updating ||
              (order.orderStatus !== "CONFIRMED" && order.orderStatus !== "PLACED")
            }
            className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-30 transition-colors"
          >
            2. Start Preparation
          </button>

          <button
            onClick={() => handleUpdateStatus("READY_FOR_PICKUP")}
            disabled={updating || order.orderStatus !== "PREPARING"}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-30 transition-colors"
          >
            3. Ready for Pickup
          </button>

          <button
            onClick={() => handleUpdateStatus("OUT_FOR_DELIVERY")}
            disabled={
              updating ||
              (order.orderStatus !== "READY_FOR_PICKUP" &&
                order.orderStatus !== "PREPARING")
            }
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold disabled:opacity-30 transition-colors"
          >
            4. Dispatch Delivery
          </button>

          <button
            onClick={() => handleUpdateStatus("DELIVERED")}
            disabled={updating || order.orderStatus !== "OUT_FOR_DELIVERY"}
            className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-30 transition-colors"
          >
            5. Mark Delivered
          </button>

          <button
            onClick={() => handleUpdateStatus("CANCELLED")}
            disabled={
              updating ||
              order.orderStatus === "DELIVERED" ||
              order.orderStatus === "CANCELLED"
            }
            className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold disabled:opacity-30 transition-colors ml-auto"
          >
            Cancel Order
          </button>
        </div>

        <div className="pt-2">
          <input
            type="text"
            placeholder="Add transition note (optional, e.g. Extra salad added as requested)..."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className="w-full px-4 py-2 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Order Items & Customer Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#263719] pb-3 border-b border-[#F8EBD2]">
              Order Items ({order.items.length})
            </h3>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <VegBadge size="sm" />
                      <span className="font-extrabold text-sm text-[#263719]">
                        {item.name}
                      </span>
                    </div>
                    {item.customization?.variant && (
                      <span className="text-[11px] text-[#74776D] block">
                        Portion: {item.customization.variant.name} (₹{item.customization.variant.price})
                      </span>
                    )}
                    {item.customization?.addons && item.customization.addons.length > 0 && (
                      <span className="text-[11px] text-[#6C472B] block">
                        Add-ons: {item.customization.addons.map((a) => `${a.name} (+₹${a.price})`).join(", ")}
                      </span>
                    )}
                    <span className="text-[10px] text-[#74776D] mt-0.5 block">
                      Quantity: <strong>{item.quantity}</strong> × ₹{item.unitPrice}
                    </span>
                  </div>

                  <span className="font-black text-sm text-[#26291F]">
                    ₹{item.totalPrice}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-[#F8EBD2] space-y-2 text-xs text-[#74776D]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#26291F]">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-[#26291F]">₹{order.deliveryFee}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#F8EBD2] flex justify-between items-center text-base font-black text-[#26291F]">
                <span>Total Amount</span>
                <span className="text-xl text-[#34451F]">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Address */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#263719] pb-3 border-b border-[#F8EBD2]">
              Customer & Delivery Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                  Customer Name
                </span>
                <span className="font-extrabold text-[#26291F] text-sm">
                  {order.customerName}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                  Phone Number
                </span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-bold text-[#34451F] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {order.customerPhone}
                </a>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                  Delivery Address
                </span>
                <p className="font-semibold text-[#26291F] mt-0.5">
                  {order.deliveryAddress.houseFlat},{" "}
                  {order.deliveryAddress.landmark && `Near ${order.deliveryAddress.landmark}, `}
                  {order.deliveryAddress.areaLocality}, {order.deliveryAddress.city}
                </p>
                {order.deliveryAddress.instructions && (
                  <p className="text-[#6C472B] font-bold mt-1 bg-[#F8EBD2] p-2 rounded-xl">
                    Note from customer: &quot;{order.deliveryAddress.instructions}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dispatch, Payment & Internal Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Delivery Assignment Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#263719] pb-2 border-b border-[#F8EBD2] flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#34451F]" />
              Delivery Partner Dispatch
            </h3>

            <div>
              <label className="text-[11px] font-bold text-[#74776D] block mb-1">
                Assign / Reassign Partner:
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F]"
              >
                <option value="">-- Choose Delivery Agent --</option>
                {partners.map((p) => (
                  <option key={p.userId} value={p.userId}>
                    {p.name} ({p.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAssignPartner}
              disabled={!selectedPartnerId}
              className="w-full py-2.5 px-4 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold disabled:opacity-40 transition-colors"
            >
              Confirm Partner Assignment
            </button>

            {order.assignedDeliveryPartnerName && (
              <div className="p-3 rounded-2xl bg-[#DCE8C9]/30 border border-[#DCE8C9] text-xs text-[#263719]">
                <span className="font-extrabold block">
                  Currently Assigned:
                </span>
                <span>{order.assignedDeliveryPartnerName}</span>
                <span className="block text-[11px] text-[#74776D]">
                  {order.assignedDeliveryPartnerPhone}
                </span>
              </div>
            )}
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#263719] pb-2 border-b border-[#F8EBD2]">
              Payment & Settlement
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#74776D]">Method</span>
                <span className="font-bold text-[#26291F]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#74776D]">Current Status</span>
                <span className="font-bold text-[#34451F]">{order.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleUpdatePayment("PAID")}
                className="flex-1 py-1.5 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
              >
                Mark Paid
              </button>
              <button
                onClick={() => handleUpdatePayment("REFUNDED")}
                className="flex-1 py-1.5 px-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold"
              >
                Record Refund
              </button>
            </div>
          </div>

          {/* Internal Kitchen Notes */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#263719]">
              Internal Kitchen Notes
            </h3>
            <textarea
              rows={3}
              placeholder="e.g. Extra napkins provided, customer requested spicy chutney..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-medium focus:outline-hidden"
            />
            <button
              onClick={handleSaveNotes}
              className="w-full py-2 px-4 rounded-full border border-[#34451F] text-[#34451F] hover:bg-[#34451F] hover:text-white text-xs font-bold transition-colors"
            >
              Save Internal Note
            </button>
          </div>

          {/* Status Audit History */}
          <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#263719] pb-2 border-b border-[#F8EBD2]">
              Audit Trail
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-neutral-100 pr-1">
              {history.map((h) => (
                <div key={h.id} className="pt-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#263719]">{h.status}</span>
                    <span className="text-[10px] text-[#74776D]">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {h.note && <p className="text-[11px] text-[#74776D] mt-0.5">{h.note}</p>}
                  <span className="text-[10px] text-[#74776D] block">By {h.changedByName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

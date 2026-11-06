"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Order, DeliveryPartnerProfile, DeliveryAssignment } from "@/lib/types";
import { DemoBar } from "@/components/DemoBar";
import { VegBadge } from "@/components/VegBadge";
import { Logo } from "@/components/Logo";
import {
  Bike,
  Power,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Store,
  ExternalLink,
} from "lucide-react";

export default function DeliveryPartnerPage() {
  const { user, quickLogin, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<DeliveryPartnerProfile | null>(null);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "history" | "earnings">("active");

  // Decline modal state
  const [declineModalOrder, setDeclineModalOrder] = useState<Order | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Problem modal state
  const [problemModalOrder, setProblemModalOrder] = useState<Order | null>(null);
  const [problemNote, setProblemNote] = useState("");

  // COD confirm state
  const [codCollectedMap, setCodCollectedMap] = useState<Record<string, boolean>>({});

  const fetchDeliveryData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/delivery/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setAssignments(data.assignments || []);
        setAssignedOrders(data.assignedOrders || []);
      }
    } catch (e) {
      console.error("Failed to load delivery data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
    const interval = setInterval(() => fetchDeliveryData(), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    const newStatus = !profile.isAvailable;
    try {
      const res = await fetch("/api/delivery/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newStatus }),
      });
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, isAvailable: newStatus } : null));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleWorkflowAction = async (
    orderId: string,
    action: string,
    extra: { reason?: string; note?: string; codCollected?: boolean } = {}
  ) => {
    try {
      const res = await fetch("/api/delivery/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action,
          ...extra,
        }),
      });
      if (res.ok) {
        setDeclineModalOrder(null);
        setProblemModalOrder(null);
        fetchDeliveryData(true);
      }
    } catch (e) {
      console.error("Workflow action failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F0]">
        <div className="text-center">
          <Logo size="md" className="mx-auto mb-3 animate-pulse" />
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
          <p className="text-xs font-bold text-[#74776D] mt-3">Loading Delivery Console...</p>
        </div>
      </div>
    );
  }

  // Route protection
  if (!user || (user.role !== "delivery" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-[#F8EBD2] shadow-2xl space-y-4">
            <Logo size="lg" className="mx-auto mb-2" />
            <h2 className="text-2xl font-extrabold text-[#263719]">
              Delivery Partner Access
            </h2>
            <p className="text-xs text-[#74776D] leading-relaxed">
              This dashboard is designed for active delivery riders and couriers. Log in with your registered delivery credentials or switch to the test partner demo account.
            </p>
            <div className="pt-2 space-y-2">
              <Link
                href="/login?redirect=/delivery"
                className="w-full py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Bike className="w-4 h-4" />
                <span>Sign In with Delivery Account</span>
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 px-6 rounded-full border border-[#F8EBD2] text-[#26291F] text-xs font-bold block"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeDeliveries = assignedOrders.filter(
    (o) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED"
  );
  const completedDeliveries = assignedOrders.filter(
    (o) => o.orderStatus === "DELIVERED"
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />

      {/* Delivery Header */}
      <header className="bg-[#263719] text-[#F8EBD2] px-4 sm:px-8 py-4 shadow-md sticky top-7 z-30 border-b border-[#34451F]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/" alt="The Sprouts Spot" />
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">
                Delivery Partner Hub
              </span>
              <span className="text-[11px] text-[#DCE8C9]">
                {profile?.name || user.name} • The Sprouts Spot Fleet
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Availability switch */}
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs ${
                profile?.isAvailable
                  ? "bg-[#DCE8C9] text-[#263719]"
                  : "bg-red-500/20 text-red-200 border border-red-500/30"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{profile?.isAvailable ? "Online (Ready)" : "Offline (Rest)"}</span>
            </button>

            <button
              onClick={() => fetchDeliveryData(true)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Refresh assignments"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Delivery Partner Console */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#74776D] block">
              Active Pickups
            </span>
            <span className="text-2xl font-black text-[#26291F] mt-1 block">
              {activeDeliveries.length} Orders
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#74776D] block">
              Completed
            </span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">
              {profile?.totalDeliveries || completedDeliveries.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#74776D] block">
              Total Earnings
            </span>
            <span className="text-2xl font-black text-[#34451F] mt-1 block">
              ₹{profile?.totalEarnings || 0}
            </span>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#74776D] block">
              Payout Rate
            </span>
            <span className="text-2xl font-black text-[#6C472B] mt-1 block">
              ₹{profile?.commissionPerOrder || 40} / trip
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[#F8EBD2] pb-3">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === "active"
                ? "bg-[#34451F] text-white shadow-xs"
                : "bg-white text-[#74776D] border border-[#F8EBD2] hover:bg-[#F8EBD2]"
            }`}
          >
            Assigned Active Deliveries ({activeDeliveries.length})
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === "history"
                ? "bg-[#34451F] text-white shadow-xs"
                : "bg-white text-[#74776D] border border-[#F8EBD2] hover:bg-[#F8EBD2]"
            }`}
          >
            Completed History ({completedDeliveries.length})
          </button>

          <button
            onClick={() => setActiveTab("earnings")}
            className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === "earnings"
                ? "bg-[#34451F] text-white shadow-xs"
                : "bg-white text-[#74776D] border border-[#F8EBD2] hover:bg-[#F8EBD2]"
            }`}
          >
            Earnings & Payouts
          </button>
        </div>

        {/* TAB 1: ACTIVE DELIVERIES */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {activeDeliveries.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#F8EBD2] shadow-xs max-w-md mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-3xl mx-auto mb-3">
                  🛵
                </div>
                <h3 className="font-extrabold text-base text-[#263719]">
                  No Active Deliveries Right Now
                </h3>
                <p className="text-xs text-[#74776D] mt-1.5 leading-relaxed">
                  You are all caught up! Keep your status <strong>Online</strong> to receive incoming orders dispatched from The Sprouts Spot kitchen.
                </p>
              </div>
            ) : (
              activeDeliveries.map((order) => {
                const asgn = assignments.find((a) => a.orderId === order.id);
                const isAccepted = asgn?.status === "ACCEPTED" || order.orderStatus === "OUT_FOR_DELIVERY";
                const isPickedUp = asgn?.status === "PICKED_UP" || order.orderStatus === "OUT_FOR_DELIVERY";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#34451F]/30 shadow-lg space-y-6 relative"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F8EBD2] gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xl text-[#263719]">
                          #{order.orderNumber}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCE8C9] text-[#263719] uppercase tracking-wider">
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Payment Badge */}
                      <div>
                        {order.paymentMethod === "COD" ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs">
                            <Banknote className="w-4 h-4 text-amber-800" />
                            <span>COLLECT CASH: ₹{order.total}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                            <span>PAID ONLINE (DO NOT COLLECT CASH)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Workflow Action Row */}
                    <div className="bg-[#FBF8F0] p-4 rounded-2xl border border-[#F8EBD2] space-y-3">
                      <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                        Delivery Step Workflow:
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Step 1: Accept / Decline if newly assigned */}
                        {asgn?.status === "ASSIGNED" && (
                          <>
                            <button
                              onClick={() => handleWorkflowAction(order.id, "accept")}
                              className="px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-extrabold shadow-xs transition-colors"
                            >
                              ✓ Accept Assignment
                            </button>
                            <button
                              onClick={() => setDeclineModalOrder(order)}
                              className="px-4 py-2.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {/* Step 2: Arrived at Kitchen */}
                        {asgn?.status === "ACCEPTED" && order.orderStatus !== "OUT_FOR_DELIVERY" && (
                          <button
                            onClick={() => handleWorkflowAction(order.id, "arrived_kitchen")}
                            className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-xs transition-colors"
                          >
                            📍 Arrived at Kitchen
                          </button>
                        )}

                        {/* Step 3: Food Picked up & checked */}
                        {(asgn?.status === "ARRIVED_KITCHEN" || asgn?.status === "ACCEPTED") &&
                          order.orderStatus !== "OUT_FOR_DELIVERY" && (
                            <button
                              onClick={() => handleWorkflowAction(order.id, "confirm_pickup")}
                              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs transition-colors"
                            >
                              📦 Confirm Pickup & Start Delivery
                            </button>
                          )}

                        {/* Step 4: Mark Delivered */}
                        {order.orderStatus === "OUT_FOR_DELIVERY" && (
                          <div className="flex flex-wrap items-center gap-3 w-full">
                            {order.paymentMethod === "COD" && (
                              <label className="flex items-center gap-2 text-xs font-bold text-[#26291F] cursor-pointer bg-amber-50 p-2 rounded-xl border border-amber-200">
                                <input
                                  type="checkbox"
                                  checked={!!codCollectedMap[order.id]}
                                  onChange={(e) =>
                                    setCodCollectedMap((prev) => ({
                                      ...prev,
                                      [order.id]: e.target.checked,
                                    }))
                                  }
                                  className="w-4 h-4 accent-[#34451F] rounded"
                                />
                                <span>I have collected ₹{order.total} cash from customer</span>
                              </label>
                            )}

                            <button
                              onClick={() =>
                                handleWorkflowAction(order.id, "mark_delivered", {
                                  codCollected: !!codCollectedMap[order.id],
                                })
                              }
                              disabled={
                                order.paymentMethod === "COD" && !codCollectedMap[order.id]
                              }
                              className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-colors disabled:opacity-40"
                            >
                              ✓ Mark Order Delivered
                            </button>
                          </div>
                        )}

                        {/* Report Issue */}
                        <button
                          onClick={() => setProblemModalOrder(order)}
                          className="px-3 py-1.5 rounded-full text-neutral-600 hover:bg-neutral-200 text-xs font-semibold ml-auto"
                        >
                          Report Issue
                        </button>
                      </div>
                    </div>

                    {/* Navigation Coordinates Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Kitchen Pickup Address */}
                      <div className="p-4 rounded-2xl bg-white border border-[#F8EBD2] space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-[#74776D] block">
                          Step 1: Kitchen Pickup Location
                        </span>
                        <p className="text-xs font-bold text-[#26291F]">
                          The Sprouts Spot Kitchen
                        </p>
                        <p className="text-[11px] text-[#74776D]">
                          Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan
                        </p>
                        <div className="pt-2">
                          <a
                            href="https://maps.google.com/?q=Maheshwari+Mohalla,+Near+Lakhara+Gali,+Nimbahera,+Rajasthan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DCE8C9] text-[#263719] text-[11px] font-bold hover:bg-[#34451F] hover:text-white transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Open Kitchen in Google Maps</span>
                          </a>
                        </div>
                      </div>

                      {/* Customer Delivery Address */}
                      <div className="p-4 rounded-2xl bg-white border border-[#F8EBD2] space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-[#74776D] block">
                          Step 2: Customer Delivery Doorstep
                        </span>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#26291F]">
                            {order.customerName}
                          </p>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="flex items-center gap-1 text-xs font-extrabold text-[#34451F] hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call {order.customerPhone}</span>
                          </a>
                        </div>
                        <p className="text-[11px] text-[#74776D]">
                          {order.deliveryAddress.houseFlat},{" "}
                          {order.deliveryAddress.landmark && `Near ${order.deliveryAddress.landmark}, `}
                          {order.deliveryAddress.areaLocality}, {order.deliveryAddress.city}
                        </p>
                        {order.deliveryAddress.instructions && (
                          <p className="text-[11px] text-[#6C472B] font-bold bg-[#F8EBD2] p-1.5 rounded-lg">
                            Instructions: &quot;{order.deliveryAddress.instructions}&quot;
                          </p>
                        )}
                        <div className="pt-2">
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              `${order.deliveryAddress.houseFlat}, ${order.deliveryAddress.areaLocality}, ${order.deliveryAddress.city || "Nimbahera"}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34451F] text-white text-[11px] font-bold hover:bg-[#263719] transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Navigate to Customer Address</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Order Items checklist */}
                    <div className="p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#74776D] block">
                        Food Items to Check & Deliver:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <VegBadge size="sm" />
                            <span className="font-bold text-[#26291F]">
                              {item.quantity}x {item.name}
                            </span>
                            {item.customization?.variant && (
                              <span className="text-[10px] text-[#74776D]">
                                ({item.customization.variant.name})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: COMPLETED HISTORY */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl border border-[#F8EBD2] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FBF8F0] border-b border-[#F8EBD2] text-[#74776D] uppercase text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Delivered Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Locality</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Trip Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {completedDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#74776D]">
                      No completed deliveries recorded yet.
                    </td>
                  </tr>
                ) : (
                  completedDeliveries.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-4 font-bold text-[#34451F]">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#74776D]">
                        {new Date(order.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#26291F]">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-[#74776D]">
                        {order.deliveryAddress.areaLocality}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#26291F]">
                        ₹{order.total}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.paymentMethod} (PAID)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        +₹{profile?.commissionPerOrder || 40}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: EARNINGS & PAYOUTS */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs space-y-6">
              <h3 className="font-extrabold text-base text-[#263719] pb-3 border-b border-[#F8EBD2]">
                Earnings Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
                  <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                    Total Completed Trips
                  </span>
                  <span className="text-2xl font-black text-[#26291F] mt-1 block">
                    {profile?.totalDeliveries || 0} Trips
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
                  <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                    Per-Delivery Commission
                  </span>
                  <span className="text-2xl font-black text-[#6C472B] mt-1 block">
                    ₹{profile?.commissionPerOrder || 40} / trip
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
                  <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                    Pending Direct Payout
                  </span>
                  <span className="text-2xl font-black text-emerald-700 mt-1 block">
                    ₹{profile?.pendingPayout || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#DCE8C9]/30 border border-[#DCE8C9] text-xs text-[#263719] space-y-1">
                <span className="font-extrabold block">
                  Weekly Payout Schedule
                </span>
                <p className="text-[#74776D]">
                  The Sprouts Spot disburses partner earnings every Monday directly to your registered UPI ID or bank account. No deductions or platform fees.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Decline Reason Modal */}
      {declineModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <h3 className="font-extrabold text-base text-[#263719]">
              Decline Delivery #{declineModalOrder.orderNumber}?
            </h3>
            <p className="text-xs text-[#74776D]">
              Please state why you cannot take this delivery so our kitchen admin can dispatch another rider.
            </p>

            <textarea
              rows={2}
              placeholder="e.g. Flat tire, currently too far, battery low..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclineModalOrder(null)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-[#26291F]"
              >
                Back
              </button>
              <button
                onClick={() =>
                  handleWorkflowAction(declineModalOrder.id, "decline", {
                    reason: declineReason || "Partner declined assignment",
                  })
                }
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      {problemModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <h3 className="font-extrabold text-base text-[#263719]">
              Report Delivery Issue #{problemModalOrder.orderNumber}
            </h3>
            <p className="text-xs text-[#74776D]">
              Record any delivery hurdle (customer phone unreachable, address not found, guard refusing entry).
            </p>

            <textarea
              rows={3}
              placeholder="Describe the issue..."
              value={problemNote}
              onChange={(e) => setProblemNote(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setProblemModalOrder(null)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-[#26291F]"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleWorkflowAction(problemModalOrder.id, "report_problem", {
                    note: problemNote,
                  })
                }
                className="px-5 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

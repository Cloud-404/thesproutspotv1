"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Order, OrderStatusHistoryItem, OrderStatus } from "@/lib/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VegBadge } from "@/components/VegBadge";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  Bike,
  Home,
  XCircle,
  Phone,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

function OrderTrackingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params.id as string;
  const isConfirmedJustNow = searchParams.get("confirmed") === "true";

  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<OrderStatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("Order not found");
      }
      const data = await res.json();
      setOrder(data.order);
      setHistory(data.history || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load order";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Real-time polling every 4 seconds to observe status changes live
    const interval = setInterval(() => {
      fetchOrder();
    }, 4000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || "Cancelled by customer" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel order");
      }
      setCancelModalOpen(false);
      fetchOrder(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error cancelling";
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  // Status timeline steps
  const steps: Array<{
    status: OrderStatus;
    title: string;
    desc: string;
    icon: any;
  }> = [
    {
      status: "PLACED",
      title: "Order Placed",
      desc: "Sent to The Sprouts Spot kitchen",
      icon: Clock,
    },
    {
      status: "CONFIRMED",
      title: "Order Confirmed",
      desc: "Kitchen verified your items",
      icon: CheckCircle2,
    },
    {
      status: "PREPARING",
      title: "Preparing Food",
      desc: "Fresh vegetarian meal on the stove",
      icon: ChefHat,
    },
    {
      status: "READY_FOR_PICKUP",
      title: "Ready for Pickup",
      desc: "Packed hot in eco-friendly containers",
      icon: Package,
    },
    {
      status: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      desc: "Delivery partner on the way to your door",
      icon: Bike,
    },
    {
      status: "DELIVERED",
      title: "Delivered",
      desc: "Enjoy your healthy meal!",
      icon: Home,
    },
  ];

  const getStepState = (stepStatus: OrderStatus) => {
    if (!order) return "upcoming";
    if (order.orderStatus === "CANCELLED") return "cancelled";

    const statusOrder: OrderStatus[] = [
      "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    const currentIdx = statusOrder.indexOf(order.orderStatus);
    const stepIdx = statusOrder.indexOf(stepStatus);

    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "upcoming";
  };

  const isCancellable =
    order &&
    (order.orderStatus === "PLACED" || order.orderStatus === "CONFIRMED");

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
          <p className="text-xs font-bold text-[#74776D] mt-3">
            Loading order details...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#263719]">Order Not Found</h2>
            <p className="text-xs text-[#74776D] mt-1.5">
              Could not find order with ID &quot;{orderId}&quot;.
            </p>
            <Link
              href="/orders"
              className="mt-5 inline-block px-6 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
            >
              View My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16">
        {/* Confirmed Banner */}
        {isConfirmedJustNow && (
          <div className="mb-6 p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-emerald-800">
                  Order <strong>#{order.orderNumber}</strong> has been received by Chef Radha. You can track preparation below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="text-xs font-bold text-[#74776D] hover:text-[#26291F] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>
              <span className="text-xs text-[#74776D]">•</span>
              <span className="text-xs font-bold text-[#6C472B]">
                Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719] mt-1">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-[#74776D] mt-0.5">
              Deliver to: <strong>{order.deliveryAddress.houseFlat}, {order.deliveryAddress.areaLocality}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="p-2.5 rounded-full border border-[#F8EBD2] hover:bg-[#F8EBD2] text-[#26291F] transition-colors"
              title="Refresh order status"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {isCancellable && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2 rounded-full border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                Cancel Order
              </button>
            )}

            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(
                `Hi The Sprouts Spot! I am checking on my order #${order.orderNumber}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        {/* Cancelled Banner if cancelled */}
        {order.orderStatus === "CANCELLED" && (
          <div className="mb-8 p-5 rounded-3xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-sm text-red-950">
                Order Cancelled
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                {order.cancellationReason || "This order was cancelled."}
              </p>
              {order.paymentStatus === "REFUNDED" && (
                <span className="inline-block mt-2 text-[11px] font-bold bg-white text-red-700 px-2.5 py-0.5 rounded-full border border-red-200">
                  Payment Status: REFUND PROCESSED
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Progress Timeline & Delivery Partner Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Progress Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F8EBD2]">
                <h3 className="font-bold text-sm text-[#263719] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Order Status
                </h3>
                <span className="text-xs font-bold text-[#34451F] bg-[#DCE8C9] px-3 py-1 rounded-full uppercase tracking-wider">
                  {order.orderStatus.replace(/_/g, " ")}
                </span>
              </div>

              <div className="space-y-6 relative pl-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#F8EBD2]">
                {steps.map((step, idx) => {
                  const state = getStepState(step.status);
                  const Icon = step.icon;

                  let circleStyle = "bg-white border-2 border-neutral-300 text-neutral-400";
                  let textStyle = "text-neutral-400";

                  if (state === "completed") {
                    circleStyle = "bg-[#34451F] border-2 border-[#34451F] text-white";
                    textStyle = "text-[#26291F]";
                  } else if (state === "active") {
                    circleStyle = "bg-[#DCE8C9] border-2 border-[#34451F] text-[#34451F] animate-pulse-subtle";
                    textStyle = "text-[#263719] font-extrabold";
                  }

                  return (
                    <div key={step.status} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 w-7 h-7 rounded-full flex items-center justify-center transition-all ${circleStyle}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${textStyle}`}>
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-[#74776D] mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Partner Assigned Card */}
            {order.assignedDeliveryPartnerName && (
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-[#74776D] tracking-wider block">
                  Assigned Delivery Partner
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
                      🛵
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#26291F]">
                        {order.assignedDeliveryPartnerName}
                      </h4>
                      <p className="text-xs text-[#74776D]">
                        Delivery Partner • The Sprouts Spot Fleet
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${order.assignedDeliveryPartnerPhone}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Partner</span>
                  </a>
                </div>
              </div>
            )}

            {/* Status History Audit Trail */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#74776D]">
                  Status Audit Log
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-neutral-100 pr-1">
                  {history.map((h) => (
                    <div key={h.id} className="pt-2 text-xs flex items-start justify-between">
                      <div>
                        <span className="font-bold text-[#26291F]">{h.status}</span>
                        {h.note && (
                          <p className="text-[11px] text-[#74776D]">{h.note}</p>
                        )}
                        <span className="text-[10px] text-[#74776D]">By {h.changedByName}</span>
                      </div>
                      <span className="text-[10px] text-[#74776D]">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Items & Payment Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#263719] pb-3 border-b border-[#F8EBD2]">
                Order Items ({order.items.length})
              </h3>

              <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-start justify-between text-xs">
                    <div className="flex items-start gap-2">
                      <VegBadge size="sm" className="mt-0.5" />
                      <div>
                        <span className="font-bold text-[#26291F]">
                          {item.quantity}x {item.name}
                        </span>
                        {item.customization?.variant && (
                          <span className="text-[10px] text-[#74776D] block">
                            Option: {item.customization.variant.name}
                          </span>
                        )}
                        {item.customization?.addons && item.customization.addons.length > 0 && (
                          <span className="text-[10px] text-[#6C472B] block">
                            + {item.customization.addons.map((a) => a.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-[#26291F]">₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div className="space-y-2 pt-3 border-t border-[#F8EBD2] text-xs text-[#74776D]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#26291F]">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#26291F]">
                    {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount ({order.couponCode})</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#F8EBD2] flex justify-between items-center text-sm font-extrabold text-[#26291F]">
                  <span>Total Paid</span>
                  <span className="text-lg text-[#34451F]">₹{order.total}</span>
                </div>
              </div>

              {/* Payment Status Badge */}
              <div className="p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                    Payment Mode
                  </span>
                  <span className="font-bold text-[#26291F]">
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod === "UPI"
                      ? "UPI Payment"
                      : "Online Card/NetBanking"}
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    order.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.paymentStatus === "REFUNDED"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2]">
            <h3 className="font-extrabold text-base text-[#263719]">
              Cancel Order #{order.orderNumber}?
            </h3>
            <p className="text-xs text-[#74776D] mt-2 leading-relaxed">
              Are you sure you want to cancel this order? Food preparation has not started yet.
            </p>

            <div className="mt-4">
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Reason for cancellation (optional):
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Ordered by mistake, change of delivery address"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs focus:outline-hidden focus:border-[#34451F]"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-[#26291F]"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF8F0]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}


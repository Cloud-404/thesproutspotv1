"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VegBadge } from "@/components/VegBadge";
import {
  Clock,
  ArrowRight,
  Search,
  RotateCcw,
  ShoppingBag,
  CheckCircle2,
  Package,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupOrderNumber, setLookupOrderNumber] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!lookupOrderNumber.trim()) return;

    try {
      const res = await fetch(`/api/orders?orderNumber=${lookupOrderNumber.trim()}`);
      const data = await res.json();
      if (data && data.length > 0) {
        router.push(`/orders/${data[0].id}`);
      } else {
        setLookupError("No order found with that order number.");
      }
    } catch {
      setLookupError("Error looking up order.");
    }
  };

  const handleReorder = (order: Order) => {
    // Re-add items to cart
    order.items.forEach((item) => {
      addItem(
        {
          id: item.productId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: "",
          price: item.unitPrice,
          categoryId: "cat-specials",
          isVeg: true,
          isAvailable: true,
          isFeatured: false,
          isTodaySpecial: false,
          prepTimeMinutes: 15,
          imageUrl: item.imageUrl || "/images/food/hero.jpg",
          createdAt: "",
          updatedAt: "",
        },
        item.quantity,
        item.customization as any
      );
    });
    router.push("/cart");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#263719]">My Orders</h1>
            <p className="text-xs sm:text-sm text-[#74776D] mt-0.5">
              Track active meals in preparation and review your past orders.
            </p>
          </div>

          {/* Quick Lookup by Order Number */}
          <form onSubmit={handleLookup} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Track by # (e.g. TSS-1001)"
              value={lookupOrderNumber}
              onChange={(e) => setLookupOrderNumber(e.target.value.toUpperCase())}
              className="px-4 py-2 rounded-full bg-white border border-[#F8EBD2] text-xs font-bold uppercase tracking-wider focus:outline-hidden focus:border-[#34451F]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
            >
              Track
            </button>
          </form>
        </div>

        {lookupError && (
          <div className="mb-6 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {lookupError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-6 border border-[#F8EBD2] animate-pulse h-32"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F8EBD2] shadow-xs max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-[#F8EBD2] text-[#34451F] flex items-center justify-center text-3xl mx-auto mb-3">
              📦
            </div>
            <h3 className="font-extrabold text-lg text-[#263719]">No Orders Yet</h3>
            <p className="text-xs text-[#74776D] mt-1.5 leading-relaxed">
              You haven&apos;t placed any orders yet. Check out our fresh homemade menu!
            </p>
            <Link
              href="/menu"
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#34451F] text-white text-xs font-bold shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Menu</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isActive =
                order.orderStatus !== "DELIVERED" && order.orderStatus !== "CANCELLED";

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition-all ${
                    isActive
                      ? "border-[#34451F]/40 shadow-md ring-1 ring-[#34451F]/20"
                      : "border-[#F8EBD2]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F8EBD2] gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-[#263719]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            order.orderStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : order.orderStatus === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-[#DCE8C9] text-[#263719] animate-pulse"
                          }`}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-xs text-[#74776D] mt-0.5 block">
                        Ordered on {new Date(order.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                        Total Amount
                      </span>
                      <span className="text-base font-extrabold text-[#34451F]">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>

                  {/* Items snapshot snippet */}
                  <div className="py-3 flex flex-wrap gap-2 text-xs text-[#26291F]">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-[#FBF8F0] px-3 py-1 rounded-xl border border-[#F8EBD2] flex items-center gap-1.5"
                      >
                        <VegBadge size="sm" />
                        <span className="font-semibold">
                          {item.quantity}x {item.name}
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#F8EBD2] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#74776D]">
                      Deliver to: <strong>{order.deliveryAddress.areaLocality}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F8EBD2] hover:bg-[#F8EBD2] text-[#26291F] text-xs font-bold transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-Order</span>
                      </button>

                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <span>{isActive ? "Track Live" : "View Details"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

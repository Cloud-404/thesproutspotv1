"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VegBadge } from "@/components/VegBadge";
import { Logo } from "@/components/Logo";
import { BUSINESS_INFO } from "@/lib/business-info";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    appliedCoupon,
    couponMessage,
    applyCoupon,
    removeCoupon,
    buildWhatsAppMessage,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const availableCoupons = [
    { code: "FIRSTBITE", desc: "₹40 off on orders above ₹149" },
    { code: "SPROUT50", desc: "₹50 off on orders above ₹249" },
    { code: "HEALTHY20", desc: "20% off up to ₹75 on orders above ₹199" },
  ];

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponFeedback(null);
    const result = await applyCoupon(code);
    setCouponFeedback(result);
    setCouponLoading(false);
    if (result.success) {
      setCouponInput("");
    }
  };

  const freeDeliveryThreshold = 299;
  const amountNeededForFreeDelivery = freeDeliveryThreshold - subtotal;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#263719]">Your Food Cart</h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-0.5">
            Review your order before proceeding to delivery details.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F8EBD2] shadow-xs max-w-lg mx-auto my-12">
            <Logo size="xl" className="mx-auto mb-4" />
            <h2 className="text-2xl font-extrabold text-[#263719]">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#74776D] mt-2 leading-relaxed">
              Looks like you haven&apos;t added any delicious homemade meals yet. Check out our fresh sandwiches, sprouts chaats, and healthy combos!
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-sm font-bold shadow-md transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Menu</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              {/* Free Delivery Bar */}
              <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs">
                {subtotal >= freeDeliveryThreshold ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Yay! You have unlocked FREE Kitchen Delivery!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#26291F]">
                      <span>Add ₹{amountNeededForFreeDelivery} more for FREE Delivery!</span>
                      <span className="text-[#6C472B]">₹{subtotal} / ₹{freeDeliveryThreshold}</span>
                    </div>
                    <div className="w-full bg-[#F8EBD2] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#34451F] h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#F8EBD2]">
                  <span className="text-sm font-bold text-[#263719]">
                    Selected Items ({items.length})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F8EBD2] shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <VegBadge size="sm" />
                            <h4 className="font-extrabold text-sm text-[#263719]">
                              {item.name}
                            </h4>
                          </div>

                          {/* Customizations display */}
                          {item.customization?.variant && (
                            <span className="text-[11px] text-[#74776D] block mt-0.5">
                              Portion: {item.customization.variant.name}
                            </span>
                          )}

                          {item.customization?.addons &&
                            item.customization.addons.length > 0 && (
                              <span className="text-[11px] text-[#6C472B] block">
                                + {item.customization.addons.map((a) => a.name).join(", ")}
                              </span>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-extrabold text-[#26291F]">
                            ₹{item.totalPrice}
                            <span className="text-[10px] font-normal text-[#74776D] ml-1">
                              (₹{item.unitPrice} each)
                            </span>
                          </span>

                          <div className="flex items-center gap-2 bg-[#FBF8F0] border border-[#F8EBD2] rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full bg-white hover:bg-[#F8EBD2] flex items-center justify-center text-[#26291F] transition-colors shadow-2xs"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1.5 min-w-[14px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-white hover:bg-[#F8EBD2] flex items-center justify-center text-[#26291F] transition-colors shadow-2xs"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Coupons & Bill Summary */}
            <div className="lg:col-span-5 space-y-6">
              {/* Promo Code Box */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#263719]">
                  <Tag className="w-4 h-4 text-[#34451F]" />
                  <span>Have a Promo Code?</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-emerald-800">
                          {appliedCoupon} Applied
                        </span>
                        <p className="text-[10px] text-emerald-700">
                          {couponMessage || `You saved ₹${discount}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon (e.g. SPROUT50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-2.5 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-bold uppercase tracking-wider focus:outline-hidden focus:border-[#34451F]"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs"
                      >
                        {couponLoading ? "Checking..." : "Apply"}
                      </button>
                    </div>

                    {couponFeedback && !couponFeedback.success && (
                      <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {couponFeedback.message}
                      </p>
                    )}

                    {/* Quick Select Coupons */}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                      <span className="text-[10px] uppercase font-bold text-[#74776D] block mb-2">
                        Available Offers
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {availableCoupons.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => handleApplyCoupon(c.code)}
                            className="text-left px-3 py-1.5 rounded-xl border border-dashed border-[#34451F]/40 bg-[#DCE8C9]/20 hover:bg-[#DCE8C9]/50 transition-colors"
                          >
                            <span className="text-[11px] font-extrabold text-[#34451F] block">
                              {c.code}
                            </span>
                            <span className="text-[9px] text-[#74776D]">{c.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#263719] pb-3 border-b border-[#F8EBD2]">
                  Bill Details
                </h3>

                <div className="space-y-2.5 text-xs text-[#74776D]">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-[#26291F]">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery Fee (Local {BUSINESS_INFO.city})</span>
                    <span className="font-semibold text-[#26291F]">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({appliedCoupon})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#F8EBD2] flex justify-between items-center text-sm">
                    <span className="font-extrabold text-[#26291F]">To Pay</span>
                    <span className="font-extrabold text-xl text-[#34451F]">
                      ₹{total}
                    </span>
                  </div>
                </div>

                {/* Primary CTA: Proceed to Checkout */}
                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-sm font-extrabold text-center block shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  id="cart-proceed-checkout-btn"
                >
                  Proceed to Checkout • ₹{total}
                </Link>

                {/* Secondary Fallback: Order via WhatsApp */}
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${buildWhatsAppMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-colors"
                  id="cart-order-whatsapp-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp Instead</span>
                </a>

                <p className="text-[10px] text-center text-[#74776D] pt-1">
                  🔒 Safe & hygienic home-cooked meals • Pay via UPI or Cash on Delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

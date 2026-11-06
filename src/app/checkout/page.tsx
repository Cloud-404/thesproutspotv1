"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Address, PaymentMethod } from "@/lib/types";
import { BUSINESS_INFO } from "@/lib/business-info";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VegBadge } from "@/components/VegBadge";
import { Logo } from "@/components/Logo";
import {
  MapPin,
  CreditCard,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");

  // Address Form State
  const [houseFlat, setHouseFlat] = useState("");
  const [landmark, setLandmark] = useState("");
  const [areaLocality, setAreaLocality] = useState<string>(BUSINESS_INFO.serviceableLocalities[0]);
  const [city, setCity] = useState<string>(BUSINESS_INFO.city);
  const [instructions, setInstructions] = useState("");

  // Customer Contact State
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerPhone(user.phone);
      setCustomerEmail(user.email);

      // Fetch saved addresses
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data: Address[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            const defaultAddr = data.find((a) => a.isDefault) || data[0];
            setSelectedAddressId(defaultAddr.id);
            setHouseFlat(defaultAddr.houseFlat);
            setLandmark(defaultAddr.landmark || "");
            setAreaLocality(defaultAddr.areaLocality);
            setCity(defaultAddr.city);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Handle selecting an existing address
  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setHouseFlat(addr.houseFlat);
    setLandmark(addr.landmark || "");
    setAreaLocality(addr.areaLocality);
    setCity(addr.city);
  };

  const localities = [...BUSINESS_INFO.serviceableLocalities, "Other Locality"];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg("Your cart is empty. Please add items from our menu first.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Please provide your name and phone number for delivery.");
      return;
    }

    if (!houseFlat.trim() || !areaLocality.trim()) {
      setErrorMsg("Please provide complete house/flat details and area.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryAddress: {
          houseFlat: houseFlat.trim(),
          landmark: landmark.trim(),
          areaLocality: areaLocality.trim(),
          city: city.trim(),
          instructions: instructions.trim(),
        },
        cartItems: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          customization: i.customization,
        })),
        couponCode: appliedCoupon,
        paymentMethod,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Celebrate success!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      router.push(`/orders/${data.order.id}?confirmed=true`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Order placement failed";
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-3xl border border-[#F8EBD2] shadow-xs">
            <Logo size="lg" className="mx-auto mb-3" />
            <h2 className="text-xl font-bold text-[#263719]">Your Cart is Empty</h2>
            <p className="text-xs text-[#74776D] mt-2">
              Please add items from our menu before proceeding to checkout.
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#34451F] text-white text-xs font-bold"
            >
              Go to Menu
            </button>
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#263719]">Checkout & Delivery</h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-0.5">
            Complete your delivery details to place your hot, home-cooked meal order.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Delivery & Payment Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#263719] flex items-center gap-2 pb-3 border-b border-[#F8EBD2]">
                  <span className="w-6 h-6 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xs font-extrabold">
                    1
                  </span>
                  Customer Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Mobile Number (for delivery updates) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98234 56789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Email Address (Optional receipt)
                    </label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
                  <h3 className="text-sm font-bold text-[#263719] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xs font-extrabold">
                      2
                    </span>
                    Delivery Address ({BUSINESS_INFO.city}, {BUSINESS_INFO.state})
                  </h3>
                  <span className="text-[10px] text-[#34451F] font-bold bg-[#DCE8C9]/40 px-2.5 py-0.5 rounded-full">
                    Local Kitchen Delivery
                  </span>
                </div>

                {/* Saved addresses selector */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-[#74776D] block">
                      Choose Saved Address:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                            selectedAddressId === addr.id
                              ? "border-[#34451F] bg-[#DCE8C9]/30 shadow-xs"
                              : "border-neutral-200 hover:border-[#DCE8C9]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#263719]">
                              {addr.label || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-[#34451F] text-white px-1.5 py-0.2 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#74776D] mt-1 line-clamp-1">
                            {addr.houseFlat}, {addr.areaLocality}
                          </p>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId("custom");
                          setHouseFlat("");
                          setLandmark("");
                        }}
                        className={`p-3 rounded-2xl border border-dashed text-left text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          selectedAddressId === "custom"
                            ? "border-[#34451F] bg-white text-[#34451F]"
                            : "border-neutral-300 text-[#74776D] hover:bg-neutral-50"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enter New Address</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      House / Flat / Building / Street *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Lotus Heights, 12 Saket Nagar"
                      value={houseFlat}
                      onChange={(e) => setHouseFlat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Anand Bazaar Circle"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                        Area / Locality *
                      </label>
                      <select
                        value={areaLocality}
                        onChange={(e) => setAreaLocality(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                      >
                        {localities.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ring bell twice, leave with guard, mild spicy"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#263719] flex items-center gap-2 pb-3 border-b border-[#F8EBD2]">
                  <span className="w-6 h-6 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xs font-extrabold">
                    3
                  </span>
                  Choose Payment Method
                </h3>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-[#34451F] bg-[#DCE8C9]/20 shadow-xs"
                        : "border-neutral-200 hover:border-[#DCE8C9]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-[#34451F] bg-[#34451F]"
                            : "border-neutral-300"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#26291F] flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#34451F]" />
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-[11px] text-[#74776D] mt-0.5">
                          Pay cash to our delivery partner upon receiving your food order.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#34451F]">₹{total}</span>
                  </label>

                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod("UPI")}
                    className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === "UPI"
                        ? "border-[#34451F] bg-[#DCE8C9]/20 shadow-xs"
                        : "border-neutral-200 hover:border-[#DCE8C9]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                            paymentMethod === "UPI"
                              ? "border-[#34451F] bg-[#34451F]"
                              : "border-neutral-300"
                          }`}
                        >
                          {paymentMethod === "UPI" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-[#26291F] flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-[#34451F]" />
                            UPI (Google Pay, PhonePe, Paytm, BHIM)
                          </span>
                          <p className="text-[11px] text-[#74776D] mt-0.5">
                            Scan QR code or pay to UPI ID <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] text-[#263719] font-bold">sproutsspot@okaxis</code>
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </div>

                    {paymentMethod === "UPI" && (
                      <div className="mt-3 pt-3 border-t border-[#DCE8C9] flex items-center gap-4 bg-white p-3 rounded-xl">
                        <div className="w-16 h-16 bg-[#FBF8F0] border border-[#F8EBD2] rounded-lg flex items-center justify-center text-xs text-center p-1 font-mono font-bold text-[#34451F]">
                          [UPI QR]
                        </div>
                        <div className="text-[11px] text-[#74776D] space-y-1">
                          <p className="font-bold text-[#26291F]">
                            VPA: sproutsspot@okaxis
                          </p>
                          <p className="text-[10px]">
                            Verified merchant: The Sprouts Spot Kitchen
                          </p>
                          <span className="inline-block text-[10px] text-emerald-700 font-semibold">
                            ✓ Payment will be marked verified automatically upon order confirmation
                          </span>
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Online Payment */}
                  <label
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === "ONLINE"
                        ? "border-[#34451F] bg-[#DCE8C9]/20 shadow-xs"
                        : "border-neutral-200 hover:border-[#DCE8C9]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                          paymentMethod === "ONLINE"
                            ? "border-[#34451F] bg-[#34451F]"
                            : "border-neutral-300"
                        }`}
                      >
                        {paymentMethod === "ONLINE" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#26291F] flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[#34451F]" />
                          Cards / Net Banking (Demo Gateway)
                        </span>
                        <p className="text-[11px] text-[#74776D] mt-0.5">
                          Simulated secure online payment gateway for testing.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary Card */}
            <div className="lg:col-span-5 space-y-6 sticky top-28">
              <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#263719] pb-3 border-b border-[#F8EBD2]">
                  Order Summary ({items.length} items)
                </h3>

                {/* Items summary list */}
                <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <VegBadge size="sm" />
                        <div>
                          <span className="font-bold text-[#26291F]">
                            {item.quantity}x {item.name}
                          </span>
                          {item.customization?.variant && (
                            <span className="text-[10px] text-[#74776D] block">
                              ({item.customization.variant.name})
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-[#26291F]">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="space-y-2 pt-3 border-t border-[#F8EBD2] text-xs text-[#74776D]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#26291F]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-[#26291F]">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#F8EBD2] flex justify-between items-center text-sm">
                    <span className="font-extrabold text-[#26291F]">Total Amount</span>
                    <span className="font-extrabold text-2xl text-[#34451F]">
                      ₹{total}
                    </span>
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                <div className="p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] flex items-center gap-2 text-xs text-[#26291F]">
                  <Clock className="w-4 h-4 text-[#34451F] shrink-0" />
                  <span>
                    Estimated delivery: <strong>~30-35 mins</strong> after kitchen confirmation
                  </span>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-base font-extrabold text-center block shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 disabled:opacity-50"
                  id="checkout-place-order-btn"
                >
                  {isSubmitting ? "Placing Your Order..." : `Place Order • ₹${total}`}
                </button>

                <p className="text-[10px] text-center text-[#74776D] flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-[#34451F]" />
                  Encrypted checkout • Zero hidden charges
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

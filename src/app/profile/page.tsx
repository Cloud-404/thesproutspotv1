"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address } from "@/lib/types";
import { BUSINESS_INFO } from "@/lib/business-info";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  Bike,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New address state
  const [label, setLabel] = useState("Home");
  const [houseFlat, setHouseFlat] = useState("");
  const [landmark, setLandmark] = useState("");
  const [areaLocality, setAreaLocality] = useState<string>(BUSINESS_INFO.serviceableLocalities[0]);
  const [city, setCity] = useState<string>(BUSINESS_INFO.city);
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddr(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user) {
      fetchAddresses();
    }
  }, [user, isLoading]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseFlat.trim() || !areaLocality.trim()) return;

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          houseFlat: houseFlat.trim(),
          landmark: landmark.trim(),
          areaLocality: areaLocality.trim(),
          city: city.trim(),
          isDefault,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setHouseFlat("");
        setLandmark("");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to save address:", err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this saved address?")) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#263719]">Customer Account</h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-0.5">
            Manage your personal profile and saved {BUSINESS_INFO.city} delivery addresses.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs text-center">
              <div className="w-20 h-20 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-3xl font-black mx-auto mb-4 uppercase">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-extrabold text-[#263719]">{user.name}</h2>
              {user.username && (
                <p className="text-xs font-bold text-[#6C472B]">@{user.username}</p>
              )}
              <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-[#34451F] text-white text-[10px] font-bold uppercase">
                Role: {user.role}
              </span>

              <div className="mt-6 pt-6 border-t border-[#F8EBD2] space-y-3 text-left text-xs text-[#26291F]">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#74776D] shrink-0" />
                  <span className="font-semibold">{user.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#74776D] shrink-0" />
                  <span className="font-semibold">{user.phone}</span>
                </div>
              </div>

              {/* Special Dashboard links if role is admin or delivery */}
              {user.role === "admin" && (
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <Link
                    href="/admin"
                    className="w-full py-2.5 px-4 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Open Admin Kitchen Dashboard
                  </Link>
                </div>
              )}

              {user.role === "delivery" && (
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <Link
                    href="/delivery"
                    className="w-full py-2.5 px-4 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Bike className="w-4 h-4" /> Open Delivery Partner Dashboard
                  </Link>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/orders"
                  className="w-full py-2.5 px-4 rounded-full border border-[#F8EBD2] hover:bg-[#F8EBD2] text-[#26291F] text-xs font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> View My Past Orders
                </Link>

                <button
                  onClick={() => logout()}
                  className="w-full py-2.5 px-4 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Delivery Addresses */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#F8EBD2]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#34451F]" />
                  <h3 className="font-extrabold text-base text-[#263719]">
                    Saved Delivery Addresses
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34451F] text-white text-xs font-bold hover:bg-[#263719]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? "Cancel" : "Add Address"}</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddForm && (
                <form
                  onSubmit={handleSaveAddress}
                  className="p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] space-y-3 animate-in fade-in"
                >
                  <h4 className="text-xs font-extrabold text-[#26291F]">
                    New Delivery Address
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#74776D] block mb-1">
                        Address Label (e.g. Home, Office, Gym)
                      </label>
                      <input
                        type="text"
                        required
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8EBD2] text-xs font-semibold text-[#26291F]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#74776D] block mb-1">
                        Area / Locality
                      </label>
                      <input
                        type="text"
                        required
                        value={areaLocality}
                        onChange={(e) => setAreaLocality(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8EBD2] text-xs font-semibold text-[#26291F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#74776D] block mb-1">
                      House / Flat / Building / Street
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 301, Silver Residency"
                      value={houseFlat}
                      onChange={(e) => setHouseFlat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8EBD2] text-xs font-semibold text-[#26291F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#74776D] block mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near Vijay Nagar Square"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#F8EBD2] text-xs font-semibold text-[#26291F]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#74776D] block mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        value={city}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#26291F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="rounded accent-[#34451F]"
                      />
                      <span>Set as default address</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              {loadingAddr ? (
                <p className="text-xs text-[#74776D]">Loading addresses...</p>
              ) : addresses.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#74776D]">
                  No saved addresses yet. Add your home or office address for faster checkout!
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl border border-[#F8EBD2] bg-[#FBF8F0] flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#263719]">
                            {addr.label || "Saved Address"}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-[#34451F] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#26291F] mt-1 font-medium">
                          {addr.houseFlat}
                        </p>
                        {addr.landmark && (
                          <p className="text-[11px] text-[#74776D]">
                            Landmark: {addr.landmark}
                          </p>
                        )}
                        <p className="text-[11px] text-[#74776D]">
                          {addr.areaLocality}, {addr.city}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

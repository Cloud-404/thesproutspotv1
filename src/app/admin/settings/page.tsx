"use client";

import React, { useState, useEffect } from "react";
import { StoreSettings } from "@/lib/types";
import { Settings, Save, CheckCircle2, ShieldCheck, Power, MessageCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState("08:30");
  const [closingTime, setClosingTime] = useState("22:00");
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [freeThreshold, setFreeThreshold] = useState(299);
  const [minOrder, setMinOrder] = useState(99);
  const [areasInput, setAreasInput] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [kitchenAddress, setKitchenAddress] = useState("");
  const [enableCod, setEnableCod] = useState(true);
  const [enableUpi, setEnableUpi] = useState(true);
  const [upiId, setUpiId] = useState("sproutsspot@okaxis");
  const [enableOnline, setEnableOnline] = useState(true);
  const [commission, setCommission] = useState(40);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data: StoreSettings) => {
        setSettings(data);
        setStoreName(data.storeName);
        setTagline(data.tagline);
        setIsOpen(data.isOpen);
        setOpeningTime(data.openingTime);
        setClosingTime(data.closingTime);
        setPrepMinutes(data.estimatedPrepMinutes);
        setDeliveryFee(data.deliveryFee);
        setFreeThreshold(data.freeDeliveryThreshold);
        setMinOrder(data.minOrderValue);
        setAreasInput(data.serviceableAreas.join(", "));
        setPhone(data.businessPhone);
        setWhatsapp(data.whatsappNumber);
        setKitchenAddress(data.kitchenAddress);
        setEnableCod(data.enableCod);
        setEnableUpi(data.enableUpi);
        setUpiId(data.upiId);
        setEnableOnline(data.enableOnlinePayment);
        setCommission(data.partnerCommissionPerOrder);
        setAnnouncement(data.announcement || "");
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    try {
      const serviceableAreas = areasInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        isOpen,
        openingTime,
        closingTime,
        estimatedPrepMinutes: Number(prepMinutes),
        deliveryFee: Number(deliveryFee),
        freeDeliveryThreshold: Number(freeThreshold),
        minOrderValue: Number(minOrder),
        serviceableAreas,
        businessPhone: phone.trim(),
        whatsappNumber: whatsapp.trim(),
        kitchenAddress: kitchenAddress.trim(),
        enableCod,
        enableUpi,
        upiId: upiId.trim(),
        enableOnlinePayment: enableOnline,
        partnerCommissionPerOrder: Number(commission),
        announcement: announcement.trim(),
      };

      const res = await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-xs font-bold text-[#74776D]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Store & Kitchen Settings
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Manage operational parameters, delivery thresholds, payment methods, and contact channels without touching code.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Updated Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operations & Hours */}
        <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#263719] pb-2 border-b border-[#F8EBD2]">
            Operations & Service Hours
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
            <div>
              <span className="font-bold text-xs text-[#26291F] block">
                Accepting Orders (Store Open / Closed)
              </span>
              <span className="text-[11px] text-[#74776D]">
                Turn off during high kitchen rush or after daily kitchen hours
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase transition-colors ${
                isOpen ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {isOpen ? "Kitchen OPEN" : "Kitchen CLOSED"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Opening Time (Daily)
              </label>
              <input
                type="text"
                required
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Closing Time (Daily)
              </label>
              <input
                type="text"
                required
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Estimated Prep Time (Mins)
              </label>
              <input
                type="number"
                min={5}
                required
                value={prepMinutes}
                onChange={(e) => setPrepMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Delivery Thresholds */}
        <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#263719] pb-2 border-b border-[#F8EBD2]">
            Delivery Pricing & Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Standard Delivery Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#26291F] block mb-1">
              Serviceable Nimbahera Localities (comma-separated)
            </label>
            <textarea
              rows={2}
              value={areasInput}
              onChange={(e) => setAreasInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
            />
          </div>
        </div>

        {/* Payments & WhatsApp Integration */}
        <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-[#263719] pb-2 border-b border-[#F8EBD2]">
            Payment Modes & Contacts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Business WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Kitchen Contact Phone
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Partner Commission (₹ / delivery)
              </label>
              <input
                type="number"
                min={0}
                required
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                Kitchen Address (Pickup Location)
              </label>
              <input
                type="text"
                required
                value={kitchenAddress}
                onChange={(e) => setKitchenAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-6 text-xs font-bold text-[#26291F]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableCod}
                onChange={(e) => setEnableCod(e.target.checked)}
                className="rounded accent-[#34451F]"
              />
              <span>Enable Cash on Delivery (COD)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableUpi}
                onChange={(e) => setEnableUpi(e.target.checked)}
                className="rounded accent-[#34451F]"
              />
              <span>Enable UPI Payments</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableOnline}
                onChange={(e) => setEnableOnline(e.target.checked)}
                className="rounded accent-[#34451F]"
              />
              <span>Enable Online Gateway</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Store Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

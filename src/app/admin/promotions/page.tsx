"use client";

import React, { useState, useEffect } from "react";
import { Coupon } from "@/lib/types";
import { Plus, Tag, Trash2, Power, X, Calendar, Percent } from "lucide-react";

export default function AdminPromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENTAGE">("FLAT");
  const [discountValue, setDiscountValue] = useState(50);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [validUntil, setValidUntil] = useState("2027-12-31");
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minOrderValue: Number(minOrderValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          validUntil,
          isActive: true,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setCode("");
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotional coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Promotions & Coupon Codes
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Create percentage discounts, flat discounts, minimum cart values, and expiration dates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5 text-[#34451F]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#263719] tracking-wider">
                    {c.code}
                  </h3>
                  <span className="text-[10px] text-[#74776D]">
                    {c.discountType === "FLAT" ? `₹${c.discountValue} Flat Discount` : `${c.discountValue}% Percentage Off`}
                  </span>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                  c.isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {c.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#74776D] pt-2 border-t border-neutral-100">
              <div className="flex justify-between">
                <span>Min Order Subtotal:</span>
                <span className="font-bold text-[#26291F]">₹{c.minOrderValue}</span>
              </div>
              {c.maxDiscount && (
                <div className="flex justify-between">
                  <span>Max Discount Cap:</span>
                  <span className="font-bold text-[#26291F]">₹{c.maxDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Valid Until:</span>
                <span className="font-bold text-[#26291F]">{c.validUntil}</span>
              </div>
              <div className="flex justify-between">
                <span>Times Used:</span>
                <span className="font-bold text-[#34451F]">{c.usageCount} times</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
              <h3 className="font-extrabold text-base text-[#263719]">
                Create Coupon Code
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Coupon Code * (e.g. SPROUT50)
                </label>
                <input
                  type="text"
                  required
                  placeholder="CODE"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-bold uppercase tracking-wider focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  >
                    <option value="FLAT">Flat ₹ Off</option>
                    <option value="PERCENTAGE">% Percentage Off</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="Optional"
                    value={maxDiscount || ""}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-bold text-[#26291F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold"
                >
                  {saving ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Product, Category } from "@/lib/types";
import { VegBadge } from "@/components/VegBadge";
import { ImageUploader } from "@/components/ImageUploader";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  Sparkles,
  X,
  Clock,
  Check,
} from "lucide-react";

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("all");

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState(99);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrepTime, setFormPrepTime] = useState(15);
  const [formBadge, setFormBadge] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("/images/food/hero.jpg");
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsTodaySpecial, setFormIsTodaySpecial] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMenuData = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if (data.categories && data.categories.length > 0 && !formCategoryId) {
          setFormCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const openNewModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDescription("");
    setFormPrice(99);
    setFormCategoryId(categories[0]?.id || "cat-sandwiches");
    setFormPrepTime(15);
    setFormBadge("");
    setFormImageUrl("/images/food/hero.jpg");
    setFormIsAvailable(true);
    setFormIsTodaySpecial(false);
    setFormIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormPrice(p.price);
    setFormCategoryId(p.categoryId);
    setFormPrepTime(p.prepTimeMinutes);
    setFormBadge(p.badge || "");
    setFormImageUrl(p.imageUrl);
    setFormIsAvailable(p.isAvailable);
    setFormIsTodaySpecial(p.isTodaySpecial);
    setFormIsFeatured(p.isFeatured);
    setModalOpen(true);
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle-availability" }),
      });
      if (res.ok) {
        fetchMenuData();
      }
    } catch (e) {
      console.error("Error toggling availability:", e);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMenuData();
      }
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      const payload = {
        id: editingProduct?.id,
        name: formName.trim(),
        description: formDescription.trim(),
        price: Number(formPrice),
        categoryId: formCategoryId,
        prepTimeMinutes: Number(formPrepTime),
        badge: formBadge.trim(),
        imageUrl: formImageUrl.trim(),
        isAvailable: formIsAvailable,
        isTodaySpecial: formIsTodaySpecial,
        isFeatured: formIsFeatured,
        isVeg: true,
      };

      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchMenuData();
      }
    } catch (e) {
      console.error("Error saving product:", e);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCatId === "all" || p.categoryId === selectedCatId;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Menu Management
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Add new vegetarian dishes, adjust prices, edit descriptions, and toggle item availability.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74776D]" />
          <input
            type="text"
            placeholder="Search items by name or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden focus:border-[#34451F]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCatId("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
              selectedCatId === "all"
                ? "bg-[#34451F] text-white"
                : "bg-[#FBF8F0] text-[#74776D] hover:text-[#26291F]"
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                selectedCatId === c.id
                  ? "bg-[#34451F] text-white"
                  : "bg-[#FBF8F0] text-[#74776D] hover:text-[#26291F]"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl p-4 border shadow-xs flex flex-col justify-between transition-all ${
              p.isAvailable ? "border-[#F8EBD2]" : "border-red-200 opacity-75 bg-neutral-50"
            }`}
          >
            <div>
              {/* Product Image */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#F8EBD2] mb-3">
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <VegBadge size="sm" />
                  {p.badge && (
                    <span className="bg-[#263719] text-[#F8EBD2] text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>

                {!p.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-xs uppercase tracking-wider">
                    Sold Out / Inactive
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm text-[#263719] leading-tight">
                  {p.name}
                </h3>
                <span className="font-extrabold text-sm text-[#26291F]">₹{p.price}</span>
              </div>

              <p className="text-[11px] text-[#74776D] mt-1 line-clamp-2">
                {p.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-[#74776D] mt-2">
                <Clock className="w-3 h-3 text-[#34451F]" />
                <span>Prep: {p.prepTimeMinutes}m</span>
                {p.isTodaySpecial && (
                  <span className="text-[#6C472B] font-bold">• Today Special</span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[#F8EBD2] flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggleAvailability(p.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                  p.isAvailable
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                }`}
                title="Toggle Storefront Availability"
              >
                <Power className="w-3 h-3" />
                <span>{p.isAvailable ? "Available" : "Hidden"}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-700"
                  title="Edit product"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(p.id, p.name)}
                  className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                  title="Delete product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
              <h3 className="font-extrabold text-base text-[#263719]">
                {editingProduct ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Grilled Sandwich"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ingredients and culinary description..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Prep Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                    Badge Tag (e.g. Bestseller)
                  </label>
                  <input
                    type="text"
                    placeholder="Bestseller, High Protein"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              <ImageUploader
                value={formImageUrl}
                onChange={setFormImageUrl}
                label="Food Product Image"
              />

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-[#26291F]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsAvailable}
                    onChange={(e) => setFormIsAvailable(e.target.checked)}
                    className="rounded accent-[#34451F]"
                  />
                  <span>Available for Ordering</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsTodaySpecial}
                    onChange={(e) => setFormIsTodaySpecial(e.target.checked)}
                    className="rounded accent-[#34451F]"
                  />
                  <span>Today&apos;s Special</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
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
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

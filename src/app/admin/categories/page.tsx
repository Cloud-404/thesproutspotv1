"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/lib/types";
import { Plus, Pencil, Trash2, X, Tags } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openNewModal = () => {
    setEditingCat(null);
    setName("");
    setDescription("");
    setSortOrder(categories.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCat(c);
    setName(c.name);
    setDescription(c.description || "");
    setSortOrder(c.sortOrder);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCat?.id,
          name: name.trim(),
          description: description.trim(),
          sortOrder: Number(sortOrder),
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchCats();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchCats();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#263719]">
            Food Categories
          </h1>
          <p className="text-xs text-[#74776D] mt-0.5">
            Organize the menu into customer-facing categories.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#F8EBD2] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FBF8F0] border-b border-[#F8EBD2] text-[#74776D] uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/70">
                <td className="py-3.5 px-4 font-bold text-[#26291F]">#{c.sortOrder}</td>
                <td className="py-3.5 px-4 font-extrabold text-[#263719] text-sm">
                  {c.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#74776D]">
                  {c.slug}
                </td>
                <td className="py-3.5 px-4 text-[#74776D]">{c.description || "—"}</td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-700"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F8EBD2]">
              <h3 className="font-extrabold text-base text-[#263719]">
                {editingCat ? "Edit Category" : "New Category"}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthy Meals"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description for customer discovery..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Sort Display Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
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
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

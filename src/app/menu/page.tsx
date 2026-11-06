"use client";

import React, { useState, useEffect } from "react";
import { Product, Category } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "prep">("featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        setCategories(data.categories || []);
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : selectedCategory === "specials"
          ? p.isTodaySpecial
          : p.categoryId === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.badge?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "prep") return a.prepTimeMinutes - b.prepTimeMinutes;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-16">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <span className="text-xs font-bold text-[#6C472B] uppercase tracking-wider">
            Pure Vegetarian • Nimbahera Home Kitchen
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263719] mt-1">
            Explore Our Full Menu
          </h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-1">
            All meals freshly prepared upon receiving your order using 100% pure vegetarian ingredients.
          </p>
        </div>

        {/* Filter & Search Bar Controls */}
        <div className="bg-white p-4 rounded-3xl border border-[#F8EBD2] shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74776D]" />
            <input
              type="text"
              placeholder="Search by food name, ingredients, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-medium placeholder-[#74776D] focus:outline-hidden focus:border-[#34451F]"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <ArrowUpDown className="w-4 h-4 text-[#74776D]" />
            <span className="text-xs font-bold text-[#26291F]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden"
            >
              <option value="featured">Featured / Specials</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="prep">Fastest Prep Time</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-[#34451F] text-white shadow-md scale-105"
                : "bg-white text-[#26291F] border border-[#F8EBD2] hover:bg-[#F8EBD2]"
            }`}
          >
            All Items ({products.length})
          </button>

          <button
            onClick={() => setSelectedCategory("specials")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === "specials"
                ? "bg-[#34451F] text-white shadow-md scale-105"
                : "bg-[#DCE8C9] text-[#263719] hover:bg-[#34451F] hover:text-white"
            }`}
          >
            ⭐ Today&apos;s Specials
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#34451F] text-white shadow-md scale-105"
                  : "bg-white text-[#26291F] border border-[#F8EBD2] hover:bg-[#F8EBD2]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-4 border border-[#F8EBD2] animate-pulse space-y-4"
              >
                <div className="h-44 bg-neutral-200 rounded-2xl w-full"></div>
                <div className="h-4 bg-neutral-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded-md w-1/2"></div>
                <div className="h-8 bg-neutral-200 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F8EBD2] max-w-md mx-auto shadow-xs">
            <h3 className="font-extrabold text-lg text-[#263719]">No dishes found</h3>
            <p className="text-xs text-[#74776D] mt-1.5">
              Try adjusting your category or search term to discover more options.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-5 px-6 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <FloatingWhatsApp />
      <MobileBottomNav />
      <Footer />
    </div>
  );
}

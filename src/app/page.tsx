"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, Category, StoreSettings } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { VegBadge } from "@/components/VegBadge";
import {
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Leaf,
  Heart,
  Search,
  CheckCircle2,
  PhoneCall,
  ShoppingBag,
} from "lucide-react";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/store/settings"),
        ]);
        const menuData = await menuRes.json();
        const settingsData = await settingsRes.json();

        setCategories(menuData.categories || []);
        setProducts(menuData.products || []);
        setStoreSettings(settingsData);
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
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
  });

  const specials = products.filter((p) => p.isTodaySpecial || p.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      {/* Top Demo Bar for Testing */}
      <DemoBar />

      {/* Main Header */}
      <Header />

      <main className="flex-1 pb-24 md:pb-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Status Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DCE8C9] border border-[#34451F]/20 text-[#263719] text-xs font-bold shadow-xs">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>Kitchen Open & Taking Orders</span>
                  <span className="text-[#34451F]/40">•</span>
                  <span className="text-[#6C472B]">Fresh Batches Ready</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#263719] tracking-tight leading-[1.15]">
                  Freshly Made. <br />
                  <span className="text-[#34451F] underline decoration-[#DCE8C9] decoration-wavy decoration-2">
                    Lovingly Delivered.
                  </span>
                </h1>

                {/* Tagline & Supporting description */}
                <p className="text-base sm:text-lg text-[#74776D] max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
                  Discover fresh, delicious vegetarian meals prepared with care in our Indore home kitchen. Wholesome sprouted grain bowls, loaded grilled sandwiches, and authentic daily thalis made fresh on order.
                </p>

                {/* Operational Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#F8EBD2] text-left">
                    <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                      Avg Prep Time
                    </span>
                    <span className="text-sm font-extrabold text-[#263719] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#34451F]" />
                      {storeSettings?.estimatedPrepMinutes || 20} mins
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#F8EBD2] text-left">
                    <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                      Min Order
                    </span>
                    <span className="text-sm font-extrabold text-[#263719] mt-0.5 block">
                      ₹{storeSettings?.minOrderValue || 99}
                    </span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-[#F8EBD2] text-left">
                    <span className="text-[10px] uppercase font-bold text-[#74776D] block">
                      Free Delivery
                    </span>
                    <span className="text-sm font-extrabold text-[#34451F] mt-0.5 block">
                      Over ₹{storeSettings?.freeDeliveryThreshold || 299}
                    </span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                  <a
                    href="#menu-section"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <Link
                    href="/menu"
                    className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-[#F8EBD2] text-[#263719] text-base font-bold border border-[#F8EBD2] shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Explore Our Menu</span>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-[#74776D]">
                  <span className="flex items-center gap-1.5">
                    <VegBadge size="sm" /> 100% Pure Vegetarian
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#34451F]" /> Hygienic Kitchen
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-[#34451F]" /> Zero Preservatives
                  </span>
                </div>
              </div>

              {/* Right Hero Image Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative backdrop shapes */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#DCE8C9] to-[#F8EBD2] rounded-3xl transform -rotate-2 -z-10 shadow-lg"></div>

                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-[#F8EBD2]">
                    <Image
                      src="/images/food/hero.jpg"
                      alt="The Sprouts Spot Fresh Vegetarian Spread"
                      fill
                      priority
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Floating badge inside image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#E27B38] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                          Chef Radha&apos;s Signature
                        </span>
                      </div>
                      <p className="font-extrabold text-lg">
                        Daily Fresh Moong Sprouts & Grilled Delights
                      </p>
                      <p className="text-xs text-white/90">
                        Crafted fresh every single morning with farm-picked produce
                      </p>
                    </div>
                  </div>

                  {/* Floating Testimonial Pill */}
                  <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white p-3.5 rounded-2xl shadow-xl border border-[#F8EBD2] flex items-center gap-3 max-w-xs">
                    <div className="w-10 h-10 rounded-full bg-[#DCE8C9] flex items-center justify-center text-lg">
                      🥗
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#26291F]">
                        &quot;Tastes just like home!&quot;
                      </p>
                      <p className="text-[10px] text-[#74776D]">
                        Priya S., Regular Customer in Saket
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITIONS */}
        <section className="py-12 bg-[#F8EBD2]/50 border-y border-[#F8EBD2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-2xl shrink-0">
                  🌱
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#263719]">
                    Daily Live Sprouts
                  </h4>
                  <p className="text-xs text-[#74776D] mt-1 leading-relaxed">
                    Naturally sprouted organic moong with superior nutrient and protein content.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-2xl shrink-0">
                  🧀
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#263719]">
                    Farm Fresh Paneer
                  </h4>
                  <p className="text-xs text-[#74776D] mt-1 leading-relaxed">
                    Fresh pure cow milk paneer, prepared in homestyle ghee and spices daily.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-2xl shrink-0">
                  ✨
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#263719]">
                    Hygienic Home Kitchen
                  </h4>
                  <p className="text-xs text-[#74776D] mt-1 leading-relaxed">
                    Strict sanitation, filtered water, and love in every single dish we cook.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#F8EBD2] shadow-xs flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-2xl shrink-0">
                  🛵
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#263719]">
                    Local Fast Delivery
                  </h4>
                  <p className="text-xs text-[#74776D] mt-1 leading-relaxed">
                    Packed hot in eco-friendly packaging and delivered promptly to your door.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MENU & FOOD DISCOVERY SECTION */}
        <section id="menu-section" className="py-16 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C472B] uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#34451F]" />
                  Handcrafted Vegetarian Delights
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#263719]">
                  Explore Our Fresh Menu
                </h2>
                <p className="text-sm text-[#74776D] mt-1 max-w-xl">
                  Order hearty sandwiches, nourishing sprout bowls, and balanced Indian meal combos made to order.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74776D]" />
                <input
                  type="text"
                  placeholder="Search paneer, chaat, sandwich..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#F8EBD2] text-xs font-medium placeholder-[#74776D] focus:outline-hidden focus:border-[#34451F] focus:ring-1 focus:ring-[#34451F] transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#74776D] hover:text-[#26291F]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
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
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === "specials"
                    ? "bg-[#34451F] text-white shadow-md scale-105"
                    : "bg-[#DCE8C9] text-[#263719] hover:bg-[#34451F] hover:text-white"
                }`}
              >
                <span>⭐ Today&apos;s Specials</span>
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

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {[1, 2, 3, 4].map((n) => (
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
              <div className="bg-white rounded-3xl p-12 text-center border border-[#F8EBD2] mt-8 max-w-md mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-[#F8EBD2] text-[#6C472B] flex items-center justify-center text-3xl mx-auto mb-4">
                  🔍
                </div>
                <h3 className="font-extrabold text-lg text-[#263719]">
                  No items found
                </h3>
                <p className="text-xs text-[#74776D] mt-1.5">
                  We couldn&apos;t find any vegetarian dishes matching &quot;{searchQuery}&quot;. Try exploring other categories!
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-5 px-6 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
                >
                  Reset Menu Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* TODAY'S CHEF SPECIAL BANNER */}
        <section className="py-12 bg-[#263719] text-[#F8EBD2] my-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-[#34451F] to-[#263719] p-8 sm:p-12 border border-[#34451F] shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-xl space-y-4">
                <span className="bg-[#DCE8C9] text-[#263719] text-xs font-extrabold uppercase px-3 py-1 rounded-full inline-block">
                  Limited Daily Batch
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Have Special Dietary Preferences?
                </h3>
                <p className="text-xs sm:text-sm text-[#F8EBD2]/90 leading-relaxed">
                  Chef Radha accommodates custom spice levels (mild/medium/spicy), Jain options (without onion/garlic), and oil-free sprout preparations upon request. Just mention it in your order notes or ping us on WhatsApp!
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="https://wa.me/919876543210?text=Hi%20The%20Sprouts%20Spot!%20I%20have%20a%20custom%20dietary%20request%20for%20today."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <span>💬 WhatsApp Chef Directly</span>
                  </a>
                  <a
                    href="#menu-section"
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                  >
                    View Menu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}

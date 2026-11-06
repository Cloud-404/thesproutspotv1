"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { VegBadge } from "@/components/VegBadge";
import { Sparkles, Heart, ShieldCheck, Leaf, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 md:pb-16 space-y-12">
        {/* Story Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C472B] uppercase tracking-wider bg-[#F8EBD2] px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#34451F]" />
            From Our Nimbahera Kitchen to Your Table
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263719] tracking-tight">
            Our Story & Food Philosophy
          </h1>
          <p className="text-sm sm:text-base text-[#74776D] leading-relaxed">
            The Sprouts Spot was born out of a simple conviction: healthy food doesn&apos;t have to be bland, and homemade food should always feel like it was prepared by family.
          </p>
        </div>

        {/* Founder & Kitchen Photo Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F8EBD2] shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative aspect-square rounded-2xl overflow-hidden shadow-md bg-[#F8EBD2]">
            <Image
              src="/images/food/healthy-meal-combo.jpg"
              alt="The Sprouts Spot Wholesome Meal Thali"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-[#74776D] leading-relaxed">
            <div className="flex items-center gap-2">
              <VegBadge size="md" />
              <span className="font-extrabold text-[#34451F] uppercase tracking-wider">
                100% Pure Vegetarian Home Kitchen
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-[#263719]">
              Nourishing Nimbahera, One Fresh Batch at a Time
            </h2>

            <p>
              Started as a dedicated home kitchen in Maheshwari Mohalla, Nimbahera (Chittorgarh), The Sprouts Spot initially prepared nourishing breakfast boxes and sprout bowls for neighbors and friends.
            </p>

            <p>
              Every morning at 6:00 AM, our day begins by inspecting freshly sprouted green moong beans and hand-churning creamy paneer. We never use preservatives, frozen premixes, artificial food colorings, or leftover oils.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
                <span className="font-extrabold text-sm text-[#263719] block">24-Hour</span>
                <span className="text-[11px] text-[#74776D]">Natural Grain Germination</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2]">
                <span className="font-extrabold text-sm text-[#263719] block">Farm Fresh</span>
                <span className="text-[11px] text-[#74776D]">Pure Cow Milk Cottage Cheese</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#F8EBD2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
              🌱
            </div>
            <h3 className="font-bold text-sm text-[#263719]">Live Sprouted Nutrition</h3>
            <p className="text-xs text-[#74776D] leading-relaxed">
              Sprouting increases bioavailability of vitamins B and C, fiber, and plant proteins while making digestion effortless.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F8EBD2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
              🧼
            </div>
            <h3 className="font-bold text-sm text-[#263719]">Hospital-Grade Hygiene</h3>
            <p className="text-xs text-[#74776D] leading-relaxed">
              RO water washing for all raw vegetables and herbs, sanitized stainless steel cookware, and hairnet/glove protocols.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F8EBD2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
              🧈
            </div>
            <h3 className="font-bold text-sm text-[#263719]">Desi Ghee & Fresh Oil</h3>
            <p className="text-xs text-[#74776D] leading-relaxed">
              We never re-heat frying oil. All parathas and bhurjis are brushed with pure A2 cow ghee or cold-pressed mustard oil.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#F8EBD2] shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#DCE8C9] text-[#263719] flex items-center justify-center text-xl">
              📦
            </div>
            <h3 className="font-bold text-sm text-[#263719]">Eco Food Packaging</h3>
            <p className="text-xs text-[#74776D] leading-relaxed">
              Meals are packed in food-grade kraft containers and foil-wrapped breads so food reaches your table piping hot.
            </p>
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-3xl bg-[#34451F] text-[#F8EBD2] p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Taste the Difference?
          </h3>
          <p className="text-xs sm:text-sm text-[#F8EBD2]/80 max-w-xl mx-auto">
            Try our signature Paneer Bhurji with hot rotis, our loaded Indori grilled sandwich, or our superfood sprouted moong salad today.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#DCE8C9] text-[#263719] text-sm font-extrabold hover:bg-white transition-colors"
            >
              <span>Order From Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

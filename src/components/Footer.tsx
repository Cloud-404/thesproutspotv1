"use client";

import React from "react";
import Link from "next/link";
import { VegBadge } from "./VegBadge";
import { Logo } from "./Logo";
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#263719] text-[#F8EBD2] mt-auto border-t border-[#34451F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo
              size="sm"
              withText
              theme="light"
              href="/"
            />

            <p className="text-xs text-[#F8EBD2]/80 leading-relaxed">
              We are a dedicated home-kitchen in Indore preparing hygienic, fresh, and wholesome vegetarian food. From live sprouted salads to grilled paneer sandwiches and balanced thalis, every meal is prepared with love and organic care.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <VegBadge size="md" />
              <span className="text-xs font-bold text-[#DCE8C9]">
                100% Pure Vegetarian Home Kitchen
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#F8EBD2]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-white transition-colors">
                  Full Menu & Specials
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Hygiene Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white">
              Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#F8EBD2]/80">
              <li>
                <Link href="/policies#delivery" className="hover:text-white transition-colors">
                  Delivery Policy & Zones
                </Link>
              </li>
              <li>
                <Link href="/policies#cancellation" className="hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/policies#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies#terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies#faqs" className="hover:text-white transition-colors">
                  Frequently Asked Questions (FAQs)
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Timings */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider uppercase text-white">
              Kitchen Details
            </h4>
            <div className="space-y-2.5 text-xs text-[#F8EBD2]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DCE8C9] shrink-0 mt-0.5" />
                <span>
                  Flat 12, Tulsi Villa, 9 Old Palasia Main Road, Indore (M.P.) - 452001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#DCE8C9] shrink-0" />
                <span>08:30 AM – 10:00 PM (All 7 Days)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#DCE8C9] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#DCE8C9] shrink-0" />
                <span>WhatsApp: +91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8EBD2]/60 gap-4">
          <p>© 2026 The Sprouts Spot. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Prepared with fresh local produce & love in Indore <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}

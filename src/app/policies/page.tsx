"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ChevronDown, ChevronUp, ShieldCheck, Truck, RefreshCw, Lock, FileText } from "lucide-react";

export default function PoliciesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Where is The Sprouts Spot located?",
      a: "Our kitchen is located at Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan. We operate as a dedicated cloud/home kitchen preparing fresh orders for local doorstep delivery.",
    },
    {
      q: "How are the sprouts prepared?",
      a: "We soak premium quality, organic whole green moong beans in RO-filtered water and allow them to germinate naturally over 24 hours under sanitized room temperature conditions. We never boil them to mush, preserving crunch, active enzymes, and live nutrients.",
    },
    {
      q: "Can I customize the spice level or ask for Jain food?",
      a: "Yes! During checkout, please enter your preference in the 'Special Delivery Instructions' field (e.g. 'No onion/garlic' or 'Less spicy'). You can also message our kitchen on WhatsApp immediately after placing your order.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept Cash on Delivery (COD), direct UPI transfers (Google Pay, PhonePe, Paytm, BHIM), and online card/net banking payments.",
    },
    {
      q: "How long does delivery take?",
      a: "Average preparation time is 15-20 minutes, followed by 15-20 minutes of local transit. Most orders arrive within 30-40 minutes across our Nimbahera delivery zones.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 md:pb-16 space-y-12">
        <div>
          <span className="text-xs font-bold text-[#6C472B] uppercase tracking-wider">
            Operational Guidelines & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263719] mt-1">
            Policies & Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-1">
            Everything you need to know about delivery zones, cancellations, refunds, and data privacy.
          </p>
        </div>

        {/* Delivery Policy Section */}
        <section id="delivery" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F8EBD2]">
            <Truck className="w-5 h-5 text-[#34451F]" />
            <h2 className="font-extrabold text-lg text-[#263719]">
              1. Delivery Policy & Serviceable Areas
            </h2>
          </div>
          <div className="space-y-3 text-xs text-[#74776D] leading-relaxed">
            <p>
              The Sprouts Spot provides direct food delivery within the local limits of <strong>Nimbahera, Rajasthan</strong>. Our coverage includes Maheshwari Mohalla, Near Lakhara Gali, Station Road, Mandi Road, Jawahar Nagar, Adarsh Nagar, Kailash Nagar, and surrounding local localities.
            </p>
            <p>
              <strong>Delivery Fees:</strong> Orders with an item subtotal of <strong>₹299 or higher receive FREE delivery</strong>. For orders below ₹299, a nominal delivery convenience fee of ₹30 applies to cover delivery partner transit.
            </p>
            <p>
              <strong>Delivery Windows:</strong> Food is prepared hot and fresh per order. Transit time varies between 25 to 45 minutes depending on traffic and kitchen queue.
            </p>
          </div>
        </section>

        {/* Cancellation & Refund Policy Section */}
        <section id="cancellation" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F8EBD2]">
            <RefreshCw className="w-5 h-5 text-[#34451F]" />
            <h2 className="font-extrabold text-lg text-[#263719]">
              2. Cancellation & Refund Policy
            </h2>
          </div>
          <div className="space-y-3 text-xs text-[#74776D] leading-relaxed">
            <p>
              <strong>Customer Cancellation:</strong> You may cancel your order free of charge directly through your order tracking screen as long as the order status remains in <strong>&quot;PLACED&quot;</strong> or <strong>&quot;CONFIRMED&quot;</strong>.
            </p>
            <p>
              Once our kitchen starts active cooking (<strong>&quot;PREPARING&quot;</strong> status) or the food is packed for pickup, cancellations cannot be processed automatically, as fresh vegetarian ingredients cannot be re-used.
            </p>
            <p>
              <strong>Refunds:</strong> If an order is cancelled or an item is unavailable, digital payments made via UPI or online gateway are marked <code>REFUNDED</code> in our system and credited back to the original source within 3-5 business days.
            </p>
          </div>
        </section>

        {/* Privacy Policy & Terms Section */}
        <section id="privacy" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F8EBD2]">
            <Lock className="w-5 h-5 text-[#34451F]" />
            <h2 className="font-extrabold text-lg text-[#263719]">
              3. Privacy Policy & Security
            </h2>
          </div>
          <div className="space-y-3 text-xs text-[#74776D] leading-relaxed">
            <p>
              We treat your contact and address information with absolute confidentiality. Customer mobile numbers and delivery coordinates are shared exclusively with the assigned delivery partner solely for fulfilling that specific food delivery.
            </p>
            <p>
              We do not sell, lease, or share personal data with external third-party advertisers. Passwords are securely hashed with bcrypt before storage, and session authentication is transmitted via encrypted HTTP-only cookies.
            </p>
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs space-y-4 scroll-mt-24">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F8EBD2]">
            <FileText className="w-5 h-5 text-[#34451F]" />
            <h2 className="font-extrabold text-lg text-[#263719]">
              4. Frequently Asked Questions (FAQs)
            </h2>
          </div>

          <div className="divide-y divide-neutral-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-extrabold text-xs sm:text-sm text-[#263719]">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#34451F] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#74776D] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-[#74776D] mt-2 leading-relaxed animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}

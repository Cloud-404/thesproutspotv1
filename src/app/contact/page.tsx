"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Mail,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 md:pb-16 space-y-10">
        <div>
          <span className="text-xs font-bold text-[#6C472B] uppercase tracking-wider">
            Indore Home Kitchen • We Love Hearing From You
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#263719] mt-1">
            Get in Touch with The Sprouts Spot
          </h1>
          <p className="text-xs sm:text-sm text-[#74776D] mt-1">
            Have questions about catering, corporate meal boxes, custom diets, or order delivery?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-[#F8EBD2] shadow-xs space-y-5">
              <h3 className="font-extrabold text-base text-[#263719] pb-3 border-b border-[#F8EBD2]">
                Kitchen & Direct Contacts
              </h3>

              <div className="space-y-4 text-xs text-[#26291F]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Kitchen Address</span>
                    <span className="text-[#74776D] leading-relaxed">
                      Flat 12, Tulsi Villa, 9 Old Palasia Main Road, Indore (M.P.) - 452001
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Phone Call</span>
                    <a
                      href="tel:+919876543210"
                      className="text-[#34451F] font-bold hover:underline"
                    >
                      +91 98765 43210
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="font-bold block">WhatsApp Business</span>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      +91 98765 43210 (Click to Chat)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Kitchen Operating Hours</span>
                    <span className="text-[#74776D]">
                      08:30 AM – 10:00 PM (Monday – Sunday)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8EBD2] shadow-xs">
              <h3 className="font-extrabold text-base text-[#263719] pb-3 border-b border-[#F8EBD2]">
                Send Us a Message
              </h3>

              {submitted ? (
                <div className="py-10 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-extrabold text-[#263719]">
                    Thank You! Message Received.
                  </h4>
                  <p className="text-xs text-[#74776D] max-w-sm mx-auto">
                    Chef Radha and our kitchen team will reply to you on phone or WhatsApp shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="mt-4 px-6 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Mobile Number or Email *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98234 56789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                      Your Message / Inquiry *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us what you'd like to ask or share with our kitchen..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Kitchen</span>
                  </button>
                </form>
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

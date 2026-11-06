"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Logo } from "./Logo";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("919876543210");

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber.replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {});
  }, []);

  const defaultMessage = encodeURIComponent(
    "Hello The Sprouts Spot! I'd like to check today's fresh vegetarian menu and specials."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-5 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 p-4 bg-white rounded-2xl shadow-2xl border border-[#F8EBD2] max-w-xs animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Logo size="xs" />
              <div>
                <h5 className="font-bold text-xs text-[#263719]">The Sprouts Spot</h5>
                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Kitchen Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#74776D] mt-2 leading-relaxed">
            Prefer ordering directly via WhatsApp or have questions about custom meal prep? Chat with Chef Radha!
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group relative"
        aria-label="Contact on WhatsApp"
        id="floating-whatsapp-btn"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}

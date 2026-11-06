"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, User } from "lucide-react";

/**
 * Demo Role Switcher:
 * STRICTLY disabled in production and Vercel environments.
 * Only renders in local development if NEXT_PUBLIC_ENABLE_DEV_DEMO_BAR="true".
 */
export function DemoBar() {
  const { user, quickLogin } = useAuth();

  // Strict production and environment guard
  const isEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_DEMO_BAR === "true";

  if (!isEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="Development Demo Switcher"
      className="bg-[#263719] text-[#F8EBD2] text-xs border-b border-[#34451F] sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DCE8C9] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DCE8C9]"></span>
          </span>
          <span className="font-semibold tracking-wide text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DCE8C9]" />
            Local Dev Mode:
          </span>
          {user ? (
            <span className="bg-[#34451F] px-2 py-0.5 rounded text-[#DCE8C9] font-medium border border-[#34451F]">
              Logged in as <strong className="text-white capitalize">{user.role}</strong> ({user.name})
            </span>
          ) : (
            <span className="text-white/70 italic">Browsing as Guest</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => quickLogin("customer")}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1"
          >
            <User className="w-3 h-3" />
            Customer Demo
          </button>
        </div>
      </div>
    </aside>
  );
}

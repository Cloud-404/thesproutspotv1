"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Home, Utensils, ShoppingBag, Clock, User } from "lucide-react";

function MobileBottomNavInner() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useAuth();

  // Hide mobile bottom nav on admin and delivery dashboards to keep dedicated experience
  if (pathname.startsWith("/admin") || pathname.startsWith("/delivery")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Menu", href: "/menu", icon: Utensils },
    {
      label: "Cart",
      href: "/cart",
      icon: ShoppingBag,
      badge: itemCount > 0 ? itemCount : undefined,
    },
    { label: "Orders", href: "/orders", icon: Clock },
    {
      label: "Profile",
      href: user ? "/profile" : "/login",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#F8EBD2] px-2 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all ${
                isActive ? "text-[#34451F]" : "text-[#74776D] hover:text-[#26291F]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? "scale-110 text-[#34451F]" : ""
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E27B38] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold ${
                  isActive ? "text-[#34451F] font-bold" : "text-[#74776D]"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#34451F] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";
import {
  ShoppingBag,
  MapPin,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  Clock,
  Sparkles,
  ChevronDown,
  LogOut,
  UtensilsCrossed,
  ShieldCheck,
  Bike,
} from "lucide-react";
import { BUSINESS_INFO } from "@/lib/business-info";

function HeaderInner() {
  const pathname = usePathname();
  const { itemCount, total } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(`${BUSINESS_INFO.serviceableLocalities[0]}, ${BUSINESS_INFO.city}`);

  const localities = BUSINESS_INFO.serviceableLocalities.map(
    (loc) => `${loc}, ${BUSINESS_INFO.city}`
  );

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Explore Menu", href: "/menu" },
    { label: "My Orders", href: "/orders" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-7 z-40 bg-white/95 backdrop-blur-md border-b border-[#F8EBD2] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand Name */}
            <Logo
              href="/"
              withText
              size="md"
              priority
              imageClassName="group-hover:scale-105"
            />

            {/* Delivery Location Selector Pill */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => setLocationModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-medium text-[#26291F] hover:bg-[#F8EBD2]/60 hover:border-[#DCE8C9] transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-[#DCE8C9] flex items-center justify-center text-[#263719]">
                  <MapPin className="w-3 h-3 text-[#263719]" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-[#74776D] uppercase tracking-wider block font-bold">
                    Delivering to
                  </span>
                  <span className="font-semibold text-[#26291F] flex items-center gap-1">
                    {selectedArea}
                    <ChevronDown className="w-3 h-3 text-[#74776D]" />
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors duration-150 relative py-1 ${
                      isActive
                        ? "text-[#34451F]"
                        : "text-[#74776D] hover:text-[#34451F]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#34451F] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons: Cart & Auth */}
            <div className="flex items-center gap-3">
              {/* Cart Button */}
              <Link
                href="/cart"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#34451F] hover:bg-[#263719] text-white shadow-sm transition-all duration-200 active:scale-95 group"
                id="header-cart-button"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#E27B38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold hidden sm:inline">
                  {itemCount > 0 ? `₹${total}` : "Cart"}
                </span>
              </Link>

              {/* User Account / Profile */}
              {user ? (
                <div className="relative group">
                  <Link
                    href={
                      user.role === "admin"
                        ? "/admin"
                        : user.role === "delivery"
                        ? "/delivery"
                        : "/profile"
                    }
                    className="flex items-center gap-2 p-2 rounded-full border border-[#F8EBD2] hover:bg-[#F8EBD2]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#26291F] hidden sm:inline max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#34451F] text-[#34451F] hover:bg-[#34451F] hover:text-white text-xs font-bold transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 md:hidden text-[#26291F] hover:text-[#34451F] rounded-lg"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#F8EBD2] bg-[#FBF8F0] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
            {/* Mobile Location Selector */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLocationModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-[#F8EBD2] text-xs font-medium"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#34451F]" />
                <span className="font-semibold text-[#26291F]">{selectedArea}</span>
              </div>
              <span className="text-[#34451F] text-[11px] font-bold">Change</span>
            </button>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-[#DCE8C9] text-[#263719]"
                      : "text-[#26291F] hover:bg-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F8EBD2]">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1 text-xs text-[#74776D]">
                    Logged in as <strong className="text-[#26291F]">{user.name}</strong> ({user.role})
                  </div>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#34451F] bg-white rounded-lg border border-[#F8EBD2]"
                    >
                      <ShieldCheck className="w-4 h-4" /> Admin Kitchen Dashboard
                    </Link>
                  )}
                  {user.role === "delivery" && (
                    <Link
                      href="/delivery"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#34451F] bg-white rounded-lg border border-[#F8EBD2]"
                    >
                      <Bike className="w-4 h-4" /> Delivery Partner Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#26291F] bg-white rounded-lg border border-[#F8EBD2]"
                  >
                    <UserIcon className="w-4 h-4" /> Customer Profile & Addresses
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#34451F] text-white font-bold text-sm"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Location Picker Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#F8EBD2] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F8EBD2]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#34451F]" />
                <h3 className="font-extrabold text-lg text-[#263719]">
                  Select Delivery Location
                </h3>
              </div>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#74776D] mt-3">
              The Sprouts Spot delivers hot, freshly prepared meals across the following local {BUSINESS_INFO.city} localities:
            </p>

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
              {localities.map((area) => (
                <button
                  key={area}
                  onClick={() => {
                    setSelectedArea(area);
                    setLocationModalOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedArea === area
                      ? "bg-[#DCE8C9] text-[#263719] font-bold"
                      : "bg-[#FBF8F0] hover:bg-[#F8EBD2] text-[#26291F]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-60" />
                    {area}
                  </span>
                  {selectedArea === area && (
                    <span className="text-xs bg-[#34451F] text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-[#F8EBD2] flex justify-end">
              <button
                onClick={() => setLocationModalOpen(false)}
                className="px-5 py-2 rounded-full bg-[#34451F] text-white text-xs font-bold hover:bg-[#263719]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-7 z-40 bg-white/95 border-b border-[#F8EBD2]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Logo href="/" withText size="md" priority />
            </div>
          </div>
        </header>
      }
    >
      <HeaderInner />
    </Suspense>
  );
}


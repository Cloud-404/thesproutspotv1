"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DemoBar } from "@/components/DemoBar";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Tags,
  Bike,
  Users,
  Percent,
  BarChart3,
  Settings,
  Store,
  LogOut,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  Power,
} from "lucide-react";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, quickLogin, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);
  const [togglingStore, setTogglingStore] = useState(false);

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isOpen === "boolean") {
          setStoreOpen(data.isOpen);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleStoreOpen = async () => {
    setTogglingStore(true);
    const newStatus = !storeOpen;
    try {
      const res = await fetch("/api/store/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: newStatus }),
      });
      if (res.ok) {
        setStoreOpen(newStatus);
      }
    } catch (e) {
      console.error("Failed to toggle store open status:", e);
    } finally {
      setTogglingStore(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Orders Management", href: "/admin/orders", icon: ShoppingBag },
    { label: "Menu Items (CRUD)", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Categories", href: "/admin/categories", icon: Tags },
    { label: "Delivery Fleet", href: "/admin/delivery", icon: Bike },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Coupons & Offers", href: "/admin/promotions", icon: Percent },
    { label: "Sales Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Store Settings", href: "/admin/settings", icon: Settings },
  ];

  // If loading or unauthorized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F0]">
        <div className="text-center">
          <Logo size="md" className="mx-auto mb-3 animate-pulse" />
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
          <p className="text-xs font-bold text-[#74776D] mt-3">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
        <DemoBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-[#F8EBD2] shadow-2xl space-y-4">
            <Logo size="lg" className="mx-auto mb-2" />
            <h2 className="text-2xl font-extrabold text-[#263719]">
              Admin Access Required
            </h2>
            <p className="text-xs text-[#74776D] leading-relaxed">
              This area is restricted to kitchen administrators and store owners. You are currently logged in as{" "}
              <strong>{user ? `${user.name} (${user.role})` : "Guest"}</strong>.
            </p>
            <div className="pt-2 space-y-2">
              <Link
                href="/login?redirect=/admin"
                className="w-full py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In with Admin Account</span>
              </Link>
              <Link
                href="/"
                className="w-full py-2.5 px-6 rounded-full border border-[#F8EBD2] text-[#26291F] text-xs font-bold block"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col bg-[#263719] text-[#F8EBD2] border-r border-[#34451F] shrink-0">
          {/* Brand header */}
          <div className="p-6 border-b border-[#34451F]">
            <Logo
              size="sm"
              withText
              theme="light"
              title="Kitchen Admin"
              subtitle="The Sprouts Spot"
              href="/admin"
            />
          </div>

          {/* Nav Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#DCE8C9] text-[#263719] shadow-sm font-extrabold"
                      : "text-[#F8EBD2]/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#34451F] space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#DCE8C9] hover:bg-white/10 transition-colors"
            >
              <Store className="w-4 h-4" />
              <span>Back to Storefront</span>
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Admin Header Bar */}
          <header className="bg-white border-b border-[#F8EBD2] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-[#26291F] hover:bg-neutral-100"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <Logo size="xs" className="lg:hidden" />
                <div>
                  <span className="text-xs font-bold text-[#6C472B]">Admin Dashboard</span>
                  <h2 className="text-base font-extrabold text-[#263719]">
                    Kitchen Command Center
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Kitchen Open/Closed Toggle */}
              <div className="flex items-center gap-2 bg-[#FBF8F0] border border-[#F8EBD2] px-3 py-1.5 rounded-full">
                <span className="text-[11px] font-bold text-[#26291F] hidden sm:inline">
                  Kitchen Status:
                </span>
                <button
                  onClick={handleToggleStoreOpen}
                  disabled={togglingStore}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                    storeOpen
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  <Power className="w-3 h-3" />
                  <span>{storeOpen ? "Open" : "Closed"}</span>
                </button>
              </div>

              {/* User badge */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#DCE8C9] text-[#263719] flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-[#26291F] block leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#74776D]">Kitchen Manager</span>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/60"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative w-64 max-w-xs bg-[#263719] text-[#F8EBD2] flex flex-col p-4 z-10">
                <div className="flex items-center justify-between pb-4 border-b border-[#34451F]">
                  <Logo
                    size="xs"
                    withText
                    theme="light"
                    title="The Sprouts Spot"
                    subtitle="Kitchen Admin"
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                        pathname === item.href
                          ? "bg-[#DCE8C9] text-[#263719]"
                          : "text-[#F8EBD2]/80 hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
                <div className="pt-4 border-t border-[#34451F] space-y-2">
                  <Link
                    href="/"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#DCE8C9]"
                  >
                    <Store className="w-4 h-4" /> Storefront
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-300"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-12">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF8F0]">
          <div className="text-center">
            <Logo size="md" className="mx-auto mb-3 animate-pulse" />
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#34451F] border-t-transparent rounded-full" />
          </div>
        </div>
      }
    >
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}


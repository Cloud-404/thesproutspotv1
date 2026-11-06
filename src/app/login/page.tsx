"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Logo } from "@/components/Logo";
import { User, Lock, AlertCircle, ArrowRight } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      const userRole = res.user?.role;
      if (userRole === "delivery") {
        router.push(redirectTarget && redirectTarget.startsWith("/delivery") ? redirectTarget : "/delivery");
      } else if (userRole === "admin") {
        router.push(redirectTarget && redirectTarget.startsWith("/admin") ? redirectTarget : "/admin");
      } else {
        router.push(redirectTarget);
      }
    } else {
      setErrorMsg(res.error || "Invalid username or password");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Main Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#F8EBD2] shadow-xl">
        <div className="text-center mb-6">
          <Logo size="lg" className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-[#263719]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#74776D] mt-1">
            Sign in to manage your orders, deliveries, and addresses
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#26291F] block mb-1">
              Username or Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#26291F]">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border border-[#F8EBD2] text-xs font-semibold text-[#26291F] focus:outline-hidden focus:border-[#34451F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Verifying..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F8EBD2] text-center text-xs text-[#74776D]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-[#34451F] hover:underline">
            Register as Customer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 pb-28 md:pb-16">
        <Suspense fallback={<div className="text-center text-xs font-bold text-[#74776D]">Loading...</div>}>
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

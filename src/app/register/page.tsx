"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoBar } from "@/components/DemoBar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Logo } from "@/components/Logo";
import { User, AtSign, Mail, Phone, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Full Name is required.";

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      errors.username = "Username is required.";
    } else if (cleanUsername.length < 4 || cleanUsername.length > 20) {
      errors.username = "Username must be between 4 and 20 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      errors.username = "Only letters, numbers, and underscores allowed.";
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^(?:\+?91|0)?([6-9]\d{9})$/.test(cleanPhone)) {
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 10) {
      errors.password = "Minimum 10 characters required.";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "At least one uppercase letter (A-Z) required.";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "At least one lowercase letter (a-z) required.";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "At least one number (0-9) required.";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.password = "At least one special character (!@#$...) required.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!termsAccepted) {
      errors.terms = "You must accept the Terms and Conditions.";
    }

    if (!privacyAccepted) {
      errors.privacy = "You must accept the Privacy Policy.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const res = await register({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      termsAccepted,
      privacyAccepted,
    });

    setLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMsg(res.error || "Registration failed. Please try again.");
      if (res.field) {
        setFieldErrors((prev) => ({ ...prev, [res.field!]: res.error || "Invalid field" }));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F0]">
      <DemoBar />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 pb-28 md:pb-16">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-[#F8EBD2] shadow-xl">
            <div className="text-center mb-6">
              <Logo size="lg" className="mx-auto mb-3" />
              <h1 className="text-2xl font-extrabold text-[#263719]">
                Create Your Account
              </h1>
              <p className="text-xs text-[#74776D] mt-1">
                Fresh homemade vegetarian meals delivered straight to your door
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.name ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.name}</p>
                )}
              </div>

              {/* Unique Username */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Unique Username * (for login)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={4}
                    maxLength={20}
                    placeholder="priya_sharma"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value.toLowerCase().replace(/\s/g, ""));
                      if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.username ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#74776D] block mt-0.5">
                  4-20 chars, letters, numbers, and underscores only.
                </span>
                {fieldErrors.username && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="priya@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.email ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Indian Mobile Number */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Indian Mobile Number * (for order updates)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98234 56789"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.phone ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Password * (min 10 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.password ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#74776D] block mt-0.5">
                  Must include uppercase, lowercase, number, and special character.
                </span>
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[11px] font-bold text-[#26291F] block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#74776D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FBF8F0] border text-xs font-semibold text-[#26291F] focus:outline-hidden ${
                      fieldErrors.confirmPassword ? "border-red-400" : "border-[#F8EBD2] focus:border-[#34451F]"
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[10px] text-red-600 font-bold mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Privacy Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-[#F8EBD2]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#26291F]">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (fieldErrors.terms) setFieldErrors((prev) => ({ ...prev, terms: "" }));
                    }}
                    className="mt-0.5 rounded accent-[#34451F]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/policies#terms" target="_blank" className="text-[#34451F] font-bold underline">
                      Terms and Conditions
                    </Link>
                  </span>
                </label>
                {fieldErrors.terms && (
                  <p className="text-[10px] text-red-600 font-bold">{fieldErrors.terms}</p>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#26291F]">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => {
                      setPrivacyAccepted(e.target.checked);
                      if (fieldErrors.privacy) setFieldErrors((prev) => ({ ...prev, privacy: "" }));
                    }}
                    className="mt-0.5 rounded accent-[#34451F]"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/policies#privacy" target="_blank" className="text-[#34451F] font-bold underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {fieldErrors.privacy && (
                  <p className="text-[10px] text-red-600 font-bold">{fieldErrors.privacy}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-6 rounded-full bg-[#34451F] hover:bg-[#263719] text-white text-xs font-bold shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#F8EBD2] text-center text-xs text-[#74776D]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#34451F] hover:underline">
                Sign In with Username
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

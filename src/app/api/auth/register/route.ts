import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  validateUsername,
  validateEmail,
  validateIndianMobile,
  validatePassword,
} from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // 1. IP rate limiting: max 5 registrations per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const rateCheck = checkRateLimit(`reg_${ip}`, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rateCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, username, email, phone, password, termsAccepted, privacyAccepted } = body;

    // 2. Validate mandatory fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full Name is required.", field: "name" }, { status: 400 });
    }

    const uVal = validateUsername(username);
    if (!uVal.valid) {
      return NextResponse.json({ error: uVal.error, field: "username" }, { status: 400 });
    }

    const eVal = validateEmail(email);
    if (!eVal.valid) {
      return NextResponse.json({ error: eVal.error, field: "email" }, { status: 400 });
    }

    const pVal = validateIndianMobile(phone);
    if (!pVal.valid) {
      return NextResponse.json({ error: pVal.error, field: "phone" }, { status: 400 });
    }

    const passVal = validatePassword(password);
    if (!passVal.valid) {
      return NextResponse.json({ error: passVal.error, field: "password" }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Terms & Conditions to register.", field: "terms" },
        { status: 400 }
      );
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { error: "You must accept the Privacy Policy to register.", field: "privacy" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = pVal.normalized!;

    const supabaseAdmin = createAdminClient();

    // 3. Check for existing username in profiles
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another.", field: "username" },
        { status: 409 }
      );
    }

    // 4. Check for existing email in profiles
    const { data: existingEmail } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists.", field: "email" },
        { status: 409 }
      );
    }

    // 5. Create Supabase Auth User with auto-confirm enabled (No OTP)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
        username: normalizedUsername,
        phone: normalizedPhone,
        role: "customer", // Enforce role server-side strictly
      },
    });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create authentication user." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 6. Create associated profile in profiles table
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      username: normalizedUsername,
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role: "customer",
      is_active: true,
    });

    if (profileError) {
      console.error("Profile insertion error:", profileError);
      // Clean up orphaned auth user on profile creation failure
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Failed to create customer profile. Please try again." },
        { status: 500 }
      );
    }

    // 7. Log user in immediately on server to set session cookies
    const supabase = await createClient();
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (loginError) {
      console.error("Post-registration login error:", loginError);
      // Even if direct auto-sign-in cookie failed, the account exists and can log in
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        username: normalizedUsername,
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        role: "customer",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Registration endpoint exception:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

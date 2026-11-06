import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const body = await req.json();
    const { identifier, username, email, password, demoRole } = body;

    // 1. Isolate demo role login strictly behind an explicit dev-only environment flag
    if (demoRole) {
      const isDevDemoAllowed =
        process.env.NODE_ENV !== "production" &&
        process.env.ENABLE_DEV_DEMO_BAR === "true";

      if (!isDevDemoAllowed) {
        return NextResponse.json(
          { error: "Demo role switcher is strictly disabled in production." },
          { status: 403 }
        );
      }

      // In local dev demo mode, look up demo profile
      const supabaseAdmin = createAdminClient();
      const { data: demoProfile } = await supabaseAdmin
        .from("profiles")
        .select("id, username, name, email, phone, role")
        .eq("role", demoRole)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!demoProfile) {
        return NextResponse.json(
          { error: `No active demo account found for role "${demoRole}".` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: demoProfile,
      });
    }

    // 2. Real Username and Password Authentication
    const loginIdentifier = (identifier || username || email || "").trim();

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    // 3. Brute force rate limiting: 5 attempts per 60 seconds per IP + identifier
    const rateLimitKey = `login_${ip}_${loginIdentifier.toLowerCase()}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const normalizedIdentifier = loginIdentifier.toLowerCase();

    // 4. Resolve username (or email) to user's internal email address securely on the server
    let targetEmail: string | null = null;
    let userProfile: {
      id: string;
      username: string;
      name: string;
      email: string;
      phone: string;
      role: "customer" | "admin" | "delivery";
      is_active: boolean;
    } | null = null;

    if (normalizedIdentifier.includes("@")) {
      // Input looks like an email
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, username, name, email, phone, role, is_active")
        .eq("email", normalizedIdentifier)
        .maybeSingle();
      if (data) {
        userProfile = data;
        targetEmail = data.email;
      }
    } else {
      // Input is a username
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, username, name, email, phone, role, is_active")
        .eq("username", normalizedIdentifier)
        .maybeSingle();
      if (data) {
        userProfile = data;
        targetEmail = data.email;
      }
    }

    // Generic error message prevents username/email enumeration attacks
    const GENERIC_ERROR = "Invalid username or password.";

    if (!userProfile || !targetEmail) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    if (!userProfile.is_active) {
      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // 5. Verify password through Supabase Auth using the server client with cookie management
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        username: userProfile.username,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        role: userProfile.role,
      },
    });
  } catch (err: unknown) {
    console.error("Login endpoint exception:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}

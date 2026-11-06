import { createClient } from "./supabase/server";
import { UserRole } from "./types";

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}

/**
 * Retrieves the currently authenticated Supabase session and associated user profile.
 * Server-only function.
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Retrieve profile details from profiles table
    const { data: profile, error: pError } = await supabase
      .from("profiles")
      .select("id, username, name, email, phone, role, is_active")
      .eq("id", user.id)
      .single();

    if (pError || !profile || !profile.is_active) {
      return null;
    }

    return {
      userId: profile.id,
      username: profile.username,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone,
    };
  } catch (err) {
    console.error("getSession error:", err);
    return null;
  }
}

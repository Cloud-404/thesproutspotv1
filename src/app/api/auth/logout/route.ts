import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

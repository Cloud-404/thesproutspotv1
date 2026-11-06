import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("user_id", session.userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json([]);
  }

  const formatted = (data || []).map((a) => ({
    id: a.id,
    userId: a.user_id,
    label: a.label,
    houseFlat: a.house_flat,
    landmark: a.landmark,
    areaLocality: a.area_locality,
    city: a.city,
    postalCode: a.postal_code,
    instructions: a.instructions,
    isDefault: a.is_default,
    createdAt: a.created_at,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { label, houseFlat, landmark, areaLocality, city = "Indore", postalCode, instructions, isDefault } = body;

    if (!houseFlat || !areaLocality) {
      return NextResponse.json(
        { error: "Flat/House number and area/locality are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // If new address is marked default, unset previous default addresses
    if (isDefault) {
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", session.userId);
    }

    const { data, error } = await supabase
      .from("customer_addresses")
      .insert({
        user_id: session.userId,
        label: label || "Home",
        house_flat: houseFlat,
        landmark: landmark || null,
        area_locality: areaLocality,
        city: city || "Indore",
        postal_code: postalCode || null,
        instructions: instructions || null,
        is_default: Boolean(isDefault),
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Addresses insert error:", error);
      return NextResponse.json({ error: error?.message || "Failed to save address" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      address: {
        id: data.id,
        userId: data.user_id,
        label: data.label,
        houseFlat: data.house_flat,
        landmark: data.landmark,
        areaLocality: data.area_locality,
        city: data.city,
        postalCode: data.postal_code,
        instructions: data.instructions,
        isDefault: data.is_default,
        createdAt: data.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving address";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Address ID required" }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

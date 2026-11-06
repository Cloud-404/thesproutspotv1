import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const coupons = (data || []).map((c) => ({
    id: c.id,
    code: c.code,
    discountType: c.discount_type,
    discountValue: Number(c.discount_value),
    minOrderValue: Number(c.min_order_value || 0),
    maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
    validUntil: c.valid_until,
    isActive: c.is_active,
    usageCount: c.usage_count || 0,
  }));

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.code || body.discountValue === undefined) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const cleanCode = body.code.trim().toUpperCase();
    const id = body.id || `coupon-${Date.now()}`;

    const payload = {
      id,
      code: cleanCode,
      discount_type: body.discountType || "FLAT",
      discount_value: Number(body.discountValue),
      min_order_value: Number(body.minOrderValue || 0),
      max_discount: body.maxDiscount ? Number(body.maxDiscount) : null,
      valid_until: body.validUntil ? new Date(body.validUntil).toISOString() : new Date("2028-12-31").toISOString(),
      is_active: body.isActive !== undefined ? body.isActive : true,
    };

    const { data, error } = await adminClient
      .from("coupons")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Error saving coupon:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: Number(data.discount_value),
        minOrderValue: Number(data.min_order_value),
        maxDiscount: data.max_discount ? Number(data.max_discount) : undefined,
        validUntil: data.valid_until,
        isActive: data.is_active,
        usageCount: data.usage_count || 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving coupon";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("coupons").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

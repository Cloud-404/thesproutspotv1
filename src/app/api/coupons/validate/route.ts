import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { code, subtotal = 0 } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const supabase = await createClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({
        valid: false,
        error: `Coupon "${cleanCode}" is invalid or expired.`,
      });
    }

    if (new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: `Coupon "${cleanCode}" has expired.`,
      });
    }

    const minOrder = Number(coupon.min_order_value) || 0;
    if (orderSubtotal < minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order value of ₹${minOrder} required for coupon "${cleanCode}".`,
      });
    }

    let discount = 0;
    if (coupon.discount_type === "PERCENTAGE") {
      discount = (orderSubtotal * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && discount > Number(coupon.max_discount)) {
        discount = Number(coupon.max_discount);
      }
    } else {
      discount = Number(coupon.discount_value);
    }

    discount = Math.min(discount, orderSubtotal);

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      message: `Coupon "${cleanCode}" applied successfully! You saved ₹${Math.round(discount)}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        minOrderValue: minOrder,
        maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : undefined,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error validating coupon";
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}

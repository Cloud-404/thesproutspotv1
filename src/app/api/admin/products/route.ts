import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const supabase = await createClient();

  const { data: prods, error: pErr } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: cats, error: cErr } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (pErr || cErr) {
    console.error("Admin products GET error:", pErr || cErr);
  }

  const products = (prods || []).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    categoryId: p.category_id,
    isVeg: p.is_veg,
    isAvailable: p.is_available,
    isFeatured: p.is_featured,
    isTodaySpecial: p.is_today_special,
    prepTimeMinutes: p.prep_time_minutes,
    imageUrl: p.image_url,
    badge: p.badge,
    variants: p.variants || [],
    addons: p.addons || [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  const categories = (cats || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sort_order,
    isActive: c.is_active,
  }));

  return NextResponse.json({ products, categories });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, price, categoryId, description, imageUrl, prepTimeMinutes, badge, isAvailable, isTodaySpecial, isFeatured } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Product name, price, and category are required." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = `prod-${Date.now()}`;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        id,
        name: name.trim(),
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        description: description?.trim() || "",
        price: Number(price),
        category_id: categoryId,
        is_veg: true,
        is_available: isAvailable ?? true,
        is_featured: isFeatured ?? false,
        is_today_special: isTodaySpecial ?? false,
        prep_time_minutes: Number(prepTimeMinutes) || 15,
        image_url: imageUrl || "/images/food/hero.jpg",
        badge: badge?.trim() || null,
        variants: body.variants || [],
        addons: body.addons || [],
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Product insert error:", error);
      return NextResponse.json({ error: error?.message || "Failed to create product" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        categoryId: data.category_id,
        isVeg: data.is_veg,
        isAvailable: data.is_available,
        isFeatured: data.is_featured,
        isTodaySpecial: data.is_today_special,
        prepTimeMinutes: data.prep_time_minutes,
        imageUrl: data.image_url,
        badge: data.badge,
        variants: data.variants || [],
        addons: data.addons || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error creating product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === "toggle-availability") {
      const { data: current } = await supabase
        .from("products")
        .select("is_available")
        .eq("id", id)
        .single();

      const newAvailability = current ? !current.is_available : true;
      const { data, error } = await supabase
        .from("products")
        .update({ is_available: newAvailability, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: error?.message || "Failed to toggle availability" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        product: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          categoryId: data.category_id,
          isVeg: data.is_veg,
          isAvailable: data.is_available,
          isFeatured: data.is_featured,
          isTodaySpecial: data.is_today_special,
          prepTimeMinutes: data.prep_time_minutes,
          imageUrl: data.image_url,
          badge: data.badge,
          variants: data.variants || [],
          addons: data.addons || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    }

    // Full product update
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name.trim();
    if (body.price !== undefined) updatePayload.price = Number(body.price);
    if (body.categoryId !== undefined) updatePayload.category_id = body.categoryId;
    if (body.description !== undefined) updatePayload.description = body.description.trim();
    if (body.imageUrl !== undefined) updatePayload.image_url = body.imageUrl;
    if (body.prepTimeMinutes !== undefined) updatePayload.prep_time_minutes = Number(body.prepTimeMinutes);
    if (body.badge !== undefined) updatePayload.badge = body.badge?.trim() || null;
    if (body.isAvailable !== undefined) updatePayload.is_available = body.isAvailable;
    if (body.isTodaySpecial !== undefined) updatePayload.is_today_special = body.isTodaySpecial;
    if (body.isFeatured !== undefined) updatePayload.is_featured = body.isFeatured;
    if (body.variants !== undefined) updatePayload.variants = body.variants;
    if (body.addons !== undefined) updatePayload.addons = body.addons;

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to update product" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        categoryId: data.category_id,
        isVeg: data.is_veg,
        isAvailable: data.is_available,
        isFeatured: data.is_featured,
        isTodaySpecial: data.is_today_special,
        prepTimeMinutes: data.prep_time_minutes,
        imageUrl: data.image_url,
        badge: data.badge,
        variants: data.variants || [],
        addons: data.addons || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating product";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product ID required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Product deleted successfully" });
}

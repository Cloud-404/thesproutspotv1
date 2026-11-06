import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const query = searchParams.get("q")?.toLowerCase();
    const showAll = searchParams.get("all") === "true";

    const supabase = await createClient();

    // 1. Fetch active categories ordered by sort_order
    const { data: catData, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (catError) {
      console.error("Menu categories error:", catError);
    }

    const categories = (catData || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sort_order,
      isActive: c.is_active,
    }));

    // 2. Fetch products
    let queryBuilder = supabase.from("products").select("*");

    if (!showAll) {
      queryBuilder = queryBuilder.eq("is_available", true);
    }

    const { data: prodData, error: prodError } = await queryBuilder;

    if (prodError) {
      console.error("Menu products error:", prodError);
    }

    let products = (prodData || []).map((p) => ({
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

    // Category filter
    if (categorySlug && categorySlug !== "all") {
      const category = categories.find((c) => c.slug === categorySlug);
      if (category) {
        if (category.id === "cat-specials") {
          products = products.filter((p) => p.isTodaySpecial);
        } else {
          products = products.filter((p) => p.categoryId === category.id);
        }
      }
    }

    // Keyword filter
    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.badge?.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      categories,
      products,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error loading menu";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

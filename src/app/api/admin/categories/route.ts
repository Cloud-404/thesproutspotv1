import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json([]);
  }

  const categories = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sort_order,
    isActive: c.is_active,
  }));

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const slug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = body.id || `cat-${slug}-${Math.floor(Math.random() * 1000)}`;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .upsert({
        id,
        name: body.name.trim(),
        slug: body.slug || slug,
        description: body.description?.trim() || null,
        sort_order: Number(body.sortOrder) || 10,
        is_active: body.isActive ?? true,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to save category" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      category: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        sortOrder: data.sort_order,
        isActive: data.is_active,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving category";
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
  if (!id) return NextResponse.json({ error: "Category ID required." }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

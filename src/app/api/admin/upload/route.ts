import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // 1. File size validation (Max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.` },
        { status: 400 }
      );
    }

    // 2. File type validation
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid image format. Only JPG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic bytes verification
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp =
      buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json(
        { error: "File content is not a valid image format." },
        { status: 400 }
      );
    }

    // Determine extension
    let extension = "jpg";
    if (isPng) extension = "png";
    else if (isWebp) extension = "webp";

    const fileName = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type || `image/${extension}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error || !data) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to upload image to Supabase Storage." },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("product-images").getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error uploading image";
    console.error("Upload route exception:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


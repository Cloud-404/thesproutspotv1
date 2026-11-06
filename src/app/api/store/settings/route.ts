import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", "store-main")
      .maybeSingle();

    if (error || !data) {
      console.error("Store settings GET error:", error);
      return NextResponse.json({
        id: "store-main",
        storeName: "The Sprouts Spot",
        tagline: "Eat Healthy, Live Happy",
        isOpen: true,
        openingTime: "08:30",
        closingTime: "22:00",
        estimatedPrepMinutes: 20,
        deliveryFee: 30,
        freeDeliveryThreshold: 299,
        minOrderValue: 99,
        serviceableAreas: [
          "Maheshwari Mohalla",
          "Near Lakhara Gali",
          "Station Road",
          "Mandi Road",
          "Jawahar Nagar",
          "Adarsh Nagar",
          "Kailash Nagar",
          "Bus Stand Area",
        ],
        businessPhone: "+91 7878794401",
        whatsappNumber: "917878794401",
        kitchenAddress: "Maheshwari Mohalla, Near Lakhara Gali, Nimbahera, Rajasthan, India.",
        enableCod: true,
        enableUpi: true,
        upiId: "sproutsspot@okaxis",
        enableOnlinePayment: true,
        partnerCommissionPerOrder: 40,
        announcement: "",
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      id: data.id,
      storeName: data.store_name,
      tagline: data.tagline,
      isOpen: data.is_open,
      openingTime: data.opening_time,
      closingTime: data.closing_time,
      estimatedPrepMinutes: data.estimated_prep_minutes,
      deliveryFee: Number(data.delivery_fee),
      freeDeliveryThreshold: Number(data.free_delivery_threshold),
      minOrderValue: Number(data.min_order_value),
      serviceableAreas: data.serviceable_areas || [],
      businessPhone: data.business_phone,
      whatsappNumber: data.whatsapp_number,
      kitchenAddress: data.kitchen_address,
      enableCod: data.enable_cod,
      enableUpi: data.enable_upi,
      upiId: data.upi_id,
      enableOnlinePayment: data.enable_online_payment,
      partnerCommissionPerOrder: Number(data.partner_commission_per_order),
      announcement: data.announcement || "",
      updatedAt: data.updated_at,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching store settings";
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
    const supabase = await createClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.storeName !== undefined) updatePayload.store_name = body.storeName;
    if (body.tagline !== undefined) updatePayload.tagline = body.tagline;
    if (body.isOpen !== undefined) updatePayload.is_open = body.isOpen;
    if (body.openingTime !== undefined) updatePayload.opening_time = body.openingTime;
    if (body.closingTime !== undefined) updatePayload.closing_time = body.closingTime;
    if (body.estimatedPrepMinutes !== undefined) updatePayload.estimated_prep_minutes = Number(body.estimatedPrepMinutes);
    if (body.deliveryFee !== undefined) updatePayload.delivery_fee = Number(body.deliveryFee);
    if (body.freeDeliveryThreshold !== undefined) updatePayload.free_delivery_threshold = Number(body.freeDeliveryThreshold);
    if (body.minOrderValue !== undefined) updatePayload.min_order_value = Number(body.minOrderValue);
    if (body.serviceableAreas !== undefined) updatePayload.serviceable_areas = body.serviceableAreas;
    if (body.businessPhone !== undefined) updatePayload.business_phone = body.businessPhone;
    if (body.whatsappNumber !== undefined) updatePayload.whatsapp_number = body.whatsappNumber;
    if (body.kitchenAddress !== undefined) updatePayload.kitchen_address = body.kitchenAddress;
    if (body.enableCod !== undefined) updatePayload.enable_cod = body.enableCod;
    if (body.enableUpi !== undefined) updatePayload.enable_upi = body.enableUpi;
    if (body.upiId !== undefined) updatePayload.upi_id = body.upiId;
    if (body.enableOnlinePayment !== undefined) updatePayload.enable_online_payment = body.enableOnlinePayment;
    if (body.partnerCommissionPerOrder !== undefined) updatePayload.partner_commission_per_order = Number(body.partnerCommissionPerOrder);
    if (body.announcement !== undefined) updatePayload.announcement = body.announcement;

    const { data, error } = await supabase
      .from("store_settings")
      .update(updatePayload)
      .eq("id", "store-main")
      .select()
      .single();

    if (error || !data) {
      console.error("Store settings update error:", error);
      return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: data.id,
        storeName: data.store_name,
        tagline: data.tagline,
        isOpen: data.is_open,
        openingTime: data.opening_time,
        closingTime: data.closing_time,
        estimatedPrepMinutes: data.estimated_prep_minutes,
        deliveryFee: Number(data.delivery_fee),
        freeDeliveryThreshold: Number(data.free_delivery_threshold),
        minOrderValue: Number(data.min_order_value),
        serviceableAreas: data.serviceable_areas || [],
        businessPhone: data.business_phone,
        whatsappNumber: data.whatsapp_number,
        kitchenAddress: data.kitchen_address,
        enableCod: data.enable_cod,
        enableUpi: data.enable_upi,
        upiId: data.upi_id,
        enableOnlinePayment: data.enable_online_payment,
        partnerCommissionPerOrder: Number(data.partner_commission_per_order),
        announcement: data.announcement || "",
        updatedAt: data.updated_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error updating settings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

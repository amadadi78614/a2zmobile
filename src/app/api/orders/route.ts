import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      quantity: z.number().int().min(1).max(20),
      colorway: z.string().max(80).optional().nullable(),
    })
  ).min(1),
  contact: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(7).max(30),
  }),
  fulfilment_method: z.enum(["delivery", "collection"]),
  payment_method: z.enum(["payfast", "ozow", "eft"]),
  delivery_zone: z.enum(["local", "national"]).optional().nullable(),
  shipping_address: z.object({
    line1: z.string().trim().min(3).max(200),
    line2: z.string().trim().max(200).optional().nullable(),
    suburb: z.string().trim().max(120).optional().nullable(),
    city: z.string().trim().min(2).max(120),
    province: z.string().trim().min(2).max(120),
    postal_code: z.string().trim().min(3).max(12),
  }).optional().nullable(),
  collection_store: z.string().trim().max(200).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const payload = checkoutSchema.parse(await request.json());
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("create_checkout_order", {
      p_items: payload.items,
      p_contact: payload.contact,
      p_fulfilment_method: payload.fulfilment_method,
      p_payment_method: payload.payment_method,
      p_delivery_zone: payload.delivery_zone ?? null,
      p_shipping_address: payload.shipping_address ?? null,
      p_collection_store: payload.collection_store ?? null,
    });

    if (error) {
      console.error("create_checkout_order failed", error);
      return NextResponse.json(
        { error: error.message || "Order could not be created" },
        { status: 400 }
      );
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout information", details: error.flatten() },
        { status: 400 }
      );
    }

    console.error("Order API error", error);
    return NextResponse.json({ error: "Order could not be created" }, { status: 500 });
  }
}

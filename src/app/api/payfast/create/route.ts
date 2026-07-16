import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createPayFastSignature } from "@/lib/payfast/signature";

const requestSchema = z.object({ orderId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { orderId } = requestSchema.parse(await request.json());
    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://a2zmobile.co.za";
    const sandbox = process.env.PAYFAST_SANDBOX !== "false";

    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        { error: "PayFast credentials are not configured" },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, order_number, total, guest_email")
      .eq("id", orderId)
      .eq("customer_id", user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const nameParts = String(user.user_metadata?.full_name || "A2Z Customer")
      .trim()
      .split(/\s+/);

    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${siteUrl}/checkout/confirmation?order=${encodeURIComponent(order.order_number)}`,
      cancel_url: `${siteUrl}/checkout?payment=cancelled&order=${encodeURIComponent(order.order_number)}`,
      notify_url: `${siteUrl}/api/payfast/notify`,
      name_first: nameParts[0] || "Customer",
      name_last: nameParts.slice(1).join(" ") || "A2Z",
      email_address: order.guest_email || user.email || "",
      m_payment_id: order.order_number,
      amount: Number(order.total).toFixed(2),
      item_name: `A2Z Mobile order ${order.order_number}`,
      custom_str1: order.id,
    };

    fields.signature = createPayFastSignature(Object.entries(fields), passphrase);

    return NextResponse.json({
      action: sandbox
        ? "https://sandbox.payfast.co.za/eng/process"
        : "https://www.payfast.co.za/eng/process",
      fields,
      sandbox,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid PayFast request" }, { status: 400 });
    }

    console.error("PayFast create request error", error);
    return NextResponse.json({ error: "Payment could not be started" }, { status: 500 });
  }
}

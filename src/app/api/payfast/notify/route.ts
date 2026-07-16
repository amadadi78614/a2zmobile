import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createPayFastSignature, buildAuditPayload, verifyWithPayFastServer } from "@/lib/payfast/signature";

// Fields that must be present and non-empty for the notification to be worth validating at all.
// Anything missing here is treated as malformed, not a legitimate-but-failed payment.
const REQUIRED_FIELDS = ["m_payment_id", "pf_payment_id", "payment_status", "amount_gross", "merchant_id", "signature"] as const;

function log(event: string, details: Record<string, unknown>) {
  // Structured, secret-free logging. Never includes signature, passphrase, or raw payload.
  console.log(JSON.stringify({ scope: "payfast_itn", event, ...details, at: new Date().toISOString() }));
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  // ---------- 1. Malformed request check ----------
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(rawBody);
  } catch {
    log("malformed_body", {});
    return new NextResponse("Malformed request", { status: 400 });
  }

  const fields: Record<string, string> = {};
  const orderedPairs: [string, string][] = [];
  for (const [key, value] of params) {
    fields[key] = value;
    orderedPairs.push([key, value]);
  }

  const missing = REQUIRED_FIELDS.filter((key) => !fields[key] || fields[key].trim() === "");
  if (missing.length > 0) {
    log("missing_required_fields", { missing });
    return new NextResponse("Missing required fields", { status: 400 });
  }

  // ---------- 2. Signature validation (local, no network) ----------
  const passphrase = process.env.PAYFAST_PASSPHRASE;
  const expectedSignature = createPayFastSignature(orderedPairs, passphrase);
  if (expectedSignature.toLowerCase() !== fields.signature.toLowerCase()) {
    log("invalid_signature", { m_payment_id: fields.m_payment_id });
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // ---------- 3. Merchant ID validation ----------
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  if (!merchantId || fields.merchant_id !== merchantId) {
    log("merchant_id_mismatch", { m_payment_id: fields.m_payment_id });
    return new NextResponse("Merchant ID mismatch", { status: 400 });
  }

  // ---------- 4. Server-to-server validation against PayFast's own servers ----------
  const sandbox = process.env.PAYFAST_SANDBOX !== "false";
  const validated = await verifyWithPayFastServer(rawBody, sandbox);
  if (!validated) {
    log("payfast_server_validation_failed", { m_payment_id: fields.m_payment_id });
    return new NextResponse("Could not validate with PayFast", { status: 400 });
  }

  // ---------- 5. Resolve order identity ----------
  // custom_str1 (the order UUID) is primary; m_payment_id (the human-readable order number) is
  // only a fallback. If both are present, they must agree — a mismatch is treated as tampering,
  // not resolved silently in either direction.
  const supabase = createServiceClient();
  const customStr1 = fields.custom_str1?.trim();
  const isValidUuid = customStr1 ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customStr1) : false;

  let order: { id: string; order_number: string; total: number; status: string } | null = null;

  if (isValidUuid) {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status")
      .eq("id", customStr1)
      .maybeSingle();
    order = data;

    if (order && order.order_number !== fields.m_payment_id) {
      log("order_identity_mismatch", {
        custom_str1: customStr1,
        m_payment_id: fields.m_payment_id,
        resolved_order_number: order.order_number,
      });
      return new NextResponse("Order identity mismatch", { status: 400 });
    }
  } else {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, total, status")
      .eq("order_number", fields.m_payment_id)
      .maybeSingle();
    order = data;
  }

  if (!order) {
    log("unknown_order", { m_payment_id: fields.m_payment_id, custom_str1: customStr1 });
    return new NextResponse("Unknown order", { status: 400 });
  }

  // ---------- 6. Amount validation ----------
  // Compared in integer cents to avoid floating-point comparison issues.
  const amountGrossCents = Math.round(parseFloat(fields.amount_gross) * 100);
  const orderTotalCents = Math.round(Number(order.total) * 100);
  if (!Number.isFinite(amountGrossCents) || amountGrossCents !== orderTotalCents) {
    log("amount_mismatch", {
      order_id: order.id,
      amount_gross: fields.amount_gross,
      order_total: order.total,
    });
    return new NextResponse("Amount mismatch", { status: 400 });
  }

  // ---------- 7. Hand off to the atomic finalisation function ----------
  // Everything from here (idempotency, payment record, stock finalisation, status update,
  // history) happens inside one Postgres transaction — see migration 008.
  const auditPayload = buildAuditPayload(fields);

  const { data: result, error } = await supabase.rpc("process_verified_payfast_itn", {
    p_order_id: order.id,
    p_provider_reference: fields.pf_payment_id,
    p_payfast_payment_status: fields.payment_status,
    p_amount: Number(fields.amount_gross),
    p_raw_payload: auditPayload,
  });

  if (error) {
    log("finalisation_rpc_failed", { order_id: order.id, error: error.message });
    return new NextResponse("Internal error", { status: 500 });
  }

  log("processed", { order_id: order.id, result: result?.result });
  return new NextResponse("OK", { status: 200 });
}

import crypto from "node:crypto";

/**
 * PayFast's own percent-encoding: spaces become '+' (not %20), and !'()* are explicitly
 * re-escaped uppercase. This exact function is used for BOTH building the outgoing payment
 * request signature and validating incoming ITN signatures — one implementation, not two that
 * could silently drift apart.
 */
export function payFastEncode(value: string) {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

/**
 * Builds the MD5 signature over an ordered list of [key, value] pairs.
 * - For OUTGOING requests, the caller controls field order (any order is fine, PayFast
 *   recomputes with whatever order it receives).
 * - For INCOMING ITN validation, `pairs` MUST be in the exact order PayFast sent them in the
 *   POST body — this is why the notify route builds `pairs` from the raw body via
 *   URLSearchParams (which preserves parse order) rather than from a plain object (whose key
 *   order isn't guaranteed to match what was received).
 */
export function createPayFastSignature(pairs: [string, string][], passphrase?: string) {
  const parameterString = pairs
    .filter(([key, value]) => key !== "signature" && value !== "")
    .map(([key, value]) => `${key}=${payFastEncode(value)}`)
    .join("&");

  const signedString = passphrase
    ? `${parameterString}&passphrase=${payFastEncode(passphrase)}`
    : parameterString;

  return crypto.createHash("md5").update(signedString).digest("hex");
}

/** Fields we persist to payments.raw_payload — an explicit allow-list, never the full ITN body.
 * Deliberately excludes: signature (no reason to retain long-term), name_first/name_last/
 * email_address (customer PII), and any custom_str/custom_int fields (may carry internal
 * identifiers we don't need duplicated in an audit blob). */
const AUDIT_FIELD_ALLOWLIST = [
  "m_payment_id",
  "pf_payment_id",
  "payment_status",
  "amount_gross",
  "amount_fee",
  "amount_net",
  "merchant_id",
] as const;

export function buildAuditPayload(fields: Record<string, string>): Record<string, string> {
  const audit: Record<string, string> = {};
  for (const key of AUDIT_FIELD_ALLOWLIST) {
    if (fields[key] !== undefined) audit[key] = fields[key];
  }
  return audit;
}

/**
 * Server-to-server validation against PayFast's own /eng/query/validate endpoint. This is the
 * final, most authoritative check — even a correct local signature computation should still be
 * confirmed against PayFast's servers before trusting the notification, per PayFast's own
 * integration guidance. Returns false on any non-"VALID" response, network error, or timeout —
 * callers must treat "false" as "do not trust this notification yet", not "payment failed".
 */
export async function verifyWithPayFastServer(rawBody: string, sandbox: boolean): Promise<boolean> {
  const url = sandbox
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: rawBody,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = (await response.text()).trim();
    return text === "VALID";
  } catch (error) {
    console.error("PayFast server-to-server validation request failed", error);
    return false;
  }
}

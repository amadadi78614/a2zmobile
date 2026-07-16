import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPayFastSignature } from "@/lib/payfast/signature";

// Mock the service-role client — no real Supabase connection in tests.
const mockMaybeSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
    rpc: mockRpc,
  }),
}));

// Keep the real signature/encoding/audit-payload logic (that's what's under test), but mock only
// the network call to PayFast's own servers.
vi.mock("@/lib/payfast/signature", async () => {
  const actual = await vi.importActual<typeof import("@/lib/payfast/signature")>("@/lib/payfast/signature");
  return {
    ...actual,
    verifyWithPayFastServer: vi.fn(async () => true),
  };
});

import { verifyWithPayFastServer } from "@/lib/payfast/signature";
import { POST } from "./route";

const PASSPHRASE = "testpass123";
const MERCHANT_ID = "10000100";
const ORDER_ID = "11111111-1111-1111-1111-111111111111";
const ORDER_NUMBER = "A2Z-100234";

const validOrder = { id: ORDER_ID, order_number: ORDER_NUMBER, total: 199.99, status: "pending" };

function buildBody(overrides: Record<string, string> = {}, opts: { skipSignature?: boolean; badSignature?: boolean } = {}) {
  const fields: Record<string, string> = {
    m_payment_id: ORDER_NUMBER,
    pf_payment_id: "PF-REF-0001",
    payment_status: "COMPLETE",
    amount_gross: "199.99",
    merchant_id: MERCHANT_ID,
    custom_str1: ORDER_ID,
    ...overrides,
  };

  const pairs = Object.entries(fields);
  const params = new URLSearchParams();
  for (const [k, v] of pairs) params.append(k, v);

  if (!opts.skipSignature) {
    const signature = opts.badSignature
      ? "0".repeat(32)
      : createPayFastSignature(pairs, PASSPHRASE);
    params.append("signature", signature);
  }

  return params.toString();
}

function makeRequest(body: string) {
  return new Request("https://a2zmobile.co.za/api/payfast/notify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

beforeEach(() => {
  process.env.PAYFAST_MERCHANT_ID = MERCHANT_ID;
  process.env.PAYFAST_PASSPHRASE = PASSPHRASE;
  process.env.PAYFAST_SANDBOX = "true";
  mockMaybeSingle.mockReset();
  mockRpc.mockReset();
  vi.mocked(verifyWithPayFastServer).mockReset();
  vi.mocked(verifyWithPayFastServer).mockResolvedValue(true);
});

describe("PayFast ITN endpoint", () => {
  it("1. accepts a valid COMPLETE notification and calls the finalisation RPC", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    mockRpc.mockResolvedValue({ data: { result: "paid", order_id: ORDER_ID }, error: null });

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith(
      "process_verified_payfast_itn",
      expect.objectContaining({
        p_order_id: ORDER_ID,
        p_provider_reference: "PF-REF-0001",
        p_payfast_payment_status: "COMPLETE",
        p_amount: 199.99,
      })
    );
  });

  it("2. rejects an invalid signature and never calls the RPC", async () => {
    const res = await POST(makeRequest(buildBody({}, { badSignature: true })));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("3. rejects when amount_gross does not match the stored order total", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });

    const res = await POST(makeRequest(buildBody({ amount_gross: "1.00" })));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("4. rejects when the order cannot be found", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null });

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("5. handles a duplicate notification safely (RPC reports duplicate, route still returns 200)", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    mockRpc.mockResolvedValue({ data: { result: "duplicate_notification", order_id: ORDER_ID }, error: null });

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it("6. passes through a non-COMPLETE (FAILED) payment status to the RPC rather than rejecting it", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    mockRpc.mockResolvedValue({ data: { result: "failed", order_id: ORDER_ID }, error: null });

    const res = await POST(makeRequest(buildBody({ payment_status: "FAILED" })));

    expect(res.status).toBe(200);
    expect(mockRpc).toHaveBeenCalledWith(
      "process_verified_payfast_itn",
      expect.objectContaining({ p_payfast_payment_status: "FAILED" })
    );
  });

  it("7. calls the finalisation RPC exactly once per valid unique notification (stock finalisation-exactly-once is enforced at the DB layer — see migration 008's idempotency guards; this test confirms the route itself never double-calls it)", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    mockRpc.mockResolvedValue({ data: { result: "paid", order_id: ORDER_ID }, error: null });

    await POST(makeRequest(buildBody()));

    expect(mockRpc).toHaveBeenCalledTimes(1);
  });

  it("8. handles an already-paid order safely (RPC reports already_paid, route still returns 200)", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    mockRpc.mockResolvedValue({ data: { result: "already_paid", order_id: ORDER_ID }, error: null });

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(200);
  });

  it("9. rejects a notification missing required fields before ever checking the signature", async () => {
    const res = await POST(makeRequest(buildBody({}, { skipSignature: true })));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("10. rejects malformed form-encoded bodies", async () => {
    const res = await POST(makeRequest("this is not form encoded at all %%% ==="));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("11. rejects an incorrect merchant ID and never calls the RPC", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });

    const res = await POST(makeRequest(buildBody({ merchant_id: "WRONG-ID" })));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("bonus: rejects when custom_str1 resolves an order whose order_number disagrees with m_payment_id", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { ...validOrder, order_number: "A2Z-DIFFERENT" } });

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it("bonus: rejects when PayFast's own server-to-server validation does not return VALID", async () => {
    mockMaybeSingle.mockResolvedValue({ data: validOrder });
    vi.mocked(verifyWithPayFastServer).mockResolvedValue(false);

    const res = await POST(makeRequest(buildBody()));

    expect(res.status).toBe(400);
    expect(mockRpc).not.toHaveBeenCalled();
  });
});

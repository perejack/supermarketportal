import { NextResponse } from "next/server";

export const runtime = "nodejs";

const HASHBACK_BASE_URL = "https://api.hashback.co.ke";
const HASHBACK_API_KEY = "9851f07892796e5ab74e04b89e6d623e15363438b39213ec4224fa2805c746f5";
const HASHBACK_ACCOUNT_ID = "HP464530";

function mapHashbackStatus(data: Record<string, unknown>): "paid" | "failed" | "pending" {
  const resultCode = String(data.ResultCode ?? data.resultCode ?? data.result_code ?? "").trim();
  const resultDesc = String(data.ResultDesc ?? data.resultDesc ?? data.message ?? "").toLowerCase();
  const status = String(data.status ?? data.Status ?? "").toLowerCase();

  // ── Explicit success ────────────────────────────────────────────────────────
  if (
    resultCode === "0" ||
    status === "success" ||
    status === "completed" ||
    status === "paid" ||
    resultDesc.includes("success") ||
    resultDesc.includes("processed successfully") ||
    resultDesc.includes("accepted for processing")
  ) {
    return "paid";
  }

  // ── Explicit failure — only flag as failed when explicitly cancelled, wrong PIN, or insufficient funds.
  // CRITICAL: Code 1037 ("DS timeout user cannot be reached.") is returned by HashBack IMMEDIATELY
  // while the phone prompt is ringing / waiting for PIN entry. It MUST NOT be treated as a failure!
  if (resultCode === "1037" || resultDesc.includes("user cannot be reached") || resultDesc.includes("ds timeout")) {
    return "pending";
  }

  const isConclusiveFailure =
    resultCode === "1032" ||
    resultDesc.includes("cancelled by user") ||
    resultDesc.includes("canceled by user") ||
    resultDesc.includes("request cancelled") ||
    resultDesc.includes("insufficient") ||
    resultDesc.includes("wrong pin") ||
    resultDesc.includes("invalid pin") ||
    status === "cancelled" ||
    status === "canceled";

  if (isConclusiveFailure) {
    return "failed";
  }

  // ── Everything else (including intermediate non-zero codes while still processing) ──
  return "pending";
}

export async function POST(req: Request) {
  // Hardcoded — overwrite env
  const apiKey = HASHBACK_API_KEY;
  const accountId = HASHBACK_ACCOUNT_ID;

  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    const checkoutId =
      (typeof body?.checkoutId === "string" ? body.checkoutId : undefined) ??
      (typeof body?.checkoutid === "string" ? body.checkoutid : undefined) ??
      (typeof body?.checkoutRequestId === "string" ? body.checkoutRequestId : undefined) ??
      (typeof body?.reference === "string" ? body.reference : undefined);

    if (!checkoutId?.trim()) {
      return NextResponse.json({ status: "error", message: "Missing checkoutId/reference" }, { status: 400 });
    }

    const payload = {
      api_key: apiKey,
      account_id: accountId,
      checkoutid: checkoutId.trim(),
    };

    const hashbackRes = await fetch(`${HASHBACK_BASE_URL}/transactionstatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await hashbackRes.json().catch(() => null)) as Record<string, unknown> | null;

    if (!hashbackRes.ok || !data) {
      return NextResponse.json({
        success: false,
        status: "pending",
        state: "pending",
        rawStatus: "Status check pending",
        resultDesc: "Status check pending",
        raw: data,
      });
    }

    const mappedStatus = mapHashbackStatus(data);
    const success = mappedStatus === "paid";

    return NextResponse.json({
      success,
      status: mappedStatus,
      state: mappedStatus === "paid" ? "success" : mappedStatus === "failed" ? "failed" : "pending",
      rawStatus: String(data.ResultDesc ?? data.status ?? data.ResponseDescription ?? ""),
      resultDesc:
        (typeof data.ResultDesc === "string" ? data.ResultDesc : "") ||
        (typeof data.ResponseDescription === "string" ? data.ResponseDescription : "") ||
        (typeof data.message === "string" ? data.message : ""),
      receiptNumber:
        (typeof data.TransactionReceipt === "string" ? data.TransactionReceipt : null) ??
        (typeof data.TransactionID === "string" ? data.TransactionID : null) ??
        (typeof data.receipt === "string" ? data.receipt : null),
      raw: data,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      status: "pending",
      state: "pending",
      rawStatus: "Status check pending",
      resultDesc: "Status check pending",
    });
  }
}

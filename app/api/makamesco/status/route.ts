import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAKAMESCO_BASE_URL = "https://makamescopay.com";
// Hardcoded for testing
const MAKAMESCO_API_KEY =
  "sk_f3791afb6810ba3f1e51e87f8b67e0d511adfacec40d6affd8f2176cefcd5b24";

function getApiKey(): string {
  return (process.env.MAKAMESCO_API_KEY ?? MAKAMESCO_API_KEY).trim();
}

function mapStatus(raw: string): "paid" | "failed" | "pending" {
  const status = raw.toLowerCase();
  if (status === "completed" || status === "success" || status === "paid") return "paid";
  if (status === "failed" || status === "cancelled" || status === "canceled") return "failed";
  return "pending";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    const checkoutRequestId =
      (typeof body?.checkoutId === "string" ? body.checkoutId : undefined) ??
      (typeof body?.checkoutRequestId === "string" ? body.checkoutRequestId : undefined) ??
      (typeof body?.checkoutid === "string" ? body.checkoutid : undefined) ??
      (typeof body?.reference === "string" ? body.reference : undefined);

    if (!checkoutRequestId?.trim()) {
      return NextResponse.json(
        { status: "error", message: "Missing checkoutRequestId" },
        { status: 400 },
      );
    }

    const upstream = await fetch(
      `${MAKAMESCO_BASE_URL}/api/payments/status/${encodeURIComponent(checkoutRequestId)}`,
      {
        method: "GET",
        headers: {
          "X-API-Key": getApiKey(),
        },
      },
    );

    const data = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;

    if (!upstream.ok || !data) {
      return NextResponse.json(
        {
          status: "error",
          message:
            (typeof data?.message === "string" ? data.message : null) ??
            (typeof data?.error === "string" ? data.error : null) ??
            "Status check failed",
          raw: data,
        },
        { status: upstream.status || 502 },
      );
    }

    const rawStatus = String(data.status ?? "").trim();
    const mappedStatus = mapStatus(rawStatus);
    const success = mappedStatus === "paid";

    return NextResponse.json({
      success,
      status: mappedStatus,
      state: mappedStatus === "paid" ? "success" : mappedStatus === "failed" ? "failed" : "pending",
      rawStatus,
      resultDesc: rawStatus,
      receiptNumber:
        (typeof data.mpesaReceiptNumber === "string" ? data.mpesaReceiptNumber : null) ?? null,
      amount: data.amount ?? null,
      phoneNumber: data.phoneNumber ?? null,
      raw: data,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}

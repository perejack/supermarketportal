import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAKAMESCO_BASE_URL = "https://makamescopay.com";
// Hardcoded for testing
const MAKAMESCO_API_KEY =
  "sk_f3791afb6810ba3f1e51e87f8b67e0d511adfacec40d6affd8f2176cefcd5b24";

function toE164Kenya(phone: string | undefined | null): string | null {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) return cleaned;
  if (cleaned.startsWith("0") && cleaned.length === 10) return `254${cleaned.slice(1)}`;
  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    return `254${cleaned}`;
  }
  return null;
}

function getApiKey(): string {
  return (process.env.MAKAMESCO_API_KEY ?? MAKAMESCO_API_KEY).trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    const rawPhone =
      (typeof body?.phone === "string" ? body.phone : undefined) ??
      (typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined) ??
      (typeof body?.phone_number === "string" ? body.phone_number : undefined) ??
      (typeof body?.msisdn === "string" ? body.msisdn : undefined);

    const phoneNumber = toE164Kenya(rawPhone);
    if (!phoneNumber) {
      return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 });
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    const accountReference =
      (typeof body?.reference === "string" && body.reference.trim()
        ? body.reference.trim()
        : null) ??
      (typeof body?.accountReference === "string" && body.accountReference.trim()
        ? body.accountReference.trim()
        : null) ??
      `SUPERPORTAL-${Date.now()}`;

    const transactionDesc =
      (typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null) ??
      (typeof body?.transactionDesc === "string" && body.transactionDesc.trim()
        ? body.transactionDesc.trim()
        : null) ??
      "food order";

    const payload: Record<string, unknown> = {
      phoneNumber,
      amount: Math.round(amount),
      accountReference,
      transactionDesc,
    };

    if (typeof body?.settlementAccountId === "number") {
      payload.settlementAccountId = body.settlementAccountId;
    }

    const upstream = await fetch(`${MAKAMESCO_BASE_URL}/api/payments/stkpush`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": getApiKey(),
      },
      body: JSON.stringify(payload),
    });

    const data = (await upstream.json().catch(() => null)) as Record<string, unknown> | null;

    if (!upstream.ok || !data) {
      return NextResponse.json(
        {
          success: false,
          message:
            (typeof data?.message === "string" ? data.message : null) ??
            (typeof data?.error === "string" ? data.error : null) ??
            (typeof data?.responseDescription === "string" ? data.responseDescription : null) ??
            "Payment initiation failed",
          raw: data,
        },
        { status: upstream.status || 502 },
      );
    }

    const checkoutRequestId =
      (typeof data.checkoutRequestId === "string" ? data.checkoutRequestId : null) ??
      (typeof data.CheckoutRequestID === "string" ? data.CheckoutRequestID : null);

    const responseCode = String(data.responseCode ?? data.ResponseCode ?? "");
    const ok = responseCode === "0" || Boolean(checkoutRequestId);

    if (!ok || !checkoutRequestId) {
      return NextResponse.json(
        {
          success: false,
          message:
            (typeof data.responseDescription === "string" ? data.responseDescription : null) ??
            (typeof data.customerMessage === "string" ? data.customerMessage : null) ??
            (typeof data.message === "string" ? data.message : null) ??
            "Payment initiation failed",
          raw: data,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      checkoutId: checkoutRequestId,
      checkoutRequestId,
      reference: accountReference,
      transactionId: data.transactionId ?? null,
      merchantRequestId: data.merchantRequestId ?? null,
      normalizedPhone: phoneNumber,
      message:
        (typeof data.customerMessage === "string" ? data.customerMessage : null) ??
        (typeof data.responseDescription === "string" ? data.responseDescription : null) ??
        "STK push initiated",
      raw: data,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 },
    );
  }
}

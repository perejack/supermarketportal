import { NextResponse } from "next/server";

export const runtime = "nodejs";

const HASHBACK_BASE_URL = "https://api.hashback.co.ke";
const HASHBACK_API_KEY = "5ce253a8b7ec86f1952c445ba676799c089de738665cd1e10b274a087bb5152f";
const HASHBACK_ACCOUNT_ID = "HP935181";

function normalizePhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith("254") && cleaned.length === 12) return cleaned;
  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    return `254${cleaned}`;
  }
  return null;
}

export async function POST(req: Request) {
  // Hardcoded — overwrite env
  const apiKey = HASHBACK_API_KEY;
  const accountId = HASHBACK_ACCOUNT_ID;

  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

    const rawPhone =
      (typeof body?.phone === "string" ? body.phone : undefined) ??
      (typeof body?.phoneNumber === "string" ? body.phoneNumber : undefined) ??
      (typeof body?.phone_number === "string" ? body.phone_number : undefined) ??
      (typeof body?.msisdn === "string" ? body.msisdn : undefined);

    const normalizedPhone = normalizePhoneNumber(rawPhone);
    if (!normalizedPhone) {
      return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 });
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    const referencePrefix =
      typeof body?.referencePrefix === "string" ? body.referencePrefix : "SUPERPORTAL";
    const externalReference =
      typeof body?.reference === "string" && body.reference.trim()
        ? body.reference
        : `${referencePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      api_key: apiKey,
      account_id: accountId,
      amount: String(Math.round(amount)),
      msisdn: normalizedPhone,
      reference: externalReference,
    };

    const hashbackRes = await fetch(`${HASHBACK_BASE_URL}/initiatestk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await hashbackRes.json().catch(() => null)) as Record<string, unknown> | null;

    if (!hashbackRes.ok || !data) {
      return NextResponse.json(
        {
          success: false,
          message:
            (typeof data?.message === "string" ? data.message : null) ??
            (typeof data?.error === "string" ? data.error : null) ??
            "HashBack STK initiation failed",
          raw: data,
        },
        { status: hashbackRes.status || 502 }
      );
    }

    const checkoutId =
      (typeof data.CheckoutRequestID === "string" ? data.CheckoutRequestID : null) ??
      (typeof data.checkout_id === "string" ? data.checkout_id : null) ??
      (typeof data.checkoutid === "string" ? data.checkoutid : null) ??
      (typeof data.checkoutId === "string" ? data.checkoutId : null) ??
      (typeof data.MerchantRequestID === "string" ? data.MerchantRequestID : null);

    const isSuccess =
      data.ResponseCode === "0" ||
      data.ResponseCode === 0 ||
      data.success === true ||
      Boolean(checkoutId);

    if (!isSuccess || !checkoutId) {
      return NextResponse.json(
        {
          success: false,
          message:
            (typeof data.CustomerMessage === "string" ? data.CustomerMessage : null) ??
            (typeof data.ResponseDescription === "string" ? data.ResponseDescription : null) ??
            (typeof data.message === "string" ? data.message : null) ??
            "Payment initiation failed",
          raw: data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutId,
      checkoutRequestId: checkoutId,
      reference: externalReference,
      normalizedPhone,
      message:
        (typeof data.CustomerMessage === "string" ? data.CustomerMessage : null) ??
        (typeof data.ResponseDescription === "string" ? data.ResponseDescription : null) ??
        (typeof data.message === "string" ? data.message : "STK push initiated"),
      raw: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

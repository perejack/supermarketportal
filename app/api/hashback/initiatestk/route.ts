import { NextResponse } from "next/server";

export const runtime = "nodejs";

function formatPhone(phone: string): string {
  let cleaned = String(phone ?? "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
  if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
  return cleaned;
}

function getHashbackCreds() {
  // Reuse the same credentials as the reference project by default.
  // Prefer setting env vars in production.
  return {
    apiKey: process.env.HASHBACK_API_KEY ?? "h26212Lo1a8Jm",
    accountId: process.env.HASHBACK_ACCOUNT_ID ?? "HP674928",
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as null | {
      amount?: number | string;
      msisdn?: string;
      reference?: string;
    };

    if (!body?.msisdn) {
      return NextResponse.json({ error: "Missing msisdn" }, { status: 400 });
    }

    const amountNum = Math.round(Number(body.amount ?? 0));
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { apiKey, accountId } = getHashbackCreds();
    const reference =
      String(body.reference ?? "").trim() ||
      `KCC${Date.now()}${Math.random().toString(36).slice(2, 11)}`;

    const response = await fetch("https://api.hashback.co.ke/initiatestk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        account_id: accountId,
        amount: String(amountNum),
        msisdn: formatPhone(body.msisdn),
        reference,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to initiate payment", details: text || data },
        { status: 502 }
      );
    }

    // Return Hashback payload + our reference (useful for receipts).
    return NextResponse.json({ ...data, reference }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}


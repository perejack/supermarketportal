import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
    const body = (await req.json().catch(() => null)) as null | { checkoutid?: string };

    const checkoutid = String(body?.checkoutid ?? "").trim();
    if (!checkoutid) {
      return NextResponse.json({ error: "Missing checkoutid" }, { status: 400 });
    }

    const { apiKey, accountId } = getHashbackCreds();

    const response = await fetch("https://api.hashback.co.ke/transactionstatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        account_id: accountId,
        checkoutid,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to check transaction status", details: text || data },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase.server";

export const runtime = "nodejs";

function parseBody(rawText: string): Record<string, unknown> {
  try {
    return JSON.parse(rawText);
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    const json = parseBody(rawText);

    const webhookSecret = process.env.HASHBACK_WEBHOOK_SECRET;

    // Verify HMAC-SHA256 signature if secret is provided
    if (webhookSecret && webhookSecret.trim()) {
      const signatureHeader =
        req.headers.get("x-hashpay-signature") ||
        req.headers.get("X-Hashpay-Signature") ||
        "";

      if (!signatureHeader) {
        return NextResponse.json({ message: "Missing X-Hashpay-Signature header" }, { status: 401 });
      }

      const expectedSignature =
        "sha256=" + crypto.createHmac("sha256", webhookSecret).update(rawText).digest("hex");

      try {
        const valid = crypto.timingSafeEqual(
          Buffer.from(signatureHeader),
          Buffer.from(expectedSignature)
        );
        if (!valid) {
          return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ message: "Signature verification failed" }, { status: 401 });
      }
    }

    const event = json.event;
    const responseCode = json.ResponseCode;
    const isSuccess = event === "payment.success" && (responseCode === 0 || responseCode === "0");

    const checkoutRequestId =
      (typeof json.CheckoutRequestID === "string" ? json.CheckoutRequestID : null) ??
      (typeof json.checkoutid === "string" ? json.checkoutid : null);
    const transactionReceipt =
      (typeof json.TransactionReceipt === "string" ? json.TransactionReceipt : null) ??
      (typeof json.TransactionID === "string" ? json.TransactionID : null);
    const reference =
      (typeof json.TransactionReference === "string" ? json.TransactionReference : null) ??
      (typeof json.reference === "string" ? json.reference : null);

    // Update Supabase application record if configured
    if (isSuccess && (checkoutRequestId || reference)) {
      try {
        const supabase = getSupabaseAdmin();
        const matchVal = checkoutRequestId || reference;

        await supabase
          .from("applications")
          .update({
            payment_completed: true,
            payment_ref: transactionReceipt || reference,
            payment_at: new Date().toISOString(),
          })
          .or(`payment_ref.eq.${matchVal},staff_number.eq.${matchVal}`);
      } catch (dbErr) {
        console.error("Failed to update Supabase in webhook:", dbErr);
      }
    }

    return NextResponse.json({
      received: true,
      success: isSuccess,
      checkoutRequestId,
      receipt: transactionReceipt,
      reference,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: error?.message },
      { status: 500 }
    );
  }
}

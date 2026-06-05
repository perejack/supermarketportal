type HashbackInitiateResponse = {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  CustomerMessage?: string;
  reference?: string;
};

type HashbackStatusResponse = {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: string;
  ResultDesc?: string;
};

export class MpesaService {
  static formatPhone(phone: string): string {
    let cleaned = String(phone ?? "").replace(/\D/g, "");
    if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
    if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
    if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
    return cleaned;
  }

  static async initiateSTKPush(
    phoneNumber: string,
    amount: number
  ): Promise<{ success: boolean; checkoutRequestId?: string; reference?: string; error?: string }> {
    try {
      const formattedPhone = this.formatPhone(phoneNumber);

      const response = await fetch("/api/hashback/initiatestk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: String(Math.round(Number(amount))),
          msisdn: formattedPhone,
        }),
      });

      const data: HashbackInitiateResponse | null = await response.json().catch(() => null);

      if (!response.ok || !data) {
        return { success: false, error: "Failed to initiate payment" };
      }

      if (String(data.ResponseCode) !== "0") {
        return { success: false, error: data.ResponseDescription || "Failed to initiate payment" };
      }

      const checkoutId = data.CheckoutRequestID;
      if (!checkoutId) {
        return { success: false, error: "Payment initiated but missing CheckoutRequestID" };
      }

      return {
        success: true,
        checkoutRequestId: checkoutId,
        reference: data.reference,
      };
    } catch (error: any) {
      return { success: false, error: error?.message || "Failed to initiate payment" };
    }
  }

  static async checkTransactionStatus(checkoutRequestId: string): Promise<HashbackStatusResponse> {
    const response = await fetch("/api/hashback/transactionstatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkoutid: checkoutRequestId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Status check failed: ${response.status} ${errorText}`.trim());
    }

    return response.json();
  }

  static extractReceiptNumber(text: string): string | null {
    const t = String(text ?? "");
    // Common M-PESA receipt format: 10 chars (e.g., QWE12RTY34) — allow 8-12 just in case.
    const m = t.match(/\b[A-Z0-9]{8,12}\b/);
    return m ? m[0] : null;
  }

  static async getPaymentStatus(
    checkoutRequestId: string
  ): Promise<{ status: "completed" | "failed" | "pending"; receipt?: string; raw: HashbackStatusResponse }> {
    const raw = await this.checkTransactionStatus(checkoutRequestId);

    if (String(raw.ResultCode) === "0") {
      const receipt = this.extractReceiptNumber(raw.ResultDesc ?? "") ?? undefined;
      return { status: "completed", receipt, raw };
    }

    const desc = String(raw.ResultDesc ?? raw.ResponseDescription ?? "").toLowerCase();
    if (desc.includes("cancel") || desc.includes("fail") || desc.includes("insufficient") || desc.includes("reject")) {
      return { status: "failed", raw };
    }

    return { status: "pending", raw };
  }
}


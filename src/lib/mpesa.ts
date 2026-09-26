type PaymentStatusRaw = {
  ResultDesc?: string;
  ResponseDescription?: string;
  resultDesc?: string;
  status?: string;
  rawStatus?: string;
  receiptNumber?: string | null;
};

// HashPay / HashBack M-Pesa Integration Service
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
    amount: number,
  ): Promise<{ success: boolean; checkoutRequestId?: string; reference?: string; error?: string }> {
    try {
      const response = await fetch("/api/hashback/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          phoneNumber,
          amount: Math.round(Number(amount)),
          description: "onboarding fee",
          reference: `SUPERPORTAL-${Date.now()}`,
          referencePrefix: "SUPERPORTAL",
        }),
      });

      const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      if (!response.ok || !data || data.success === false) {
        return {
          success: false,
          error:
            (typeof data?.message === "string" ? data.message : null) ??
            "Failed to initiate payment",
        };
      }

      const checkoutId =
        (typeof data.checkoutId === "string" ? data.checkoutId : null) ??
        (typeof data.checkoutRequestId === "string" ? data.checkoutRequestId : null);

      if (!checkoutId) {
        return { success: false, error: "Payment initiated but missing checkoutId" };
      }

      return {
        success: true,
        checkoutRequestId: checkoutId,
        reference: typeof data.reference === "string" ? data.reference : undefined,
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initiate payment",
      };
    }
  }

  static extractReceiptNumber(text: string): string | null {
    const t = String(text ?? "");
    const m = t.match(/\b[A-Z0-9]{8,12}\b/);
    return m ? m[0] : null;
  }

  static async getPaymentStatus(
    checkoutRequestId: string,
  ): Promise<{ status: "completed" | "failed" | "pending"; receipt?: string; raw: PaymentStatusRaw }> {
    try {
      const response = await fetch("/api/hashback/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId: checkoutRequestId }),
      });

      const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      if (!response.ok || !data) {
        return {
          status: "pending",
          raw: { status: "pending", rawStatus: "pending", resultDesc: "Checking payment status..." },
        };
      }

      if (data.status === "error") {
        return {
          status: "pending",
          raw: { status: "pending", rawStatus: "pending", resultDesc: String(data.message ?? "") },
        };
      }

      const mapped = String(data.status ?? data.state ?? "").toLowerCase();
      const rawStatus = String(data.rawStatus ?? "").toLowerCase();
      const resultDesc = String(
        (typeof data.resultDesc === "string" ? data.resultDesc : "") ||
        (typeof data.message === "string" ? data.message : "") ||
        rawStatus
      ).toLowerCase();
      const resultCode = String(data.ResultCode ?? data.resultCode ?? "").trim();

      const receiptFromApi =
        typeof data.receiptNumber === "string" && data.receiptNumber.trim()
          ? data.receiptNumber
          : null;
      const receipt = receiptFromApi ?? this.extractReceiptNumber(resultDesc) ?? undefined;

      const raw: PaymentStatusRaw = {
        ResultDesc: resultDesc,
        ResponseDescription: resultDesc,
        resultDesc,
        status: mapped,
        rawStatus,
        receiptNumber: receiptFromApi,
      };

      // ── Explicit success check ──────────────────────────────────────────────
      if (
        resultCode === "0" ||
        mapped === "paid" ||
        mapped === "success" ||
        mapped === "completed" ||
        rawStatus === "success" ||
        rawStatus === "completed" ||
        rawStatus === "paid" ||
        resultDesc.includes("success") ||
        resultDesc.includes("processed successfully") ||
        resultDesc.includes("accepted for processing")
      ) {
        return { status: "completed", receipt, raw };
      }

      // ── Conclusive failure check ONLY ───────────────────────────────────────
      const isConclusiveFailure =
        resultDesc.includes("cancel") ||
        resultDesc.includes("insufficient") ||
        resultDesc.includes("declined") ||
        resultDesc.includes("wrong pin") ||
        resultDesc.includes("invalid pin") ||
        resultDesc.includes("user cannot be reached") ||
        resultDesc.includes("timed out") ||
        resultDesc.includes("timeout") ||
        resultDesc.includes("failed") ||
        mapped === "failed" ||
        rawStatus === "failed" ||
        rawStatus === "cancelled" ||
        rawStatus === "canceled";

      if (isConclusiveFailure) {
        return { status: "failed", raw };
      }

      return { status: "pending", raw };
    } catch {
      // Soft fallback on any network error so polling is not interrupted
      return {
        status: "pending",
        raw: { status: "pending", rawStatus: "pending", resultDesc: "Checking payment status..." },
      };
    }
  }
}

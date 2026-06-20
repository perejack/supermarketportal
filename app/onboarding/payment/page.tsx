"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BRANDS } from "@/lib/brands";
import { useUser, useOnb } from "@/lib/store";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import {
  ShieldCheck,
  Lock,
  BadgeCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IdCard,
  Shirt,
  KeyRound,
  BookOpen,
  FileSignature,
  Sparkles,
} from "lucide-react";
import { MpesaService } from "@/lib/mpesa";
import { toast } from "sonner";

const FEE = 950;

export default function PaymentPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  const redirectedRef = useRef(false);

  const [phone, setPhone] = useState(onb.paymentPhone || "");
  const [stage, setStage] = useState<"idle" | "requesting" | "polling" | "success" | "failed">(
    onb.paymentCompleted ? "success" : "idle"
  );
  const [message, setMessage] = useState<string>("");
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const validPhone = useMemo(() => {
    const d = phone.replace(/\D/g, "");
    if (d.startsWith("254") && d.length === 12) return true;
    if (d.startsWith("0") && d.length === 10) return true;
    if ((d.startsWith("7") || d.startsWith("1")) && d.length === 9) return true;
    return false;
  }, [phone]);

  const b = user ? BRANDS[user.employer] : null;

  // Auto-redirect to Contract page after successful payment.
  useEffect(() => {
    if (!user) return;
    if (redirectedRef.current) return;
    if (!onb.paymentCompleted) return;
    redirectedRef.current = true;
    const t = window.setTimeout(() => {
      router.push("/onboarding/contract");
    }, 900);
    return () => window.clearTimeout(t);
  }, [user, onb.paymentCompleted, router]);

  // Simple countdown to reassure the user while waiting.
  useEffect(() => {
    if (stage !== "polling") return;
    setSecondsLeft(60);
    const t = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(t);
  }, [stage]);

  // IMPORTANT: Do not return before all hooks run (prevents React hook-order errors in prod).
  if (!user || !b) return null;

  async function startPayment() {
    if (!validPhone) {
      setStage("failed");
      setMessage("Enter a valid Safaricom number (e.g. 0712 345 678).");
      return;
    }

    try {
      setMessage("");
      setStage("requesting");

      const init = await MpesaService.initiateSTKPush(phone, FEE);
      if (!init.success || !init.checkoutRequestId) {
        setStage("failed");
        setMessage(init.error || "Failed to initiate payment.");
        toast.error(init.error || "Failed to initiate payment");
        return;
      }

      setCheckoutId(init.checkoutRequestId);
      setStage("polling");
      setMessage("STK Push sent. Complete payment on your phone to continue.");
      toast.success("STK Push sent! Complete payment on your phone.");

      const startedAt = Date.now();
      const timeoutMs = 2 * 60 * 1000; // 2 minutes
      const intervalMs = 3000;

      // Poll until completed/failed/timeout
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (Date.now() - startedAt > timeoutMs) {
          setStage("failed");
          setMessage("Payment pending. Please complete the prompt on your phone, then try again.");
          toast.error("Timed out waiting for payment confirmation");
          return;
        }

        const status = await MpesaService.getPaymentStatus(init.checkoutRequestId);
        if (status.status === "completed") {
          // We don't always get receipt from Hashback status response; fall back to a friendly ref.
          const ref = status.receipt ?? "MP" + Date.now().toString().slice(-8).toUpperCase();
          patch({
            paymentCompleted: true,
            paymentRef: ref,
            paymentPhone: phone,
            paymentAt: new Date().toISOString(),
            paymentAmount: FEE,
          });
          setStage("success");
          setMessage("Payment confirmed successfully.");
          toast.success("Payment confirmed");
          return;
        }

        if (status.status === "failed") {
          setStage("failed");
          setMessage(status.raw.ResultDesc || status.raw.ResponseDescription || "Payment failed or was cancelled.");
          toast.error("Payment failed or was cancelled");
          return;
        }

        // pending
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    } catch (e: any) {
      setStage("failed");
      setMessage(e?.message || "Something went wrong.");
      toast.error("Something went wrong");
    }
  }

  const inclusions = [
    { icon: IdCard, t: "Printed Staff ID Badge" },
    { icon: Shirt, t: "Branded Uniform (your size)" },
    { icon: KeyRound, t: "Personal Locker + Keys" },
    { icon: BookOpen, t: "Training Materials (4 modules)" },
    { icon: FileSignature, t: "Stamped Employment Contract" },
    { icon: Sparkles, t: "Orientation Welcome Pack" },
  ];

  return (
    <div>
      <OnboardingHeader
        step="06"
        title="Final Step"
        subtitle={`A one-off KES ${FEE.toLocaleString()} processing fee covers your badge printing, uniform, locker keys, training pack and contract stamping. Paid once, never again.`}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* What's covered */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-7">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: b.primary }}>
              <BadgeCheck className="h-4 w-4" /> What your fee covers
            </div>
            <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">Everything you need on day one.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No hidden costs. No deductions from your first salary. Without this, HR cannot release your kit on orientation day.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {inclusions.map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: b.primary }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold">{t}</div>
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Trust icon={ShieldCheck} title="Safaricom Verified" desc="Paid securely via M-PESA STK Push." />
            <Trust icon={Lock} title="HR-Issued Receipt" desc="Auto-generated & downloadable." />
            <Trust icon={BadgeCheck} title="Bring documents" desc="Carry your national ID and your printed employment contract (signed)." />
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
            <strong>Why now?</strong> Orientation slots are released only to fully-paid applicants. Settle today and your contract + receipt are ready to print.
          </div>
        </div>

        {/* Pay card */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="overflow-hidden rounded-3xl text-white shadow-2xl" style={{ background: b.primary }}>
            <div className="p-6 sm:p-7">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-80">Onboarding Fee · One-time</div>
              <div className="mt-2 flex items-end gap-2">
                <div className="font-display text-4xl font-bold sm:text-5xl">KES {FEE.toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm opacity-85">Inclusive of all processing. No further charges.</div>
            </div>
            <div className="space-y-4 bg-white p-6 text-foreground sm:p-7">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">M-PESA Phone Number</label>
                <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-background px-3 focus-within:border-foreground/40">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={stage === "success" || stage === "requesting" || stage === "polling"}
                    className="h-12 w-full bg-transparent font-mono text-base outline-none"
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">Use the Safaricom line registered in your name.</div>
              </div>

              <AnimatePresence mode="wait">
                {stage !== "success" ? (
                  <motion.button
                    key="pay"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={startPayment}
                    disabled={!validPhone || stage === "requesting" || stage === "polling"}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
                    style={{ background: b.primary }}
                  >
                    {stage === "requesting" && (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Sending STK push…
                      </>
                    )}
                    {stage === "polling" && (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Complete payment on your phone ({secondsLeft}s)
                      </>
                    )}
                    {(stage === "idle" || stage === "failed") && (
                      <>Pay KES {FEE.toLocaleString()} via M-PESA to download contract</>
                    )}
                  </motion.button>
                ) : (
                  <motion.div
                    key="paid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-200"
                  >
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <div>
                      <div className="font-bold">Payment received</div>
                      <div className="text-xs opacity-80">
                        Ref: <span className="font-mono">{onb.paymentRef}</span>
                      </div>
                      <div className="mt-1 text-xs opacity-80">Redirecting to Contract download…</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {checkoutId && stage === "polling" && (
                <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  Checkout ID: <span className="font-mono">{checkoutId}</span>
                </div>
              )}

              {message && stage !== "success" && (
                <div
                  className={`flex items-start gap-2 rounded-xl p-3 text-sm ${
                    stage === "failed" ? "bg-destructive/10 text-destructive ring-1 ring-destructive/30" : "bg-muted text-foreground"
                  }`}
                >
                  {stage === "failed" ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{message}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Encrypted
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Safaricom
                </div>
                <div className="flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> HR-verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col-reverse gap-2 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:flex-row sm:justify-between md:mx-0 md:rounded-2xl md:border md:px-6">
        <button onClick={() => router.push("/onboarding/id")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
          Back
        </button>
        <button
          disabled={!onb.paymentCompleted}
          onClick={() => router.push("/onboarding/contract")}
          className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 sm:w-auto"
          style={{ background: b.primary }}
        >
          Continue to Contract →
        </button>
      </div>
    </div>
  );
}

function Trust({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <Icon className="h-5 w-5 text-emerald-600" />
      <div className="mt-2 text-sm font-bold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}

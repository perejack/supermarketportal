"use client";

import { useRouter } from "next/navigation";
import { Download, Printer, FileText, IdCard, Lock, Receipt, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useUser, useOnb } from "@/lib/store";
import { BRANDS } from "@/lib/brands";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import { downloadContract } from "@/lib/contract";
import { downloadReceipt } from "@/lib/receipt";

export default function ContractPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  if (!user) return null;
  const b = BRANDS[user.employer];
  const paid = !!onb.paymentCompleted;

  async function submitApplication() {
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, onb }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to save application");
      patch({ contractDownloaded: true });
      toast.success("Application saved to HR system");
      return true;
    } catch (e: any) {
      toast.error(e?.message || "Failed to save application");
      return false;
    }
  }

  const handleContract = async () => {
    if (!paid) return;
    const ok = await submitApplication();
    if (!ok) return;
    await downloadContract(user);
  };

  const handleReceipt = async () => {
    if (!paid || !onb.paymentRef || !onb.paymentAt) return;
    const ok = await submitApplication();
    if (!ok) return;
    await downloadReceipt({
      employer: user.employer,
      fullName: user.fullName,
      staffNumber: user.staffNumber,
      position: user.position,
      amount: onb.paymentAmount ?? 650,
      paymentRef: onb.paymentRef,
      paymentPhone: onb.paymentPhone ?? "",
      paidAt: onb.paymentAt,
    });
  };

  return (
    <div>
      <OnboardingHeader
        step="07"
        title="Employment Contract & Receipt"
        subtitle={`Download your personalized ${b.logoText} contract and your official application receipt, sign and bring on orientation day.`}
      />

      {!paid && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="flex-1">
            <div className="font-bold text-amber-900">Documents locked</div>
            <div className="text-sm text-amber-800">Complete the item purchase processing fee to unlock your contract and receipt.</div>
          </div>
          <button
            onClick={() => router.push("/onboarding/payment")}
            className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110"
            style={{ background: b.primary }}
          >
            Pay Now <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Preview card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-border">
          <div style={{ background: b.primary }} className="px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white font-display text-lg font-bold" style={{ color: b.primary }}>
                  {b.logoMark}
                </div>
                <div>
                  <div className="font-display text-lg font-bold leading-none">{b.logoText.toUpperCase()}</div>
                  <div className="text-[10px] italic opacity-90">{b.tagline}</div>
                </div>
              </div>
              <div className="text-right text-[10px] uppercase tracking-widest opacity-90">
                Employment
                <br />
                Contract
              </div>
            </div>
          </div>
          <div className="h-1.5" style={{ background: b.accent }} />
          <div className="space-y-3 p-6 text-sm">
            <div className="text-center font-display text-xl font-bold">CONTRACT OF EMPLOYMENT</div>
            <p className="text-muted-foreground">
              This Contract is made between <strong>{b.logoText} Supermarkets Ltd</strong> ("the Employer") and the Employee named below.
            </p>
            <div className="rounded-xl border-2 p-4" style={{ borderColor: b.primary }}>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: b.primary }}>
                Employee Details
              </div>
              <div className="mt-2 grid gap-1 text-xs">
                <Row k="Full Name" v={user.fullName} />
                <Row k="Staff Number" v={user.staffNumber} mono />
                <Row k="Position" v={user.position} />
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Terms cover probation (3 months), 45-hour week, 21 days leave, locker policy, 30-day notice and Kenyan employment law.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
              <div>
                <div className="mb-6 border-b border-dashed" />
                Employee signature
              </div>
              <div>
                <div className="mb-6 border-b border-dashed" />
                HR signature
              </div>
            </div>
          </div>
        </div>

        {/* Downloads + instructions */}
        <div className="space-y-4">
          <button
            onClick={handleContract}
            disabled={!paid}
            className="group relative w-full overflow-hidden rounded-2xl p-6 text-left text-white shadow-2xl transition hover:brightness-110 disabled:opacity-60"
            style={{ background: b.primary }}
          >
            <div className="relative flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">{paid ? <Download className="h-6 w-6" /> : <Lock className="h-6 w-6" />}</div>
              <div className="min-w-0">
                <div className="font-display text-xl font-bold sm:text-2xl">{!paid ? "Locked · Pay first" : "Download Contract PDF"}</div>
                <div className="truncate text-sm opacity-90">{user.fullName} · {b.logoText}</div>
              </div>
            </div>
          </button>

          <button
            onClick={handleReceipt}
            disabled={!paid}
            className="group relative w-full overflow-hidden rounded-2xl bg-card p-6 text-left shadow-xl ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-2xl disabled:opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white" style={{ background: b.primary }}>
                {paid ? <Receipt className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <div className="font-display text-xl font-bold sm:text-2xl">{paid ? "Download Application Receipt" : "Receipt locked"}</div>
                <div className="truncate text-sm text-muted-foreground">
                  {paid ? (
                    <>
                      Ref <span className="font-mono">{onb.paymentRef}</span> · KES {onb.paymentAmount ?? 650}
                    </>
                  ) : (
                    "Available right after payment."
                  )}
                </div>
              </div>
            </div>
          </button>

          <Step n={1} icon={Download} title="Download" desc="Get your branded contract PDF and the application receipt." />
          <Step n={2} icon={Printer} title="Print" desc="Print both on plain A4 paper. Do not modify any text." />
          <Step n={3} icon={FileText} title="Sign" desc="Read every clause carefully and sign in BLUE ink on the signature line." />
          <Step n={4} icon={IdCard} title="Bring to Orientation" desc="Signed contract + receipt + photocopy of your National ID (front + back on one page)." />

          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <strong>Important.</strong> Without all three documents you will not be cleared to start training.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => router.push("/onboarding/payment")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
              Back
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110"
              style={{ background: b.primary }}
            >
              Finish · Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-semibold ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}
function Step({ n, icon: Icon, title, desc }: { n: number; icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted font-display font-bold">{n}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="font-semibold">{title}</span>
        </div>
        <div className="mt-0.5 text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

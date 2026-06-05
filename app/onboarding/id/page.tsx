"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { useUser, useOnb } from "@/lib/store";
import { PhotoUpload } from "@/components/PhotoUpload";
import { OnboardingHeader } from "@/components/OnboardingHeader";

export default function IdPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  if (!user) return null;
  const done = !!(onb.idFrontDataUrl && onb.idBackDataUrl);

  return (
    <div>
      <OnboardingHeader
        step="05"
        title="National ID Upload"
        subtitle="Upload clear photos of the FRONT and BACK of your Kenyan National ID. Used for KYC only."
      />

      <div className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <PhotoUpload aspect="card" label="ID — Front" value={onb.idFrontDataUrl} onChange={(v) => patch({ idFrontDataUrl: v })} />
          <PhotoUpload aspect="card" label="ID — Back" value={onb.idBackDataUrl} onChange={(v) => patch({ idBackDataUrl: v })} />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <strong>Secure.</strong> Your ID photos are encrypted and only accessible to HR for employment verification.
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button onClick={() => router.push("/onboarding/training")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
            Back
          </button>
          <button
            disabled={!done}
            onClick={() => router.push("/onboarding/payment")}
            className="brand-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}


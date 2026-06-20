"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { useUser, useOnb } from "@/lib/store";
import { StaffBadge } from "@/components/StaffBadge";
import { PhotoUpload } from "@/components/PhotoUpload";
import { OnboardingHeader } from "@/components/OnboardingHeader";

export default function BadgePage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(!!onb.badgeSubmitted);
  if (!user) return null;
  const nameMode = onb.badgeNameMode ?? "full";

  return (
    <div>
      <OnboardingHeader step="01" title="Staff ID Badge" subtitle="Worn on your uniform. Your live badge updates as you fill it in." />

      <div className="mt-6 space-y-6 md:mt-8">
        {/* Form */}
        <div>
          <div className="space-y-5 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border sm:space-y-6 sm:p-8">
            <PhotoUpload label="Selfie Photo" value={onb.photoDataUrl} onChange={(v) => patch({ photoDataUrl: v })} />

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Name on Badge</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["first", "full"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => patch({ badgeNameMode: m })}
                    className={`rounded-xl border-2 p-3 text-left text-sm font-semibold transition ${
                      nameMode === m ? "brand-gradient border-transparent text-white shadow-lg" : "border-border bg-card hover:border-foreground/30"
                    }`}
                  >
                    {m === "first" ? `First name only · ${user.fullName.split(" ")[0]}` : `Full name · ${user.fullName}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-4 text-sm">
              <div className="font-semibold">Auto-filled from your profile</div>
              <ul className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
                <li>
                  Staff #: <span className="font-mono font-semibold text-foreground">{user.staffNumber}</span>
                </li>
                <li>
                  Position: <span className="font-semibold text-foreground">{user.position}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          {onb.photoDataUrl ? (
            <div className="rounded-3xl bg-card p-5 text-center shadow-sm ring-1 ring-border sm:p-8">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Live Preview</div>
              <div className="mt-3">
                <StaffBadge
                  employer={user.employer}
                  fullName={user.fullName}
                  staffNumber={user.staffNumber}
                  position={user.position}
                  photoDataUrl={onb.photoDataUrl}
                  nameMode={nameMode}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-muted/40 p-6 text-center text-sm text-muted-foreground ring-1 ring-border">Upload a selfie to see your badge preview.</div>
          )}
        </div>
      </div>

      {submitted && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Badge submitted. We&apos;ll print it for your orientation day.
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col-reverse gap-2 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:mx-0 md:rounded-2xl md:border md:px-6">
        <button onClick={() => router.push("/dashboard")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
          Save & Exit
        </button>
        <button
          disabled={!onb.photoDataUrl}
          onClick={() => {
            patch({ badgeSubmitted: true });
            setSubmitted(true);
            setTimeout(() => router.push("/onboarding/uniform"), 700);
          }}
          className="brand-gradient w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50 sm:w-auto"
        >
          Submit Badge → Next
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Package, Sparkles, Users } from "lucide-react";

import { useUser, useOnb } from "@/lib/store";
import { OnboardingHeader } from "@/components/OnboardingHeader";

const MODULES = [
  { icon: Users, title: "Customer Service Manual", chapters: 8, mins: 45, desc: "Greetings, complaints handling, the 5-step floor protocol." },
  { icon: Package, title: "Product Knowledge Guide", chapters: 12, mins: 60, desc: "Fresh produce, butchery, bakery, dry goods, electronics." },
  { icon: Sparkles, title: "Hygiene & Safety", chapters: 5, mins: 25, desc: "Cleaning standards, food safety, PPE & spills." },
  { icon: BookOpen, title: "POS & Cash Handling", chapters: 6, mins: 40, desc: "Tills, card payments, M-Pesa, refunds and end-of-day." },
];

export default function TrainingPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();

  // Default both checked
  useEffect(() => {
    const next: Partial<typeof onb> = {};
    if (onb.trainingAccepted === undefined) next.trainingAccepted = true;
    if (onb.trainingReviewed === undefined) next.trainingReviewed = true;
    if (Object.keys(next).length) patch(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const accepted = onb.trainingAccepted ?? true;
  const reviewed = onb.trainingReviewed ?? true;

  return (
    <div>
      <OnboardingHeader step="04" title="Training Materials" subtitle="Your starter library. Confirm receipt — hard copies are handed out at orientation." />

      <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
        {MODULES.map((m, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-xl sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="brand-gradient grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-lg sm:h-12 sm:w-12">
                <m.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-base font-bold sm:text-lg">{m.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{m.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-[11px]">
                  <span>{m.chapters} chapters</span>
                  <span>·</span>
                  <span>{m.mins} min read</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-6">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border p-3 transition hover:border-foreground/30">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => patch({ trainingAccepted: e.target.checked })}
            className="mt-1 h-5 w-5"
            style={{ accentColor: "var(--brand)" }}
          />
          <div>
            <div className="font-semibold">I confirm receipt of training materials</div>
            <div className="text-sm text-muted-foreground">All four modules listed above will be issued to me.</div>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border p-3 transition hover:border-foreground/30">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => patch({ trainingReviewed: e.target.checked })}
            className="mt-1 h-5 w-5"
            style={{ accentColor: "var(--brand)" }}
          />
          <div>
            <div className="font-semibold">I will review all four modules before orientation day</div>
            <div className="text-sm text-muted-foreground">Reviewing in advance speeds up your on-floor training.</div>
          </div>
        </label>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col-reverse gap-2 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end md:mx-0 md:rounded-2xl md:border md:px-6">
        <button onClick={() => router.push("/onboarding/locker")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
          Back
        </button>
        <button
          disabled={!accepted || !reviewed}
          onClick={() => router.push("/onboarding/id")}
          className="brand-gradient w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50 sm:w-auto"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}


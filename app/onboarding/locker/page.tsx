"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Smartphone, Briefcase, ShieldAlert, Minus, Plus } from "lucide-react";

import { useUser, useOnb } from "@/lib/store";
import { OnboardingHeader } from "@/components/OnboardingHeader";

export default function LockerPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();

  // Defaults: requested = true, keys = 1
  useEffect(() => {
    const next: Partial<typeof onb> = {};
    if (onb.lockerRequested === undefined) next.lockerRequested = true;
    if (onb.lockerKeys === undefined) next.lockerKeys = 1;
    if (Object.keys(next).length) patch(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;
  const keys = onb.lockerKeys ?? 1;
  const requested = onb.lockerRequested ?? true;

  return (
    <div>
      <OnboardingHeader
        step="03"
        title="Personal Locker Key"
        subtitle="A physical key for the staff room locker — phones and bags are strictly banned on the active shop floor."
      />

      <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-8">
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-900">
                <strong>Workplace policy.</strong> Personal items (phones, bags, jackets, jewellery) must be stored in your locker before clocking in. Items left at workstations are confiscated by Loss Prevention.
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Bullet icon={Smartphone} title="Phones" desc="Off and locked. No exceptions on floor." />
            <Bullet icon={Briefcase} title="Bags" desc="Handbags & backpacks in locker only." />
            <Bullet icon={KeyRound} title="Your Key" desc="Lost key replacement: KES 500 each." />
            <Bullet icon={ShieldAlert} title="Spot Checks" desc="Random locker checks per HR policy." />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-border p-4 transition hover:border-foreground/30">
            <input
              type="checkbox"
              checked={requested}
              onChange={(e) => patch({ lockerRequested: e.target.checked })}
              className="mt-1 h-5 w-5 accent-current"
              style={{ accentColor: "var(--brand)" }}
            />
            <div>
              <div className="font-semibold">Request locker key</div>
              <div className="text-sm text-muted-foreground">I&apos;ve read the policy. Issue me locker keys at orientation.</div>
            </div>
          </label>

          {/* Key count */}
          <div className={`mt-4 rounded-2xl border-2 border-border p-4 transition ${requested ? "" : "pointer-events-none opacity-50"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">How many locker keys?</div>
                <div className="text-xs text-muted-foreground">Most staff need 1. Pick up to 3 if you share with shift partners.</div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted p-1">
                <button
                  onClick={() => patch({ lockerKeys: Math.max(1, keys - 1) })}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-card shadow-sm transition hover:bg-foreground/5 disabled:opacity-40"
                  disabled={keys <= 1}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-10 text-center font-display text-xl font-bold">{keys}</div>
                <button
                  onClick={() => patch({ lockerKeys: Math.min(3, keys + 1) })}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-card shadow-sm transition hover:bg-foreground/5 disabled:opacity-40"
                  disabled={keys >= 3}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => patch({ lockerKeys: n })}
                  className={`rounded-xl border-2 py-2 text-sm font-bold transition ${
                    keys === n ? "border-transparent brand-gradient text-white shadow-lg" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {n} key{n > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key visual */}
        <div className="relative grid place-items-center overflow-hidden rounded-3xl bg-zinc-900 p-8 text-white shadow-2xl md:p-10">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative">
            <svg viewBox="0 0 200 80" className="w-56 drop-shadow-2xl sm:w-64">
              <circle cx="40" cy="40" r="28" fill="none" stroke="#FFD200" strokeWidth="8" />
              <circle cx="40" cy="40" r="6" fill="#FFD200" />
              <rect x="65" y="35" width="120" height="10" rx="2" fill="#FFD200" />
              <rect x="155" y="30" width="8" height="20" fill="#FFD200" />
              <rect x="170" y="30" width="8" height="14" fill="#FFD200" />
            </svg>
            <div className="mt-6 text-center">
              <div className="font-mono text-xl font-bold sm:text-2xl">L-{user.staffNumber || "0000"}</div>
              <div className="mt-1 text-xs uppercase tracking-widest opacity-70">Your assigned locker</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs">
                <KeyRound className="h-3.5 w-3.5" /> {keys} key{keys > 1 ? "s" : ""} to be issued
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col-reverse gap-2 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end md:mx-0 md:rounded-2xl md:border md:px-6">
        <button onClick={() => router.push("/onboarding/uniform")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
          Back
        </button>
        <button
          disabled={!requested}
          onClick={() => router.push("/onboarding/training")}
          className="brand-gradient w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50 sm:w-auto"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function Bullet({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}


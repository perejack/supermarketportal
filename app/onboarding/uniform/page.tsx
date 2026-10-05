"use client";

import { useRouter } from "next/navigation";
import { Shirt, Check } from "lucide-react";

import { useUser, useOnb } from "@/lib/store";
import { BRANDS } from "@/lib/brands";
import { OnboardingHeader } from "@/components/OnboardingHeader";

const SIZES = ["S", "M", "L", "XL"] as const;
const TYPES = [
  { id: "shirt" as const, label: "Branded Shirt", desc: "Classic collared shirt with embroidered logo." },
  { id: "polo" as const, label: "Branded Polo", desc: "Breathable polo for active floor staff." },
  { id: "apron" as const, label: "Branded Apron", desc: "For chefs, butchers and bakers." },
];

export default function UniformPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  if (!user) return null;
  const b = BRANDS[user.employer];
  const selected = onb.uniformTypes ?? ["shirt", "polo", "apron"];

  const toggle = (id: "shirt" | "polo" | "apron") => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    patch({ uniformTypes: next });
  };

  const previewType = selected.includes("apron") && selected.length === 1 ? "apron" : selected.includes("polo") ? "polo" : selected[0] || "shirt";

  return (
    <div>
      <OnboardingHeader step="02" title="Uniform Request" subtitle="Tick every uniform piece you need — pick all that apply so nothing is missed." />

      <div className="mt-6 grid gap-6 md:mt-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">These are the uniforms you will receive</div>
          <div className="mt-3 grid gap-3">
            {TYPES.map((t) => {
              const active = selected.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition sm:gap-4 sm:p-4 ${
                    active ? "border-transparent brand-gradient text-white shadow-lg" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${active ? "bg-white/20" : "bg-muted"}`}>
                    <Shirt className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold">{t.label}</div>
                    <div className={`text-xs ${active ? "text-white/85" : "text-muted-foreground"}`}>{t.desc}</div>
                  </div>
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold uppercase ${
                      active ? "bg-white text-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {active ? <Check className="h-4 w-4" /> : ""}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {selected.length} of 3 selected
            {selected.length === 0 && <span className="ml-2 font-semibold text-destructive">Please pick at least one</span>}
          </div>

          <div className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Size</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SIZES.map((s) => {
              const active = onb.uniformSize === s;
              return (
                <button
                  key={s}
                  onClick={() => patch({ uniformSize: s })}
                  className={`h-14 rounded-xl border-2 font-display text-lg font-bold transition sm:h-16 sm:text-xl ${
                    active ? "border-transparent brand-gradient text-white shadow-lg" : "border-border hover:border-foreground/30"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mockup */}
        <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl md:p-8" style={{ background: b.primary }}>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="text-xs uppercase tracking-widest opacity-80">Mockup</div>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{b.logoText} Uniform</h3>
          <div className="mt-6 grid place-items-center">
            <svg viewBox="0 0 200 240" className="h-48 w-auto drop-shadow-2xl sm:h-64">
              <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {previewType === "apron" ? (
                <g>
                  <path d="M70 30 L100 50 L130 30 L160 90 L150 220 L50 220 L40 90 Z" fill="url(#g)" />
                  <rect x="85" y="20" width="30" height="14" rx="4" fill="white" />
                  <line x1="85" y1="27" x2="50" y2="80" stroke="white" strokeWidth="3" />
                  <line x1="115" y1="27" x2="150" y2="80" stroke="white" strokeWidth="3" />
                </g>
              ) : (
                <g>
                  <path d="M40 50 L80 30 L100 50 L120 30 L160 50 L170 100 L140 110 L140 220 L60 220 L60 110 L30 100 Z" fill="url(#g)" />
                  {previewType === "polo" && <path d="M90 30 L100 60 L110 30 L100 28 Z" fill={b.primary} />}
                </g>
              )}
              <text x="100" y="150" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold" fontSize="14" fill={b.primary}>
                {b.logoText}
              </text>
            </svg>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <div className="text-[10px] uppercase tracking-widest opacity-70">Pieces</div>
              <div className="font-bold capitalize">{selected.length ? selected.join(", ") : "—"}</div>
            </div>
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur">
              <div className="text-[10px] uppercase tracking-widest opacity-70">Size</div>
              <div className="font-bold">{onb.uniformSize || "—"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex flex-col-reverse gap-2 border-t border-border/60 bg-background/85 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end md:mx-0 md:rounded-2xl md:border md:px-6">
        <button onClick={() => router.push("/onboarding/badge")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
          Back
        </button>
        <button
          disabled={!onb.uniformSize || selected.length === 0}
          onClick={() => router.push("/onboarding/locker")}
          className="brand-gradient w-full rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-50 sm:w-auto"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}


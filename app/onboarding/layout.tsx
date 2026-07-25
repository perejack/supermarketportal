"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { useUser } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";

const STEPS = [
  { path: "/onboarding/badge", label: "Badge" },
  { path: "/onboarding/uniform", label: "Uniform" },
  { path: "/onboarding/locker", label: "Locker" },
  { path: "/onboarding/training", label: "Training" },
  { path: "/onboarding/id", label: "ID Upload" },
  { path: "/onboarding/payment", label: "Payment" },
  { path: "/onboarding/contract", label: "Contract" },
] as const;

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user === null) router.push("/");
  }, [user, router]);

  if (!user) return null;

  const idx = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div data-brand={user.employer} className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted hover:bg-foreground/10">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <BrandLogo employer={user.employer} size="sm" />
          </div>
          <div className="hidden text-right text-xs uppercase tracking-widest text-muted-foreground md:block">
            {user.fullName} · {user.position}
          </div>
        </div>
        {/* Stepper */}
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3 sm:px-6 sm:pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const active = i === idx;
              const done = i < idx;
              return (
                <Link
                  key={s.path}
                  href={s.path}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active ? "brand-gradient text-white shadow-lg" : done ? "bg-foreground/10 text-foreground" : "bg-muted text-muted-foreground hover:bg-foreground/10"
                  }`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${active ? "bg-white/25" : "bg-foreground/10"}`}>{i + 1}</span>
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}


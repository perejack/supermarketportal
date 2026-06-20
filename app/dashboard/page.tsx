"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  IdCard,
  Shirt,
  KeyRound,
  BookOpen,
  ScanLine,
  FileSignature,
  LogOut,
  CheckCircle2,
  Circle,
  ArrowRight,
  CreditCard,
} from "lucide-react";

import { BRANDS } from "@/lib/brands";
import { useUser, useOnb, saveUser } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";
import { downloadContract } from "@/lib/contract";

export default function DashboardPage() {
  const user = useUser();
  const [onb] = useOnb();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.push("/");
  }, [user, router]);

  if (!user) return null;

  const b = BRANDS[user.employer];
  const tasks = [
    { key: "badge", label: "Staff ID Badge", icon: IdCard, done: !!onb.badgeSubmitted, to: "/onboarding/badge" as const },
    { key: "uniform", label: "Uniform Request", icon: Shirt, done: !!(onb.uniformSize && (onb.uniformTypes?.length ?? 0) > 0), to: "/onboarding/uniform" as const },
    { key: "locker", label: "Locker Key", icon: KeyRound, done: !!onb.lockerRequested, to: "/onboarding/locker" as const },
    { key: "training", label: "Training Materials", icon: BookOpen, done: !!(onb.trainingAccepted && onb.trainingReviewed), to: "/onboarding/training" as const },
    { key: "id", label: "National ID Upload", icon: ScanLine, done: !!(onb.idFrontDataUrl && onb.idBackDataUrl), to: "/onboarding/id" as const },
    { key: "payment", label: "Item Purchase Processing Fee (KES 650)", icon: CreditCard, done: !!onb.paymentCompleted, to: "/onboarding/payment" as const },
    { key: "contract", label: "Employment Contract", icon: FileSignature, done: !!onb.contractDownloaded, to: "/onboarding/contract" as const },
  ];
  const completed = tasks.filter((t) => t.done).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div data-brand={user.employer} className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <BrandLogo employer={user.employer} size="sm" />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold">{user.fullName}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{user.position}</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: b.primary }}>
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <button
              onClick={() => {
                saveUser(null);
                router.push("/");
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-foreground/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8 md:p-12"
          style={{ background: b.primary }}
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 sm:h-72 sm:w-72" />
          <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full sm:h-64 sm:w-64" style={{ background: b.accent, opacity: 0.3 }} />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80 sm:text-xs">Karibu · Welcome</div>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              {greet()}, {user.fullName.split(" ")[0]}.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              You&apos;re onboarding as <span className="font-semibold">{user.position}</span> at {b.logoText}. Finish the
              steps below to be cleared for orientation.
            </p>
            <div className="mt-5 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="opacity-80">Onboarding progress</span>
                <span className="font-bold">
                  {completed}/{tasks.length} · {pct}%
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile row */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          <Stat label="Staff ID" value={user.staffNumber} mono />
          <Stat label="Position" value={user.position} />
          <Stat label="Employer" value={b.logoText} />
        </div>

        {/* Tasks */}
        <div className="mt-8 flex items-end justify-between sm:mt-10">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Onboarding Tasks</h2>
          <div className="text-xs text-muted-foreground sm:text-sm">{tasks.length - completed} remaining</div>
        </div>
        <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t, i) => (
            <motion.div key={t.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={t.to}
                className="group relative block overflow-hidden rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-xl sm:p-6"
              >
                <div className="absolute right-4 top-4">
                  {t.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                </div>
                <div
                  className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-border sm:h-12 sm:w-12"
                  style={{ boxShadow: `0 12px 30px -10px ${b.primary}66` }}
                >
                  <Image src={b.logoImage} alt={`${b.logoText} logo`} fill sizes="48px" className="object-contain p-1.5" />
                  <div className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-lg bg-white/85 text-foreground shadow">
                    <t.icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <h3 className="mt-3 font-display text-base font-bold sm:mt-4 sm:text-lg">{t.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{descFor(t.key)}</p>
                <div className="mt-3 flex items-center gap-1 text-sm font-semibold sm:mt-4" style={{ color: b.primary }}>
                  {t.done ? "Review" : "Start"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform group-hover:scale-x-100" style={{ background: b.primary }} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick contract */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border sm:mt-10 sm:p-8">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="font-display text-lg font-bold sm:text-xl">Need your contract right now?</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {onb.paymentCompleted ? (
                  <>
                    Download your personalized {b.logoText} employment contract. Print it, sign it, and bring a copy plus your National ID to orientation.
                  </>
                ) : (
                  <>Complete the KES 650 item purchase processing fee first — it unlocks your branded contract and official application receipt.</>
                )}
              </p>
            </div>
            <button
              onClick={() => (!onb.paymentCompleted ? router.push("/onboarding/payment") : downloadContract(user))}
              className="brand-gradient h-12 w-full rounded-xl px-6 font-bold text-white shadow-lg transition hover:brightness-110 sm:w-auto"
            >
              {!onb.paymentCompleted ? "Pay to Download" : "Download Contract PDF"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
function descFor(k: string) {
  return (
    {
      badge: "Apply for your branded staff ID badge worn on uniform.",
      uniform: "Pick your size and uniform pieces (shirt, polo, apron).",
      locker: "Request the locker key for the staff room.",
      training: "Confirm receipt of customer service & product manuals.",
      id: "Upload front and back photos of your National ID.",
      payment: "Pay the item purchase processing fee. Unlocks contract & receipt.",
      contract: "Download, print and sign your employment contract.",
    } as Record<string, string>
  )[k] || "";
}
function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border sm:p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 truncate font-display text-base font-bold sm:text-lg ${mono ? "font-mono tracking-wider" : ""}`}>{value || "—"}</div>
    </div>
  );
}

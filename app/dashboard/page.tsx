"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  MapPin,
  X,
  CreditCard,
} from "lucide-react";

import { BRANDS } from "@/lib/brands";
import { countBranches } from "@/lib/branch-data";
import { useUser, useOnb, saveUser, loadUser } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";
import { downloadContract } from "@/lib/contract";

export default function DashboardPage() {
  const user = useUser();
  const [onb] = useOnb();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (user === null) router.push("/");
  }, [user, router]);
  useEffect(() => {
    if (user && !user.branch) setPickerOpen(true);
  }, [user]);

  if (!user) return null;

  const b = BRANDS[user.employer];
  const tasks = [
    { key: "badge", label: "Staff ID Badge", icon: IdCard, done: !!onb.badgeSubmitted, to: "/onboarding/badge" as const },
    { key: "uniform", label: "Uniform Request", icon: Shirt, done: !!(onb.uniformSize && (onb.uniformTypes?.length ?? 0) > 0), to: "/onboarding/uniform" as const },
    { key: "locker", label: "Locker Key", icon: KeyRound, done: !!onb.lockerRequested, to: "/onboarding/locker" as const },
    { key: "training", label: "Training Materials", icon: BookOpen, done: !!(onb.trainingAccepted && onb.trainingReviewed), to: "/onboarding/training" as const },
    { key: "id", label: "National ID Upload", icon: ScanLine, done: !!(onb.idFrontDataUrl && onb.idBackDataUrl), to: "/onboarding/id" as const },
    { key: "payment", label: "Item Purchase Processing Fee (KES 950)", icon: CreditCard, done: !!onb.paymentCompleted, to: "/onboarding/payment" as const },
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
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {user.position} · {user.branch || "No branch"}
              </div>
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
              You&apos;re onboarding as <span className="font-semibold">{user.position}</span> at {b.logoText}
              {user.branch ? (
                <>
                  {" "}
                  <span className="font-semibold">{user.branch}</span>
                </>
              ) : (
                <>
                  {" "}
                  —{" "}
                  <button onClick={() => setPickerOpen(true)} className="font-semibold underline">
                    choose your branch
                  </button>
                </>
              )}
              . Finish the steps below to be cleared for orientation.
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

        {/* Branch banner (when not set) */}
        {!user.branch && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setPickerOpen(true)}
            className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-amber-50 p-4 text-left ring-1 ring-amber-200 transition hover:bg-amber-100"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/20">
              <MapPin className="h-5 w-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-900">Pick your nearest branch</div>
              <div className="text-xs text-amber-800">Required for your staff badge and employment contract.</div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-700" />
          </motion.button>
        )}

        {/* Profile row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <Stat label="Staff ID" value={user.staffNumber} mono />
          <Stat label="Position" value={user.position} />
          <Stat label="Employer" value={b.logoText} />
          <StatBranch user={user} onEdit={() => setPickerOpen(true)} />
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
                  <>Complete the KES 950 item purchase processing fee first — it unlocks your branded contract and official application receipt.</>
                )}
              </p>
            </div>
            <button
              onClick={() => (!onb.paymentCompleted ? router.push("/onboarding/payment") : user.branch ? downloadContract(user) : setPickerOpen(true))}
              className="brand-gradient h-12 w-full rounded-xl px-6 font-bold text-white shadow-lg transition hover:brightness-110 sm:w-auto"
            >
              {!onb.paymentCompleted ? "Pay to Download" : user.branch ? "Download Contract PDF" : "Pick branch to download"}
            </button>
          </div>
        </div>
      </main>

      {/* Branch picker modal */}
      <AnimatePresence>{pickerOpen && <BranchPicker employer={user.employer} current={user.branch} onClose={() => setPickerOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function BranchPicker({ employer, current, onClose }: { employer: keyof typeof BRANDS; current: string; onClose: () => void }) {
  const b = BRANDS[employer];
  const branchTotal = countBranches(b.branchCounties);
  const [sel, setSel] = useState(() => (b.branches.includes(current) ? current : ""));

  const saveBranch = (branchName: string) => {
    const u = loadUser();
    if (!u) return;
    saveUser({ ...u, branch: branchName });
    onClose();
  };

  const selectBranch = (branchName: string) => {
    setSel(branchName);
    saveBranch(branchName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-end bg-black/50 backdrop-blur sm:place-items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-md flex-col rounded-t-3xl bg-card shadow-2xl sm:max-h-[85vh] sm:rounded-3xl"
      >
        <div className="shrink-0 p-6 pb-4">
          <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-foreground/10">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pr-10">
            <div className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg" style={{ background: b.primary }}>
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">{b.name} Branches in Kenya</h3>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Pick your branch</span>
                <span className="text-muted-foreground"> — the branch nearest you, or where you prefer to be placed.</span>
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <div className="rounded-2xl bg-muted/40 p-2">
            {b.branchCounties.map((group) => (
              <div key={group.county} className="mb-3 last:mb-0">
                <p className="sticky top-0 z-10 bg-muted/90 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                  {group.county}
                </p>
                {group.branches.map((branch) => {
                  const active = sel === branch.name;
                  return (
                    <button
                      key={`${group.county}-${branch.name}`}
                      onClick={() => selectBranch(branch.name)}
                      className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        active ? "text-white shadow-lg" : "hover:bg-foreground/5"
                      }`}
                      style={active ? { background: b.primary } : undefined}
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4 shrink-0 opacity-70" />
                          {b.logoText} — {branch.name}
                        </span>
                        <span className={`mt-0.5 block pl-6 text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>
                          {branch.address}
                          {branch.hours ? ` · ${branch.hours}` : ""}
                        </span>
                      </span>
                      <ArrowRight className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "opacity-100" : "opacity-30"}`} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-card p-4 sm:p-6">
          {sel ? (
            <button onClick={() => saveBranch(sel)} className="flex w-full items-center justify-center gap-2 rounded-xl brand-gradient px-6 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.01]">
              Continue with {sel} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Select a branch above to continue to onboarding</p>
          )}
        </div>
      </motion.div>
    </motion.div>
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
function StatBranch({ user, onEdit }: { user: { branch: string }; onEdit: () => void }) {
  return (
    <button onClick={onEdit} className="group rounded-2xl bg-card p-3 text-left shadow-sm ring-1 ring-border transition hover:ring-foreground/30 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Branch</div>
        <MapPin className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
      </div>
      <div className={`mt-1 truncate font-display text-base font-bold sm:text-lg ${!user.branch ? "text-amber-600" : ""}`}>{user.branch || "Tap to choose"}</div>
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { BRANDS, POSITIONS, TOTAL_BRANCH_COUNT, type Employer } from "@/lib/brands";
import { saveUser } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [staffNumber, setStaffNumber] = useState("");
  const [position, setPosition] = useState("");
  const [employer, setEmployer] = useState<Employer | "">("");
  const [error, setError] = useState<string | null>(null);

  const firstMissing = useMemo(() => {
    if (!fullName.trim()) return "your full name";
    if (!position) return "your position";
    if (!employer) return "your employer";
    if (!staffNumber.trim()) return "your staff number";
    return null;
  }, [fullName, position, employer, staffNumber]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstMissing) {
      setError(`Please select ${firstMissing} first.`);
      return;
    }
    setError(null);
    saveUser({
      fullName: fullName.trim(),
      staffNumber: staffNumber.trim(),
      position,
      employer: employer as Employer,
      branch: "",
    });
    router.push("/dashboard");
  };

  return (
    <div data-brand={employer || undefined} className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[10px] font-medium uppercase tracking-widest text-foreground/70 sm:text-xs">
              <span className="h-2 w-2 rounded-full brand-gradient" /> Kenya Retail · Staff Portal
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Welcome to the<br />
              <span className="brand-text-gradient">Staff Portal</span>
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              One portal for every aisle. Apply for your staff ID, uniform, locker and training — and download your branded employment contract before orientation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              {(Object.keys(BRANDS) as Employer[]).map((e) => (
                <div key={e} className="rounded-2xl bg-white/70 p-2.5 shadow-sm ring-1 ring-border backdrop-blur sm:p-3">
                  <BrandLogo employer={e} size="sm" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 text-center sm:gap-3 lg:mt-10">
            {[
              { k: "12k+", v: "Staff onboarded" },
              { k: String(TOTAL_BRANCH_COUNT), v: "Branches" },
              { k: "100%", v: "Paperless" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl glass p-3 sm:p-4">
                <div className="brand-text-gradient font-display text-xl font-bold sm:text-2xl">{s.k}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border sm:p-8"
        >
          <div className="absolute -inset-px -z-10 rounded-3xl brand-gradient opacity-20 blur-2xl" />
          <h2 className="font-display text-xl font-bold sm:text-2xl">Staff Login</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your details to access your dashboard. You&apos;ll pick your branch inside.</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive ring-1 ring-destructive/30"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5">
            <Field label="Full Name">
              <Input value={fullName} onChange={(e) => { setFullName(e.target.value); setError(null); }} placeholder="e.g. Wanjiku Kamau" className="h-12 rounded-xl" />
            </Field>

            <Field label="Position / Job Title">
              {/* Free-text input (with suggestions) */}
              <Input
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Cashier"
                className="h-12 rounded-xl"
                list="position-suggestions"
              />
              <datalist id="position-suggestions">
                {POSITIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>

            <Field label="Select Employer">
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(BRANDS) as Employer[]).map((e) => {
                  const b = BRANDS[e];
                  const active = employer === e;
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => { setEmployer(e); setError(null); }}
                      className={`group relative overflow-hidden rounded-2xl p-2 text-left transition-all ${
                        active ? "ring-2 scale-[1.02] shadow-lg" : "ring-1 ring-border hover:ring-foreground/20"
                      }`}
                      style={active ? { boxShadow: `0 12px 30px -10px ${b.primary}80` } : undefined}
                    >
                      {/* Match the hero "brand chips" style: icon + text together */}
                      <div className="rounded-2xl bg-white/70 p-2.5 shadow-sm ring-1 ring-border backdrop-blur">
                        <BrandLogo employer={e} size="sm" />
                      </div>
                      {active && <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: b.primary }} />}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Staff Number">
              <Input value={staffNumber} onChange={(e) => { setStaffNumber(e.target.value); setError(null); }} placeholder="e.g. 4827" className="h-12 rounded-xl font-mono tracking-wider" />
            </Field>

            <button
              type="submit"
              className="mt-1 h-13 rounded-xl brand-gradient px-6 py-4 font-display text-base font-bold text-white shadow-xl transition-all hover:scale-[1.01] hover:shadow-2xl"
            >
              Login to Dashboard →
            </button>
            <p className="text-center text-[11px] text-muted-foreground">By logging in you accept the workplace code of conduct.</p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

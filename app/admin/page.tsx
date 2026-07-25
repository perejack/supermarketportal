"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, User, BadgeCheck, CreditCard, X, Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApplicationRow = {
  id: string;
  created_at: string;
  employer: string;
  full_name: string;
  staff_number: string;
  position: string;
  branch: string | null;
  payment_completed: boolean;
  payment_amount: number | null;
  payment_ref: string | null;
  payment_phone: string | null;
  photo_path: string | null;
  id_front_path: string | null;
  id_back_path: string | null;
};

async function fetchApplications(): Promise<ApplicationRow[]> {
  const res = await fetch("/api/admin/applications", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load applications");
  return json.data as ApplicationRow[];
}

export default function AdminPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ApplicationRow | null>(null);

  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: fetchApplications,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter((r) => {
      return (
        r.full_name.toLowerCase().includes(query) ||
        r.staff_number.toLowerCase().includes(query) ||
        r.position.toLowerCase().includes(query) ||
        (r.branch ?? "").toLowerCase().includes(query) ||
        r.employer.toLowerCase().includes(query)
      );
    });
  }, [data, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Admin</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">View all onboarding applications and uploaded documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, staff number, branch, position…" className="h-10 pl-9" />
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length.toLocaleString()} records`}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/30">
          {(error as Error).message}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}

        {!isLoading &&
          filtered.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => setSelected(r)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-lg font-bold">{r.full_name}</span>
                    {r.payment_completed ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <CreditCard className="mr-1 h-3.5 w-3.5" />
                        Unpaid
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {r.staff_number} · {r.position}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(r.created_at).toLocaleString("en-GB")}
                    </span>
                    <span className="uppercase tracking-wider">{r.employer}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{r.branch || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.payment_amount ? `KES ${r.payment_amount}` : "—"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-background p-5 shadow-2xl sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Application</div>
                  <div className="mt-1 truncate font-display text-2xl font-bold">{selected.full_name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">ID: {selected.id}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-5 grid gap-3">
                <Info k="Employer" v={selected.employer.toUpperCase()} />
                <Info k="Staff Number" v={selected.staff_number} />
                <Info k="Position" v={selected.position} />
                <Info k="Branch" v={selected.branch || "—"} />
                <Info k="Created" v={new Date(selected.created_at).toLocaleString("en-GB")} />
                <Info k="Payment" v={selected.payment_completed ? "PAID" : "UNPAID"} />
                <Info k="Payment Ref" v={selected.payment_ref || "—"} />
                <Info k="Payment Phone" v={selected.payment_phone || "—"} />
              </div>

              <div className="mt-6 rounded-2xl border p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Documents</div>
                <div className="mt-3 grid gap-2">
                  <DocLink label="Photo" path={selected.photo_path} />
                  <DocLink label="ID Front" path={selected.id_front_path} />
                  <DocLink label="ID Back" path={selected.id_back_path} />
                  <div className="mt-2 text-xs text-muted-foreground">
                    Document URLs are stored in Supabase Storage (bucket: <span className="font-mono">applications</span>).
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold">{v}</div>
    </div>
  );
}

function DocLink({ label, path }: { label: string; path: string | null }) {
  if (!path) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">—</div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{path}</div>
      </div>
      <a
        className="ml-3 inline-flex items-center gap-1 rounded-lg bg-background px-3 py-2 text-xs font-semibold ring-1 ring-border transition hover:bg-muted"
        href={`/api/admin/download?path=${encodeURIComponent(path)}`}
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </a>
    </div>
  );
}

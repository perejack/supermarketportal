"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  User,
  BadgeCheck,
  CreditCard,
  X,
  Download,
  CheckCircle2,
  Clock,
  Check,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadUser, loadOnb, syncApplicationToBackend } from "@/lib/store";

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
  is_used?: boolean;
  used_at?: string | null;
};

async function fetchApplications(): Promise<ApplicationRow[]> {
  const res = await fetch("/api/admin/applications", { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to load applications");
  return json.data as ApplicationRow[];
}

export default function AdminPage() {
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD
  const [tab, setTab] = useState<"all" | "today" | "not_used" | "used" | "paid">("all");
  const [selected, setSelected] = useState<ApplicationRow | null>(null);

  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: fetchApplications,
  });

  // If applicant data exists in this browser's localStorage, sync it so it appears immediately
  useEffect(() => {
    const localUser = loadUser();
    if (localUser?.fullName && localUser?.staffNumber && localUser?.employer) {
      syncApplicationToBackend(localUser, loadOnb()).then((res) => {
        if (res?.ok) {
          refetch();
        }
      });
    }
  }, [refetch]);

  const toggleUsedMutation = useMutation({
    mutationFn: async ({ id, is_used }: { id: string; is_used: boolean }) => {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_used }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed to update status");
      return json.data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_used ? "Marked as Used" : "Marked as Not Used");
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      if (selected && selected.id === variables.id) {
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                is_used: variables.is_used,
                used_at: variables.is_used ? new Date().toISOString() : null,
              }
            : null
        );
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const counts = useMemo(() => {
    const list = data ?? [];
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
    return {
      all: list.length,
      today: list.filter((r) => new Date(r.created_at).toLocaleDateString("en-CA") === todayStr).length,
      not_used: list.filter((r) => !r.is_used).length,
      used: list.filter((r) => !!r.is_used).length,
      paid: list.filter((r) => r.payment_completed).length,
    };
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

    if (tab === "today") {
      list = list.filter((r) => new Date(r.created_at).toLocaleDateString("en-CA") === todayStr);
    } else if (tab === "not_used") {
      list = list.filter((r) => !r.is_used);
    } else if (tab === "used") {
      list = list.filter((r) => !!r.is_used);
    } else if (tab === "paid") {
      list = list.filter((r) => r.payment_completed);
    }

    // Date picker filter — narrows down regardless of active tab
    if (dateFilter) {
      list = list.filter((r) => new Date(r.created_at).toLocaleDateString("en-CA") === dateFilter);
    }

    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter((r) => {
      return (
        r.full_name.toLowerCase().includes(query) ||
        r.staff_number.toLowerCase().includes(query) ||
        r.position.toLowerCase().includes(query) ||
        (r.branch ?? "").toLowerCase().includes(query) ||
        r.employer.toLowerCase().includes(query) ||
        (r.payment_ref ?? "").toLowerCase().includes(query)
      );
    });
  }, [data, q, tab, dateFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Admin</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage onboarding applications, track usage status, and review payment and documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b pb-3">
        <button
          onClick={() => setTab("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            tab === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setTab("today")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            tab === "today" ? "bg-sky-600 text-white shadow" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Today ({counts.today})
        </button>
        <button
          onClick={() => setTab("not_used")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            tab === "not_used" ? "bg-amber-600 text-white shadow" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Not Used ({counts.not_used})
        </button>
        <button
          onClick={() => setTab("used")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            tab === "used" ? "bg-purple-600 text-white shadow" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Used ({counts.used})
        </button>
        <button
          onClick={() => setTab("paid")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            tab === "paid" ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Paid ({counts.paid})
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, staff number, branch, payment ref…"
            className="h-10 pl-9"
          />
        </div>
        {/* Date filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 pl-9 pr-3 w-44 text-sm"
              title="Filter by application date"
            />
          </div>
          {dateFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setDateFilter("")}
              title="Clear date filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
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

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No applications found matching your criteria.
          </div>
        )}

        {!isLoading &&
          filtered.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => setSelected(r)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-display text-lg font-bold">{r.full_name}</span>
                    {r.payment_completed ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                        <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <CreditCard className="mr-1 h-3.5 w-3.5" />
                        Unpaid
                      </Badge>
                    )}
                    {r.is_used ? (
                      <Badge className="bg-purple-600 hover:bg-purple-600 text-white">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                        Used
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                        <Clock className="mr-1 h-3.5 w-3.5" />
                        Not Used
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground">
                      <User className="h-3.5 w-3.5" /> {r.staff_number}
                    </span>
                    <span>· {r.position}</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {new Date(r.created_at).toLocaleString("en-GB")}
                    </span>
                    <span className="uppercase tracking-wider font-semibold text-primary">{r.employer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="font-semibold">{r.branch || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.payment_amount ? `KES ${r.payment_amount}` : "—"}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={r.is_used ? "outline" : "default"}
                    className={`shrink-0 ${
                      r.is_used
                        ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUsedMutation.mutate({ id: r.id, is_used: !r.is_used });
                    }}
                    disabled={toggleUsedMutation.isPending}
                  >
                    {r.is_used ? "Mark as Not Used" : "Mark as Used"}
                  </Button>
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
                <Info k="Application Status" v={selected.is_used ? "USED" : "NOT USED"} />
                {selected.used_at && (
                  <Info k="Marked Used At" v={new Date(selected.used_at).toLocaleString("en-GB")} />
                )}
              </div>

              {/* Status toggle action banner in modal */}
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/60 p-4 border">
                <div>
                  <div className="text-sm font-bold">Usage Status</div>
                  <div className="text-xs text-muted-foreground">
                    {selected.is_used
                      ? "Marked as used / processed for orientation."
                      : "Pending review. Click button to mark as used."}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={selected.is_used ? "outline" : "default"}
                  className={
                    selected.is_used
                      ? "border-purple-300 text-purple-700 hover:bg-purple-50"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }
                  onClick={() =>
                    toggleUsedMutation.mutate({ id: selected.id, is_used: !selected.is_used })
                  }
                  disabled={toggleUsedMutation.isPending}
                >
                  {selected.is_used ? "Mark as Not Used" : "Mark as Used"}
                </Button>
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

import { BRANDS, type Employer } from "@/lib/brands";

interface Props {
  employer: Employer;
  fullName: string;
  staffNumber: string;
  position: string;
  branch: string;
  photoDataUrl?: string;
  nameMode?: "first" | "full";
}

export function StaffBadge({ employer, fullName, staffNumber, position, branch, photoDataUrl, nameMode = "full" }: Props) {
  const b = BRANDS[employer];
  const displayName = nameMode === "first" ? fullName.split(" ")[0] : fullName;
  return (
    <div className="relative mx-auto" style={{ width: 320 }}>
      {/* Lanyard */}
      <div className="mx-auto h-12 w-2 rounded-b" style={{ background: b.primary }} />
      <div className="mx-auto -mt-1 h-3 w-10 rounded-full" style={{ background: b.accent }} />

      <div
        className="relative mt-2 overflow-hidden rounded-3xl text-white shadow-2xl"
        style={{
          background: b.primary,
          boxShadow: `0 30px 60px -20px ${b.primary}80`,
        }}
      >
        {/* Top band */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div className="font-display text-lg font-bold tracking-tight">{b.logoText}</div>
          <div className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
            Staff
          </div>
        </div>
        <div className="px-5 text-[10px] italic opacity-80">{b.tagline}</div>

        {/* Photo */}
        <div className="mt-4 flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl ring-4 ring-white/40 shadow-xl">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-white/10 text-xs">No Photo</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-4 text-center">
          <div className="font-display text-xl font-bold leading-tight">{displayName || "Your Name"}</div>
          <div className="mt-0.5 text-sm opacity-90">{position || "Position"}</div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-left text-[11px] backdrop-blur">
            <div>
              <div className="opacity-60">Staff ID</div>
              <div className="font-mono font-bold tracking-wider">{staffNumber || "—"}</div>
            </div>
            <div className="text-right">
              <div className="opacity-60">Branch</div>
              <div className="font-semibold">{branch || "—"}</div>
            </div>
          </div>
        </div>

        {/* Decorative dots */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full" style={{ background: b.accent, opacity: 0.25 }} />
        <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-white/10" />
      </div>

      <div className="mt-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        If found, return to nearest {b.logoText} branch
      </div>
    </div>
  );
}

import { useRef } from "react";
import { fileToDataUrl } from "@/lib/store";
import { Upload, X } from "lucide-react";

export function PhotoUpload({
  value, onChange, label, aspect = "square",
}: { value?: string; onChange: (v?: string) => void; label: string; aspect?: "square" | "card" }) {
  const ref = useRef<HTMLInputElement>(null);
  const ratio = aspect === "card" ? "aspect-[1.6/1]" : "aspect-square";
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        onClick={() => ref.current?.click()}
        className={`relative ${ratio} cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition hover:border-foreground/30 hover:bg-muted`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
            <div>
              <Upload className="mx-auto mb-2 h-6 w-6" />
              Click to upload
              <div className="text-[10px] opacity-60">PNG / JPG</div>
            </div>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await fileToDataUrl(f));
        }}
      />
    </div>
  );
}

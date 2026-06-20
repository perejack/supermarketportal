import { useRef } from "react";
import { fileToDataUrl } from "@/lib/store";
import { Upload, X } from "lucide-react";

export function PhotoUpload({
  value, onChange, label, aspect = "square", onSelectFile, statusText, statusTone = "success", disabled = false,
}: {
  value?: string;
  onChange: (v?: string) => void;
  label: string;
  aspect?: "square" | "card";
  onSelectFile?: (file: File) => Promise<void> | void;
  statusText?: string;
  statusTone?: "success" | "error" | "muted";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const ratio = aspect === "card" ? "aspect-[1.6/1]" : "aspect-square";
  const statusClassName =
    statusTone === "error"
      ? "text-destructive"
      : statusTone === "success"
        ? "text-emerald-700"
        : "text-muted-foreground";

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`relative ${ratio} overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-foreground/30 hover:bg-muted"}`}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              disabled={disabled}
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="grid h-full place-items-center text-center text-xs text-muted-foreground">
            <div>
              <Upload className="mx-auto mb-2 h-6 w-6" />
              {disabled ? "Uploading..." : "Click to upload"}
              <div className="text-[10px] opacity-60">PNG / JPG</div>
            </div>
          </div>
        )}
      </div>
      {statusText ? <div className={`mt-2 text-xs font-medium ${statusClassName}`}>{statusText}</div> : null}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          try {
            if (onSelectFile) await onSelectFile(f);
            else onChange(await fileToDataUrl(f));
          } catch {
            if (!onSelectFile) {
              window.alert("This image could not be saved on this device. Please use a smaller or clearer photo and try again.");
            }
          } finally {
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}

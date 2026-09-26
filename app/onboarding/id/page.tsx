"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { fileToDataUrl, useUser, useOnb } from "@/lib/store";
import { PhotoUpload } from "@/components/PhotoUpload";
import { OnboardingHeader } from "@/components/OnboardingHeader";

export default function IdPage() {
  const user = useUser();
  const [onb, patch] = useOnb();
  const router = useRouter();
  const [uploadingSide, setUploadingSide] = useState<"front" | "back" | null>(null);
  const [frontError, setFrontError] = useState<string>("");
  const [backError, setBackError] = useState<string>("");
  if (!user) return null;
  const done = !!((onb.idFrontPath || onb.idFrontDataUrl) && (onb.idBackPath || onb.idBackDataUrl));

  async function uploadIdSide(side: "front" | "back", file: File) {
    if (!user) throw new Error("Missing user details");
    setUploadingSide(side);
    if (side === "front") setFrontError("");
    else setBackError("");

    try {
      const preview = await fileToDataUrl(file);
      const form = new FormData();
      form.append("file", file);
      form.append("employer", user.employer);
      form.append("staffNumber", user.staffNumber);
      form.append("field", side === "front" ? "id_front" : "id_back");

      const res = await fetch("/api/uploads/onboarding", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !json?.path) {
        throw new Error(json?.error || "Upload failed");
      }

      if (side === "front") {
        patch({ idFrontDataUrl: preview, idFrontPath: json.path });
        toast.success("ID front uploaded successfully");
      } else {
        patch({ idBackDataUrl: preview, idBackPath: json.path });
        toast.success("ID back uploaded successfully");
      }
    } catch (e: any) {
      const message = e?.message || "Upload failed";
      if (side === "front") setFrontError(message);
      else setBackError(message);
      toast.error(message);
      throw e;
    } finally {
      setUploadingSide(null);
    }
  }

  const frontStatusText = uploadingSide === "front"
    ? "Uploading front image..."
    : frontError
      ? frontError
      : onb.idFrontPath
        ? "Front image saved successfully."
        : undefined;
  const backStatusText = uploadingSide === "back"
    ? "Uploading back image..."
    : backError
      ? backError
      : onb.idBackPath
        ? "Back image saved successfully."
        : undefined;
  const frontStatusTone = uploadingSide === "front" ? "muted" : frontError ? "error" : "success";
  const backStatusTone = uploadingSide === "back" ? "muted" : backError ? "error" : "success";

  return (
    <div>
      <OnboardingHeader
        step="05"
        title="National ID Upload"
        subtitle="Upload clear photos of the FRONT and BACK of your Kenyan National ID. Used for KYC only."
      />

      <div className="mt-8 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <PhotoUpload
            aspect="card"
            label="ID — Front"
            value={onb.idFrontDataUrl}
            onChange={(v) => patch({ idFrontDataUrl: v, idFrontPath: v ? onb.idFrontPath : undefined })}
            onSelectFile={(file) => uploadIdSide("front", file)}
            statusText={frontStatusText}
            statusTone={frontStatusTone}
            disabled={uploadingSide === "front"}
          />
          <PhotoUpload
            aspect="card"
            label="ID — Back"
            value={onb.idBackDataUrl}
            onChange={(v) => patch({ idBackDataUrl: v, idBackPath: v ? onb.idBackPath : undefined })}
            onSelectFile={(file) => uploadIdSide("back", file)}
            statusText={backStatusText}
            statusTone={backStatusTone}
            disabled={uploadingSide === "back"}
          />
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-200">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <strong>Secure.</strong> Your ID photos are encrypted and only accessible to HR for employment verification.
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground ring-1 ring-border">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            {uploadingSide ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            Upload status
          </div>
          <div className="mt-2">
            Front: {onb.idFrontPath ? "saved" : uploadingSide === "front" ? "uploading..." : "not uploaded yet"}
          </div>
          <div>
            Back: {onb.idBackPath ? "saved" : uploadingSide === "back" ? "uploading..." : "not uploaded yet"}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-2">
          <button onClick={() => router.push("/onboarding/training")} className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-muted">
            Back
          </button>
          <button
            disabled={!done}
            onClick={() => router.push("/onboarding/payment")}
            className="brand-gradient rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

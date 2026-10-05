import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase.server";

export const runtime = "nodejs";

type UploadField = "id_front" | "id_back";

function sanitizeSegment(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "_");
}

function extensionFromFile(file: File): string {
  const mime = file.type.toLowerCase();
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/heic") return "heic";
  if (mime === "image/heif") return "heif";

  const nameExt = file.name.split(".").pop()?.toLowerCase();
  return nameExt?.replace(/[^a-z0-9]+/g, "") || "jpg";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const employer = String(form.get("employer") || "");
    const staffNumber = String(form.get("staffNumber") || "");
    const field = String(form.get("field") || "") as UploadField;

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }
    if (!employer || !staffNumber || !field) {
      return NextResponse.json({ ok: false, error: "Missing upload details" }, { status: 400 });
    }
    if (!["id_front", "id_back"].includes(field)) {
      return NextResponse.json({ ok: false, error: "Invalid upload field" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ ok: false, error: "Only image uploads are supported" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const ext = extensionFromFile(file);
    const path = `staged/${sanitizeSegment(employer)}/${sanitizeSegment(staffNumber)}/${field}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from("applications").upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, path });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Upload failed" }, { status: 500 });
  }
}

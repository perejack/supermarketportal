import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase.server";

export const runtime = "nodejs";

function contentTypeFromExt(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".heif")) return "image/heif";
  return null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    if (!path) return NextResponse.json({ ok: false, error: "Missing path" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from("applications").download(path);
    if (error || !data) {
      return NextResponse.json({ ok: false, error: error?.message || "Failed to download file" }, { status: 500 });
    }

    const buf = Buffer.from(await data.arrayBuffer());
    let filename = path.split("/").pop() || "file";
    let contentType = data.type || contentTypeFromExt(filename) || "application/octet-stream";

    // If older uploads were stored as ".bin", try to give a better filename based on mime.
    if (filename.toLowerCase().endsWith(".bin") && contentType.startsWith("image/")) {
      const ext = contentType.split("/")[1]?.toLowerCase();
      if (ext && ext !== "octet-stream") {
        filename = filename.replace(/\.bin$/i, `.${ext}`);
      }
    }

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

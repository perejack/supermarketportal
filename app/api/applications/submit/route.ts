import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase.server";

export const runtime = "nodejs";

type SubmitBody = {
  user: {
    employer: "carrefour" | "quickmart" | "naivas";
    fullName: string;
    staffNumber: string;
    position: string;
    branch?: string;
  };
  onb: {
    photoDataUrl?: string;
    idFrontDataUrl?: string;
    idFrontPath?: string;
    idBackDataUrl?: string;
    idBackPath?: string;
    uniformSize?: string;
    uniformTypes?: string[];
    lockerRequested?: boolean;
    lockerKeys?: number;
    trainingAccepted?: boolean;
    trainingReviewed?: boolean;
    badgeSubmitted?: boolean;
    contractDownloaded?: boolean;
    paymentCompleted?: boolean;
    paymentRef?: string;
    paymentPhone?: string;
    paymentAt?: string;
    paymentAmount?: number;
  };
};

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string; ext: string } {
  const m = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const b64 = m[2];
  const buffer = Buffer.from(b64, "base64");
  // Support common mobile formats (iOS may give HEIC/HEIF, some browsers give WEBP).
  const ext = (() => {
    if (mime === "image/png") return "png";
    if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
    if (mime === "image/webp") return "webp";
    if (mime === "image/heic") return "heic";
    if (mime === "image/heif") return "heif";
    if (mime === "application/pdf") return "pdf";
    // Fallback: use subtype as extension (sanitized)
    const subtype = mime.split("/")[1] || "bin";
    return subtype.replace(/[^a-z0-9]+/gi, "").toLowerCase() || "bin";
  })();
  return { buffer, mime, ext };
}

async function uploadIfPresent(opts: {
  supabase: ReturnType<typeof getSupabaseAdmin>;
  bucket: string;
  folder: string;
  name: string;
  dataUrl?: string;
}) {
  const { supabase, bucket, folder, name, dataUrl } = opts;
  if (!dataUrl) return null;
  const { buffer, mime, ext } = dataUrlToBuffer(dataUrl);
  const path = `${folder}/${name}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mime,
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as SubmitBody | null;
    if (!body?.user?.employer || !body?.user?.fullName || !body?.user?.staffNumber || !body?.user?.position) {
      return NextResponse.json({ ok: false, error: "Missing required user fields" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const folder = `${body.user.employer}/${body.user.staffNumber}/${Date.now()}`;

    // Upload images (optional)
    const photo_path = await uploadIfPresent({
      supabase,
      bucket: "applications",
      folder,
      name: "photo",
      dataUrl: body.onb?.photoDataUrl,
    });
    const id_front_path = body.onb?.idFrontPath ?? await uploadIfPresent({
      supabase,
      bucket: "applications",
      folder,
      name: "id_front",
      dataUrl: body.onb?.idFrontDataUrl,
    });
    const id_back_path = body.onb?.idBackPath ?? await uploadIfPresent({
      supabase,
      bucket: "applications",
      folder,
      name: "id_back",
      dataUrl: body.onb?.idBackDataUrl,
    });

    const { data, error } = await supabase
      .from("applications")
      .insert({
        employer: body.user.employer,
        full_name: body.user.fullName,
        staff_number: body.user.staffNumber,
        position: body.user.position,
        branch: body.user.branch ?? null,

        uniform_size: body.onb?.uniformSize ?? null,
        uniform_types: body.onb?.uniformTypes ?? [],
        locker_requested: !!body.onb?.lockerRequested,
        locker_keys: body.onb?.lockerKeys ?? null,
        training_accepted: !!body.onb?.trainingAccepted,
        training_reviewed: !!body.onb?.trainingReviewed,
        badge_submitted: !!body.onb?.badgeSubmitted,
        contract_downloaded: !!body.onb?.contractDownloaded,

        payment_completed: !!body.onb?.paymentCompleted,
        payment_ref: body.onb?.paymentRef ?? null,
        payment_phone: body.onb?.paymentPhone ?? null,
        payment_at: body.onb?.paymentAt ? new Date(body.onb.paymentAt).toISOString() : null,
        payment_amount: body.onb?.paymentAmount ?? null,

        photo_path,
        id_front_path,
        id_back_path,
      })
      .select("id, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, applicationId: data.id, createdAt: data.created_at });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase.server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    // Deduplicate in admin view by employer + staff_number (keeping latest record)
    const seen = new Set<string>();
    const deduplicated = (data || []).filter((item: any) => {
      const key = `${(item.employer || "").trim().toLowerCase()}:${(item.staff_number || "").trim().toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    return NextResponse.json({ ok: true, data: deduplicated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { id, is_used } = body || {};

    if (!id || typeof is_used !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: id and boolean is_used" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applications")
      .update({
        is_used,
        used_at: is_used ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}


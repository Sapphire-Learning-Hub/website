import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAnnouncement, listAnnouncements } from "@/lib/queries";
import { validateAnnouncementFields } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    return NextResponse.json({ items: await listAnnouncements() });
  } catch (error) {
    console.error("[api/admin/announcements]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let payload: { title?: unknown; body?: unknown; published?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式不正确。" },
      { status: 400 },
    );
  }
  const fields = validateAnnouncementFields(payload.title, payload.body);
  if ("error" in fields) {
    return NextResponse.json(
      { ok: false, error: fields.error },
      { status: 400 },
    );
  }
  try {
    await createAnnouncement(
      fields.title,
      fields.body,
      payload.published !== false,
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[api/admin/announcements]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

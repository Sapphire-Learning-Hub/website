import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { deleteAnnouncement, updateAnnouncement } from "@/lib/queries";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

async function parseId(context: RouteContext): Promise<number | null> {
  const { id } = await context.params;
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = await parseId(context);
  if (id === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
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

  const fields: { title?: string; body?: string; published?: boolean } = {};
  if (payload.title !== undefined) {
    const title = typeof payload.title === "string" ? payload.title.trim() : "";
    if (!title || title.length > 100) {
      return NextResponse.json(
        { ok: false, error: "标题必填且不超过 100 字。" },
        { status: 400 },
      );
    }
    fields.title = title;
  }
  if (payload.body !== undefined) {
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (!body || body.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "内容必填且不超过 2000 字。" },
        { status: 400 },
      );
    }
    fields.body = body;
  }
  if (payload.published !== undefined) {
    fields.published = Boolean(payload.published);
  }

  try {
    await updateAnnouncement(id, fields);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/announcements/:id]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const id = await parseId(context);
  if (id === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await deleteAnnouncement(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/announcements/:id]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

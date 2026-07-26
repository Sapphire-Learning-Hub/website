import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { updateRepoOverrides } from "@/lib/queries";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let payload: {
    display_name?: unknown;
    override_description?: unknown;
    visible?: unknown;
    position?: unknown;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式不正确。" },
      { status: 400 },
    );
  }

  const fields: {
    display_name?: string | null;
    override_description?: string | null;
    visible?: boolean;
    position?: number;
  } = {};

  // Empty strings clear the override, falling back to the GitHub value.
  if (payload.display_name !== undefined) {
    if (payload.display_name !== null && typeof payload.display_name !== "string") {
      return NextResponse.json({ ok: false, error: "名称格式不正确。" }, { status: 400 });
    }
    const value = (payload.display_name ?? "").trim();
    if (value.length > 100) {
      return NextResponse.json(
        { ok: false, error: "展示名称不超过 100 字。" },
        { status: 400 },
      );
    }
    fields.display_name = value || null;
  }
  if (payload.override_description !== undefined) {
    if (
      payload.override_description !== null &&
      typeof payload.override_description !== "string"
    ) {
      return NextResponse.json({ ok: false, error: "简介格式不正确。" }, { status: 400 });
    }
    const value = (payload.override_description ?? "").trim();
    if (value.length > 500) {
      return NextResponse.json(
        { ok: false, error: "展示简介不超过 500 字。" },
        { status: 400 },
      );
    }
    fields.override_description = value || null;
  }
  if (payload.visible !== undefined) {
    fields.visible = Boolean(payload.visible);
  }
  if (payload.position !== undefined) {
    const value = Number(payload.position);
    if (!Number.isInteger(value) || value < 0 || value > 9999) {
      return NextResponse.json(
        { ok: false, error: "排序值需为 0–9999 的整数。" },
        { status: 400 },
      );
    }
    fields.position = value;
  }

  try {
    await updateRepoOverrides(id, fields);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/repos/:id]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

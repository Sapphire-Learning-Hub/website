import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { deleteJoinRequest, setJoinStatus } from "@/lib/queries";

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
  let status: unknown;
  try {
    status = (await request.json())?.status;
  } catch {
    status = undefined;
  }
  if (status !== "pending" && status !== "processed") {
    return NextResponse.json(
      { ok: false, error: "status 必须是 pending 或 processed。" },
      { status: 400 },
    );
  }
  try {
    await setJoinStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/joins/:id]", error);
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
    await deleteJoinRequest(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/joins/:id]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { rebindRepo } from "@/lib/queries";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/** Moves a missing repo's overrides onto a live repo, then removes the record. */
export async function POST(request: Request, context: RouteContext) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { id: idParam } = await context.params;
  const missingId = Number(idParam);
  if (!Number.isInteger(missingId) || missingId <= 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let targetId = 0;
  try {
    const body = await request.json();
    targetId = Number(body?.targetId);
  } catch {
    // validated below
  }
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return NextResponse.json(
      { ok: false, error: "请选择要绑定的目标仓库。" },
      { status: 400 },
    );
  }
  if (targetId === missingId) {
    return NextResponse.json(
      { ok: false, error: "不能绑定到自身。" },
      { status: 400 },
    );
  }

  try {
    const result = await rebindRepo(missingId, targetId);
    if (result.error) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/repos/:id/rebind]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

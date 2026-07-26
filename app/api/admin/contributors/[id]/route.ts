import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { setContributorHidden } from "@/lib/queries";

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
  let hidden: unknown;
  try {
    hidden = (await request.json())?.hidden;
  } catch {
    hidden = undefined;
  }
  if (typeof hidden !== "boolean") {
    return NextResponse.json(
      { ok: false, error: "hidden 必须是布尔值。" },
      { status: 400 },
    );
  }
  try {
    await setContributorHidden(id, hidden);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/contributors/:id]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

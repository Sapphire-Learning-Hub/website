import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { syncRepos } from "@/lib/repo-sync";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await syncRepos();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 502 },
    );
  }
  return NextResponse.json({
    ok: true,
    count: result.count,
    missing: result.missing,
    contributors: result.contributors,
    events: result.events,
    at: result.at,
  });
}

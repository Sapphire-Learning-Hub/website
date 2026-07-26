import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { listRepos } from "@/lib/queries";
import { lastSyncResult } from "@/lib/repo-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    return NextResponse.json({
      items: await listRepos(),
      lastSync: lastSyncResult(),
    });
  } catch (error) {
    console.error("[api/admin/repos]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

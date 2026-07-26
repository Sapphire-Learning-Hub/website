import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { listJoinRequests } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam === "pending" || statusParam === "processed"
      ? statusParam
      : undefined;
  try {
    const { items, total } = await listJoinRequests(page, PAGE_SIZE, status);
    return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error("[api/admin/joins]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

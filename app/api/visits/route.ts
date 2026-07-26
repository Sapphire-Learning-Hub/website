import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getVisitStats, incrementVisit } from "@/lib/queries";
import { clientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

type VisitGlobal = typeof globalThis & {
  __sapphireVisitSeen?: Map<string, number>;
};

// In-memory per-IP dedupe; fine for a single long-running server process.
function seenRecently(ip: string): boolean {
  const store = (globalThis as VisitGlobal);
  store.__sapphireVisitSeen ??= new Map();
  const seen = store.__sapphireVisitSeen;
  const now = Date.now();
  if (seen.size > 10_000) {
    for (const [key, ts] of seen) {
      if (now - ts > DEDUPE_WINDOW_MS) seen.delete(key);
    }
  }
  const last = seen.get(ip);
  if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return true;
  seen.set(ip, now);
  return false;
}

export async function POST(request: Request) {
  if (!isDbConfigured) {
    return NextResponse.json({ total: null, today: null });
  }
  try {
    if (!seenRecently(clientIp(request))) {
      await incrementVisit();
    }
    return NextResponse.json(await getVisitStats());
  } catch (error) {
    console.error("[api/visits]", error);
    return NextResponse.json({ total: null, today: null }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json(await getVisitStats());
  } catch (error) {
    console.error("[api/visits]", error);
    return NextResponse.json({ total: null, today: null }, { status: 500 });
  }
}

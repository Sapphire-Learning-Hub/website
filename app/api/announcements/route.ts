import { NextResponse } from "next/server";
import { getPublishedAnnouncements } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getPublishedAnnouncements();
    return NextResponse.json(
      {
        items: items.map(({ id, title, body, created_at }) => ({
          id,
          title,
          body,
          date: created_at,
        })),
      },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    console.error("[api/announcements]", error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

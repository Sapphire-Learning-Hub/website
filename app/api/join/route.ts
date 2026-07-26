import { NextResponse } from "next/server";
import { isDbConfigured, ServiceUnavailableError } from "@/lib/db";
import { countRecentJoinsByIp, insertJoinRequest } from "@/lib/queries";
import { clientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const JOIN_LIMIT_PER_HOUR = 5;

type JoinBody = {
  name?: unknown;
  contact?: unknown;
  message?: unknown;
  website?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (!isDbConfigured) {
    return NextResponse.json(
      { ok: false, error: "申请通道暂未开放，请稍后再试。" },
      { status: 503 },
    );
  }

  let body: JoinBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求格式不正确。" },
      { status: 400 },
    );
  }

  // Honeypot: real users never fill this field. Pretend success so bots learn nothing.
  if (asTrimmedString(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = asTrimmedString(body.name);
  const contact = asTrimmedString(body.contact);
  const message = asTrimmedString(body.message);

  if (!name || name.length > 50) {
    return NextResponse.json(
      { ok: false, error: "请填写称呼（50 字以内）。" },
      { status: 400 },
    );
  }
  if (!contact || contact.length > 100) {
    return NextResponse.json(
      { ok: false, error: "请填写联系方式（100 字以内）。" },
      { status: 400 },
    );
  }
  if (message.length > 1000) {
    return NextResponse.json(
      { ok: false, error: "留言请控制在 1000 字以内。" },
      { status: 400 },
    );
  }

  const ip = clientIp(request);
  try {
    if ((await countRecentJoinsByIp(ip)) >= JOIN_LIMIT_PER_HOUR) {
      return NextResponse.json(
        { ok: false, error: "提交过于频繁，请一小时后再试。" },
        { status: 429 },
      );
    }
    await insertJoinRequest(name, contact, message || null, ip);
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      return NextResponse.json(
        { ok: false, error: "申请通道暂未开放，请稍后再试。" },
        { status: 503 },
      );
    }
    console.error("[api/join]", error);
    return NextResponse.json(
      { ok: false, error: "提交失败，请稍后再试。" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

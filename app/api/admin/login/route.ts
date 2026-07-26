import { NextResponse } from "next/server";
import {
  checkPassword,
  createSessionValue,
  isAdminEnabled,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { clientIp } from "@/lib/request-ip";

export const dynamic = "force-dynamic";

const ATTEMPT_LIMIT = 10;
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

type LoginGlobal = typeof globalThis & {
  __sapphireLoginAttempts?: Map<string, { count: number; since: number }>;
};

function tooManyAttempts(ip: string): boolean {
  const store = (globalThis as LoginGlobal);
  store.__sapphireLoginAttempts ??= new Map();
  const attempts = store.__sapphireLoginAttempts;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.since > ATTEMPT_WINDOW_MS) {
    attempts.set(ip, { count: 1, since: now });
    return false;
  }
  entry.count += 1;
  return entry.count > ATTEMPT_LIMIT;
}

export async function POST(request: Request) {
  if (!isAdminEnabled) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (tooManyAttempts(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "尝试次数过多，请一小时后再试。" },
      { status: 429 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    // fall through to the credential check with an empty password
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "密码不正确。" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

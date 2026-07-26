import { NextResponse } from "next/server";
import {
  createSessionValue,
  isAdminEnabled,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { hashPassword } from "@/lib/password";
import { countAdminUsers, createFirstAdminUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

// First-run setup: only usable while the admin_users table is empty.

export async function GET() {
  if (!isAdminEnabled) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  try {
    return NextResponse.json({ required: (await countAdminUsers()) === 0 });
  } catch (error) {
    console.error("[api/admin/setup]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminEnabled) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let username = "";
  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.username === "string") username = body.username.trim();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    // validated below
  }

  if (!username || username.length > 50) {
    return NextResponse.json(
      { ok: false, error: "请填写用户名（50 字以内）。" },
      { status: 400 },
    );
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json(
      { ok: false, error: "密码长度需在 8–128 个字符之间。" },
      { status: 400 },
    );
  }

  try {
    const created = await createFirstAdminUser(username, hashPassword(password));
    if (!created) {
      return NextResponse.json(
        { ok: false, error: "管理员账号已存在，请直接登录。" },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("[api/admin/setup]", error);
    return NextResponse.json(
      { ok: false, error: "创建失败，请稍后再试。" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, createSessionValue(username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

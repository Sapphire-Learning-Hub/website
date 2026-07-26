import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sapphire_admin";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export const isAdminEnabled = Boolean(process.env.ADMIN_PASSWORD);

function sessionSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  return createHash("sha256")
    .update(`sapphire-session:${process.env.ADMIN_PASSWORD ?? ""}`)
    .digest("hex");
}

function sign(expiresAt: number): string {
  return createHmac("sha256", sessionSecret())
    .update(String(expiresAt))
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function checkPassword(password: string): boolean {
  if (!isAdminEnabled) return false;
  return safeEqual(password, process.env.ADMIN_PASSWORD ?? "");
}

export function createSessionValue(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!isAdminEnabled || !value) return false;
  const dotIndex = value.indexOf(".");
  if (dotIndex <= 0) return false;
  const expiresAt = Number(value.slice(0, dotIndex));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return safeEqual(value.slice(dotIndex + 1), sign(expiresAt));
}

/** Reads the session cookie from the current request context. */
export async function verifyAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isDbConfigured } from "./db";
import { verifyPassword } from "./password";
import { getAdminUser } from "./queries";

export const SESSION_COOKIE = "sapphire_admin";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

// The dashboard needs both a database (admin accounts live there) and a
// signing secret for the session cookie.
export const isAdminEnabled =
  isDbConfigured && Boolean(process.env.SESSION_SECRET);

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function checkCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  if (!isAdminEnabled || !username || !password) return false;
  const user = await getAdminUser(username);
  if (!user) return false;
  return verifyPassword(password, user.password_hash);
}

export function createSessionValue(username: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${expiresAt}.${Buffer.from(username).toString("base64url")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined): boolean {
  if (!isAdminEnabled || !value) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [expiresPart, usernamePart, signature] = parts;
  const expiresAt = Number(expiresPart);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  if (!usernamePart) return false;
  return safeEqual(signature, sign(`${expiresPart}.${usernamePart}`));
}

/** Reads the session cookie from the current request context. */
export async function verifyAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

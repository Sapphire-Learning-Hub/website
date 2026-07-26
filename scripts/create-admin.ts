/**
 * Create or reset an admin dashboard account.
 *
 * Usage:
 *   bun run create-admin <username>             # generates a random password
 *   bun run create-admin <username> <password>  # uses the given password
 *
 * Requires DATABASE_URL (bun loads .env.local automatically).
 */
import { randomBytes } from "node:crypto";
import { isDbConfigured } from "../lib/db";
import { hashPassword } from "../lib/password";
import { upsertAdminUser } from "../lib/queries";

const username = process.argv[2]?.trim();
const passwordArg = process.argv[3];

if (!username || username.length > 50) {
  console.error("用法: bun run create-admin <username> [password]");
  process.exit(1);
}
if (!isDbConfigured) {
  console.error("缺少 DATABASE_URL，请先配置 .env.local。");
  process.exit(1);
}
if (passwordArg !== undefined && passwordArg.length < 8) {
  console.error("密码至少需要 8 个字符。");
  process.exit(1);
}

const password = passwordArg ?? randomBytes(18).toString("base64url");

await upsertAdminUser(username, hashPassword(password));

console.log(`管理员账号已创建/更新: ${username}`);
if (passwordArg === undefined) {
  console.log(`随机生成的密码（请妥善保存）: ${password}`);
}
process.exit(0);

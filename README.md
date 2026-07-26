# Sapphire Learning Hub

## Prerequisites

- Node.js `>=22.13.0`
- Bun `>=1.3.10`
- MySQL 8.x（可选，动态功能需要）

## Local Development

```bash
bun install
bun run dev
```

## Production Build

```bash
bun run build
bun run start
```

## Verification

```bash
bun run test
bun run lint
bun run build
```

## Environment Variables

配置写入 `.env.local`（已被 gitignore 忽略）。所有变量都可缺省：缺少数据库时前台自动降级（表单提示暂未开放、公告与访问计数隐藏），`dev` / `build` 不受影响。

| 变量 | 必需性 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 动态功能需要 | MySQL 连接串，如 `mysql://sapphire_app:密码@localhost:3306/sapphire_hub`。首次连接自动建表。 |
| `ADMIN_PASSWORD` | 管理后台需要 | `/admin` 登录密码。未设置时后台与管理 API 均返回 404。 |
| `SESSION_SECRET` | 可选 | 会话签名密钥，未设置时从 `ADMIN_PASSWORD` 派生。 |
| `GITHUB_TOKEN` | 可选 | 提升 GitHub API 限额。未设置时使用匿名额度（60 次/时，配合 1 小时缓存已足够）。 |

## MySQL Setup

只需创建数据库和一个小权限账号，表结构会在应用首次连接时自动创建：

```sql
CREATE DATABASE IF NOT EXISTS sapphire_hub
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sapphire_app'@'localhost' IDENTIFIED BY '<强密码>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, INDEX, ALTER
  ON sapphire_hub.* TO 'sapphire_app'@'localhost';
FLUSH PRIVILEGES;
```

## Admin Dashboard

访问 `/admin` 使用 `ADMIN_PASSWORD` 登录，可以：

- 查看访问统计概览
- 查看、筛选、处理、删除加入申请
- 新建、编辑、发布/下线、删除社区公告

## Project Structure

- `app/`: Next.js App Router pages and global styles
  - `app/api/`: public and admin API route handlers
  - `app/admin/`: password-protected admin dashboard
  - `app/components/`: page sections and client components
- `lib/`: database pool, SQL queries, GitHub fetcher, admin session helpers
- `public/`: static assets served as-is
- `tests/`: lightweight repository regression tests

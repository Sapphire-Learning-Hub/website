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

复制 `.env.example` 为 `.env.local` 并填写。所有变量都可缺省：缺少数据库时前台自动降级（表单提示暂未开放、公告与访问计数隐藏），`dev` / `build` 不受影响。

| 变量 | 必需性 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 动态功能需要 | MySQL 连接串，如 `mysql://sapphire_app:密码@localhost:3306/sapphire_hub`。首次连接自动建表。 |
| `SESSION_SECRET` | 管理后台需要 | 会话签名密钥，用 `openssl rand -hex 32` 生成。未设置时后台与管理 API 均返回 404。 |
| `GITHUB_TOKEN` | 可选 | 提升 GitHub API 限额。未设置时使用匿名额度（60 次/时，配合定时同步已足够）。 |
| `REPO_SYNC_INTERVAL_MINUTES` | 可选 | 仓库列表自动同步间隔（分钟，最小 5，默认 60）。 |

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

管理员账号以 scrypt 哈希形式存储在数据库中。首次访问 `/admin`（数据库中还没有管理员时）登录页会自动变为「创建管理员」表单，交互式完成初始化，无需脚本。

忘记密码或需要新增/重置账号时，可用脚本（不传密码则自动生成随机密码并打印）：

```bash
bun run create-admin <username>
```

访问 `/admin` 使用用户名和密码登录，可以：

- 查看访问统计概览
- 查看、筛选、处理、删除加入申请
- 新建、编辑、发布/下线、删除社区公告
- 管理 GitHub 仓库列表：服务启动后按 `REPO_SYNC_INTERVAL_MINUTES` 自动同步，可手动「立即同步」；支持覆盖展示名称/简介、控制是否展示与排序（覆盖在同步后保留）。同步不会删除记录：无法对应到 GitHub 的仓库会标记为失联并在后台提示，可选择移除记录，或将其覆盖信息绑定到改名后的新仓库

## Project Structure

- `app/`: Next.js App Router pages and global styles
  - `app/api/`: public and admin API route handlers
  - `app/admin/`: password-protected admin dashboard
  - `app/components/`: page sections and client components
- `lib/`: database pool, SQL queries, GitHub fetcher, admin session helpers
- `public/`: static assets served as-is
- `tests/`: lightweight repository regression tests

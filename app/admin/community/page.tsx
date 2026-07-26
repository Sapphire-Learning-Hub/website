import Image from "next/image";
import { avatarUrl } from "@/app/components/CommunitySection";
import { ArrowUpRight } from "@/app/components/icons";
import { isDbConfigured } from "@/lib/db";
import {
  getRecentEvents,
  listContributors,
  type ContributorRow,
  type EventRow,
} from "@/lib/queries";
import { repoSyncIntervalMinutes } from "@/lib/repo-sync";
import AdminNav from "../AdminNav";
import { requireAdmin } from "../require-admin";
import ContributorActions from "./ContributorActions";

export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireAdmin();
  let contributors: ContributorRow[] = [];
  let events: EventRow[] = [];
  if (isDbConfigured) {
    [contributors, events] = await Promise.all([
      listContributors(),
      getRecentEvents(20),
    ]);
  }

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <h1 className="admin-title">社区数据</h1>
        <p className="admin-note">
          贡献者与 GitHub 动态每 {repoSyncIntervalMinutes()} 分钟随仓库一起同步（仓库页可手动触发）。
          隐藏的贡献者不会出现在首页头像墙与统计中。
        </p>

        {contributors.length === 0 ? (
          <p className="admin-empty">
            暂无贡献者数据，请先在「仓库」页执行同步。
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>贡献者</th>
                  <th>贡献数</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((contributor) => (
                  <tr key={contributor.id}>
                    <td>
                      <a
                        className="admin-contributor"
                        href={contributor.html_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Image
                          src={avatarUrl(contributor.avatar_url, 56)}
                          alt=""
                          width={28}
                          height={28}
                          unoptimized
                        />
                        {contributor.login} <ArrowUpRight />
                      </a>
                    </td>
                    <td>{contributor.contributions}</td>
                    <td>
                      <span
                        className={`admin-badge ${contributor.hidden ? "pending" : "processed"}`}
                      >
                        {contributor.hidden ? "已隐藏" : "展示中"}
                      </span>
                    </td>
                    <td>
                      <ContributorActions
                        id={contributor.id}
                        hidden={Boolean(contributor.hidden)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="admin-subtitle">最近动态（同步自 GitHub）</h2>
        {events.length === 0 ? (
          <p className="admin-empty">暂无动态记录。</p>
        ) : (
          <ul className="admin-event-list">
            {events.map((event) => (
              <li key={event.id}>
                <span className="admin-event-time">{event.occurred_at}</span>
                <span>
                  <b>{event.actor_login}</b> · {event.type.replace("Event", "")}{" "}
                  · {event.repo_name}
                  {event.detail ? ` · ${event.detail}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

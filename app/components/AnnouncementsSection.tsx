import type { Announcement, EventRow } from "@/lib/queries";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function formatShortDate(value: string): string {
  const date = new Date(value.replace(" ", "T") + "Z");
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function describeEvent(event: EventRow): string {
  const repo = event.repo_name.split("/")[1] ?? event.repo_name;
  switch (event.type) {
    case "PushEvent":
      return `推送了 ${repo}${event.detail ? ` (${event.detail})` : ""}`;
    case "PullRequestEvent":
      return `在 ${repo} ${event.detail?.startsWith("closed") ? "关闭了 PR" : "发起了 PR"}`;
    case "IssuesEvent":
      return `在 ${repo} ${event.detail?.startsWith("closed") ? "关闭了 issue" : "提出了 issue"}`;
    case "IssueCommentEvent":
      return `评论了 ${repo} 的 issue`;
    case "CreateEvent":
      return `在 ${repo} 创建了${event.detail?.startsWith("branch") ? "分支" : event.detail?.startsWith("tag") ? "标签" : "仓库"}`;
    case "ForkEvent":
      return `Fork 了 ${repo}`;
    case "WatchEvent":
      return `Star 了 ${repo}`;
    case "ReleaseEvent":
      return `在 ${repo} 发布了版本`;
    case "MemberEvent":
      return `加入了 ${repo}`;
    case "PublicEvent":
      return `公开了 ${repo}`;
    default:
      return `更新了 ${repo}`;
  }
}

export default function AnnouncementsSection({
  items,
  events,
}: {
  items: Announcement[];
  events: EventRow[];
}) {
  if (items.length === 0 && events.length === 0) return null;
  return (
    <section className="announcements section-shell" id="news">
      <div className="section-heading">
        <div>
          <p className="kicker"><span /> LATEST UPDATES</p>
          <h2>社区动态</h2>
        </div>
        <p>近期的公告、项目进展与 GitHub 上的真实活动，都会在这里同步。</p>
      </div>

      <div className="news-grid">
        {items.length > 0 ? (
          <ul className="announcement-list">
            {items.map((item) => (
              <li className="announcement-item" key={item.id}>
                <span className="announcement-date">{formatDate(item.created_at)}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {events.length > 0 ? (
          <div className="activity">
            <p className="activity-title">GITHUB ACTIVITY</p>
            <ul className="activity-list">
              {events.map((event) => (
                <li key={event.id}>
                  <span className="activity-date">
                    {formatShortDate(event.occurred_at)}
                  </span>
                  <span className="activity-body">
                    <b>{event.actor_login}</b> {describeEvent(event)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

import type { Announcement } from "@/lib/queries";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default function AnnouncementsSection({
  items,
}: {
  items: Announcement[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="announcements section-shell" id="news">
      <div className="section-heading">
        <div>
          <p className="kicker"><span /> LATEST UPDATES</p>
          <h2>社区动态</h2>
        </div>
        <p>近期的活动、项目进展与社区通知，都会在这里同步。</p>
      </div>
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
    </section>
  );
}

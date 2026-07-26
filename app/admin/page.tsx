import { isDbConfigured } from "@/lib/db";
import {
  countPendingJoins,
  getVisitStats,
  listAnnouncements,
} from "@/lib/queries";
import AdminNav from "./AdminNav";
import { requireAdmin } from "./require-admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();

  let stats = { total: null as number | null, today: null as number | null };
  let pendingJoins: number | null = null;
  let announcementCount: number | null = null;
  if (isDbConfigured) {
    const [visits, pending, announcements] = await Promise.all([
      getVisitStats(),
      countPendingJoins(),
      listAnnouncements(),
    ]);
    stats = visits;
    pendingJoins = pending;
    announcementCount = announcements.length;
  }

  const cards = [
    ["总访问", stats.total],
    ["今日访问", stats.today],
    ["待处理申请", pendingJoins],
    ["公告数", announcementCount],
  ] as const;

  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <h1 className="admin-title">概览</h1>
        {!isDbConfigured ? (
          <p className="admin-empty">
            未配置 DATABASE_URL，数据功能不可用。
          </p>
        ) : null}
        <div className="admin-stats">
          {cards.map(([label, value]) => (
            <div key={label}>
              <b>{value ?? "—"}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

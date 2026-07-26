import type { Metadata } from "next";
import AnnouncementsSection from "../components/AnnouncementsSection";
import CommunitySection from "../components/CommunitySection";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import {
  getCommunityStats,
  getPublishedAnnouncements,
  getRecentEvents,
  getVisibleContributors,
  getVisitStats,
} from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "社区｜Sapphire Learning Hub",
  description:
    "Sapphire Learning Hub 的贡献者、社区公告与 GitHub 实时动态。",
};

export default async function CommunityPage() {
  const [contributors, stats, announcements, events, visits] =
    await Promise.all([
      getVisibleContributors().catch(() => []),
      getCommunityStats().catch(() => null),
      getPublishedAnnouncements().catch(() => []),
      getRecentEvents(10).catch(() => []),
      getVisitStats().catch(() => ({ total: null, today: null })),
    ]);

  const isEmpty =
    contributors.length === 0 &&
    announcements.length === 0 &&
    events.length === 0;

  return (
    <main>
      <SiteHeader />

      <section className="page-hero grid-paper">
        <p className="kicker"><span /> PEOPLE & UPDATES</p>
        <h1>社区</h1>
        <p className="page-hero-description">
          谁在这里写代码、最近发生了什么——社区的心跳都在这一页。
        </p>
      </section>

      {isEmpty ? (
        <section className="section-shell">
          <p className="admin-empty">
            暂无社区数据。首次同步完成后，贡献者与动态会自动出现在这里。
          </p>
        </section>
      ) : (
        <>
          <CommunitySection contributors={contributors} stats={stats} />
          <AnnouncementsSection items={announcements} events={events} />
        </>
      )}

      <SiteFooter visitTotal={visits.total} />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import ProjectsSection from "../components/ProjectsSection";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { ArrowDownRight } from "../components/icons";
import { getVisibleRepos, getVisitStats } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "项目｜Sapphire Learning Hub",
  description: "Sapphire Learning Hub 组织正在进行中的实践项目列表。",
};

export default async function ProjectsPage() {
  const [repos, visits] = await Promise.all([
    getVisibleRepos(24).catch(() => []),
    getVisitStats().catch(() => ({ total: null, today: null })),
  ]);

  return (
    <main>
      <SiteHeader />

      <section className="page-hero grid-paper">
        <p className="kicker"><span /> SELECTED PRACTICE</p>
        <h1>实践项目</h1>
        <p className="page-hero-description">
          这些仓库都在真实迭代中。挑一个感兴趣的开始阅读、提问、提交你的第一个 PR。
        </p>
      </section>

      <ProjectsSection repos={repos} showHeading={false} />

      <section className="join-cta section-shell">
        <div>
          <p className="kicker"><span /> READY TO BUILD</p>
          <h2>准备好动手了？</h2>
          <p>告诉我们你的方向，我们帮你找到合适的切入点。</p>
        </div>
        <Link className="button button-primary" href="/#join">
          提交加入申请 <ArrowDownRight />
        </Link>
      </section>

      <SiteFooter visitTotal={visits.total} />
    </main>
  );
}

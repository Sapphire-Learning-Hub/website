import JoinForm from "./components/JoinForm";
import ProjectsSection from "./components/ProjectsSection";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  GitFork,
} from "./components/icons";
import { getVisibleRepos, getVisitStats } from "@/lib/queries";

export const revalidate = 300;

const githubUrl = "https://github.com/Sapphire-Learning-Hub";

const steps = [
  ["01", "选择项目", "从与你当前能力匹配的任务开始，读懂目标与项目结构。"],
  ["02", "独立实现", "查阅文档、拆分问题，在真实约束中完成可以运行的功能。"],
  ["03", "协作交付", "提交 Pull Request，参与讨论与 Code Review，让成果持续改进。"],
];

export default async function Home() {
  const [repos, visits] = await Promise.all([
    getVisibleRepos(3).catch(() => []),
    getVisitStats().catch(() => ({ total: null, today: null })),
  ]);

  return (
    <main>
      <SiteHeader />

      <section className="hero grid-paper" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> SOFTWARE · PRACTICE · COMMUNITY</p>
          <h1>让每一次练习，<br />都成为真正的作品</h1>
          <p className="hero-description">
            一个由软件开发学习者共同维护的实践社区，<br className="desktop-break" />
            在真实项目中学习协作、工程化与开源。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="/projects">探索项目 <ArrowDownRight /></a>
            <a className="button button-secondary" href="#join">加入我们 <ArrowUpRight /></a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-caption">BUILD / LEARN / SHARE</div>
          <div className="code-window">
            <div className="window-bar"><i /><i /><i /><span>practice.ts</span></div>
            <div className="code-line long" /><div className="code-line mid" />
            <div className="code-line short" /><div className="code-line mid indent" />
            <div className="code-line short indent" />
            <div className="cursor">_</div>
          </div>
          <div className="orbit orbit-one"><i /></div>
          <div className="orbit orbit-two"><i /></div>
          <div className="diagram-node node-code">{`{ }`}</div>
          <div className="diagram-node node-git"><GitFork size="26" /></div>
          <div className="diagram-node node-done"><Check size="24" /></div>
          <span className="visual-note">CODE IS<br />OUR COMMON<br />LANGUAGE</span>
        </div>
      </section>

      <ProjectsSection repos={repos} viewAllHref="/projects" />

      <section className="learning-path section-shell" id="path">
        <div className="path-intro">
          <p className="kicker"><span /> HOW WE LEARN</p>
          <h2>把学习放进<br />真实的协作里</h2>
          <p>能力不是在教程结束时突然出现的。它来自一次次理解、实现、反馈和重构。</p>
        </div>
        <ol className="steps">
          {steps.map(([index, title, description]) => (
            <li key={index}>
              <span className="step-index">{index}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              <span className="step-arrow" aria-hidden="true"><ArrowDownRight /></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about section-shell" id="about">
        <div className="about-copy">
          <p className="kicker"><span /> SAPPHIRE LEARNING HUB</p>
          <h2>为学习者提供一块<br />可以共同打磨作品的地方。</h2>
          <p>我们根据成员当前的学习进度，设计和维护不同规模的实践项目。部分项目独立完成，部分项目多人协作；每个人都可以从合适的任务开始，逐步参与更复杂的工作。</p>
          <a className="text-link" href={githubUrl} target="_blank" rel="noreferrer">访问 GitHub 组织 <ArrowUpRight /></a>
        </div>
        <div className="principles" aria-label="社区原则">
          <div><b>OPEN</b><span>开放交流</span></div>
          <div><b>BUILD</b><span>实践优先</span></div>
          <div><b>GROW</b><span>共同成长</span></div>
        </div>
      </section>

      <section className="join section-shell" id="join">
        <div className="section-heading">
          <div>
            <p className="kicker"><span /> JOIN THE HUB</p>
            <h2>和我们一起写点<br />真正会被用到的东西</h2>
          </div>
          <p>留下你的联系方式，介绍一下自己。我们会尽快联系你，帮你找到合适的起点。</p>
        </div>
        <JoinForm />
      </section>

      <SiteFooter visitTotal={visits.total} />
    </main>
  );
}

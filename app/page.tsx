const githubUrl = "https://github.com/Sapphire-Learning-Hub";

const projects = [
  {
    index: "01",
    eyebrow: "FRONTEND",
    title: "前端页面与交互",
    description: "从页面实现到组件封装，在可运行的产品中掌握现代前端工程。",
    tone: "dark",
    art: "terminal",
  },
  {
    index: "02",
    eyebrow: "FULL STACK",
    title: "前后端协作开发",
    description: "围绕真实接口、数据流与业务边界，练习完整的软件交付过程。",
    tone: "paper",
    art: "flow",
  },
  {
    index: "03",
    eyebrow: "OPEN SOURCE",
    title: "开源协作工作流",
    description: "通过 Issue、Pull Request 与 Code Review，把协作变成日常习惯。",
    tone: "blue",
    art: "branch",
  },
];

const steps = [
  ["01", "选择项目", "从与你当前能力匹配的任务开始，读懂目标与项目结构。"],
  ["02", "独立实现", "查阅文档、拆分问题，在真实约束中完成可以运行的功能。"],
  ["03", "协作交付", "提交 Pull Request，参与讨论与 Code Review，让成果持续改进。"],
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
    </span>
  );
}

function ProjectArt({ type }: { type: string }) {
  if (type === "terminal") {
    return (
      <div className="terminal-art" aria-hidden="true">
        <i>&gt;_</i><span /><span /><span />
      </div>
    );
  }
  if (type === "flow") {
    return (
      <div className="flow-art" aria-hidden="true">
        <i /><i /><i /><b /><b />
      </div>
    );
  }
  return (
    <div className="branch-art" aria-hidden="true">
      <i /><i /><i /><span /><span />
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回首页">
          <BrandMark />
          <span>Sapphire Learning Hub</span>
        </a>
        <span className="header-index" aria-hidden="true">01</span>
        <nav aria-label="主导航">
          <a href="#projects">项目</a>
          <a href="#path">学习路径</a>
          <a href="#about">关于我们</a>
        </nav>
      </header>

      <section className="hero grid-paper" id="top">
        <div className="rail-label" aria-hidden="true">
          <span>01</span>
          <i />
          <small>HERO_TITLE<br />{"// GRID 12 COL"}</small>
        </div>

        <div className="hero-copy">
          <p className="kicker"><span /> SOFTWARE · PRACTICE · COMMUNITY</p>
          <h1>让每一次练习，<br />都成为真正的作品</h1>
          <p className="hero-description">
            一个由软件开发学习者共同维护的实践社区，<br className="desktop-break" />
            在真实项目中学习协作、工程化与开源。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projects">探索项目 <span>↘</span></a>
            <a className="button button-secondary" href={githubUrl} target="_blank" rel="noreferrer">加入我们 <span>↗</span></a>
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
          <div className="diagram-node node-git">⑂</div>
          <div className="diagram-node node-done">✓</div>
          <span className="visual-note">CODE IS<br />OUR COMMON<br />LANGUAGE</span>
        </div>
      </section>

      <section className="projects section-shell" id="projects">
        <div className="section-heading">
          <div>
            <p className="kicker"><span /> SELECTED PRACTICE</p>
            <h2>从真实项目开始</h2>
          </div>
          <p>不止完成一道练习，而是经历从理解需求、实现功能到协作交付的全过程。</p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <a
              className={`project-card ${project.tone}`}
              href={`${githubUrl}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              key={project.index}
            >
              <div className="card-meta"><span>{project.eyebrow}</span><span>{project.index}</span></div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <ProjectArt type={project.art} />
              <span className="card-link">查看组织项目 ↗</span>
            </a>
          ))}
        </div>
      </section>

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
              <span className="step-arrow" aria-hidden="true">↘</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about section-shell" id="about">
        <div className="about-label"><span>03</span><small>ABOUT<br />THE HUB</small></div>
        <div className="about-copy">
          <p className="kicker"><span /> SAPPHIRE LEARNING HUB</p>
          <h2>为学习者提供一块<br />可以共同打磨作品的地方。</h2>
          <p>我们根据成员当前的学习进度，设计和维护不同规模的实践项目。部分项目独立完成，部分项目多人协作；每个人都可以从合适的任务开始，逐步参与更复杂的工作。</p>
          <a className="text-link" href={githubUrl} target="_blank" rel="noreferrer">访问 GitHub 组织 <span>↗</span></a>
        </div>
        <div className="principles" aria-label="社区原则">
          <div><b>OPEN</b><span>开放交流</span></div>
          <div><b>BUILD</b><span>实践优先</span></div>
          <div><b>GROW</b><span>共同成长</span></div>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><BrandMark /><span>Sapphire Learning Hub</span></div>
        <p>Make practice visible. Make progress real.</p>
        <a href={githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
      </footer>
    </main>
  );
}

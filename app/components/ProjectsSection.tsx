import type { PublicRepo } from "@/lib/queries";
import { ArrowUpRight, Star } from "./icons";

const githubUrl = "https://github.com/Sapphire-Learning-Hub";

const fallbackProjects = [
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

const tones = ["dark", "paper", "blue"] as const;
const arts = ["terminal", "flow", "branch"] as const;

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

export default function ProjectsSection({ repos }: { repos: PublicRepo[] }) {
  return (
    <section className="projects section-shell" id="projects">
      <div className="section-heading">
        <div>
          <p className="kicker"><span /> SELECTED PRACTICE</p>
          <h2>从真实项目开始</h2>
        </div>
        <p>不止完成一道练习，而是经历从理解需求、实现功能到协作交付的全过程。</p>
      </div>

      <div className="project-grid">
        {repos.length > 0
          ? repos.map((repo, index) => (
              <a
                className={`project-card ${tones[index % 3]}`}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                key={repo.name}
              >
                <div className="card-meta">
                  <span>{repo.language ?? "PROJECT"}</span>
                  <span className="card-stars"><Star /> {repo.stargazers_count}</span>
                </div>
                <h3>{repo.name}</h3>
                <p>{repo.description ?? "这个项目还没有描述，点开看看它在做什么。"}</p>
                <ProjectArt type={arts[index % 3]} />
                <span className="card-link">查看仓库 <ArrowUpRight /></span>
              </a>
            ))
          : fallbackProjects.map((project) => (
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
                <span className="card-link">查看组织项目 <ArrowUpRight /></span>
              </a>
            ))}
      </div>
    </section>
  );
}

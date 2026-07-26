import Image from "next/image";
import type { CommunityStats, ContributorRow } from "@/lib/queries";

/** GitHub's avatar CDN resizes natively via ?s=, so we skip the optimizer. */
export function avatarUrl(base: string, size: number): string {
  return `${base}${base.includes("?") ? "&" : "?"}s=${size}`;
}

export default function CommunitySection({
  contributors,
  stats,
}: {
  contributors: ContributorRow[];
  stats: CommunityStats | null;
}) {
  if (contributors.length === 0) return null;

  const numbers = [
    ["CONTRIBUTORS", stats?.contributors ?? contributors.length, "位贡献者"],
    ["COMMITS", stats?.contributions ?? 0, "次代码贡献"],
    ["PROJECTS", stats?.repos ?? 0, "个进行中项目"],
    ["STARS", stats?.stars ?? 0, "个 Star"],
  ] as const;

  return (
    <section className="community section-shell" id="community">
      <div className="section-heading">
        <div>
          <p className="kicker"><span /> PEOPLE BEHIND THE HUB</p>
          <h2>社区由这些人构成</h2>
        </div>
        <p>每一个头像背后，都是一次真实的提交、评审与讨论。</p>
      </div>

      <div className="community-stats" aria-label="社区数据">
        {numbers.map(([label, value, caption]) => (
          <div key={label}>
            <span className="community-stat-label">{label}</span>
            <b>{value}</b>
            <span className="community-stat-caption">{caption}</span>
          </div>
        ))}
      </div>

      <ul className="community-wall" aria-label="贡献者">
        {contributors.map((contributor) => (
          <li key={contributor.id}>
            <a
              href={contributor.html_url}
              target="_blank"
              rel="noreferrer"
              title={`${contributor.login} · ${contributor.contributions} contributions`}
            >
              <Image
                src={avatarUrl(contributor.avatar_url, 104)}
                alt={contributor.login}
                width={52}
                height={52}
                loading="lazy"
                unoptimized
              />
              <span>{contributor.login}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

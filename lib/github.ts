export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
};

const ORG_REPOS_URL =
  "https://api.github.com/orgs/Sapphire-Learning-Hub/repos?sort=updated&per_page=9&type=public";

export async function fetchOrgRepos(): Promise<Repo[] | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const response = await fetch(ORG_REPOS_URL, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return null;
    const repos = data
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
      .map((item) => ({
        name: String(item.name ?? ""),
        description:
          typeof item.description === "string" ? item.description : null,
        html_url: String(item.html_url ?? ""),
        stargazers_count: Number(item.stargazers_count ?? 0),
        language: typeof item.language === "string" ? item.language : null,
      }))
      .filter((repo) => repo.name && repo.html_url);
    return repos.length > 0 ? repos : null;
  } catch {
    return null;
  }
}

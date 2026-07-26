const ORG = "Sapphire-Learning-Hub";
const API_BASE = "https://api.github.com";

export type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
};

export type GithubContributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export type GithubEvent = {
  github_id: string;
  type: string;
  actor_login: string;
  actor_avatar: string;
  repo_name: string;
  detail: string | null;
  occurred_at: string;
};

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubGet(path: string): Promise<unknown[] | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: githubHeaders(),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function asRecord(item: unknown): Record<string, unknown> | null {
  return typeof item === "object" && item !== null
    ? (item as Record<string, unknown>)
    : null;
}

/** Fetches the org repo list from the GitHub API. Returns null on any failure. */
export async function fetchOrgRepos(): Promise<GithubRepo[] | null> {
  const data = await githubGet(
    `/orgs/${ORG}/repos?sort=updated&per_page=50&type=public`,
  );
  if (!data) return null;
  return data
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item !== null)
    .map((item) => ({
      name: String(item.name ?? ""),
      description:
        typeof item.description === "string" ? item.description : null,
      html_url: String(item.html_url ?? ""),
      stargazers_count: Number(item.stargazers_count ?? 0),
      language: typeof item.language === "string" ? item.language : null,
      fork: Boolean(item.fork),
    }))
    .filter((repo) => repo.name && repo.html_url);
}

/** Fetches contributors of one repo. Returns null on failure (204 no-content → []). */
export async function fetchRepoContributors(
  repoName: string,
): Promise<GithubContributor[] | null> {
  const data = await githubGet(
    `/repos/${ORG}/${encodeURIComponent(repoName)}/contributors?per_page=50`,
  );
  if (!data) return null;
  return data
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item !== null)
    .map((item) => ({
      login: String(item.login ?? ""),
      avatar_url: String(item.avatar_url ?? ""),
      html_url: String(item.html_url ?? ""),
      contributions: Number(item.contributions ?? 0),
    }))
    .filter((contributor) => contributor.login && contributor.avatar_url);
}

function eventDetail(
  type: string,
  payload: Record<string, unknown>,
): string | null {
  switch (type) {
    case "PushEvent": {
      const ref = String(payload.ref ?? "");
      return ref.replace("refs/heads/", "") || null;
    }
    case "PullRequestEvent": {
      const pr = asRecord(payload.pull_request);
      const title = pr && typeof pr.title === "string" ? pr.title : "";
      const action = String(payload.action ?? "");
      return title ? `${action}: ${title}`.slice(0, 250) : action || null;
    }
    case "IssuesEvent": {
      const issue = asRecord(payload.issue);
      const title = issue && typeof issue.title === "string" ? issue.title : "";
      const action = String(payload.action ?? "");
      return title ? `${action}: ${title}`.slice(0, 250) : action || null;
    }
    case "IssueCommentEvent": {
      const issue = asRecord(payload.issue);
      const title = issue && typeof issue.title === "string" ? issue.title : "";
      return title.slice(0, 250) || null;
    }
    case "CreateEvent": {
      const refType = String(payload.ref_type ?? "");
      const ref = payload.ref ? String(payload.ref) : "";
      return [refType, ref].filter(Boolean).join(" ") || null;
    }
    case "ForkEvent": {
      const forkee = asRecord(payload.forkee);
      return forkee && typeof forkee.full_name === "string"
        ? forkee.full_name
        : null;
    }
    default:
      return null;
  }
}

const KNOWN_EVENT_TYPES = new Set([
  "PushEvent",
  "PullRequestEvent",
  "IssuesEvent",
  "IssueCommentEvent",
  "CreateEvent",
  "ForkEvent",
  "WatchEvent",
  "ReleaseEvent",
  "MemberEvent",
  "PublicEvent",
]);

/** Fetches recent public org activity. Returns null on failure. */
export async function fetchOrgEvents(): Promise<GithubEvent[] | null> {
  const data = await githubGet(`/orgs/${ORG}/events?per_page=30`);
  if (!data) return null;
  return data
    .map(asRecord)
    .filter((item): item is Record<string, unknown> => item !== null)
    .map((item) => {
      const actor = asRecord(item.actor);
      const repo = asRecord(item.repo);
      const payload = asRecord(item.payload) ?? {};
      const type = String(item.type ?? "");
      const occurredAt = String(item.created_at ?? "");
      return {
        github_id: String(item.id ?? ""),
        type,
        actor_login: actor && typeof actor.login === "string" ? actor.login : "",
        actor_avatar:
          actor && typeof actor.avatar_url === "string" ? actor.avatar_url : "",
        repo_name: repo && typeof repo.name === "string" ? repo.name : "",
        detail: eventDetail(type, payload),
        occurred_at: occurredAt.replace("T", " ").replace("Z", ""),
      };
    })
    .filter(
      (event) =>
        event.github_id &&
        event.actor_login &&
        event.repo_name &&
        event.occurred_at &&
        KNOWN_EVENT_TYPES.has(event.type),
    );
}

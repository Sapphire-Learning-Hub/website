import { isDbConfigured } from "./db";
import {
  fetchOrgEvents,
  fetchOrgRepos,
  fetchRepoContributors,
  type GithubContributor,
} from "./github";
import {
  deleteContributorsNotIn,
  insertEvents,
  markReposMissingNotIn,
  pruneEventsKeep,
  upsertContributor,
  upsertFetchedRepo,
} from "./queries";

export type SyncResult =
  | {
      ok: true;
      count: number;
      missing: number;
      contributors: number | null;
      events: number | null;
      at: string;
    }
  | { ok: false; error: string };

const EVENTS_KEPT = 50;

type SyncGlobal = typeof globalThis & {
  __sapphireRepoSync?: {
    running: Promise<SyncResult> | null;
    last: SyncResult | null;
    timer: ReturnType<typeof setInterval> | null;
  };
};

function syncState() {
  const store = (globalThis as SyncGlobal);
  store.__sapphireRepoSync ??= { running: null, last: null, timer: null };
  return store.__sapphireRepoSync;
}

async function doSync(): Promise<SyncResult> {
  if (!isDbConfigured) {
    return { ok: false, error: "未配置 DATABASE_URL" };
  }
  const repos = await fetchOrgRepos();
  if (repos === null) {
    return { ok: false, error: "GitHub API 请求失败（限额或网络问题）" };
  }
  for (const repo of repos) {
    await upsertFetchedRepo(repo);
  }
  // Rows absent from GitHub are flagged, never deleted — the admin decides
  // whether to remove them or re-bind their overrides to a renamed repo.
  const missing = await markReposMissingNotIn(repos.map((repo) => repo.name));

  // Contributors: aggregate across the org's own (non-fork) repos so upstream
  // contributor lists of forked projects don't flood the wall.
  let contributorCount: number | null = null;
  try {
    const byLogin = new Map<string, GithubContributor>();
    let anyFailed = false;
    for (const repo of repos.filter((r) => !r.fork)) {
      const contributors = await fetchRepoContributors(repo.name);
      if (contributors === null) {
        anyFailed = true;
        continue;
      }
      for (const contributor of contributors) {
        const existing = byLogin.get(contributor.login);
        if (existing) {
          existing.contributions += contributor.contributions;
        } else {
          byLogin.set(contributor.login, { ...contributor });
        }
      }
    }
    for (const contributor of byLogin.values()) {
      await upsertContributor(contributor);
    }
    // Only prune when every repo answered — a partial sweep would wrongly
    // drop contributors whose repo request failed.
    if (!anyFailed) {
      await deleteContributorsNotIn([...byLogin.keys()]);
    }
    contributorCount = byLogin.size;
  } catch (error) {
    console.error("[repo-sync] contributors", error);
  }

  let eventCount: number | null = null;
  try {
    const events = await fetchOrgEvents();
    if (events !== null) {
      await insertEvents(events);
      await pruneEventsKeep(EVENTS_KEPT);
      eventCount = events.length;
    }
  } catch (error) {
    console.error("[repo-sync] events", error);
  }

  return {
    ok: true,
    count: repos.length,
    missing,
    contributors: contributorCount,
    events: eventCount,
    at: new Date().toISOString(),
  };
}

/** Runs a sync, deduplicating concurrent callers onto one in-flight run. */
export async function syncRepos(): Promise<SyncResult> {
  const state = syncState();
  if (state.running) return state.running;
  state.running = doSync()
    .catch((error): SyncResult => {
      console.error("[repo-sync]", error);
      return { ok: false, error: "同步失败，请查看服务端日志。" };
    })
    .then((result) => {
      state.last = result;
      state.running = null;
      return result;
    });
  return state.running;
}

export function lastSyncResult(): SyncResult | null {
  return syncState().last;
}

const DEFAULT_INTERVAL_MINUTES = 60;

export function repoSyncIntervalMinutes(): number {
  const value = Number(process.env.REPO_SYNC_INTERVAL_MINUTES);
  return Number.isFinite(value) && value >= 5
    ? value
    : DEFAULT_INTERVAL_MINUTES;
}

/** Starts the periodic sync loop once per process. Safe to call repeatedly. */
export function startRepoSyncSchedule(): void {
  const state = syncState();
  if (state.timer || !isDbConfigured) return;
  const intervalMs = repoSyncIntervalMinutes() * 60 * 1000;
  state.timer = setInterval(() => {
    void syncRepos();
  }, intervalMs);
  // Don't keep the process alive just for the timer.
  state.timer.unref?.();
  void syncRepos();
}

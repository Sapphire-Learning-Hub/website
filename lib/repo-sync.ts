import { isDbConfigured } from "./db";
import { fetchOrgRepos } from "./github";
import { markReposMissingNotIn, upsertFetchedRepo } from "./queries";

export type SyncResult =
  | { ok: true; count: number; missing: number; at: string }
  | { ok: false; error: string };

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
  return { ok: true, count: repos.length, missing, at: new Date().toISOString() };
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

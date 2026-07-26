export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startRepoSyncSchedule } = await import("./lib/repo-sync");
    startRepoSyncSchedule();
  }
}

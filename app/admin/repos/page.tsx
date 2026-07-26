import { isDbConfigured } from "@/lib/db";
import { listRepos, type RepoRow } from "@/lib/queries";
import { repoSyncIntervalMinutes } from "@/lib/repo-sync";
import AdminNav from "../AdminNav";
import { requireAdmin } from "../require-admin";
import RepoManager from "./RepoManager";

export const dynamic = "force-dynamic";

export default async function AdminReposPage() {
  await requireAdmin();
  let items: RepoRow[] = [];
  if (isDbConfigured) {
    items = await listRepos();
  }
  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <RepoManager
          items={items}
          intervalMinutes={repoSyncIntervalMinutes()}
        />
      </main>
    </>
  );
}

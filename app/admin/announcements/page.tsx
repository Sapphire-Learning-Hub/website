import { isDbConfigured } from "@/lib/db";
import { listAnnouncements, type Announcement } from "@/lib/queries";
import AdminNav from "../AdminNav";
import { requireAdmin } from "../require-admin";
import AnnouncementManager from "./AnnouncementManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  let items: Announcement[] = [];
  if (isDbConfigured) {
    items = await listAnnouncements();
  }
  return (
    <>
      <AdminNav />
      <main className="admin-main">
        <AnnouncementManager items={items} />
      </main>
    </>
  );
}

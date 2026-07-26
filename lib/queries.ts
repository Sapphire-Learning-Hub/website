import { query, queryOr } from "./db";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  published: number;
  created_at: string;
  updated_at: string;
};

export type JoinRequest = {
  id: number;
  name: string;
  contact: string;
  message: string | null;
  ip: string;
  status: "pending" | "processed";
  created_at: string;
};

export type VisitStats = {
  total: number | null;
  today: number | null;
};

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const rows = await queryOr<Announcement, Announcement[]>(
    [],
    "SELECT id, title, body, published, created_at, updated_at FROM announcements WHERE published = 1 ORDER BY created_at DESC LIMIT 20",
  );
  return rows;
}

export async function listAnnouncements(): Promise<Announcement[]> {
  return query<Announcement>(
    "SELECT id, title, body, published, created_at, updated_at FROM announcements ORDER BY created_at DESC",
  );
}

export async function createAnnouncement(
  title: string,
  body: string,
  published: boolean,
): Promise<void> {
  await query(
    "INSERT INTO announcements (title, body, published) VALUES (?, ?, ?)",
    [title, body, published ? 1 : 0],
  );
}

export async function updateAnnouncement(
  id: number,
  fields: { title?: string; body?: string; published?: boolean },
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.title !== undefined) {
    sets.push("title = ?");
    params.push(fields.title);
  }
  if (fields.body !== undefined) {
    sets.push("body = ?");
    params.push(fields.body);
  }
  if (fields.published !== undefined) {
    sets.push("published = ?");
    params.push(fields.published ? 1 : 0);
  }
  if (sets.length === 0) return;
  params.push(id);
  await query(`UPDATE announcements SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await query("DELETE FROM announcements WHERE id = ?", [id]);
}

export async function insertJoinRequest(
  name: string,
  contact: string,
  message: string | null,
  ip: string,
): Promise<void> {
  await query(
    "INSERT INTO join_requests (name, contact, message, ip) VALUES (?, ?, ?, ?)",
    [name, contact, message, ip],
  );
}

export async function countRecentJoinsByIp(ip: string): Promise<number> {
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM join_requests WHERE ip = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)",
    [ip],
  );
  return rows[0]?.n ?? 0;
}

export async function listJoinRequests(
  page: number,
  pageSize: number,
  status?: "pending" | "processed",
): Promise<{ items: JoinRequest[]; total: number }> {
  const where = status ? "WHERE status = ?" : "";
  const params = status ? [status] : [];
  const [items, countRows] = await Promise.all([
    query<JoinRequest>(
      `SELECT id, name, contact, message, ip, status, created_at FROM join_requests ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize],
    ),
    query<{ n: number }>(
      `SELECT COUNT(*) AS n FROM join_requests ${where}`,
      params,
    ),
  ]);
  return { items, total: countRows[0]?.n ?? 0 };
}

export async function setJoinStatus(
  id: number,
  status: "pending" | "processed",
): Promise<void> {
  await query("UPDATE join_requests SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteJoinRequest(id: number): Promise<void> {
  await query("DELETE FROM join_requests WHERE id = ?", [id]);
}

export async function incrementVisit(): Promise<void> {
  await query(
    "INSERT INTO visit_stats (day, count) VALUES (CURDATE(), 1) ON DUPLICATE KEY UPDATE count = count + 1",
  );
}

export async function getVisitStats(): Promise<VisitStats> {
  const rows = await queryOr<
    { total: number | null; today: number | null },
    null
  >(
    null,
    "SELECT SUM(count) AS total, SUM(CASE WHEN day = CURDATE() THEN count ELSE 0 END) AS today FROM visit_stats",
  );
  if (rows === null) return { total: null, today: null };
  return {
    total: Number(rows[0]?.total ?? 0),
    today: Number(rows[0]?.today ?? 0),
  };
}

export async function countPendingJoins(): Promise<number> {
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM join_requests WHERE status = 'pending'",
  );
  return rows[0]?.n ?? 0;
}

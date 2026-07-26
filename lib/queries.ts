import { query, queryOr, withTransaction } from "./db";

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

export type RepoRow = {
  id: number;
  github_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  display_name: string | null;
  override_description: string | null;
  visible: number;
  position: number;
  missing: number;
  fetched_at: string;
};

const REPO_COLUMNS =
  "id, github_name, html_url, description, language, stargazers_count, display_name, override_description, visible, position, missing, fetched_at";

/** A repo as the public site renders it (overrides applied). */
export type PublicRepo = {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
};

export async function getVisibleRepos(): Promise<PublicRepo[]> {
  const rows = await queryOr<RepoRow, RepoRow[]>(
    [],
    `SELECT ${REPO_COLUMNS} FROM repos WHERE visible = 1 AND missing = 0 ORDER BY position ASC, stargazers_count DESC, github_name ASC LIMIT 9`,
  );
  return rows.map((row) => ({
    name: row.display_name?.trim() || row.github_name,
    description: row.override_description?.trim() || row.description,
    html_url: row.html_url,
    stargazers_count: row.stargazers_count,
    language: row.language,
  }));
}

export async function listRepos(): Promise<RepoRow[]> {
  return query<RepoRow>(
    `SELECT ${REPO_COLUMNS} FROM repos ORDER BY missing DESC, position ASC, stargazers_count DESC, github_name ASC`,
  );
}

export async function upsertFetchedRepo(repo: {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
}): Promise<void> {
  await query(
    `INSERT INTO repos (github_name, html_url, description, language, stargazers_count, fetched_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       html_url = VALUES(html_url),
       description = VALUES(description),
       language = VALUES(language),
       stargazers_count = VALUES(stargazers_count),
       missing = 0,
       fetched_at = NOW()`,
    [repo.name, repo.html_url, repo.description, repo.language, repo.stargazers_count],
  );
}

/** Flags rows no longer on GitHub as missing (never deletes). Returns how many are flagged. */
export async function markReposMissingNotIn(names: string[]): Promise<number> {
  if (names.length === 0) {
    await query("UPDATE repos SET missing = 1");
  } else {
    const placeholders = names.map(() => "?").join(", ");
    await query(
      `UPDATE repos SET missing = 1 WHERE github_name NOT IN (${placeholders})`,
      names,
    );
  }
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM repos WHERE missing = 1",
  );
  return rows[0]?.n ?? 0;
}

export async function deleteRepo(id: number): Promise<void> {
  await query("DELETE FROM repos WHERE id = ?", [id]);
}

/**
 * Moves a missing repo's overrides (display name, description, visibility,
 * position) onto another live row, then removes the missing row. Used when a
 * repo was renamed on GitHub and the admin re-binds the old record.
 */
export async function rebindRepo(
  missingId: number,
  targetId: number,
): Promise<{ error?: string }> {
  return withTransaction(async (exec) => {
    const sources = (await exec(
      `SELECT ${REPO_COLUMNS} FROM repos WHERE id = ? AND missing = 1 FOR UPDATE`,
      [missingId],
    )) as RepoRow[];
    if (sources.length === 0) return { error: "失联记录不存在或已恢复。" };
    const targets = (await exec(
      `SELECT ${REPO_COLUMNS} FROM repos WHERE id = ? AND missing = 0 FOR UPDATE`,
      [targetId],
    )) as RepoRow[];
    if (targets.length === 0) return { error: "目标仓库不存在或也已失联。" };
    const source = sources[0];
    await exec(
      "UPDATE repos SET display_name = ?, override_description = ?, visible = ?, position = ? WHERE id = ?",
      [
        source.display_name,
        source.override_description,
        source.visible,
        source.position,
        targetId,
      ],
    );
    await exec("DELETE FROM repos WHERE id = ?", [missingId]);
    return {};
  });
}

export async function updateRepoOverrides(
  id: number,
  fields: {
    display_name?: string | null;
    override_description?: string | null;
    visible?: boolean;
    position?: number;
  },
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.display_name !== undefined) {
    sets.push("display_name = ?");
    params.push(fields.display_name);
  }
  if (fields.override_description !== undefined) {
    sets.push("override_description = ?");
    params.push(fields.override_description);
  }
  if (fields.visible !== undefined) {
    sets.push("visible = ?");
    params.push(fields.visible ? 1 : 0);
  }
  if (fields.position !== undefined) {
    sets.push("position = ?");
    params.push(fields.position);
  }
  if (sets.length === 0) return;
  params.push(id);
  await query(`UPDATE repos SET ${sets.join(", ")} WHERE id = ?`, params);
}

export type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
};

export async function getAdminUser(
  username: string,
): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    "SELECT id, username, password_hash FROM admin_users WHERE username = ?",
    [username],
  );
  return rows[0] ?? null;
}

export async function countAdminUsers(): Promise<number> {
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM admin_users",
  );
  return rows[0]?.n ?? 0;
}

export async function upsertAdminUser(
  username: string,
  passwordHash: string,
): Promise<void> {
  await query(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
    [username, passwordHash],
  );
}

/** Creates the first admin atomically; returns false if one already exists. */
export async function createFirstAdminUser(
  username: string,
  passwordHash: string,
): Promise<boolean> {
  const result = (await query(
    "INSERT INTO admin_users (username, password_hash) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM admin_users)",
    [username, passwordHash],
  )) as unknown as { affectedRows?: number };
  return (result.affectedRows ?? 0) > 0;
}

export async function countPendingJoins(): Promise<number> {
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM join_requests WHERE status = 'pending'",
  );
  return rows[0]?.n ?? 0;
}

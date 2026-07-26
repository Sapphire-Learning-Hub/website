import mysql from "mysql2/promise";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS join_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    message TEXT NULL,
    ip VARCHAR(45) NOT NULL,
    status ENUM('pending','processed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_created (ip, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS visit_stats (
    day DATE PRIMARY KEY,
    count INT UNSIGNED NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

export const isDbConfigured = Boolean(process.env.DATABASE_URL);

export class ServiceUnavailableError extends Error {
  constructor() {
    super("Database is not configured");
    this.name = "ServiceUnavailableError";
  }
}

type DbGlobal = typeof globalThis & {
  __sapphirePool?: mysql.Pool;
  __sapphireSchemaReady?: Promise<void>;
  __sapphireWarned?: boolean;
};

const dbGlobal = globalThis as DbGlobal;

function getPool(): mysql.Pool | null {
  if (!isDbConfigured) {
    if (!dbGlobal.__sapphireWarned) {
      dbGlobal.__sapphireWarned = true;
      console.warn(
        "[db] DATABASE_URL is not set; dynamic features are disabled.",
      );
    }
    return null;
  }
  dbGlobal.__sapphirePool ??= mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 5,
    charset: "utf8mb4_unicode_ci",
    dateStrings: true,
  });
  return dbGlobal.__sapphirePool;
}

async function ensureSchema(pool: mysql.Pool): Promise<void> {
  dbGlobal.__sapphireSchemaReady ??= (async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await pool.query(statement);
    }
  })();
  try {
    await dbGlobal.__sapphireSchemaReady;
  } catch (error) {
    dbGlobal.__sapphireSchemaReady = undefined;
    throw error;
  }
}

/** Run a query against the pool, or throw ServiceUnavailableError when no DATABASE_URL is set. */
export async function query<T>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  if (!pool) throw new ServiceUnavailableError();
  await ensureSchema(pool);
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Like query(), but resolves to `fallback` instead of throwing when the DB is not configured. */
export async function queryOr<T, F>(
  fallback: F,
  sql: string,
  params: unknown[] = [],
): Promise<T[] | F> {
  if (!isDbConfigured) return fallback;
  return query<T>(sql, params);
}

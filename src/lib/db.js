import path from 'path';
import fs from 'fs';

let localDbInstance = null;
let tursoClientInstance = null;

function getLocalDbPath() {
  const candidate1 = path.resolve(process.cwd(), '../air_quality.db');
  if (fs.existsSync(candidate1)) return candidate1;
  const candidate2 = path.resolve(process.cwd(), 'air_quality.db');
  if (fs.existsSync(candidate2)) return candidate2;
  return candidate1;
}

/**
 * Universal query runner for both Vercel (Turso LibSQL over HTTP)
 * and Local Development (better-sqlite3).
 */
export async function queryAll(sql, args = []) {
  const safeArgs = Array.isArray(args) ? args : [args];
  if (process.env.TURSO_DATABASE_URL) {
    if (!tursoClientInstance) {
      const { createClient } = await import('@libsql/client');
      tursoClientInstance = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    }
    const res = await tursoClientInstance.execute({ sql, args: safeArgs });
    return res.rows || [];
  } else {
    if (!localDbInstance) {
      const Database = (await import('better-sqlite3')).default;
      const dbPath = getLocalDbPath();
      localDbInstance = new Database(dbPath, { readonly: true });
    }
    return localDbInstance.prepare(sql).all(...safeArgs);
  }
}

export async function queryGet(sql, args = []) {
  const safeArgs = Array.isArray(args) ? args : [args];
  if (process.env.TURSO_DATABASE_URL) {
    if (!tursoClientInstance) {
      const { createClient } = await import('@libsql/client');
      tursoClientInstance = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    }
    const res = await tursoClientInstance.execute({ sql, args: safeArgs });
    return res.rows[0] || null;
  } else {
    if (!localDbInstance) {
      const Database = (await import('better-sqlite3')).default;
      const dbPath = getLocalDbPath();
      localDbInstance = new Database(dbPath, { readonly: true });
    }
    return localDbInstance.prepare(sql).get(...safeArgs) || null;
  }
}

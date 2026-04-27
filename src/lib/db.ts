import { Pool, type PoolConfig, type QueryResultRow } from "pg";

// Lazy singleton pg Pool — created on first query, not at module load.
//
// On Vercel serverless: each container reuses the pool across warm invocations.
// Cold starts open a new pool. Keep `max` small to avoid exhausting your DB's
// connection limit. For Neon/Supabase, point DATABASE_URL at their pooler
// endpoint (PgBouncer) so we can scale beyond the raw connection cap.
//
// Lazy init means importing this module at build time (where DATABASE_URL is
// often unset) doesn't emit warnings. The warning surfaces only at request time.

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

let warned = false;

function getPool(): Pool {
  if (global.__pgPool) return global.__pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString && !warned) {
    warned = true;
    console.warn("[db] DATABASE_URL is not set — analytics queries will fail.");
  }

  const config: PoolConfig = {
    connectionString,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  };

  // Most managed Postgres providers (Neon, Supabase, RDS) require SSL.
  // The `?sslmode=require` URL param is honored automatically; this fallback
  // ensures a sane default in production.
  if (process.env.NODE_ENV === "production") {
    config.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(config);
  global.__pgPool = pool;
  return pool;
}

/**
 * Run a parameterized SQL query and return rows.
 * All callers MUST use $1, $2, ... placeholders — never string interpolation.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query<T>(sql, params as unknown[] as never[]);
  return result.rows;
}

// Backwards-compatible export — call .query() on this proxy and it lazily
// initializes the pool. Most callers should use the `query()` helper above.
export const pool = {
  get query() {
    return getPool().query.bind(getPool());
  },
};

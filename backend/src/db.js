import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text, params = []) {
  return db.query(text, params);
}

/** @param {(client: import('pg').PoolClient) => Promise<void>} fn */
export async function withTransaction(fn) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await fn(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

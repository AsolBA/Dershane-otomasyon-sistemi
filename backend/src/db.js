// =============================================================================
// db.js — PostgreSQL baglantisi
// pg Pool ile veritabani havuzu. query() tek sorgu, withTransaction() cok adimli
// islemlerde (ornegin ogrenci olusturma: user + student) atomik kayit icin kullanilir.
// =============================================================================
import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text, params = []) {
  return db.query(text, params);
}

/** @param {(client: import('pg').PoolClient) => Promise<T>} fn */
export async function withTransaction(fn) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

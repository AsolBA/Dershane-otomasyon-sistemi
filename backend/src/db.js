import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const db = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text, params = []) {
  return db.query(text, params);
}

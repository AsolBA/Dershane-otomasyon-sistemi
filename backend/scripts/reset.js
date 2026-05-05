import pg from "pg";
import dotenv from "dotenv";
import { pool } from "./db-utils.js";
import { runSqlDirectory } from "./db-utils.js";

dotenv.config();

const { Client } = pg;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tanimli degil.");
  }

  const adminConnectionUrl = new URL(databaseUrl);
  const targetDatabaseName = adminConnectionUrl.pathname.replace("/", "");
  adminConnectionUrl.pathname = "/postgres";

  const adminClient = new Client({ connectionString: adminConnectionUrl.toString() });
  await adminClient.connect();

  try {
    await adminClient.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [targetDatabaseName],
    );
    await adminClient.query(`DROP DATABASE IF EXISTS "${targetDatabaseName}"`);
    await adminClient.query(`CREATE DATABASE "${targetDatabaseName}"`);
  } finally {
    await adminClient.end();
  }

  try {
    await runSqlDirectory("db/migrations");
    await runSqlDirectory("db/seeds");
    console.log("DB reset tamamlandi.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("DB reset hatasi:", error.message);
  process.exit(1);
});

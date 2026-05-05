import { pool, runSqlDirectory } from "./db-utils.js";

async function main() {
  try {
    await runSqlDirectory("db/seeds");
    console.log("Seed islemleri tamamlandi.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Seed hatasi:", error.message);
  process.exit(1);
});

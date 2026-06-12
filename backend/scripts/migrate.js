import { pool, runSqlDirectory } from "./db-utils.js";
import { backfillMustChangePassword } from "./backfill-must-change-password.js";

async function main() {
  try {
    await runSqlDirectory("db/migrations");
    await backfillMustChangePassword();
    console.log("Migration islemleri tamamlandi.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Migration hatasi:", error.message);
  process.exit(1);
});

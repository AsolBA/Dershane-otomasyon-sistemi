import { pool } from "./db-utils.js";
import { comparePassword } from "../src/utils/password.js";
import { DEFAULT_USER_PASSWORD } from "../src/constants/default-password.js";
import { encryptLoginPassword } from "../src/utils/login-password-storage.js";

export async function backfillMustChangePassword() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, password_hash, login_password_enc FROM users`,
    );
    let flagUpdated = 0;
    let passwordStored = 0;
    for (const row of result.rows) {
      const stillDefault = await comparePassword(DEFAULT_USER_PASSWORD, row.password_hash);
      if (stillDefault && !row.login_password_enc) {
        await client.query(
          `UPDATE users SET must_change_password = true, login_password_enc = $2, updated_at = NOW() WHERE id = $1`,
          [row.id, encryptLoginPassword(DEFAULT_USER_PASSWORD)],
        );
        flagUpdated += 1;
        passwordStored += 1;
        continue;
      }
      if (stillDefault && row.login_password_enc) {
        await client.query(
          `UPDATE users SET must_change_password = true, updated_at = NOW() WHERE id = $1 AND must_change_password = false`,
          [row.id],
        );
        flagUpdated += 1;
      }
    }
    console.log(
      `Backfill must_change_password: ${flagUpdated} kullanici isaretlendi, ${passwordStored} sifre kaydi olusturuldu.`,
    );
    return flagUpdated;
  } finally {
    client.release();
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`) {
  backfillMustChangePassword()
    .catch((err) => {
      console.error("Backfill hatasi:", err.message);
      process.exit(1);
    })
    .finally(() => pool.end());
}

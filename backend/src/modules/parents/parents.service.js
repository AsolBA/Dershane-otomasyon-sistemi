import { query } from "../../db.js";

export async function listParents() {
  const rows = await query(
    `
    SELECT p.id, u.first_name, u.last_name, u.email, u.phone
    FROM parents p
    JOIN users u ON u.id = p.user_id
    WHERE u.is_active = true
    ORDER BY u.first_name, u.last_name`,
  );
  return { items: rows.rows };
}

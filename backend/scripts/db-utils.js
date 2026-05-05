import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL tanimli degil. .env dosyasini kontrol edin.");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export async function runSqlDirectory(relativeDirectory) {
  const directoryPath = path.resolve(process.cwd(), relativeDirectory);
  const files = (await fs.readdir(directoryPath))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const client = await pool.connect();
  try {
    for (const file of files) {
      const absoluteFilePath = path.join(directoryPath, file);
      const sql = await fs.readFile(absoluteFilePath, "utf8");
      await client.query(sql);
      console.log(`Uygulandi: ${relativeDirectory}/${file}`);
    }
  } finally {
    client.release();
  }
}

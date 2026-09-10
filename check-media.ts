import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  const r = await p.query(
    "SELECT media_id, storage_key, mimetype, filename, filesize, status FROM media ORDER BY created_at DESC",
  );
  console.log(JSON.stringify(r.rows, null, 2));
  await p.end();
}
main();
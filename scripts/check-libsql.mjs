import { createClient } from "@libsql/client";

const client = createClient({ url: "file:./app.db" });

const result = await client.execute(
  "SELECT name FROM sqlite_master WHERE type = 'index' AND name IN ('admins_email_unique','applicants_email_unique');"
);

console.log(result.rows);

await client.close();

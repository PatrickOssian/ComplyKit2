// Neon's HTTP driver: stateless, one fetch per query, no persistent
// connection to leak across requests — this is what keeps DB access safe
// under the Cloudflare Workers per-request isolate model (no global client).
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

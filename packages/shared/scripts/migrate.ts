/** Applies pending SQL migrations from packages/shared/drizzle. Run: npm run db:migrate */
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../src/db";

migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") })
  .then(() => console.log("Database is up to date."))
  .finally(() => pool.end());

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1Client = Parameters<typeof drizzle>[0];

export function createDb(database: D1Client) {
  return drizzle(database, { schema });
}

export type DB = ReturnType<typeof createDb>;

import { readdirSync } from "fs";
import { defineConfig } from "drizzle-kit";

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const sqliteFile = readdirSync(d1Dir).find((f) => f.endsWith(".sqlite"));

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `${d1Dir}/${sqliteFile}`,
  },
});

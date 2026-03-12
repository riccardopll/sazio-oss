import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineWorkersConfig(async () => {
  const rootDir = path.dirname(fileURLToPath(import.meta.url));
  const migrations = await readD1Migrations(path.join(rootDir, "drizzle"));

  return {
    test: {
      globals: true,
      include: ["test/**/*.test.ts"],
      poolOptions: {
        workers: {
          isolatedStorage: true,
          miniflare: {
            bindings: {
              TEST_MIGRATIONS: migrations,
            },
          },
          wrangler: { configPath: "./wrangler.jsonc" },
        },
      },
    },
  };
});

import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import { appRouter, type BaseContext } from "@sazio-oss/api";
import * as schema from "@sazio-oss/api/schema";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { verifyToken } from "@clerk/backend";

const app = new Hono<{
  Bindings: {
    DB: D1Database;
    CLERK_SECRET_KEY: string;
  };
}>();

app.use("/*", cors());

app.get("/", (ctx) => ctx.json({ message: "Hello, World!" }));

app.all("/trpc/*", async (ctx) => {
  const authHeader = ctx.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  let userId: string | undefined;
  if (token) {
    try {
      const payload = await verifyToken(token, {
        secretKey: ctx.env.CLERK_SECRET_KEY,
      });
      userId = payload.sub;
    } catch (error) {
      console.error("JWT verification failed:", error);
    }
  }
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: ctx.req.raw,
    router: appRouter,
    createContext: () =>
      ({
        db: drizzle(ctx.env.DB, { schema }),
        userId,
      }) satisfies BaseContext,
  });
});

export default app;

import { initTRPC, TRPCError } from "@trpc/server";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";

export interface BaseContext {
  db: ReturnType<typeof drizzle<typeof schema>>;
  userId: string | undefined;
}

const trpc = initTRPC.context<BaseContext>().create();

export const router = trpc.router;

export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: { ...ctx, userId: ctx.userId },
  });
});

import { initTRPC, TRPCError } from "@trpc/server";
import type { DB } from "../db";

export interface BaseContext {
  db: DB;
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

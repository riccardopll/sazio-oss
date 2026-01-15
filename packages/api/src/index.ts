import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { DateTime } from "luxon";
import * as schema from "./schema";
import { foods, foodLogs, userSettings } from "./schema";

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;

function calculateCalories(macros: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  return Math.round(
    macros.protein * CALORIES_PER_GRAM.protein +
      macros.carbs * CALORIES_PER_GRAM.carbs +
      macros.fat * CALORIES_PER_GRAM.fat,
  );
}

export interface BaseContext {
  db: ReturnType<typeof drizzle<typeof schema>>;
  userId: string | null;
}

const trpc = initTRPC.context<BaseContext>().create();
const router = trpc.router;
const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
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

export const appRouter = router({
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
    const { db, userId } = ctx;
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });
    const proteinGoal = settings?.proteinGoal ?? 0;
    const carbsGoal = settings?.carbsGoal ?? 0;
    const fatGoal = settings?.fatGoal ?? 0;
    const calorieGoal = calculateCalories({
      protein: proteinGoal,
      carbs: carbsGoal,
      fat: fatGoal,
    });
    return { calorieGoal, proteinGoal, carbsGoal, fatGoal };
  }),

  upsertUserSettings: protectedProcedure
    .input(
      z.object({
        proteinGoal: z.number().nonnegative(),
        carbsGoal: z.number().nonnegative(),
        fatGoal: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const [result] = await db
        .insert(userSettings)
        .values({ userId, ...input })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: input,
        })
        .returning();
      return result;
    }),

  getDailySummary: protectedProcedure
    .input(
      z
        .object({
          date: z.coerce.date().optional(),
          timezone: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const date = input?.date ?? new Date();
      const timezone = input?.timezone ?? "UTC";
      const dateTime = DateTime.fromJSDate(date, { zone: timezone }).startOf(
        "day",
      );
      const logs = await db
        .select({
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
          quantity: foodLogs.quantity,
        })
        .from(foodLogs)
        .innerJoin(foods, eq(foodLogs.foodId, foods.id))
        .where(
          and(
            eq(foodLogs.userId, userId),
            gte(foodLogs.createdAt, dateTime.toMillis()),
            lt(foodLogs.createdAt, dateTime.plus({ days: 1 }).toMillis()),
          ),
        );
      const totals = logs.reduce(
        (acc, log) => ({
          protein: acc.protein + log.protein * log.quantity,
          carbs: acc.carbs + log.carbs * log.quantity,
          fat: acc.fat + log.fat * log.quantity,
        }),
        { protein: 0, carbs: 0, fat: 0 },
      );
      return {
        calories: calculateCalories(totals),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
      };
    }),
});

export type AppRouter = typeof appRouter;

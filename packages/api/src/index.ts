import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, gte, lt, lte, gt, isNull, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { DateTime } from "luxon";
import * as schema from "./schema";
import { foods, foodLogs, goals } from "./schema";

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
  userId: string | undefined;
}

const trpc = initTRPC.context<BaseContext>().create();

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

export const appRouter = trpc.router({
  getCurrentGoal: protectedProcedure
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
      const targetDate = DateTime.fromJSDate(date, { zone: timezone })
        .startOf("day")
        .toMillis();
      const goal = await db.query.goals.findFirst({
        where: and(
          eq(goals.userId, userId),
          lte(goals.startAt, targetDate),
          or(isNull(goals.endAt), gt(goals.endAt, targetDate)),
        ),
        orderBy: desc(goals.startAt),
      });
      const proteinGoal = goal?.proteinGoal ?? 0;
      const carbsGoal = goal?.carbsGoal ?? 0;
      const fatGoal = goal?.fatGoal ?? 0;
      const calorieGoal = calculateCalories({
        protein: proteinGoal,
        carbs: carbsGoal,
        fat: fatGoal,
      });
      return {
        id: goal?.id,
        name: goal?.name,
        startAt: goal?.startAt,
        endAt: goal?.endAt,
        calorieGoal,
        proteinGoal,
        carbsGoal,
        fatGoal,
      };
    }),

  getGoalHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().int().positive().max(100).optional(),
          offset: z.number().int().nonnegative().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const results = await db.query.goals.findMany({
        where: eq(goals.userId, userId),
        orderBy: desc(goals.startAt),
        limit,
        offset,
      });
      return results.map((goal) => ({
        ...goal,
        calorieGoal: calculateCalories({
          protein: goal.proteinGoal,
          carbs: goal.carbsGoal,
          fat: goal.fatGoal,
        }),
      }));
    }),

  createGoal: protectedProcedure
    .input(
      z.object({
        name: z.string().max(100).optional(),
        startAt: z.number().int(),
        endAt: z.number().int().optional(),
        proteinGoal: z.number().int().nonnegative(),
        carbsGoal: z.number().int().nonnegative(),
        fatGoal: z.number().int().nonnegative(),
        closePreviousGoal: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { closePreviousGoal, ...goalData } = input;
      if (goalData.endAt !== undefined && goalData.startAt >= goalData.endAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "startAt must be before endAt",
        });
      }
      const overlapping = await db.query.goals.findFirst({
        where: and(
          eq(goals.userId, userId),
          lte(goals.startAt, goalData.endAt ?? Number.MAX_SAFE_INTEGER),
          or(isNull(goals.endAt), gt(goals.endAt, goalData.startAt)),
        ),
      });
      if (overlapping) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Goal period overlaps with an existing goal",
        });
      }
      if (closePreviousGoal) {
        await db
          .update(goals)
          .set({ endAt: goalData.startAt })
          .where(and(eq(goals.userId, userId), isNull(goals.endAt)));
      }
      const [result] = await db
        .insert(goals)
        .values({ userId, ...goalData })
        .returning();
      return {
        ...result,
        calorieGoal: calculateCalories({
          protein: result.proteinGoal,
          carbs: result.carbsGoal,
          fat: result.fatGoal,
        }),
      };
    }),

  updateGoal: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().max(100).optional(),
        startAt: z.number().int().optional(),
        endAt: z.number().int().optional(),
        proteinGoal: z.number().int().nonnegative().optional(),
        carbsGoal: z.number().int().nonnegative().optional(),
        fatGoal: z.number().int().nonnegative().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { id, ...updates } = input;
      const existing = await db.query.goals.findFirst({
        where: and(eq(goals.id, id), eq(goals.userId, userId)),
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }
      const newStartAt = updates.startAt ?? existing.startAt;
      const newEndAt =
        updates.endAt === undefined ? existing.endAt : updates.endAt;
      if (newEndAt !== null && newStartAt >= newEndAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "startAt must be before endAt",
        });
      }
      const [result] = await db
        .update(goals)
        .set(updates)
        .where(eq(goals.id, id))
        .returning();
      return {
        ...result,
        calorieGoal: calculateCalories({
          protein: result.proteinGoal,
          carbs: result.carbsGoal,
          fat: result.fatGoal,
        }),
      };
    }),

  deleteGoal: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const existing = await db.query.goals.findFirst({
        where: and(eq(goals.id, input.id), eq(goals.userId, userId)),
      });
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }
      await db.delete(goals).where(eq(goals.id, input.id));
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

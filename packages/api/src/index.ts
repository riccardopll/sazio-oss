import { initTRPC, TRPCError } from "@trpc/server";
import type { inferRouterOutputs } from "@trpc/server";
import { z } from "zod";
import { eq, and, gte, lt, lte, gt, isNull, or, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { DateTime } from "luxon";
import * as schema from "./schema";
import { foods, foodLogs, goals, servingUnits } from "./schema";

type Macros = { protein: number; carbs: number; fat: number };

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;
const ZERO_MACROS: Macros = { protein: 0, carbs: 0, fat: 0 };

function calculateCalories(macros: Macros) {
  return (
    macros.protein * CALORIES_PER_GRAM.protein +
    macros.carbs * CALORIES_PER_GRAM.carbs +
    macros.fat * CALORIES_PER_GRAM.fat
  );
}

function withCalorieGoal<
  T extends { proteinGoal: number; carbsGoal: number; fatGoal: number },
>(goal: T) {
  return {
    ...goal,
    calorieGoal: calculateCalories({
      protein: goal.proteinGoal,
      carbs: goal.carbsGoal,
      fat: goal.fatGoal,
    }),
  };
}

function calculateMultiplier(log: {
  quantity: number;
  servingSize: number;
  gramsEquivalent: number | null;
}) {
  return log.gramsEquivalent
    ? (log.quantity * log.gramsEquivalent) / log.servingSize
    : log.quantity;
}

const dateTimezoneInput = z
  .object({
    date: z.coerce.date().optional(),
    timezone: z.string().optional(),
  })
  .optional();

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
    .input(dateTimezoneInput)
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
      if (!goal) return null;
      return {
        id: goal.id,
        name: goal.name,
        startAt: goal.startAt,
        endAt: goal.endAt,
        ...withCalorieGoal({
          proteinGoal: goal.proteinGoal,
          carbsGoal: goal.carbsGoal,
          fatGoal: goal.fatGoal,
        }),
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
      return results.map(withCalorieGoal);
    }),

  createGoal: protectedProcedure
    .input(
      z.object({
        name: z.string().max(100),
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
      return withCalorieGoal(result);
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
      return withCalorieGoal(result);
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
    .input(dateTimezoneInput)
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
          servingSize: foods.servingSize,
          quantity: foodLogs.quantity,
          gramsEquivalent: servingUnits.gramsEquivalent,
        })
        .from(foodLogs)
        .innerJoin(foods, eq(foodLogs.foodId, foods.id))
        .leftJoin(servingUnits, eq(foodLogs.servingUnitId, servingUnits.id))
        .where(
          and(
            eq(foodLogs.userId, userId),
            gte(foodLogs.createdAt, dateTime.toMillis()),
            lt(foodLogs.createdAt, dateTime.plus({ days: 1 }).toMillis()),
          ),
        );
      const totals = logs.reduce((acc, log) => {
        const multiplier = calculateMultiplier(log);
        return {
          protein: acc.protein + log.protein * multiplier,
          carbs: acc.carbs + log.carbs * multiplier,
          fat: acc.fat + log.fat * multiplier,
        };
      }, ZERO_MACROS);
      return {
        calories: calculateCalories(totals),
        ...totals,
      };
    }),

  getWeeklySummary: protectedProcedure
    .input(
      z.object({
        weekStartDate: z.coerce.date(),
        timezone: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const timezone = input.timezone ?? "UTC";
      const weekStart = DateTime.fromJSDate(input.weekStartDate, {
        zone: timezone,
      }).startOf("day");
      const weekEnd = weekStart.plus({ days: 7 });
      const logs = await db
        .select({
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
          servingSize: foods.servingSize,
          quantity: foodLogs.quantity,
          createdAt: foodLogs.createdAt,
          gramsEquivalent: servingUnits.gramsEquivalent,
        })
        .from(foodLogs)
        .innerJoin(foods, eq(foodLogs.foodId, foods.id))
        .leftJoin(servingUnits, eq(foodLogs.servingUnitId, servingUnits.id))
        .where(
          and(
            eq(foodLogs.userId, userId),
            gte(foodLogs.createdAt, weekStart.toMillis()),
            lt(foodLogs.createdAt, weekEnd.toMillis()),
          ),
        );
      const dailyTotals: Record<string, Macros> = {};
      for (let i = 0; i < 7; i++) {
        const day = weekStart.plus({ days: i });
        dailyTotals[day.toISODate()!] = { ...ZERO_MACROS };
      }
      for (const log of logs) {
        const logDate = DateTime.fromMillis(log.createdAt, { zone: timezone })
          .startOf("day")
          .toISODate()!;
        if (dailyTotals[logDate]) {
          const multiplier = calculateMultiplier(log);
          dailyTotals[logDate].protein += log.protein * multiplier;
          dailyTotals[logDate].carbs += log.carbs * multiplier;
          dailyTotals[logDate].fat += log.fat * multiplier;
        }
      }
      return Object.entries(dailyTotals).map(([date, totals]) => ({
        date,
        calories: calculateCalories(totals),
        ...totals,
      }));
    }),
});

export type AppRouter = typeof appRouter;

type RouterOutput = inferRouterOutputs<AppRouter>;
export type GoalData = NonNullable<RouterOutput["getCurrentGoal"]>;

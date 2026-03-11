import { TRPCError } from "@trpc/server";
import { and, desc, eq, gt, isNull, lte, not, or } from "drizzle-orm";
import { DateTime } from "luxon";
import { z } from "zod";
import { goals } from "../schema";
import { protectedProcedure } from "./base";
import { withCalorieGoal } from "./nutrition";

const dateTimezoneInput = z
  .object({
    date: z.coerce.date().optional(),
    timezone: z.string().optional(),
  })
  .optional();

export const goalProcedures = {
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

      if (!goal) {
        return null;
      }

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

      const overlapping = await db.query.goals.findFirst({
        where: and(
          eq(goals.userId, userId),
          not(eq(goals.id, id)),
          lte(goals.startAt, newEndAt ?? Number.MAX_SAFE_INTEGER),
          or(isNull(goals.endAt), gt(goals.endAt, newStartAt)),
        ),
      });

      if (overlapping) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Goal period overlaps with an existing goal",
        });
      }

      const [result] = await db
        .update(goals)
        .set(updates)
        .where(and(eq(goals.id, id), eq(goals.userId, userId)))
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
};

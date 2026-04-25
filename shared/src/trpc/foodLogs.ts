import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, isNull, lt, or } from "drizzle-orm";
import { DateTime } from "luxon";
import { z } from "zod";
import { foodLogs, foods, servingUnits } from "../schema";
import { protectedProcedure } from "./base";
import {
  calculateCalories,
  calculateMultiplier,
  formatBaseServingLabel,
  getDayBounds,
  ZERO_MACROS,
} from "./nutrition";

const dateTimezoneInput = z
  .object({
    date: z.coerce.date().optional(),
    timezone: z.string().optional(),
  })
  .optional();

export const foodLogProcedures = {
  createFoodLog: protectedProcedure
    .input(
      z.object({
        foodId: z.number().int(),
        quantity: z.number().positive(),
        servingUnitId: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const food = await db
        .select({
          id: foods.id,
        })
        .from(foods)
        .where(
          and(
            eq(foods.id, input.foodId),
            or(isNull(foods.userId), eq(foods.userId, userId)),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!food) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Food not found",
        });
      }

      let selectedServingUnitId: number | undefined;

      if (input.servingUnitId != null) {
        const servingUnit = await db
          .select({
            id: servingUnits.id,
          })
          .from(servingUnits)
          .where(
            and(
              eq(servingUnits.id, input.servingUnitId),
              eq(servingUnits.foodId, food.id),
            ),
          )
          .limit(1)
          .then((rows) => rows[0]);

        if (!servingUnit) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Serving unit does not belong to the selected food",
          });
        }

        selectedServingUnitId = servingUnit.id;
      }

      const [createdLog] = await db
        .insert(foodLogs)
        .values({
          userId,
          foodId: food.id,
          servingUnitId: selectedServingUnitId,
          quantity: input.quantity,
          createdAt: Date.now(),
        })
        .returning({
          id: foodLogs.id,
          createdAt: foodLogs.createdAt,
        });

      return createdLog;
    }),

  deleteFoodLog: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const [deletedLog] = await db
        .delete(foodLogs)
        .where(and(eq(foodLogs.id, input.id), eq(foodLogs.userId, userId)))
        .returning({
          id: foodLogs.id,
        });

      if (!deletedLog) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Food log not found",
        });
      }

      return deletedLog;
    }),

  getDailySummary: protectedProcedure
    .input(dateTimezoneInput)
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const date = input?.date ?? new Date();
      const timezone = input?.timezone ?? "UTC";
      const { startAt, endAt } = getDayBounds(date, timezone);

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
            gte(foodLogs.createdAt, startAt),
            lt(foodLogs.createdAt, endAt),
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

  getDailyFoodLogs: protectedProcedure
    .input(dateTimezoneInput)
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const date = input?.date ?? new Date();
      const timezone = input?.timezone ?? "UTC";
      const { startAt, endAt } = getDayBounds(date, timezone);

      const logs = await db
        .select({
          id: foodLogs.id,
          createdAt: foodLogs.createdAt,
          foodName: foods.name,
          quantity: foodLogs.quantity,
          servingSize: foods.servingSize,
          servingUnit: foods.servingUnit,
          selectedServingUnitName: servingUnits.name,
          gramsEquivalent: servingUnits.gramsEquivalent,
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
        })
        .from(foodLogs)
        .innerJoin(foods, eq(foodLogs.foodId, foods.id))
        .leftJoin(servingUnits, eq(foodLogs.servingUnitId, servingUnits.id))
        .where(
          and(
            eq(foodLogs.userId, userId),
            gte(foodLogs.createdAt, startAt),
            lt(foodLogs.createdAt, endAt),
          ),
        )
        .orderBy(desc(foodLogs.createdAt));

      return logs.map((log) => {
        const multiplier = calculateMultiplier(log);
        const macros = {
          protein: log.protein * multiplier,
          carbs: log.carbs * multiplier,
          fat: log.fat * multiplier,
        };

        return {
          id: log.id,
          createdAt: log.createdAt,
          foodName: log.foodName,
          quantity: log.quantity,
          servingLabel:
            log.selectedServingUnitName ??
            formatBaseServingLabel({
              servingSize: log.servingSize,
              servingUnit: log.servingUnit,
            }),
          calories: calculateCalories(macros),
          ...macros,
        };
      });
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

      const dailyTotals: Record<string, typeof ZERO_MACROS> = {};

      for (let index = 0; index < 7; index += 1) {
        const day = weekStart.plus({ days: index });
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
};

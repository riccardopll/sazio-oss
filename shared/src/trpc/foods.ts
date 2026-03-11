import { and, asc, eq, inArray, isNull, like, or } from "drizzle-orm";
import { z } from "zod";
import { foods, servingUnits } from "../schema";
import type { BaseContext } from "./base";
import { protectedProcedure } from "./base";

async function getServingUnitsByFoodId(
  db: BaseContext["db"],
  foodIds: number[],
) {
  if (foodIds.length === 0) {
    return new Map<
      number,
      Array<{ id: number; name: string; gramsEquivalent: number }>
    >();
  }

  const units = await db
    .select({
      id: servingUnits.id,
      foodId: servingUnits.foodId,
      name: servingUnits.name,
      gramsEquivalent: servingUnits.gramsEquivalent,
    })
    .from(servingUnits)
    .where(inArray(servingUnits.foodId, foodIds))
    .orderBy(asc(servingUnits.name));

  const unitsByFoodId = new Map<
    number,
    Array<{ id: number; name: string; gramsEquivalent: number }>
  >();

  for (const unit of units) {
    const existing = unitsByFoodId.get(unit.foodId) ?? [];

    existing.push({
      id: unit.id,
      name: unit.name,
      gramsEquivalent: unit.gramsEquivalent,
    });

    unitsByFoodId.set(unit.foodId, existing);
  }

  return unitsByFoodId;
}

export const foodProcedures = {
  listFoods: protectedProcedure
    .input(
      z
        .object({
          query: z.string().trim().max(100).optional(),
          limit: z.number().int().positive().max(50).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const limit = input?.limit ?? 20;
      const search = input?.query?.trim();
      const accessibleFoods = or(
        isNull(foods.userId),
        eq(foods.userId, userId),
      );
      const whereClause = search
        ? and(accessibleFoods, like(foods.name, `%${search}%`))
        : accessibleFoods;

      const results = await db
        .select({
          id: foods.id,
          name: foods.name,
          servingSize: foods.servingSize,
          servingUnit: foods.servingUnit,
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
        })
        .from(foods)
        .where(whereClause)
        .orderBy(asc(foods.name))
        .limit(limit);

      const servingUnitsByFoodId = await getServingUnitsByFoodId(
        db,
        results.map((food) => food.id),
      );

      return results.map((food) => ({
        ...food,
        servingUnits: servingUnitsByFoodId.get(food.id) ?? [],
      }));
    }),

  createFood: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(50),
        servingSize: z.number().int().positive(),
        servingUnit: z.enum(["g", "ml"]),
        protein: z.number().nonnegative(),
        carbs: z.number().nonnegative(),
        fat: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const [food] = await db
        .insert(foods)
        .values({
          userId,
          name: input.name.trim(),
          servingSize: input.servingSize,
          servingUnit: input.servingUnit,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
        })
        .returning({
          id: foods.id,
          name: foods.name,
          servingSize: foods.servingSize,
          servingUnit: foods.servingUnit,
          protein: foods.protein,
          carbs: foods.carbs,
          fat: foods.fat,
        });

      return {
        ...food,
        servingUnits: [],
      };
    }),
};

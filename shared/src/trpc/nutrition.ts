import { DateTime } from "luxon";

export type Macros = { protein: number; carbs: number; fat: number };

const CALORIES_PER_GRAM = { protein: 4, carbs: 4, fat: 9 } as const;
export const ZERO_MACROS: Macros = { protein: 0, carbs: 0, fat: 0 };

export function calculateCalories(macros: Macros) {
  return (
    macros.protein * CALORIES_PER_GRAM.protein +
    macros.carbs * CALORIES_PER_GRAM.carbs +
    macros.fat * CALORIES_PER_GRAM.fat
  );
}

export function withCalorieGoal<
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

export function calculateMultiplier(log: {
  quantity: number;
  servingSize: number;
  gramsEquivalent: number | null;
}) {
  return log.gramsEquivalent
    ? (log.quantity * log.gramsEquivalent) / log.servingSize
    : log.quantity;
}

export function getDayBounds(date: Date, timezone: string) {
  const start = DateTime.fromJSDate(date, { zone: timezone }).startOf("day");

  return {
    start,
    startAt: start.toMillis(),
    endAt: start.plus({ days: 1 }).toMillis(),
  };
}

export function formatBaseServingLabel(food: {
  servingSize: number;
  servingUnit: "g" | "ml";
}) {
  return `${food.servingSize}${food.servingUnit}`;
}

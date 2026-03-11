import type { inferRouterOutputs } from "@trpc/server";
import { foodLogProcedures } from "./trpc/foodLogs";
import { foodProcedures } from "./trpc/foods";
import { goalProcedures } from "./trpc/goals";
import { router } from "./trpc/base";

export { type BaseContext } from "./trpc/base";

export const appRouter = router({
  ...foodProcedures,
  ...foodLogProcedures,
  ...goalProcedures,
});

export type AppRouter = typeof appRouter;

type RouterOutput = inferRouterOutputs<AppRouter>;
export type GoalData = NonNullable<RouterOutput["getCurrentGoal"]>;
export type FoodListItem = RouterOutput["listFoods"][number];
export type DailyFoodLogItem = RouterOutput["getDailyFoodLogs"][number];

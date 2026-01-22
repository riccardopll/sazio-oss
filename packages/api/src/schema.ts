import {
  check,
  index,
  int,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const baseColumns = {
  id: int().primaryKey({ autoIncrement: true }),
  createdAt: int("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`),
  updatedAt: int("updated_at")
    .notNull()
    .default(sql`(strftime('%s', 'now') * 1000)`)
    .$onUpdate(() => Date.now()),
};

export const foods = sqliteTable(
  "foods",
  {
    ...baseColumns,
    userId: text("user_id"),
    name: text({ length: 50 }).notNull(),
    servingSize: int("serving_size").notNull(),
    servingUnit: text("serving_unit", { enum: ["g", "ml"] }).notNull(),
    protein: real().notNull(),
    carbs: real().notNull(),
    fat: real().notNull(),
    barcode: text().unique(),
  },
  (table) => [
    check("serving_size_positive", sql`${table.servingSize} > 0`),
    check("protein_non_negative", sql`${table.protein} >= 0`),
    check("carbs_non_negative", sql`${table.carbs} >= 0`),
    check("fat_non_negative", sql`${table.fat} >= 0`),
  ],
);

export const servingUnits = sqliteTable(
  "serving_units",
  {
    ...baseColumns,
    foodId: int("food_id")
      .notNull()
      .references(() => foods.id),
    name: text({ length: 50 }).notNull(),
    gramsEquivalent: int("grams_equivalent").notNull(),
  },
  (table) => [
    check("grams_equivalent_positive", sql`${table.gramsEquivalent} > 0`),
  ],
);

export const foodLogs = sqliteTable(
  "food_logs",
  {
    ...baseColumns,
    userId: text("user_id").notNull(),
    foodId: int("food_id")
      .notNull()
      .references(() => foods.id),
    servingUnitId: int("serving_unit_id").references(() => servingUnits.id),
    quantity: real().notNull(),
  },
  (table) => [
    check("quantity_positive", sql`${table.quantity} > 0`),
    index("food_logs_user_date_idx").on(table.userId, table.createdAt),
  ],
);

export const goals = sqliteTable(
  "goals",
  {
    ...baseColumns,
    userId: text("user_id").notNull(),
    name: text({ length: 100 }).notNull(),
    startAt: int("start_at").notNull(),
    endAt: int("end_at"),
    proteinGoal: int("protein_goal").notNull(),
    carbsGoal: int("carbs_goal").notNull(),
    fatGoal: int("fat_goal").notNull(),
  },
  (table) => [
    check("protein_goal_non_negative", sql`${table.proteinGoal} >= 0`),
    check("carbs_goal_non_negative", sql`${table.carbsGoal} >= 0`),
    check("fat_goal_non_negative", sql`${table.fatGoal} >= 0`),
    check(
      "start_before_end",
      sql`${table.endAt} IS NULL OR ${table.startAt} < ${table.endAt}`,
    ),
    index("goals_user_id_idx").on(table.userId),
    index("goals_user_date_idx").on(table.userId, table.startAt, table.endAt),
  ],
);

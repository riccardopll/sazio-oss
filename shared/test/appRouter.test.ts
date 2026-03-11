import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";
import { appRouter, type BaseContext } from "../src/index";
import { foodLogs, foods } from "../src/schema";
import * as schema from "../src/schema";

type TestDatabase = ReturnType<typeof drizzle<typeof schema>>;

function createTestDatabase() {
  const sqlite = new Database(":memory:");
  const migrationsDir = decodeURIComponent(
    path.join(new URL("../../server/drizzle/", import.meta.url).pathname),
  );

  sqlite.exec(
    readFileSync(path.join(migrationsDir, "0000_red_killraven.sql"), {
      encoding: "utf8",
    }),
  );
  sqlite.exec(
    readFileSync(
      path.join(migrationsDir, "0001_powerful_serpent_society.sql"),
      {
        encoding: "utf8",
      },
    ),
  );

  const db = drizzle(sqlite, { schema });

  return { sqlite, db };
}

function createCaller(db: TestDatabase, userId = "user_1") {
  return appRouter.createCaller({
    db: db as unknown as BaseContext["db"],
    userId,
  });
}

describe("appRouter food logging", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("createFood stores a user-scoped food", async () => {
    const { sqlite, db } = createTestDatabase();
    const caller = createCaller(db);

    const createdFood = await caller.createFood({
      name: "Greek Yogurt",
      servingSize: 170,
      servingUnit: "g",
      protein: 17,
      carbs: 6,
      fat: 0,
    });

    const storedFood = db
      .select()
      .from(foods)
      .where(eq(foods.id, createdFood.id))
      .get();

    expect(createdFood.name).toBe("Greek Yogurt");
    expect(createdFood.servingUnits).toEqual([]);
    expect(storedFood?.userId).toBe("user_1");
    sqlite.close();
  });

  it("listFoods returns global plus user foods and filters by search text", async () => {
    const { sqlite, db } = createTestDatabase();
    const caller = createCaller(db);

    await db.insert(foods).values([
      {
        userId: null,
        name: "Chicken Breast",
        servingSize: 100,
        servingUnit: "g",
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
      {
        userId: "user_1",
        name: "Chia Pudding",
        servingSize: 150,
        servingUnit: "g",
        protein: 8,
        carbs: 18,
        fat: 9,
      },
      {
        userId: "user_2",
        name: "Chorizo",
        servingSize: 100,
        servingUnit: "g",
        protein: 24,
        carbs: 2,
        fat: 38,
      },
    ]);

    const result = await caller.listFoods({ query: "ch", limit: 10 });

    expect(result.map((food) => food.name)).toEqual([
      "Chia Pudding",
      "Chicken Breast",
    ]);
    sqlite.close();
  });

  it("createFoodLog rejects invalid quantity and stores a valid log", async () => {
    const { sqlite, db } = createTestDatabase();
    const caller = createCaller(db);

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Oats",
        servingSize: 40,
        servingUnit: "g",
        protein: 5,
        carbs: 27,
        fat: 3,
      })
      .returning();

    await expect(
      caller.createFoodLog({
        foodId: food.id,
        quantity: 0,
      }),
    ).rejects.toBeDefined();

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T10:30:00.000Z"));

    const createdLog = await caller.createFoodLog({
      foodId: food.id,
      quantity: 2,
    });

    const storedLog = db
      .select()
      .from(foodLogs)
      .where(eq(foodLogs.id, createdLog.id))
      .get();

    expect(storedLog?.userId).toBe("user_1");
    expect(storedLog?.quantity).toBe(2);
    expect(storedLog?.createdAt).toBe(
      new Date("2026-03-10T10:30:00.000Z").getTime(),
    );
    sqlite.close();
  });

  it("getDailyFoodLogs returns derived macros and calories", async () => {
    const { sqlite, db } = createTestDatabase();
    const caller = createCaller(db);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T08:00:00.000Z"));

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Protein Pasta",
        servingSize: 100,
        servingUnit: "g",
        protein: 30,
        carbs: 10,
        fat: 5,
      })
      .returning();

    await caller.createFoodLog({
      foodId: food.id,
      quantity: 1.5,
    });

    const logs = await caller.getDailyFoodLogs({
      date: new Date("2026-03-10T12:00:00.000Z"),
      timezone: "UTC",
    });

    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      foodName: "Protein Pasta",
      quantity: 1.5,
      servingLabel: "100g",
      protein: 45,
      carbs: 15,
      fat: 7.5,
      calories: 307.5,
    });
    sqlite.close();
  });

  it("daily and weekly summaries reflect newly created logs", async () => {
    const { sqlite, db } = createTestDatabase();
    const caller = createCaller(db);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T07:15:00.000Z"));

    const [food] = await db
      .insert(foods)
      .values({
        userId: "user_1",
        name: "Turkey Rice Bowl",
        servingSize: 100,
        servingUnit: "g",
        protein: 20,
        carbs: 25,
        fat: 4,
      })
      .returning();

    await caller.createFoodLog({
      foodId: food.id,
      quantity: 2,
    });

    const daily = await caller.getDailySummary({
      date: new Date("2026-03-10T12:00:00.000Z"),
      timezone: "UTC",
    });
    const weekly = await caller.getWeeklySummary({
      weekStartDate: new Date("2026-03-09T00:00:00.000Z"),
      timezone: "UTC",
    });

    expect(daily).toEqual({
      protein: 40,
      carbs: 50,
      fat: 8,
      calories: 432,
    });
    expect(weekly.find((day) => day.date === "2026-03-10")).toEqual({
      date: "2026-03-10",
      protein: 40,
      carbs: 50,
      fat: 8,
      calories: 432,
    });
    sqlite.close();
  });
});

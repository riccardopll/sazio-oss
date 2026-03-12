import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import type { FoodListItem } from "@sazio-oss/shared";
import { DashboardCard } from "@/components/DashboardCard";
import {
  FoodCreateSheet,
  type FoodCreateSheetParams,
} from "@/components/FoodCreateSheet";
import {
  FoodLogSheet,
  type FoodLogSheetParams,
} from "@/components/FoodLogSheet";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export default function Log() {
  const trpc = useTRPC();
  const [activeModal, setActiveModal] = useState<"log" | "create" | null>(null);
  const [foodLogParams, setFoodLogParams] = useState<FoodLogSheetParams>({});
  const [foodCreateParams, setFoodCreateParams] =
    useState<FoodCreateSheetParams>({});
  const timezone = DateTime.local().zoneName;
  const [today] = useState(() => DateTime.now().toJSDate());
  const { data: dailyLogs, isLoading: isLogsLoading } = useQuery(
    trpc.getDailyFoodLogs.queryOptions({
      date: today,
      timezone,
    }),
  );

  const handleFoodCreated = (food: FoodListItem) => {
    setFoodLogParams({
      initialSearch: food.name,
      selectedFood: food,
    });
    setActiveModal("log");
  };

  const handleOpenCreateFood = (initialName?: string) => {
    setFoodCreateParams({ initialName });
    setActiveModal("create");
  };

  const isLoading = isLogsLoading;

  return (
    <>
      <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
        <View className="px-5 pt-4">
          <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
            {DateTime.now().toLocaleString({
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary">
            Log food
          </Text>
          <Text className="mt-2 max-w-[320px] text-base leading-6 text-text-secondary">
            Track what you ate today, build your catalog as you go, and keep the
            dashboard totals in sync.
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-2 pt-6"
        >
          <Pressable
            onPress={() => {
              setFoodLogParams({});
              setActiveModal("log");
            }}
            className="mb-4 rounded-[28px] bg-text-primary px-5 py-4"
          >
            <Text className="text-center text-base font-semibold text-text-inverse">
              Log food
            </Text>
          </Pressable>

          {isLoading || !dailyLogs ? (
            <DashboardCard>
              <View className="items-center justify-center py-8">
                <ActivityIndicator
                  size="large"
                  color={mobileTheme.state.loading}
                />
              </View>
            </DashboardCard>
          ) : (
            <DashboardCard>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-semibold text-text-primary">
                    Today&apos;s log
                  </Text>
                  <Text className="mt-1 text-sm text-text-secondary">
                    Newest entries appear first.
                  </Text>
                </View>
                <Text className="text-sm text-text-muted">
                  {dailyLogs.length} item{dailyLogs.length === 1 ? "" : "s"}
                </Text>
              </View>

              {dailyLogs.length === 0 ? (
                <View className="mt-4 rounded-[22px] bg-surface-input px-4 py-5">
                  <Text className="text-base font-medium text-text-primary">
                    Nothing logged yet
                  </Text>
                  <Text className="mt-2 text-sm leading-5 text-text-secondary">
                    Start with the button above. If a food doesn&apos;t exist
                    yet, create it and log it in the same flow.
                  </Text>
                </View>
              ) : (
                <View className="mt-4 gap-3">
                  {dailyLogs.map((entry) => (
                    <View
                      key={entry.id}
                      className="rounded-[16px] border border-border-subtle bg-surface-input px-3 py-2.5"
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-[17px] font-medium text-text-primary">
                            {entry.foodName}
                          </Text>
                          <View className="mt-1 flex-row items-center gap-3">
                            <Text className="text-sm text-text-secondary">
                              {`${formatNumber(entry.quantity)} × ${entry.servingLabel}`}
                            </Text>
                            <Text className="text-sm text-nutrition-protein">
                              {formatNumber(entry.protein)}P
                            </Text>
                            <Text className="text-sm text-nutrition-carbs">
                              {formatNumber(entry.carbs)}C
                            </Text>
                            <Text className="text-sm text-nutrition-fat">
                              {formatNumber(entry.fat)}F
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm text-text-muted">
                            {DateTime.fromMillis(entry.createdAt)
                              .setZone(timezone)
                              .toFormat("HH:mm")}
                          </Text>
                          <Text className="mt-0.5 text-[17px] font-semibold text-nutrition-calories">
                            {formatNumber(entry.calories)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </DashboardCard>
          )}
        </ScrollView>
      </SafeAreaView>

      <FoodLogSheet
        visible={activeModal === "log"}
        params={foodLogParams}
        onClose={() => setActiveModal(null)}
        onRequestCreateFood={handleOpenCreateFood}
      />
      <FoodCreateSheet
        visible={activeModal === "create"}
        params={foodCreateParams}
        onClose={() => setActiveModal(null)}
        onCreated={handleFoodCreated}
      />
    </>
  );
}

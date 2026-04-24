import { useUser } from "@clerk/expo";
import { View, ScrollView, ActivityIndicator } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";
import { WeekSelector } from "@/components/WeekSelector";
import { NutritionProgressCard } from "@/components/NutritionProgressCard";
import { DailyFoodLogCard } from "@/components/DailyFoodLogCard";
import { getBottomTabBarContentPadding } from "@/components/BottomTabBarWithLogAction";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useState, useMemo } from "react";
import { DateTime } from "luxon";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { screenStyles } from "@/lib/styles";

function getWeekStart(date: DateTime) {
  return date.startOf("week");
}

export default function Dashboard() {
  const trpc = useTRPC();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(() =>
    DateTime.now().startOf("day"),
  );
  const weekStart = useMemo(
    () => getWeekStart(selectedDate).toJSDate(),
    [selectedDate],
  );
  const timezone = DateTime.local().zoneName;
  const { data: currentGoal } = useQuery(
    trpc.getCurrentGoal.queryOptions(
      {
        date: selectedDate.toJSDate(),
        timezone,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );
  const { data: weekData, isFetching: isWeekDataFetching } = useQuery(
    trpc.getWeeklySummary.queryOptions(
      {
        weekStartDate: weekStart,
        timezone,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );
  const {
    data: dailyLogs,
    isFetching: isDailyLogsFetching,
    isPlaceholderData: isDailyLogsPlaceholderData,
  } = useQuery(
    trpc.getDailyFoodLogs.queryOptions(
      {
        date: selectedDate.toJSDate(),
        timezone,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );
  if (weekData === undefined || currentGoal === undefined) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-surface-app"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={mobileTheme.state.loading} />
      </SafeAreaView>
    );
  }
  const selectedDayData = weekData.find(
    (day: { date: string }) => day.date === selectedDate.toISODate(),
  );
  const bottomContentPadding = getBottomTabBarContentPadding(insets.bottom);
  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
      <View className="mb-2">
        <ScreenHeader
          eyebrow={selectedDate.toLocaleString({
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          title={`Hi, ${user?.firstName ?? "Anon"}`}
        />
      </View>
      <WeekSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName={screenStyles.content}
        contentContainerStyle={{ paddingBottom: bottomContentPadding }}
      >
        <View className={screenStyles.cardGap}>
          <NutritionProgressCard
            calories={{
              consumed: selectedDayData?.calories ?? 0,
              goal: currentGoal?.calorieGoal ?? 0,
            }}
            carbs={{
              consumed: selectedDayData?.carbs ?? 0,
              goal: currentGoal?.carbsGoal ?? 0,
            }}
            fat={{
              consumed: selectedDayData?.fat ?? 0,
              goal: currentGoal?.fatGoal ?? 0,
            }}
            protein={{
              consumed: selectedDayData?.protein ?? 0,
              goal: currentGoal?.proteinGoal ?? 0,
            }}
            isLoading={isWeekDataFetching}
          />
          <DailyFoodLogCard
            entries={dailyLogs}
            isLoading={
              isDailyLogsFetching &&
              (dailyLogs === undefined || isDailyLogsPlaceholderData)
            }
            selectedDate={selectedDate}
            timezone={timezone}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

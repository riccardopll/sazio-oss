import { useUser } from "@clerk/expo";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";
import { WeekSelector } from "@/components/WeekSelector";
import { NutritionProgressCard } from "@/components/NutritionProgressCard";
import { GoalCard } from "@/components/GoalCard";
import { GoalSheet, type GoalSheetRef } from "@/components/GoalSheet";
import { useState, useMemo, useRef } from "react";
import { DateTime } from "luxon";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

function getWeekStart(date: DateTime): DateTime {
  return date.startOf("week");
}

export default function Dashboard() {
  const trpc = useTRPC();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState(() =>
    DateTime.now().startOf("day"),
  );
  const goalSheetRef = useRef<GoalSheetRef>(null);
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
  const handleGoalPress = () => {
    if (currentGoal) {
      goalSheetRef.current?.present({
        goalId: currentGoal.id,
        goalName: currentGoal.name,
        startAt: currentGoal.startAt,
        endAt: currentGoal.endAt ?? undefined,
        proteinGoal: currentGoal.proteinGoal,
        carbsGoal: currentGoal.carbsGoal,
        fatGoal: currentGoal.fatGoal,
      });
      return;
    }
    goalSheetRef.current?.present();
  };
  return (
    <>
      <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
        <View className="px-5 pt-4">
          <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
            {selectedDate.toLocaleString({
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="mt-2 text-3xl font-bold text-text-primary">
            {`Hi, ${user?.firstName ?? "Anon"}`}
          </Text>
          <Text className="mt-2 max-w-[280px] text-base leading-6 text-text-secondary">
            Your daily macros, rebuilt around a true-black dashboard.
          </Text>
        </View>
        <WeekSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
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
          <GoalCard
            goal={currentGoal}
            onPress={handleGoalPress}
            className="mt-4"
          />
        </ScrollView>
      </SafeAreaView>
      <GoalSheet ref={goalSheetRef} />
    </>
  );
}

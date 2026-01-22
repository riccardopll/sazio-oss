import { useUser } from "@clerk/clerk-expo";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { WeekSelector } from "@/components/WeekSelector";
import { NutritionProgressCard } from "@/components/NutritionProgressCard";
import { GoalCard } from "@/components/GoalCard";
import { GoalSheet, type GoalSheetRef } from "@/components/GoalSheet";
import { useState, useMemo, useRef } from "react";
import { DateTime } from "luxon";
import { keepPreviousData } from "@tanstack/react-query";

function getWeekStart(date: DateTime): DateTime {
  return date.startOf("week");
}

export default function Dashboard() {
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
  const { data: currentGoal } = trpc.getCurrentGoal.useQuery(
    {
      date: selectedDate.toJSDate(),
      timezone,
    },
    {
      placeholderData: keepPreviousData,
    },
  );
  const { data: weekData, isFetching: isWeekDataFetching } =
    trpc.getWeeklySummary.useQuery(
      {
        weekStartDate: weekStart,
        timezone,
      },
      {
        placeholderData: keepPreviousData,
      },
    );
  if (weekData === undefined || currentGoal === undefined) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" />
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
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <View className="px-4 pt-2">
          <Text className="text-sm text-gray-500">
            {selectedDate.toLocaleString({
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text className="text-2xl font-bold">
            {`Hi, ${user?.firstName ?? "Anon"}`}
          </Text>
        </View>
        <WeekSelector
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        <ScrollView className="flex-1" contentContainerClassName="px-4 pb-4">
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

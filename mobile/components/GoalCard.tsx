import { Pressable, Text, View } from "react-native";
import { DateTime } from "luxon";
import { DashboardCard } from "./DashboardCard";
import type { GoalData } from "@sazio-oss/shared";

interface GoalCardProps {
  goal: GoalData | null;
  onPress: () => void;
  className: string;
}

function formatDateRange(startAt: number, endAt?: number | null) {
  const start = DateTime.fromMillis(startAt).toFormat("MMM d");
  if (endAt) {
    return `${start} - ${DateTime.fromMillis(endAt).toFormat("MMM d")}`;
  }
  return `Started ${start}`;
}

export function GoalCard({ goal, onPress, className }: GoalCardProps) {
  return (
    <Pressable onPress={onPress} className={className}>
      <DashboardCard>
        {goal ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-base font-semibold text-text-primary">
                  Goal
                </Text>
                <Text
                  className="mt-0.5 text-sm text-text-secondary"
                  numberOfLines={1}
                >
                  {goal.name}
                </Text>
              </View>
              <Text className="text-sm text-text-muted">
                {formatDateRange(goal.startAt, goal.endAt)}
              </Text>
            </View>
            <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
              <View className="flex-row items-baseline gap-1">
                <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                  Protein
                </Text>
                <Text className="text-sm font-semibold text-nutrition-protein">
                  {goal.proteinGoal}g
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                  Carbs
                </Text>
                <Text className="text-sm font-semibold text-nutrition-carbs">
                  {goal.carbsGoal}g
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                  Fat
                </Text>
                <Text className="text-sm font-semibold text-nutrition-fat">
                  {goal.fatGoal}g
                </Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                  Calories
                </Text>
                <Text className="text-sm font-semibold text-nutrition-calories">
                  {goal.calorieGoal}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-2">
            <Text className="text-base font-semibold text-text-primary">
              Goal
            </Text>
            <Text className="text-text-secondary">
              Tap to set your nutrition targets →
            </Text>
          </View>
        )}
      </DashboardCard>
    </Pressable>
  );
}

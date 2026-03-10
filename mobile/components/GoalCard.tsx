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
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-text-primary">
            Goal
          </Text>
          {goal && (
            <Text className="text-sm text-text-muted">
              {formatDateRange(goal.startAt, goal.endAt)}
            </Text>
          )}
        </View>
        {goal ? (
          <View className="mt-3">
            <Text className="text-lg font-medium text-text-primary">
              {goal.name}
            </Text>
            <View className="flex-row mt-2 gap-4">
              <View className="items-center">
                <Text className="text-xs text-text-muted">Protein</Text>
                <Text className="text-sm font-semibold text-nutrition-protein">
                  {goal.proteinGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-text-muted">Carbs</Text>
                <Text className="text-sm font-semibold text-nutrition-carbs">
                  {goal.carbsGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-text-muted">Fat</Text>
                <Text className="text-sm font-semibold text-nutrition-fat">
                  {goal.fatGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-text-muted">Calories</Text>
                <Text className="text-sm font-semibold text-nutrition-calories">
                  {goal.calorieGoal}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mt-3">
            <Text className="text-text-secondary">
              Tap to set your nutrition targets →
            </Text>
          </View>
        )}
      </DashboardCard>
    </Pressable>
  );
}

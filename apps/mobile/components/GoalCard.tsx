import { Pressable, Text, View } from "react-native";
import { DateTime } from "luxon";
import { DashboardCard } from "./DashboardCard";

export interface GoalData {
  id?: number;
  name?: string | null;
  startAt?: number | null;
  endAt?: number | null;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  calorieGoal: number;
}

interface GoalCardProps {
  goal: GoalData | null;
  onPress: () => void;
  className?: string;
}

function formatDateRange(startAt?: number | null, endAt?: number | null) {
  if (!startAt) return "Ongoing";
  const start = DateTime.fromMillis(startAt);
  const startFormatted = start.toFormat("MMM d");
  if (endAt) {
    const end = DateTime.fromMillis(endAt);
    return `${startFormatted} - ${end.toFormat("MMM d")}`;
  }
  return `Started ${startFormatted}`;
}

export function GoalCard({ goal, onPress, className }: GoalCardProps) {
  const hasGoal = goal?.id != null;
  return (
    <Pressable onPress={onPress} className={className}>
      <DashboardCard>
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-800">Goal</Text>
          {hasGoal && (
            <Text className="text-sm text-gray-500">
              {formatDateRange(goal.startAt, goal.endAt)}
            </Text>
          )}
        </View>
        {hasGoal ? (
          <View className="mt-3">
            <Text className="text-lg font-medium text-gray-900">
              {goal.name || "Current Goal"}
            </Text>
            <View className="flex-row mt-2 gap-4">
              <View className="items-center">
                <Text className="text-xs text-gray-500">Protein</Text>
                <Text className="text-sm font-semibold text-nutrition-protein">
                  {goal.proteinGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">Carbs</Text>
                <Text className="text-sm font-semibold text-nutrition-carbs">
                  {goal.carbsGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">Fat</Text>
                <Text className="text-sm font-semibold text-nutrition-fat">
                  {goal.fatGoal}g
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xs text-gray-500">Calories</Text>
                <Text className="text-sm font-semibold text-gray-700">
                  {goal.calorieGoal}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="mt-3">
            <Text className="text-gray-500">
              Tap to set your nutrition targets →
            </Text>
          </View>
        )}
      </DashboardCard>
    </Pressable>
  );
}

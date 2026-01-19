import { View, ActivityIndicator } from "react-native";
import { DashboardCard } from "./DashboardCard";
import { NutritionBar } from "./NutritionBar";

const NUTRITION_COLORS = {
  calories: "#2C2C2E",
  carbs: "#30D158",
  fat: "#FFD60A",
  protein: "#FF453A",
} as const;

interface NutritionData {
  consumed: number;
  goal: number;
}

interface NutritionProgressCardProps {
  calories: NutritionData;
  carbs: NutritionData;
  fat: NutritionData;
  protein: NutritionData;
  isLoading?: boolean;
}

export function NutritionProgressCard({
  calories,
  carbs,
  fat,
  protein,
  isLoading,
}: NutritionProgressCardProps) {
  if (isLoading) {
    return (
      <DashboardCard>
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" />
        </View>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard>
      <View className="gap-5">
        <NutritionBar
          label="Calories"
          consumed={calories.consumed}
          goal={calories.goal}
          color={NUTRITION_COLORS.calories}
        />
        <NutritionBar
          label="Carbs"
          consumed={carbs.consumed}
          goal={carbs.goal}
          color={NUTRITION_COLORS.carbs}
          unit="g"
        />
        <NutritionBar
          label="Fats"
          consumed={fat.consumed}
          goal={fat.goal}
          color={NUTRITION_COLORS.fat}
          unit="g"
        />
        <NutritionBar
          label="Proteins"
          consumed={protein.consumed}
          goal={protein.goal}
          color={NUTRITION_COLORS.protein}
          unit="g"
        />
      </View>
    </DashboardCard>
  );
}

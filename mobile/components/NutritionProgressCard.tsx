import { View, ActivityIndicator } from "react-native";
import { mobileTheme } from "@/lib/theme";
import { DashboardCard } from "./DashboardCard";
import { NutritionBar } from "./NutritionBar";

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
          <ActivityIndicator size="large" color={mobileTheme.state.loading} />
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
          variant="calories"
        />
        <NutritionBar
          label="Carbs"
          consumed={carbs.consumed}
          goal={carbs.goal}
          variant="carbs"
          unit="g"
        />
        <NutritionBar
          label="Fats"
          consumed={fat.consumed}
          goal={fat.goal}
          variant="fat"
          unit="g"
        />
        <NutritionBar
          label="Proteins"
          consumed={protein.consumed}
          goal={protein.goal}
          variant="protein"
          unit="g"
        />
      </View>
    </DashboardCard>
  );
}

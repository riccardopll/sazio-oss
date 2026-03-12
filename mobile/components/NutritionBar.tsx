import { View, Text } from "react-native";

interface NutritionBarProps {
  label: string;
  consumed: number;
  goal: number;
  variant: "calories" | "carbs" | "fat" | "protein";
  unit?: string;
}

const BAR_CLASS_NAMES = {
  calories: {
    fill: "bg-nutrition-calories",
    track: "bg-nutrition-calories/15",
  },
  carbs: {
    fill: "bg-nutrition-carbs",
    track: "bg-nutrition-carbs/15",
  },
  fat: {
    fill: "bg-nutrition-fat/90",
    track: "bg-nutrition-fat/15",
  },
  protein: {
    fill: "bg-nutrition-protein",
    track: "bg-nutrition-protein/15",
  },
} as const;

export function NutritionBar({
  label,
  consumed,
  goal,
  variant,
  unit = "",
}: NutritionBarProps) {
  const percentage = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const barClasses = BAR_CLASS_NAMES[variant];
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  return (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-base text-text-secondary">{label}</Text>
        <Text className="text-base font-semibold tabular-nums text-text-primary">
          {formatNumber(consumed)} / {formatNumber(goal)}
          {unit}
        </Text>
      </View>
      <View className={`h-3 overflow-hidden rounded-full ${barClasses.track}`}>
        <View
          className={`h-full rounded-full ${barClasses.fill}`}
          style={{ width: `${percentage * 100}%` }}
        />
      </View>
    </View>
  );
}

import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useEffect } from "react";

interface NutritionBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  unit?: string;
}

export function NutritionBar({
  label,
  consumed,
  goal,
  color,
  unit = "",
}: NutritionBarProps) {
  const progress = useSharedValue(0);

  const percentage = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  useEffect(() => {
    progress.value = withSpring(percentage, {
      damping: 15,
      stiffness: 100,
    });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <View className="gap-2">
      <View className="flex-row justify-between items-center">
        <Text className="text-base text-text-primary">{label}</Text>
        <Text className="text-base font-semibold tabular-nums text-text-primary">
          {formatNumber(consumed)} / {formatNumber(goal)}
          {unit ? unit : ""}
        </Text>
      </View>
      <View
        className="h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: `${color}26` }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[{ backgroundColor: color }, animatedStyle]}
        />
      </View>
    </View>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { mobileTheme } from "@/lib/theme";
import { DashboardCard } from "./DashboardCard";

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

type MacroVariant = "calories" | "carbs" | "fat" | "protein";
type MacroIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const METRIC_STYLES: Record<
  MacroVariant,
  { color: string; icon: MacroIconName; unit: string }
> = {
  calories: {
    color: mobileTheme.nutrition.calories,
    icon: "fire",
    unit: "",
  },
  carbs: {
    color: mobileTheme.nutrition.carbs,
    icon: "grain",
    unit: "g",
  },
  fat: {
    color: mobileTheme.nutrition.fat,
    icon: "egg",
    unit: "g",
  },
  protein: {
    color: mobileTheme.nutrition.protein,
    icon: "food-drumstick",
    unit: "g",
  },
};

function formatValue(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString();
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const [r, g, b] =
    normalized.length === 3
      ? normalized
          .split("")
          .map((channel) => Number.parseInt(channel + channel, 16))
      : [
          Number.parseInt(normalized.slice(0, 2), 16),
          Number.parseInt(normalized.slice(2, 4), 16),
          Number.parseInt(normalized.slice(4, 6), 16),
        ];

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getMetricSummary({ consumed, goal }: NutritionData) {
  if (goal <= 0) {
    return {
      delta: 0,
      progress: 0,
      status: "goal not set",
      detail: "Set a goal in Settings",
    };
  }

  const remaining = goal - consumed;
  const isOver = remaining < 0;

  return {
    delta: Math.abs(remaining),
    progress: Math.min(consumed / goal, 1),
    status: isOver ? "over" : "left",
    detail: `${formatValue(consumed)} / ${formatValue(goal)}`,
  };
}

function ProgressRing({
  color,
  icon,
  progress,
  size,
  strokeWidth,
  iconSize,
}: {
  color: string;
  icon?: MacroIconName;
  progress: number;
  size: number;
  strokeWidth: number;
  iconSize: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const dashOffset = circumference * (1 - clampedProgress);
  const centerSize = Math.max(size - strokeWidth * 2 - 18, 24);

  return (
    <View
      className="items-center justify-center"
      style={{ height: size, width: size }}
    >
      <Svg height={size} width={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={hexToRgba(color, 0.16)}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {icon ? (
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            backgroundColor: mobileTheme.surface.card,
            height: centerSize,
            width: centerSize,
          }}
        >
          <MaterialCommunityIcons color={color} name={icon} size={iconSize} />
        </View>
      ) : null}
    </View>
  );
}

function MacroCard({
  label,
  metric,
  variant,
}: {
  label: string;
  metric: NutritionData;
  variant: Exclude<MacroVariant, "calories">;
}) {
  const style = METRIC_STYLES[variant];
  const summary = getMetricSummary(metric);
  const detail =
    summary.status === "goal not set"
      ? summary.detail
      : `${formatValue(metric.consumed)}${style.unit} / ${formatValue(metric.goal)}${style.unit}`;

  return (
    <View className="flex-1 overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40">
      <View className="min-h-[160px] items-center justify-between px-2.5 py-3">
        <View className="items-center">
          <Text
            className="text-center text-[25px] font-bold leading-7 tracking-tight text-text-primary"
            numberOfLines={1}
          >
            {`${formatValue(summary.delta)}${style.unit}`}
          </Text>
          <Text
            className="mt-0.5 text-center text-sm font-medium leading-5 text-text-secondary"
            numberOfLines={2}
          >
            {summary.status === "goal not set"
              ? label
              : `${label} ${summary.status}`}
          </Text>
        </View>

        <View className="items-center justify-center py-2">
          <ProgressRing
            color={style.color}
            iconSize={20}
            progress={summary.progress}
            size={66}
            strokeWidth={8}
          />
        </View>

        <Text className="self-center text-center text-[11px] text-text-muted">
          {detail}
        </Text>
      </View>
    </View>
  );
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

  const calorieSummary = getMetricSummary(calories);
  const calorieStyle = METRIC_STYLES.calories;

  return (
    <View className="gap-3">
      <DashboardCard contentClassName="px-4 py-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-medium leading-5 text-text-secondary">
              Daily nutrition
            </Text>
            <Text className="mt-3 text-[54px] font-bold leading-[54px] tracking-tight text-text-primary">
              {formatValue(calorieSummary.delta)}
            </Text>
            <Text className="mt-2 text-lg text-text-secondary">
              {calorieSummary.status === "goal not set"
                ? "Calorie goal not set"
                : `Calories ${calorieSummary.status}`}
            </Text>
            <Text className="mt-2 text-sm text-text-muted">
              {calorieSummary.status === "goal not set"
                ? calorieSummary.detail
                : `${calorieSummary.detail} kcal`}
            </Text>
          </View>

          <ProgressRing
            color={calorieStyle.color}
            icon={calorieStyle.icon}
            iconSize={40}
            progress={calorieSummary.progress}
            size={148}
            strokeWidth={13}
          />
        </View>
      </DashboardCard>

      <View className="flex-row gap-3">
        <MacroCard label="Protein" metric={protein} variant="protein" />
        <MacroCard label="Carbs" metric={carbs} variant="carbs" />
        <MacroCard label="Fat" metric={fat} variant="fat" />
      </View>
    </View>
  );
}

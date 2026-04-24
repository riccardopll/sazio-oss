import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { DateTime } from "luxon";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { mobileTheme } from "@/lib/theme";

const LOG_CHEVRON_SIZE = 16;

interface DailyFoodLogEntry {
  id: number;
  createdAt: number;
  foodName: string;
  quantity: number;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyFoodLogCardProps {
  entries?: DailyFoodLogEntry[];
  isLoading?: boolean;
  selectedDate: DateTime;
  timezone: string;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getLogTitle(date: DateTime) {
  if (date.hasSame(DateTime.local(), "day")) {
    return "Today's log";
  }

  return `${date.toLocaleString({ month: "short", day: "numeric" })} log`;
}

function getModalTitle(date: DateTime) {
  if (date.hasSame(DateTime.local(), "day")) {
    return "Today's Log";
  }

  return `Log for ${date.toLocaleString({
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
}

function FoodLogRow({
  entry,
  isLast,
  timezone,
}: {
  entry: DailyFoodLogEntry;
  isLast: boolean;
  timezone: string;
}) {
  return (
    <View
      className={`flex-row items-center gap-3 py-2 ${
        isLast ? "" : "border-b border-border-subtle"
      }`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-raised">
        <Ionicons
          color={mobileTheme.nutrition.calories}
          name="fast-food-outline"
          size={18}
        />
      </View>
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-3">
            <Text
              className="min-w-0 flex-1 text-[15px] font-semibold leading-5 text-text-primary"
              numberOfLines={1}
            >
              {entry.foodName}
            </Text>
            <Text className="w-[72px] text-right text-[15px] font-semibold leading-5 text-text-primary">
              {formatNumber(entry.calories)} kcal
            </Text>
          </View>
          <View className="mt-1 flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-nutrition-protein" />
                <Text className="text-sm leading-5 text-text-muted">
                  {formatNumber(entry.protein)}P
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-nutrition-carbs" />
                <Text className="text-sm leading-5 text-text-muted">
                  {formatNumber(entry.carbs)}C
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <View className="h-2.5 w-2.5 rounded-full bg-nutrition-fat" />
                <Text className="text-sm leading-5 text-text-muted">
                  {formatNumber(entry.fat)}F
                </Text>
              </View>
            </View>
            <Text className="w-[72px] text-right text-xs leading-5 text-text-muted">
              {DateTime.fromMillis(entry.createdAt)
                .setZone(timezone)
                .toFormat("HH:mm")}
            </Text>
          </View>
        </View>
        <View className="w-6 items-end justify-center">
          <Ionicons
            color={mobileTheme.text.muted}
            name="chevron-forward"
            size={LOG_CHEVRON_SIZE}
          />
        </View>
      </View>
    </View>
  );
}

export function DailyFoodLogCard({
  entries,
  isLoading,
  selectedDate,
  timezone,
}: DailyFoodLogCardProps) {
  const [isLogSheetVisible, setIsLogSheetVisible] = useState(false);
  const logs = entries ?? [];
  const displayLogs = isLoading ? [] : logs;
  const visibleLogs = displayLogs.slice(0, 3);
  const title = getLogTitle(selectedDate);

  return (
    <>
      <View className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card px-4 py-3 shadow-lg shadow-black/40">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-text-primary">
              {title}
            </Text>
            {!isLoading && displayLogs.length === 0 ? (
              <Text className="mt-3 text-base font-semibold text-text-primary">
                Nothing logged yet
              </Text>
            ) : null}
          </View>
          {displayLogs.length > 0 ? (
            <Pressable
              accessibilityLabel="See all logged food"
              accessibilityRole="button"
              className="flex-row items-center gap-1 py-1 pl-2"
              onPress={() => setIsLogSheetVisible(true)}
            >
              <Text className="text-sm font-medium text-text-secondary">
                See all
              </Text>
              <Ionicons
                color={mobileTheme.text.secondary}
                name="chevron-forward"
                size={LOG_CHEVRON_SIZE}
              />
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="small" color={mobileTheme.state.loading} />
          </View>
        ) : visibleLogs.length === 0 ? null : (
          <View className="mt-2 border-t border-border-subtle">
            {visibleLogs.map((entry, index) => (
              <FoodLogRow
                key={entry.id}
                entry={entry}
                isLast={index === visibleLogs.length - 1}
                timezone={timezone}
              />
            ))}
          </View>
        )}
      </View>

      <BottomSheetModal
        onClose={() => setIsLogSheetVisible(false)}
        size="foodLog"
        title={getModalTitle(selectedDate)}
        visible={isLogSheetVisible}
      >
        <ScrollView className="flex-1 px-4" contentContainerClassName="py-6">
          {displayLogs.map((entry, index) => (
            <FoodLogRow
              key={entry.id}
              entry={entry}
              isLast={index === displayLogs.length - 1}
              timezone={timezone}
            />
          ))}
        </ScrollView>
      </BottomSheetModal>
    </>
  );
}

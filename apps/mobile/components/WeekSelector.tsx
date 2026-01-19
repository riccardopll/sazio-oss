import { useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  useWindowDimensions,
  type ListRenderItem,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { DateTime } from "luxon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WeekSelectorProps {
  selectedDate: DateTime;
  onSelectDate: (date: DateTime) => void;
}

interface WeekData {
  weekStart: DateTime;
  days: DateTime[];
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS_BEFORE = 2;
const WEEKS_AFTER = 2;

function getWeekStart(date: DateTime): DateTime {
  return date.startOf("week");
}

function generateWeeks(centerDate: DateTime): WeekData[] {
  const centerWeekStart = getWeekStart(centerDate);
  const weeks: WeekData[] = [];

  for (let i = -WEEKS_BEFORE; i <= WEEKS_AFTER; i++) {
    const weekStart = centerWeekStart.plus({ weeks: i });
    const days: DateTime[] = [];
    for (let d = 0; d < 7; d++) {
      days.push(weekStart.plus({ days: d }));
    }
    weeks.push({ weekStart, days });
  }

  return weeks;
}

interface DayButtonProps {
  date: DateTime;
  isSelected: boolean;
  isToday: boolean;
  isDifferentMonth: boolean;
  onPress: () => void;
}

function DayButton({
  date,
  isSelected,
  isToday,
  isDifferentMonth,
  onPress,
}: DayButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dayOfWeek = date.weekday - 1;

  const getBackgroundClass = () => {
    if (isSelected) return "bg-gray-900";
    if (isToday) return "border-2 border-gray-300 bg-gray-100";
    if (isDifferentMonth) return "bg-gray-200";
    return "bg-gray-100";
  };

  const getTextClass = () => {
    if (isSelected) return "text-white";
    if (isDifferentMonth) return "text-gray-400";
    return "text-text-primary";
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="items-center flex-1 py-2"
      accessibilityRole="button"
      accessibilityLabel={`${date.toFormat("EEEE, MMMM d")}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        className={`text-xs mb-1 ${isDifferentMonth ? "text-gray-400" : "text-text-secondary"}`}
      >
        {DAY_NAMES[dayOfWeek]}
      </Text>
      <View
        className={`w-11 h-11 rounded-full items-center justify-center ${getBackgroundClass()}`}
      >
        <Text className={`text-base font-semibold ${getTextClass()}`}>
          {date.day}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

export function WeekSelector({
  selectedDate,
  onSelectDate,
}: WeekSelectorProps) {
  const { width: screenWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList<WeekData>>(null);
  const today = useMemo(() => DateTime.now().startOf("day"), []);

  const weeks = useMemo(() => generateWeeks(today), [today]);

  const initialIndex = WEEKS_BEFORE;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth],
  );

  const currentMonth = today.month;

  const renderWeek: ListRenderItem<WeekData> = useCallback(
    ({ item }) => (
      <View style={{ width: screenWidth }} className="flex-row px-4">
        {item.days.map((day) => (
          <DayButton
            key={day.toISODate()}
            date={day}
            isSelected={day.hasSame(selectedDate, "day")}
            isToday={day.hasSame(today, "day")}
            isDifferentMonth={day.month !== currentMonth}
            onPress={() => onSelectDate(day)}
          />
        ))}
      </View>
    ),
    [screenWidth, selectedDate, today, onSelectDate, currentMonth],
  );

  const keyExtractor = useCallback(
    (item: WeekData) => item.weekStart.toISODate()!,
    [],
  );

  return (
    <View className="mb-4">
      <FlatList
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        decelerationRate="fast"
        snapToInterval={screenWidth}
        snapToAlignment="start"
      />
    </View>
  );
}

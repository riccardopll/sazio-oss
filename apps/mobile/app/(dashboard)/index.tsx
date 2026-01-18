import { useUser } from "@clerk/clerk-expo";
import {
  Text,
  View,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ActivityRings } from "@/components/dashboard/ActivityRings";
import { useCallback, useState, useRef } from "react";

export default function DashboardScreen() {
  const { user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: currentGoal, refetch: refetchGoal } =
    trpc.getCurrentGoal.useQuery({});

  const { data: summary, refetch: refetchSummary } =
    trpc.getDailySummary.useQuery({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchGoal(), refetchSummary()]);
    setRefreshing(false);
  }, [refetchGoal, refetchSummary]);

  const isLoading = !currentGoal || !summary;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-gray-50 items-center justify-center"
        edges={["top"]}
      >
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10 bg-gray-50/95 border-b border-gray-200/50 px-4 pb-3 pt-14"
        style={{ opacity: headerOpacity }}
        pointerEvents="none"
      >
        <View className="flex-row items-center">
          <Text className="text-lg font-semibold">Dashboard</Text>
          {refreshing && (
            <ActivityIndicator size="small" className="ml-2" color="#999" />
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-6">
          <Text className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold">
              {user?.firstName ? `Hi, ${user.firstName}` : "Dashboard"}
            </Text>
            {refreshing && (
              <ActivityIndicator size="small" className="ml-2" color="#999" />
            )}
          </View>
        </View>

        <DashboardCard className="mb-4">
          <ActivityRings
            calories={{
              consumed: summary.calories,
              goal: currentGoal.calorieGoal,
            }}
            protein={{
              consumed: summary.protein,
              goal: currentGoal.proteinGoal,
            }}
            carbs={{ consumed: summary.carbs, goal: currentGoal.carbsGoal }}
            fat={{ consumed: summary.fat, goal: currentGoal.fatGoal }}
          />
        </DashboardCard>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

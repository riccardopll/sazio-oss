import Slider from "@react-native-community/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardCard } from "@/components/DashboardCard";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";

const MAX_MACRO = 300;

function calculateCalories(protein: number, carbs: number, fat: number) {
  return protein * 4 + carbs * 4 + fat * 9;
}

function MacroSlider({
  color,
  label,
  value,
  onValueChange,
}: {
  color: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium uppercase tracking-[1.1px] text-text-muted">
          {label}
        </Text>
        <Text className="text-base font-semibold" style={{ color }}>
          {value}g
        </Text>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={MAX_MACRO}
        step={1}
        value={value}
        minimumTrackTintColor={color}
        maximumTrackTintColor={mobileTheme.border.strong}
        thumbTintColor={color}
        onValueChange={onValueChange}
        style={{ marginTop: 8 }}
      />
      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs text-text-muted">0g</Text>
        <Text className="text-xs text-text-muted">{MAX_MACRO}g</Text>
      </View>
    </View>
  );
}

export default function GoalScreen() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const timezone = DateTime.local().zoneName;
  const todayStart = DateTime.now().setZone(timezone).startOf("day").toMillis();
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const calories = calculateCalories(protein, carbs, fat);

  const { data: currentGoal } = useQuery(
    trpc.getCurrentGoal.queryOptions(
      {
        timezone,
      },
      {
        staleTime: 0,
      },
    ),
  );
  const setTodayGoal = useMutation(
    trpc.setTodayGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        router.back();
      },
    }),
  );
  const deleteGoal = useMutation(
    trpc.deleteGoal.mutationOptions({
      onSuccess: async () => {
        setProtein(0);
        setCarbs(0);
        setFat(0);
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
      },
      onError: (error) => {
        Alert.alert("Unable to delete goal", error.message);
      },
    }),
  );
  useEffect(() => {
    if (currentGoal) {
      setProtein(currentGoal.proteinGoal);
      setCarbs(currentGoal.carbsGoal);
      setFat(currentGoal.fatGoal);
      return;
    }

    setProtein(0);
    setCarbs(0);
    setFat(0);
  }, [currentGoal]);

  if (currentGoal === undefined) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-surface-app"
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={mobileTheme.state.loading} />
      </SafeAreaView>
    );
  }

  const saveGoal = () => {
    setTodayGoal.mutate(
      {
        timezone,
        proteinGoal: protein,
        carbsGoal: carbs,
        fatGoal: fat,
      },
      {
        onError: (error) => {
          Alert.alert("Unable to save goal", error.message);
        },
      },
    );
  };

  const handleSave = () => {
    if (!currentGoal) {
      saveGoal();
      return;
    }

    const replacementMessage =
      currentGoal.startAt === todayStart
        ? "This will delete the goal you created today and replace it with the new one."
        : "This will end your current goal as of yesterday and replace it with the new one starting today.";

    Alert.alert("Replace current goal?", replacementMessage, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: saveGoal,
      },
    ]);
  };
  const handleDelete = () => {
    if (!currentGoal) return;

    Alert.alert("Delete Goal?", "This will remove your current active goal.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGoal.mutate({ id: currentGoal.id }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        <View className="flex-row items-center gap-3 pb-2 pt-4">
          <Pressable
            className="rounded-full p-1 active:opacity-80"
            onPress={() => router.back()}
          >
            <Ionicons
              color={mobileTheme.text.primary}
              name="arrow-back"
              size={22}
            />
          </Pressable>
          <View>
            <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
              My Goal
            </Text>
            <Text className="mt-1 text-3xl font-bold text-text-primary">
              {currentGoal ? "Replace Goal" : "Create Goal"}
            </Text>
          </View>
        </View>

        <DashboardCard className="mt-6">
          {currentGoal ? (
            <View>
              <Text className="text-3xl font-bold text-text-primary">
                {`Started ${DateTime.fromMillis(currentGoal.startAt).toFormat("MMM d")}`}
              </Text>
              <View className="mt-4 flex-row items-center gap-5">
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    P
                  </Text>
                  <Text className="text-sm font-semibold text-nutrition-protein">
                    {currentGoal.proteinGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    C
                  </Text>
                  <Text className="text-sm font-semibold text-nutrition-carbs">
                    {currentGoal.carbsGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    F
                  </Text>
                  <Text className="text-sm font-semibold text-nutrition-fat">
                    {currentGoal.fatGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    Calories
                  </Text>
                  <Text className="text-sm font-semibold text-nutrition-calories">
                    {currentGoal.calorieGoal}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-3xl font-bold text-text-primary">
              No Active Goal
            </Text>
          )}
        </DashboardCard>

        <DashboardCard className="mt-6">
          <Text className="text-sm uppercase tracking-[1.6px] text-text-muted">
            Calories
          </Text>
          <Text className="mt-2 text-4xl font-bold text-nutrition-calories">
            {calories}
          </Text>

          <MacroSlider
            color={mobileTheme.nutrition.protein}
            label="Protein"
            value={protein}
            onValueChange={setProtein}
          />
          <MacroSlider
            color={mobileTheme.nutrition.carbs}
            label="Carbs"
            value={carbs}
            onValueChange={setCarbs}
          />
          <MacroSlider
            color={mobileTheme.nutrition.fat}
            label="Fat"
            value={fat}
            onValueChange={setFat}
          />
        </DashboardCard>

        <Pressable
          className={`mt-6 rounded-[24px] px-5 py-4 ${
            setTodayGoal.isPending ? "bg-surface-raised" : "bg-text-primary"
          }`}
          disabled={setTodayGoal.isPending || deleteGoal.isPending}
          onPress={handleSave}
        >
          <Text
            className={`text-center text-base font-semibold ${
              setTodayGoal.isPending
                ? "text-text-secondary"
                : "text-text-inverse"
            }`}
          >
            {setTodayGoal.isPending
              ? "Saving..."
              : currentGoal
                ? "Replace Goal"
                : "Create Goal"}
          </Text>
        </Pressable>
        {currentGoal ? (
          <Pressable
            className="mt-5"
            disabled={setTodayGoal.isPending || deleteGoal.isPending}
            onPress={handleDelete}
          >
            <Text className="text-center text-base font-medium text-state-destructive">
              {deleteGoal.isPending ? "Deleting..." : "Delete Goal"}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

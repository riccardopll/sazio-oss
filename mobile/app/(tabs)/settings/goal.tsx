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
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme, nutritionTheme } from "@/lib/theme";
import {
  cn,
  controlStyles,
  nutritionStyles,
  screenStyles,
  textStyles,
} from "@/lib/styles";

const MAX_MACRO = 300;
type MacroSliderVariant = "carbs" | "fat" | "protein";

function calculateCalories(protein: number, carbs: number, fat: number) {
  return protein * 4 + carbs * 4 + fat * 9;
}

function MacroSlider({
  label,
  value,
  variant,
  onValueChange,
}: {
  label: string;
  value: number;
  variant: MacroSliderVariant;
  onValueChange: (value: number) => void;
}) {
  const sliderTheme = nutritionTheme[variant];
  const sliderStyles = nutritionStyles[variant];

  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between">
        <Text className={textStyles.sectionTitle}>{label}</Text>
        <Text className={cn("text-base font-semibold", sliderStyles.text)}>
          {value}g
        </Text>
      </View>
      <View className="mt-2">
        <Slider
          minimumValue={0}
          maximumValue={MAX_MACRO}
          step={1}
          value={value}
          minimumTrackTintColor={sliderTheme.color}
          maximumTrackTintColor={mobileTheme.border.strong}
          thumbTintColor={sliderTheme.color}
          onValueChange={onValueChange}
        />
      </View>
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
      <SafeAreaView className={screenStyles.centeredAppRoot} edges={["top"]}>
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
    <SafeAreaView className={screenStyles.appRoot} edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn(screenStyles.content, "pb-8")}
      >
        <ScreenHeader
          embedded
          eyebrow="My Goal"
          leftAccessory={
            <Pressable
              className={cn(
                controlStyles.hitTarget,
                "rounded-full active:opacity-80",
              )}
              onPress={() => router.back()}
            >
              <Ionicons
                color={mobileTheme.text.primary}
                name="arrow-back"
                size={22}
              />
            </Pressable>
          }
          title={currentGoal ? "Replace Goal" : "Create Goal"}
        />

        <Card className="mt-6">
          {currentGoal ? (
            <View>
              <Text className={textStyles.screenTitle}>
                {`Started ${DateTime.fromMillis(currentGoal.startAt).toFormat("MMM d")}`}
              </Text>
              <View className="mt-4 flex-row items-center gap-5">
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    P
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      nutritionStyles.protein.text,
                    )}
                  >
                    {currentGoal.proteinGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    C
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      nutritionStyles.carbs.text,
                    )}
                  >
                    {currentGoal.carbsGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    F
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      nutritionStyles.fat.text,
                    )}
                  >
                    {currentGoal.fatGoal}g
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-xs uppercase tracking-[1.1px] text-text-muted">
                    Calories
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-semibold",
                      nutritionStyles.calories.text,
                    )}
                  >
                    {currentGoal.calorieGoal}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className={textStyles.screenTitle}>No Active Goal</Text>
          )}
        </Card>

        <Card className="mt-6">
          <Text className={textStyles.sectionTitle}>Calories</Text>
          <Text
            className={cn(
              "mt-2 text-4xl font-bold",
              nutritionStyles.calories.text,
            )}
          >
            {calories}
          </Text>

          <MacroSlider
            label="Protein"
            value={protein}
            variant="protein"
            onValueChange={setProtein}
          />
          <MacroSlider
            label="Carbs"
            value={carbs}
            variant="carbs"
            onValueChange={setCarbs}
          />
          <MacroSlider
            label="Fat"
            value={fat}
            variant="fat"
            onValueChange={setFat}
          />
        </Card>

        <Pressable
          className={cn(
            controlStyles.primaryAction,
            setTodayGoal.isPending ? "bg-surface-raised" : "bg-text-primary",
          )}
          disabled={setTodayGoal.isPending || deleteGoal.isPending}
          onPress={handleSave}
        >
          <Text
            className={cn(
              controlStyles.primaryActionText,
              setTodayGoal.isPending
                ? "text-text-secondary"
                : "text-text-inverse",
            )}
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
            className={cn("mt-4", controlStyles.textAction)}
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

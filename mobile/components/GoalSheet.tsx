import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mobileTheme } from "@/lib/theme";
import { DateTime } from "luxon";

export type GoalSheetParams = {
  goalId?: number;
  goalName?: string;
  startAt?: number;
  endAt?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
};

export type GoalSheetRef = {
  present: (params?: GoalSheetParams) => void;
  dismiss: () => void;
};

function sanitizeWholeNumberInput(value: string) {
  return value.replace(/\D+/g, "");
}

export const GoalSheet = forwardRef<GoalSheetRef>(function GoalSheet(_, ref) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const sheetRef = useRef<TrueSheet>(null);
  const [params, setParams] = useState<GoalSheetParams>({});
  const isEditing = params.goalId != null;
  const goalId = params.goalId;
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOngoing, setIsOngoing] = useState(true);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  useImperativeHandle(ref, () => ({
    present: (newParams?: GoalSheetParams) => {
      if (newParams) {
        setParams(newParams);
      } else {
        setParams({});
      }
      sheetRef.current?.present();
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));
  useEffect(() => {
    if (params.goalId) {
      setName(params.goalName ?? "");
      setStartDate(
        params.startAt
          ? new Date(params.startAt)
          : DateTime.now().startOf("day").toJSDate(),
      );
      setEndDate(params.endAt ? new Date(params.endAt) : null);
      setIsOngoing(params.endAt == null);
      setProtein(params.proteinGoal?.toString() ?? "");
      setCarbs(params.carbsGoal?.toString() ?? "");
      setFat(params.fatGoal?.toString() ?? "");
    } else {
      setName("");
      setStartDate(DateTime.now().startOf("day").toJSDate());
      setEndDate(null);
      setIsOngoing(true);
      setProtein("");
      setCarbs("");
      setFat("");
    }
  }, [
    params.goalId,
    params.goalName,
    params.startAt,
    params.endAt,
    params.proteinGoal,
    params.carbsGoal,
    params.fatGoal,
  ]);
  const createGoal = useMutation(
    trpc.createGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        sheetRef.current?.dismiss();
      },
    }),
  );
  const updateGoal = useMutation(
    trpc.updateGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        sheetRef.current?.dismiss();
      },
    }),
  );
  const deleteGoal = useMutation(
    trpc.deleteGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        sheetRef.current?.dismiss();
      },
    }),
  );
  const handleSave = () => {
    const proteinValue = parseInt(protein, 10);
    const carbsValue = parseInt(carbs, 10);
    const fatValue = parseInt(fat, 10);
    if (isNaN(proteinValue) || isNaN(carbsValue) || isNaN(fatValue)) {
      Alert.alert("Invalid input", "Please enter valid numbers for all macros");
      return;
    }
    const startAt = DateTime.fromJSDate(startDate).startOf("day").toMillis();
    const endAt =
      isOngoing || !endDate
        ? undefined
        : DateTime.fromJSDate(endDate).startOf("day").toMillis();
    if (isEditing && goalId != null) {
      updateGoal.mutate({
        id: goalId,
        name: name || undefined,
        startAt,
        endAt,
        proteinGoal: proteinValue,
        carbsGoal: carbsValue,
        fatGoal: fatValue,
      });
    } else {
      createGoal.mutate({
        name: name,
        startAt,
        endAt,
        proteinGoal: proteinValue,
        carbsGoal: carbsValue,
        fatGoal: fatValue,
        closePreviousGoal: true,
      });
    }
  };
  const handleDelete = () => {
    if (!isEditing || goalId == null) return;
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGoal.mutate({ id: goalId }),
      },
    ]);
  };
  const handleClose = () => {
    sheetRef.current?.dismiss();
  };
  const isSaving = [createGoal, updateGoal, deleteGoal].some(
    (m) => m.isPending,
  );
  const numericInputStyle = {
    color: mobileTheme.text.primary,
    fontSize: 16,
    paddingVertical: 0,
    textAlign: "right",
  } as const;
  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.72, 0.92]}
      grabber
      scrollable
      header={
        <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-4">
          <Pressable onPress={handleClose}>
            <Text className="text-base text-text-secondary">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-text-primary">
            {isEditing ? "Edit Goal" : "New Goal"}
          </Text>
          <Pressable onPress={handleSave} disabled={isSaving}>
            <Text
              className={`text-base font-semibold ${isSaving ? "text-text-muted" : "text-text-primary"}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>
      }
    >
      <SafeAreaView className="flex-1 bg-surface-sheet" edges={["bottom"]}>
        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="pb-8"
          nestedScrollEnabled
        >
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
              Goal Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Goal name (optional)"
              placeholderTextColor={mobileTheme.text.muted}
              style={{
                backgroundColor: mobileTheme.surface.input,
                borderColor: mobileTheme.border.subtle,
                borderWidth: 1,
                borderRadius: 12,
                color: mobileTheme.text.primary,
                fontSize: 16,
                height: 48,
                paddingHorizontal: 16,
                paddingVertical: 0,
              }}
            />
          </View>
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
              Dates
            </Text>
            <View className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-input">
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Start Date</Text>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  themeVariant="dark"
                  onChange={(_, date) => date && setStartDate(date)}
                />
              </View>
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Ongoing</Text>
                <Switch
                  value={isOngoing}
                  onValueChange={setIsOngoing}
                  ios_backgroundColor={mobileTheme.surface.raised}
                  thumbColor={
                    isOngoing
                      ? mobileTheme.text.primary
                      : mobileTheme.text.secondary
                  }
                  trackColor={{
                    false: mobileTheme.surface.raised,
                    true: mobileTheme.border.strong,
                  }}
                />
              </View>
              {!isOngoing && (
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-base text-text-primary">End Date</Text>
                  <DateTimePicker
                    value={endDate ?? new Date()}
                    mode="date"
                    themeVariant="dark"
                    onChange={(_, date) => date && setEndDate(date)}
                  />
                </View>
              )}
            </View>
          </View>
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
              Daily Targets
            </Text>
            <View className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-input">
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Protein (g)</Text>
                <TextInput
                  value={protein}
                  onChangeText={(value) =>
                    setProtein(sanitizeWholeNumberInput(value))
                  }
                  placeholder="0"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  className="min-w-[80px]"
                  placeholderTextColor={mobileTheme.text.muted}
                  style={numericInputStyle}
                />
              </View>
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Carbs (g)</Text>
                <TextInput
                  value={carbs}
                  onChangeText={(value) =>
                    setCarbs(sanitizeWholeNumberInput(value))
                  }
                  placeholder="0"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  className="min-w-[80px]"
                  placeholderTextColor={mobileTheme.text.muted}
                  style={numericInputStyle}
                />
              </View>
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-base text-text-primary">Fat (g)</Text>
                <TextInput
                  value={fat}
                  onChangeText={(value) =>
                    setFat(sanitizeWholeNumberInput(value))
                  }
                  placeholder="0"
                  inputMode="numeric"
                  keyboardType="number-pad"
                  className="min-w-[80px]"
                  placeholderTextColor={mobileTheme.text.muted}
                  style={numericInputStyle}
                />
              </View>
            </View>
          </View>
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              disabled={isSaving}
              className="mt-8 mb-4"
            >
              <Text className="text-center text-base font-medium text-state-destructive">
                Delete Goal
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </TrueSheet>
  );
});

import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTRPC } from "@/lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mobileTheme } from "@/lib/theme";
import { DateTime } from "luxon";
import { BottomSheetModal } from "@/components/BottomSheetModal";

export type GoalSheetParams = {
  goalId?: number;
  goalName?: string;
  startAt?: number;
  endAt?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
};

interface GoalSheetProps {
  visible: boolean;
  onClose: () => void;
  params?: GoalSheetParams;
}

function sanitizeWholeNumberInput(value: string) {
  return value.replace(/\D+/g, "");
}

export function GoalSheet({ visible, onClose, params }: GoalSheetProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    goalId,
    goalName,
    startAt: initialStartAt,
    endAt: initialEndAt,
    proteinGoal,
    carbsGoal,
    fatGoal,
  } = params ?? {};
  const isEditing = goalId != null;
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isOngoing, setIsOngoing] = useState(true);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    if (goalId) {
      setName(goalName ?? "");
      setStartDate(
        initialStartAt
          ? new Date(initialStartAt)
          : DateTime.now().startOf("day").toJSDate(),
      );
      setEndDate(initialEndAt ? new Date(initialEndAt) : null);
      setIsOngoing(initialEndAt == null);
      setProtein(proteinGoal?.toString() ?? "");
      setCarbs(carbsGoal?.toString() ?? "");
      setFat(fatGoal?.toString() ?? "");
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
    goalId,
    goalName,
    initialStartAt,
    initialEndAt,
    proteinGoal,
    carbsGoal,
    fatGoal,
  ]);

  const createGoal = useMutation(
    trpc.createGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        onClose();
      },
    }),
  );
  const updateGoal = useMutation(
    trpc.updateGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        onClose();
      },
    }),
  );
  const deleteGoal = useMutation(
    trpc.deleteGoal.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getCurrentGoal.pathFilter());
        onClose();
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
  const isSaving = [createGoal, updateGoal, deleteGoal].some(
    (m) => m.isPending,
  );

  return (
    <BottomSheetModal
      actionDisabled={isSaving}
      actionLabel={isSaving ? "Saving..." : "Save"}
      closeDisabled={isSaving}
      onAction={handleSave}
      onClose={onClose}
      size="goal"
      title={isEditing ? "Edit Goal" : "New Goal"}
      visible={visible}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
            Goal Name
          </Text>
          <TextInput
            className="h-12 rounded-xl border border-border-subtle bg-surface-input px-4 py-0 text-base text-text-primary"
            value={name}
            onChangeText={setName}
            placeholder="Goal name (optional)"
            placeholderTextColor={mobileTheme.text.muted}
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
                mode="date"
                onChange={(_, date) => date && setStartDate(date)}
                value={startDate}
              />
            </View>
            <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
              <Text className="text-base text-text-primary">Ongoing</Text>
              <Switch
                value={isOngoing}
                onValueChange={setIsOngoing}
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
            {!isOngoing ? (
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-base text-text-primary">End Date</Text>
                <DateTimePicker
                  mode="date"
                  onChange={(_, date) => date && setEndDate(date)}
                  value={endDate ?? new Date()}
                />
              </View>
            ) : null}
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
                className="min-w-[80px] py-0 text-right text-base text-text-primary"
                placeholderTextColor={mobileTheme.text.muted}
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
                className="min-w-[80px] py-0 text-right text-base text-text-primary"
                placeholderTextColor={mobileTheme.text.muted}
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
                className="min-w-[80px] py-0 text-right text-base text-text-primary"
                placeholderTextColor={mobileTheme.text.muted}
              />
            </View>
          </View>
        </View>
        {isEditing ? (
          <Pressable
            className="mb-4 mt-8"
            disabled={isSaving}
            onPress={handleDelete}
          >
            <Text className="text-center text-base font-medium text-state-destructive">
              Delete Goal
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </BottomSheetModal>
  );
}

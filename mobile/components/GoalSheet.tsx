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
import { trpc } from "@/lib/trpc";
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

export const GoalSheet = forwardRef<GoalSheetRef>(function GoalSheet(_, ref) {
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
  const utils = trpc.useUtils();
  const createGoal = trpc.createGoal.useMutation({
    onSuccess: () => {
      utils.getCurrentGoal.invalidate();
      sheetRef.current?.dismiss();
    },
  });
  const updateGoal = trpc.updateGoal.useMutation({
    onSuccess: () => {
      utils.getCurrentGoal.invalidate();
      sheetRef.current?.dismiss();
    },
  });
  const deleteGoal = trpc.deleteGoal.useMutation({
    onSuccess: () => {
      utils.getCurrentGoal.invalidate();
      sheetRef.current?.dismiss();
    },
  });
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
  return (
    <TrueSheet ref={sheetRef} detents={["auto", 0.6]} grabber>
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={["bottom"]}>
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <Pressable onPress={handleClose}>
              <Text className="text-blue-500 text-base">Cancel</Text>
            </Pressable>
            <Text className="text-lg font-semibold">
              {isEditing ? "Edit Goal" : "New Goal"}
            </Text>
            <Pressable onPress={handleSave} disabled={isSaving}>
              <Text
                className={`text-base font-semibold ${isSaving ? "text-gray-400" : "text-blue-500"}`}
              >
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
          <ScrollView className="flex-1 px-4" contentContainerClassName="pb-8">
            <View className="mt-6">
              <Text className="text-sm font-medium text-gray-500 uppercase mb-2">
                Goal Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Goal name (optional)"
                placeholderTextColor="#9CA3AF"
                className="text-base"
                style={{
                  backgroundColor: "#f3f4f6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  height: 48,
                }}
              />
            </View>
            <View className="mt-6">
              <Text className="text-sm font-medium text-gray-500 uppercase mb-2">
                Dates
              </Text>
              <View className="bg-gray-100 rounded-xl">
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-base">Start Date</Text>
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    onChange={(_, date) => date && setStartDate(date)}
                  />
                </View>
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-base">Ongoing (no end date)</Text>
                  <Switch value={isOngoing} onValueChange={setIsOngoing} />
                </View>
                {!isOngoing && (
                  <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-base">End Date</Text>
                    <DateTimePicker
                      value={endDate ?? new Date()}
                      mode="date"
                      onChange={(_, date) => date && setEndDate(date)}
                    />
                  </View>
                )}
              </View>
            </View>
            <View className="mt-6">
              <Text className="text-sm font-medium text-gray-500 uppercase mb-2">
                Daily Targets
              </Text>
              <View className="bg-gray-100 rounded-xl overflow-hidden">
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-base">Protein (g)</Text>
                  <TextInput
                    value={protein}
                    onChangeText={setProtein}
                    placeholder="0"
                    keyboardType="numeric"
                    className="text-base text-right min-w-[80px]"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                  <Text className="text-base">Carbs (g)</Text>
                  <TextInput
                    value={carbs}
                    onChangeText={setCarbs}
                    placeholder="0"
                    keyboardType="numeric"
                    className="text-base text-right min-w-[80px]"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-base">Fat (g)</Text>
                  <TextInput
                    value={fat}
                    onChangeText={setFat}
                    placeholder="0"
                    keyboardType="numeric"
                    className="text-base text-right min-w-[80px]"
                    placeholderTextColor="#9CA3AF"
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
                <Text className="text-red-500 text-center text-base font-medium">
                  Delete Goal
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </TrueSheet>
  );
});

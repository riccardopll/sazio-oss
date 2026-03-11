import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FoodListItem } from "@sazio-oss/shared";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";

export type FoodCreateSheetParams = {
  initialName?: string;
};

export type FoodCreateSheetRef = {
  present: (params?: FoodCreateSheetParams) => void;
  dismiss: () => void;
};

interface FoodCreateSheetProps {
  onCreated: (food: FoodListItem) => void;
}

function sanitizeWholeNumberInput(value: string) {
  return value.replace(/\D+/g, "");
}

function sanitizeDecimalInput(value: string) {
  const normalized = value.replace(",", ".");
  const [integerPart = "", decimalPart = ""] = normalized.split(".");
  const safeInteger = integerPart.replace(/\D+/g, "");
  const safeDecimal = decimalPart.replace(/\D+/g, "");
  return safeDecimal ? `${safeInteger}.${safeDecimal}` : safeInteger;
}

export const FoodCreateSheet = forwardRef<
  FoodCreateSheetRef,
  FoodCreateSheetProps
>(function FoodCreateSheet({ onCreated }, ref) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const sheetRef = useRef<TrueSheet>(null);
  const [params, setParams] = useState<FoodCreateSheetParams>({});
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingUnit, setServingUnit] = useState<"g" | "ml">("g");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useImperativeHandle(ref, () => ({
    present: (nextParams?: FoodCreateSheetParams) => {
      setParams(nextParams ?? {});
      sheetRef.current?.present();
    },
    dismiss: () => {
      sheetRef.current?.dismiss();
    },
  }));

  useEffect(() => {
    setName(params.initialName?.trim() ?? "");
    setServingSize("");
    setServingUnit("g");
    setProtein("");
    setCarbs("");
    setFat("");
  }, [params.initialName]);

  const createFood = useMutation(
    trpc.createFood.mutationOptions({
      onSuccess: async (food) => {
        await queryClient.invalidateQueries(trpc.listFoods.pathFilter());
        sheetRef.current?.dismiss();
        onCreated(food);
      },
    }),
  );

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedServingSize = parseInt(servingSize, 10);
    const parsedProtein = parseFloat(protein);
    const parsedCarbs = parseFloat(carbs);
    const parsedFat = parseFloat(fat);

    if (!trimmedName) {
      Alert.alert("Missing name", "Enter a food name before saving.");
      return;
    }

    if (
      Number.isNaN(parsedServingSize) ||
      parsedServingSize <= 0 ||
      Number.isNaN(parsedProtein) ||
      parsedProtein < 0 ||
      Number.isNaN(parsedCarbs) ||
      parsedCarbs < 0 ||
      Number.isNaN(parsedFat) ||
      parsedFat < 0
    ) {
      Alert.alert(
        "Invalid values",
        "Enter a positive serving size and non-negative macros.",
      );
      return;
    }

    createFood.mutate({
      name: trimmedName,
      servingSize: parsedServingSize,
      servingUnit,
      protein: parsedProtein,
      carbs: parsedCarbs,
      fat: parsedFat,
    });
  };

  const inputStyle = {
    backgroundColor: mobileTheme.surface.input,
    borderColor: mobileTheme.border.subtle,
    borderRadius: 12,
    borderWidth: 1,
    color: mobileTheme.text.primary,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 0,
  } as const;

  const numericInputStyle = {
    color: mobileTheme.text.primary,
    fontSize: 16,
    paddingVertical: 0,
    textAlign: "right",
  } as const;

  return (
    <TrueSheet
      ref={sheetRef}
      detents={[0.8, 0.95]}
      grabber
      scrollable
      header={
        <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-4">
          <Pressable onPress={() => sheetRef.current?.dismiss()}>
            <Text className="text-base text-text-secondary">Cancel</Text>
          </Pressable>
          <Text className="text-lg font-semibold text-text-primary">
            New Food
          </Text>
          <Pressable onPress={handleSave} disabled={createFood.isPending}>
            <Text
              className={`text-base font-semibold ${createFood.isPending ? "text-text-muted" : "text-text-primary"}`}
            >
              {createFood.isPending ? "Saving..." : "Save"}
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
              Food Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Chicken breast"
              placeholderTextColor={mobileTheme.text.muted}
              style={inputStyle}
            />
          </View>

          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
              Base Serving
            </Text>
            <View className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-input">
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Size</Text>
                <TextInput
                  value={servingSize}
                  onChangeText={(value) =>
                    setServingSize(sanitizeWholeNumberInput(value))
                  }
                  placeholder="100"
                  placeholderTextColor={mobileTheme.text.muted}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  className="min-w-[96px]"
                  style={numericInputStyle}
                />
              </View>
              <View className="px-4 py-3">
                <Text className="mb-3 text-base text-text-primary">Unit</Text>
                <View className="flex-row gap-3">
                  {(["g", "ml"] as const).map((unit) => {
                    const isSelected = servingUnit === unit;
                    return (
                      <Pressable
                        key={unit}
                        onPress={() => setServingUnit(unit)}
                        className={`min-w-[72px] rounded-full border px-4 py-2 ${isSelected ? "border-text-primary bg-text-primary" : "border-border-strong bg-surface-raised"}`}
                      >
                        <Text
                          className={`text-center text-sm font-semibold uppercase ${isSelected ? "text-text-inverse" : "text-text-primary"}`}
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
              Macros Per Serving
            </Text>
            <Text className="mb-3 text-sm leading-5 text-text-secondary">
              These values are stored for the base serving above.
            </Text>
            <View className="overflow-hidden rounded-[24px] border border-border-subtle bg-surface-input">
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Protein (g)</Text>
                <TextInput
                  value={protein}
                  onChangeText={(value) =>
                    setProtein(sanitizeDecimalInput(value))
                  }
                  placeholder="0"
                  placeholderTextColor={mobileTheme.text.muted}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  className="min-w-[96px]"
                  style={numericInputStyle}
                />
              </View>
              <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
                <Text className="text-base text-text-primary">Carbs (g)</Text>
                <TextInput
                  value={carbs}
                  onChangeText={(value) =>
                    setCarbs(sanitizeDecimalInput(value))
                  }
                  placeholder="0"
                  placeholderTextColor={mobileTheme.text.muted}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  className="min-w-[96px]"
                  style={numericInputStyle}
                />
              </View>
              <View className="flex-row items-center justify-between px-4 py-3">
                <Text className="text-base text-text-primary">Fat (g)</Text>
                <TextInput
                  value={fat}
                  onChangeText={(value) => setFat(sanitizeDecimalInput(value))}
                  placeholder="0"
                  placeholderTextColor={mobileTheme.text.muted}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  className="min-w-[96px]"
                  style={numericInputStyle}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TrueSheet>
  );
});

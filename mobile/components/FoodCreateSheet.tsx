import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FoodListItem } from "@sazio-oss/shared";
import { useTRPC } from "@/lib/trpc";
import { mobileTheme } from "@/lib/theme";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { controlStyles } from "@/lib/styles";

export type FoodCreateSheetParams = {
  initialName?: string;
};

interface FoodCreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (food: FoodListItem) => void;
  params?: FoodCreateSheetParams;
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

export function FoodCreateSheet({
  visible,
  onClose,
  onCreated,
  params,
}: FoodCreateSheetProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingUnit, setServingUnit] = useState<"g" | "ml">("g");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  useEffect(() => {
    setName(params?.initialName?.trim() ?? "");
    setServingSize("");
    setServingUnit("g");
    setProtein("");
    setCarbs("");
    setFat("");
  }, [params?.initialName, visible]);

  const createFood = useMutation(
    trpc.createFood.mutationOptions({
      onSuccess: async (food) => {
        await queryClient.invalidateQueries(trpc.listFoods.pathFilter());
        onCreated(food);
      },
    }),
  );

  const handleSave = () => {
    const trimmedName = name.trim();
    const parsedServingSize = parseInt(servingSize, 10);
    const parsedProtein = protein === "" ? 0 : parseFloat(protein);
    const parsedCarbs = carbs === "" ? 0 : parseFloat(carbs);
    const parsedFat = fat === "" ? 0 : parseFloat(fat);

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

  return (
    <BottomSheetModal
      actionDisabled={createFood.isPending}
      actionLabel={createFood.isPending ? "Saving..." : "Save"}
      closeDisabled={createFood.isPending}
      onAction={handleSave}
      onClose={onClose}
      size="foodCreate"
      title="New Food"
      visible={visible}
    >
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
            Food Name
          </Text>
          <TextInput
            className="h-12 rounded-xl border border-border-subtle bg-surface-input px-4 py-0 text-[16px] text-text-primary"
            value={name}
            onChangeText={setName}
            placeholder="Chicken breast"
            placeholderTextColor={mobileTheme.text.muted}
          />
        </View>

        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium uppercase text-text-muted">
            Base Serving
          </Text>
          <View className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface-input">
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
                className="min-w-[96px] py-0 text-right text-[16px] text-text-primary"
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
                      className={
                        isSelected
                          ? `min-w-[72px] rounded-full border border-text-primary bg-text-primary px-4 py-2 ${controlStyles.textAction}`
                          : `min-w-[72px] rounded-full border border-border-strong bg-surface-raised px-4 py-2 ${controlStyles.textAction}`
                      }
                    >
                      <Text
                        className={
                          isSelected
                            ? "text-center text-sm font-semibold uppercase text-text-inverse"
                            : "text-center text-sm font-semibold uppercase text-text-primary"
                        }
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
          <View className="overflow-hidden rounded-[20px] border border-border-subtle bg-surface-input">
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
                className="min-w-[96px] py-0 text-right text-[16px] text-text-primary"
              />
            </View>
            <View className="flex-row items-center justify-between border-b border-border-subtle px-4 py-3">
              <Text className="text-base text-text-primary">Carbs (g)</Text>
              <TextInput
                value={carbs}
                onChangeText={(value) => setCarbs(sanitizeDecimalInput(value))}
                placeholder="0"
                placeholderTextColor={mobileTheme.text.muted}
                inputMode="decimal"
                keyboardType="decimal-pad"
                className="min-w-[96px] py-0 text-right text-[16px] text-text-primary"
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
                className="min-w-[96px] py-0 text-right text-[16px] text-text-primary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

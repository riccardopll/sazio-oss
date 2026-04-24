import type { FoodListItem } from "@sazio-oss/shared";
import { router } from "expo-router";
import { useState } from "react";
import {
  FoodCreateSheet,
  type FoodCreateSheetParams,
} from "@/components/FoodCreateSheet";
import {
  FoodLogSheet,
  type FoodLogSheetParams,
} from "@/components/FoodLogSheet";

export default function LogFoodRoute() {
  const [activeModal, setActiveModal] = useState<"log" | "create">("log");
  const [foodLogParams, setFoodLogParams] = useState<FoodLogSheetParams>({});
  const [foodCreateParams, setFoodCreateParams] =
    useState<FoodCreateSheetParams>({});

  const handleFoodCreated = (food: FoodListItem) => {
    setFoodLogParams({
      initialSearch: food.name,
      selectedFood: food,
    });
    setActiveModal("log");
  };

  const handleOpenCreateFood = (initialName?: string) => {
    setFoodCreateParams({ initialName });
    setActiveModal("create");
  };

  return (
    <>
      <FoodLogSheet
        visible={activeModal === "log"}
        params={foodLogParams}
        onClose={() => router.back()}
        onRequestCreateFood={handleOpenCreateFood}
      />
      <FoodCreateSheet
        visible={activeModal === "create"}
        params={foodCreateParams}
        onClose={() => router.back()}
        onCreated={handleFoodCreated}
      />
    </>
  );
}

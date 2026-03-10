import { DashboardCard } from "@/components/DashboardCard";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Log() {
  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
      <View className="flex-1 px-5 pt-4">
        <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
          Log
        </Text>
        <Text className="mt-2 text-3xl font-bold text-text-primary">
          Capture meals
        </Text>
        <Text className="mt-2 text-base leading-6 text-text-secondary">
          This screen is still empty, but it now uses the same black shell and
          graphite surfaces as the rest of the app.
        </Text>
        <DashboardCard className="mt-6">
          <Text className="text-lg font-semibold text-text-primary">
            Meal logging is coming here
          </Text>
          <Text className="mt-3 text-base leading-6 text-text-secondary">
            Expect the same dense, dark treatment used by dashboard cards and
            settings groups.
          </Text>
        </DashboardCard>
      </View>
    </SafeAreaView>
  );
}

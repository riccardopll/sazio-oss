import { useUser } from "@clerk/expo";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardCard } from "@/components/DashboardCard";
import { SignOutButton } from "@/components/SignOutButton";

export default function Settings() {
  const { user } = useUser();
  return (
    <SafeAreaView className="flex-1 bg-surface-app" edges={["top"]}>
      <View className="px-5 pt-4">
        <Text className="text-xs uppercase tracking-[1.6px] text-text-muted">
          Settings
        </Text>
        <Text className="mt-2 text-3xl font-bold text-text-primary">
          {user?.firstName ?? "Account"}
        </Text>
        <Text className="mt-2 text-base text-text-secondary">
          Manage profile and session preferences.
        </Text>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8">
        <DashboardCard className="mt-6">
          <Text className="text-lg font-semibold text-text-primary">
            Profile
          </Text>
          <Text className="mt-3 text-base text-text-secondary">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
          <Text className="mt-4 text-sm leading-6 text-text-muted">
            The settings area now follows the same opaque graphite grouping used
            in the references.
          </Text>
        </DashboardCard>
        <View className="mt-6">
          <SignOutButton />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
